import { describe, expect, test } from "bun:test"
import {
  createSession,
  sessionReducer,
  hasPendingIntake,
  canGenerate,
  freezeGenerationSnapshot,
} from "../src/state/session.js"

const requirement = (id, order, mandatory = false, has_expiry = false) => ({
  id,
  order,
  title_en: id,
  title_bn: id,
  mandatory,
  has_expiry,
})
const data = {
  tender: {
    tender_id: "SESSION",
    title: "Session",
    procuring_entity: "Entity",
    bidder: "Bidder",
    submission_deadline: "2026-10-20",
  },
  requirements: [requirement("A", 1, true, true), requirement("B", 2)],
}
const readyFile = (id, byte = 1) => ({
  id,
  name: `${id}.pdf`,
  size: 1,
  pageCount: 1,
  hash: `hash-${byte}`,
  bytes: new Uint8Array([byte]),
  status: "ready",
  error: null,
})
const apply = sessionReducer
function loaded(next = data) {
  return apply(createSession(), { type: "replace", data: next })
}
function usable() {
  let state = loaded()
  state = apply(state, {
    type: "add",
    session: state.session,
    files: [readyFile("f1"), readyFile("f2", 2)],
  })
  state = apply(state, { type: "assign", requirementId: "A", fileId: "f1" })
  return apply(state, {
    type: "expiry",
    requirementId: "A",
    value: "2026-10-20",
  })
}
const tokenFor = (state, id = "g") => ({
  id,
  session: state.session,
  revision: state.revision,
})

describe("atomic session integrity", () => {
  test("replacement/unmatch/removal clear expiry together with assignment", () => {
    let state = usable()
    expect(canGenerate(state)).toBe(true)
    state = apply(state, { type: "assign", requirementId: "A", fileId: "f2" })
    expect(state.matches.A).toBe("f2")
    expect(state.expiryDates.A).toBeUndefined()
    expect(canGenerate(state)).toBe(false)
    state = apply(state, {
      type: "expiry",
      requirementId: "A",
      value: "2026-11-01",
    })
    state = apply(state, { type: "remove", id: "f2" })
    expect(state.matches.A).toBeUndefined()
    expect(state.expiryDates.A).toBeUndefined()
    expect(state.files.map((file) => file.id)).toEqual(["f1"])
    state = apply(state, { type: "assign", requirementId: "A", fileId: "f1" })
    state = apply(state, {
      type: "expiry",
      requirementId: "A",
      value: "2026-11-01",
    })
    state = apply(state, { type: "unmatch", requirementId: "A" })
    expect(Object.keys(state.matches)).toEqual([])
    expect(Object.keys(state.expiryDates)).toEqual([])
  })

  test("file and exact-byte duplicate conflicts are rejected atomically", () => {
    let state = usable()
    state = apply(state, { type: "assign", requirementId: "B", fileId: "f1" })
    expect(state.notice.key).toBe("errAlready")
    expect(state.matches.B).toBeUndefined()
    state = apply(state, {
      type: "add",
      session: state.session,
      files: [readyFile("copy")],
    })
    state = apply(state, { type: "assign", requirementId: "B", fileId: "copy" })
    expect(state.notice.key).toBe("errDup")
    expect(state.matches.A).toBe("f1")
    expect(state.expiryDates.A).toBe("2026-10-20")
    expect(state.matches.B).toBeUndefined()
    expect(canGenerate(state)).toBe(true)
    const corruptMatches = Object.assign(Object.create(null), state.matches, {
      B: "copy",
    })
    expect(canGenerate({ ...state, matches: corruptMatches })).toBe(false)
    expect(canGenerate({ ...state, matches: { A: "absent" } })).toBe(false)
  })

  test("arbitrary normalized IDs never access object prototype values", () => {
    let state = loaded({
      ...data,
      requirements: [
        requirement("__proto__", 1, true, true),
        requirement("constructor", 2, true),
      ],
    })
    expect(canGenerate(state)).toBe(false)
    state = apply(state, {
      type: "add",
      session: state.session,
      files: [readyFile("f1"), readyFile("f2", 2)],
    })
    state = apply(state, {
      type: "assign",
      requirementId: "__proto__",
      fileId: "f1",
    })
    state = apply(state, {
      type: "expiry",
      requirementId: "__proto__",
      value: "2026-10-20",
    })
    state = apply(state, {
      type: "assign",
      requirementId: "constructor",
      fileId: "f2",
    })
    expect(canGenerate(state)).toBe(true)
    expect(Object.getPrototypeOf(state.matches)).toBeNull()
    expect(freezeGenerationSnapshot(state).rows[0].expiry).toBe("2026-10-20")
    state = apply(state, { type: "unmatch", requirementId: "constructor" })
    expect(state.matches.constructor).toBeUndefined()
    expect(canGenerate(state)).toBe(false)
  })
})

