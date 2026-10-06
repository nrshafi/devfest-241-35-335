import { findDuplicateGroups } from "../utils/duplicateDetection"
import { checkAssignment } from "../utils/matching"
import { computeRows, getBlockingIssues } from "../utils/validation"

export function createSession(session = 0) {
  return {
    session,
    revision: 0,
    data: null,
    files: [],
    matches: Object.create(null),
    expiryDates: Object.create(null),
    includeIndex: false,
    result: null,
    genError: null,
    generation: null,
    notice: null,
  }
}

const changed = (state, patch) => ({
  ...state,
  ...patch,
  revision: state.revision + 1,
  result: null,
  genError: null,
})
const recordFrom = (entries) =>
  Object.assign(Object.create(null), Object.fromEntries(entries))
const omit = (record, key) =>
  recordFrom(Object.entries(record).filter(([id]) => id !== key))

/** One transition owns files, assignment integrity, expiry, and artifact validity. */
export function sessionReducer(state, action) {
  switch (action.type) {
    case "replace":
      return { ...createSession(state.session + 1), data: action.data }
    case "reset":
      return createSession(state.session + 1)
    case "add":
      if (
        action.session !== state.session ||
        !state.data ||
        !action.files.length
      )
        return state
      return changed(state, { files: [...state.files, ...action.files] })
    case "intake":
      if (
        action.session !== state.session ||
        !state.files.some(
          (f) => f.id === action.id && f.status === "processing",
        )
      )
        return state
      return changed(state, {
        files: state.files.map((f) =>
          f.id === action.id ? { ...f, ...action.patch } : f,
        ),
      })
    case "remove": {
      if (!state.files.some((f) => f.id === action.id)) return state
      const removed = new Set(
        Object.entries(state.matches)
          .filter(([, id]) => id === action.id)
          .map(([id]) => id),
      )
      return changed(state, {
        files: state.files.filter((f) => f.id !== action.id),
        matches: recordFrom(
          Object.entries(state.matches).filter(([id]) => !removed.has(id)),
        ),
        expiryDates: recordFrom(
          Object.entries(state.expiryDates).filter(([id]) => !removed.has(id)),
        ),
      })
    }
    case "assign": {
      if (!state.data?.requirements.some((r) => r.id === action.requirementId))
        return state
      if (!action.fileId)
        return sessionReducer(state, {
          type: "unmatch",
          requirementId: action.requirementId,
        })
      const target = state.files.find((f) => f.id === action.fileId)
      const conflict =
        !target || target.status !== "ready" || !target.bytes?.length
          ? { code: "file_invalid" }
          : checkAssignment(
              action.fileId,
              action.requirementId,
              state.files,
              state.matches,
              findDuplicateGroups(state.files),
            )
      if (conflict) {
        const file = state.files.find((f) => f.id === action.fileId)
        const key =
          conflict.code === "already_matched"
            ? "errAlready"
            : conflict.code === "duplicate_used"
              ? "errDup"
              : "errInvalid"
        return {
          ...state,
          notice: {
            key,
            vars: {
              file: file?.name,
              other: state.files.find((f) => f.id === conflict.otherFileId)
                ?.name,
            },
            requirementId: conflict.requirementId,
          },
        }
      }
      if (state.matches[action.requirementId] === action.fileId) return state
      return changed(state, {
        matches: recordFrom([
          ...Object.entries(state.matches),
          [action.requirementId, action.fileId],
        ]),
        expiryDates: omit(state.expiryDates, action.requirementId),
      })
    }
    case "unmatch":
      if (!state.matches[action.requirementId]) return state
      return changed(state, {
        matches: omit(state.matches, action.requirementId),
        expiryDates: omit(state.expiryDates, action.requirementId),
      })
    case "expiry":
      if (
        !state.matches[action.requirementId] ||
        !state.data?.requirements.some(
          (r) => r.id === action.requirementId && r.has_expiry,
        ) ||
        state.expiryDates[action.requirementId] === action.value
      )
        return state
      return changed(state, {
        expiryDates: recordFrom([
          ...Object.entries(state.expiryDates),
          [action.requirementId, action.value],
        ]),
      })
    case "index":
      return state.includeIndex === action.value
        ? state
        : changed(state, { includeIndex: action.value })
    case "notice":
      return { ...state, notice: action.notice }
    case "generate":
      if (
        state.generation ||
        action.token.session !== state.session ||
        action.token.revision !== state.revision ||
        !canGenerate(state)
      )
        return state
      return {
        ...state,
        generation: action.token,
        result: null,
        genError: null,
      }
    case "generated":
      if (
        !state.generation ||
        state.generation.id !== action.token.id ||
        state.session !== action.token.session
      )
        return state
      return {
        ...state,
        generation: null,
        result:
          state.revision === action.token.revision
            ? (action.result ?? null)
            : null,
        genError:
          state.revision === action.token.revision
            ? (action.error ?? null)
            : null,
      }
    default:
      return state
  }
}

export function hasPendingIntake(state) {
  return state.files.some((f) => f.status === "processing")
}

/** Recheck all references and duplicate usage at the generation boundary. */
export function canGenerate(state) {
  if (!state.data || hasPendingIntake(state)) return false
  const duplicates = findDuplicateGroups(state.files)
  for (const [requirementId, fileId] of Object.entries(state.matches)) {
    if (!state.data.requirements.some((r) => r.id === requirementId))
      return false
    const file = state.files.find((f) => f.id === fileId)
    if (
      !file ||
      file.status !== "ready" ||
      !file.bytes?.length ||
      checkAssignment(
        fileId,
        requirementId,
        state.files,
        state.matches,
        duplicates,
      )
    )
      return false
  }
  return (
    getBlockingIssues(
      computeRows(
        state.data.requirements,
        state.files,
        state.matches,
        state.expiryDates,
        state.data.tender.submission_deadline,
      ),
    ).length === 0
  )
}

export function freezeGenerationSnapshot(state) {
  if (!canGenerate(state)) return null
  const files = state.files.map((f) =>
    Object.freeze({ ...f, bytes: f.bytes?.slice() }),
  )
  const requirements = state.data.requirements.map((r) =>
    Object.freeze({ ...r }),
  )
  const rows = computeRows(
    requirements,
    files,
    recordFrom(Object.entries(state.matches)),
    recordFrom(Object.entries(state.expiryDates)),
    state.data.tender.submission_deadline,
  ).map((row) => Object.freeze(row))
  return Object.freeze({
    tender: Object.freeze({ ...state.data.tender }),
    rows: Object.freeze(rows),
    includeIndex: state.includeIndex,
  })
}