describe("asynchronous guards", () => {
  test("pending intake disables ready generation, removed/reset/replaced completions are ignored", () => {
    let state = usable()
    const queued = {
      ...readyFile("pending"),
      pageCount: null,
      bytes: null,
      status: "processing",
    }
    state = apply(state, {
      type: "add",
      session: state.session,
      files: [queued],
    })
    expect(hasPendingIntake(state)).toBe(true)
    expect(canGenerate(state)).toBe(false)
    expect(freezeGenerationSnapshot(state)).toBeNull()
    expect(
      apply(state, { type: "generate", token: tokenFor(state) }).generation,
    ).toBeNull()
    const oldSession = state.session
    state = apply(state, { type: "remove", id: "pending" })
    expect(
      apply(state, {
        type: "intake",
        session: oldSession,
        id: "pending",
        patch: readyFile("pending"),
      }),
    ).toBe(state)
    const reset = apply(state, { type: "reset" })
    expect(
      apply(reset, {
        type: "intake",
        session: oldSession,
        id: "f1",
        patch: readyFile("f1"),
      }),
    ).toBe(reset)
    const replaced = apply(state, { type: "replace", data })
    expect(
      apply(replaced, { type: "add", session: oldSession, files: [queued] }),
    ).toBe(replaced)
  })

  test("generation results and errors are discarded after relevant edits", () => {
    for (const mutation of [
      { type: "expiry", requirementId: "A", value: "2026-10-21" },
      { type: "unmatch", requirementId: "A" },
      { type: "remove", id: "f1" },
      { type: "index", value: true },
    ]) {
      let state = usable()
      const token = tokenFor(state)
      state = apply(state, { type: "generate", token })
      state = apply(state, mutation)
      expect(state.generation).toEqual(token)
      state = apply(state, {
        type: "generated",
        token,
        result: { fileName: "old.pdf" },
        error: { code: "UNKNOWN" },
      })
      expect(state.result).toBeNull()
      expect(state.genError).toBeNull()
      expect(state.generation).toBeNull()
    }
  })

  test("reset/replacement old jobs cannot overwrite a new session generation", () => {
    let old = usable()
    const oldToken = tokenFor(old)
    old = apply(old, { type: "generate", token: oldToken })
    for (const type of ["reset", "replace"]) {
      const state = apply(old, { type, data })
      expect(state.session).toBeGreaterThan(old.session)
      expect(state.generation).toBeNull()
      expect(
        apply(state, {
          type: "generated",
          token: oldToken,
          result: { fileName: "old.pdf" },
        }),
      ).toBe(state)
    }
    const state = usable()
    const token = tokenFor(state)
    const active = apply(state, { type: "generate", token })
    const result = { fileName: "current.pdf" }
    expect(apply(active, { type: "generated", token, result }).result).toBe(
      result,
    )
    expect(
      apply(active, {
        type: "generated",
        token: { ...token, id: "other" },
        result,
      }),
    ).toBe(active)
  })

  test("generation snapshot isolates source bytes and freezes metadata", () => {
    const state = usable()
    const snapshot = freezeGenerationSnapshot(state)
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.tender)).toBe(true)
    expect(Object.isFrozen(snapshot.rows)).toBe(true)
    expect(Object.isFrozen(snapshot.rows[0].requirement)).toBe(true)
    snapshot.rows[0].file.bytes[0] = 99
    expect(state.files[0].bytes[0]).toBe(1)
    state.data.tender.title = "Changed outside reducer"
    expect(snapshot.tender.title).toBe("Session")
    state.data.tender.title = "Session"
  })
})
