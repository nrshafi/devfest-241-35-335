import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import {
  isValidIsoDate,
  validateRequirementsJson,
} from "../src/utils/jsonValidation.js"
import { sampleRequirements } from "../src/data/sampleRequirements.js"

const fixture = () => JSON.parse(JSON.stringify(sampleRequirements))
const assertError = (input, key, vars) => {
  const result = validateRequirementsJson(input)
  assert.equal(result.ok, false)
  assert.ok(
    result.errors.some(
      (error) =>
        error.key === key &&
        (!vars || JSON.stringify(error.vars) === JSON.stringify(vars)),
    ),
  )
  return result
}

test("supplied pack and sample shortcut satisfy the strict schema", () => {
  const supplied = JSON.parse(
    readFileSync(
      new URL(
        "../given_documents/sample-pack/requirements.json",
        import.meta.url,
      ),
      "utf8",
    ),
  )
  for (const sample of [supplied, sampleRequirements]) {
    const result = validateRequirementsJson(sample)
    assert.equal(result.ok, true)
    assert.equal(result.data.requirements.length, 10)
    assert.equal(result.data.tender.submission_deadline, "2026-10-20")
  }
})

test("whitespace-equivalent IDs cannot collapse into conflicting assignments", () => {
  const raw = fixture()
  raw.requirements[1].id = ` ${raw.requirements[0].id} `
  assertError(raw, "json_duplicate_id", { id: "R01" })
})

test("order is required and must be a positive safe integer", () => {
  for (const value of [
    undefined,
    null,
    "1",
    0,
    -1,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    const raw = fixture()
    raw.requirements[0].order = value
    assertError(raw, "json_order_invalid", { field: "requirements[0].order" })
  }
})

test("order ties are rejected instead of depending on source position", () => {
  const raw = fixture()
  raw.requirements[1].order = raw.requirements[0].order
  assertError(raw, "json_duplicate_order", { order: 1 })
})

test("normalization preserves bilingual data and sorts numeric order without mutation", () => {
  const raw = fixture()
  raw.requirements.reverse()
  raw.requirements[0].id = " R10 "
  raw.requirements[0].title_bn = ` ${raw.requirements[0].title_bn} `
  raw.tender.tender_id = " T-2026-0417 "
  raw.tender.submission_deadline = " 2026-10-20 "
  const before = JSON.stringify(raw)
  const result = validateRequirementsJson(raw)
  assert.equal(result.ok, true)
  assert.deepEqual(
    result.data.requirements.map((requirement) => requirement.order),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  )
  assert.equal(result.data.requirements[9].id, "R10")
  assert.equal(
    result.data.requirements[9].title_bn,
    sampleRequirements.requirements[9].title_bn,
  )
  assert.equal(result.data.requirements[9]._index, 0)
  assert.equal(result.data.tender.tender_id, "T-2026-0417")
  assert.equal(result.data.tender.submission_deadline, "2026-10-20")
  assert.equal(JSON.stringify(raw), before)
})

test("required strings and boolean flags do not fall back or coerce", () => {
  for (const field of ["id", "title_en", "title_bn"]) {
    for (const value of [undefined, null, "", "  ", 12]) {
      const raw = fixture()
      raw.requirements[0][field] = value
      assertError(raw, "json_field_required", {
        field: `requirements[0].${field}`,
      })
    }
  }
  for (const field of ["mandatory", "has_expiry"]) {
    for (const value of [undefined, null, "true", "false", 0, 1]) {
      const raw = fixture()
      raw.requirements[0][field] = value
      assertError(raw, "json_boolean_required", {
        field: `requirements[0].${field}`,
      })
    }
  }
})

test("arrays and primitives are rejected where objects or a nonempty list are required", () => {
  for (const raw of [null, [], "text", true, 42])
    assertError(raw, "json_object_required")
  for (const value of [null, [], "text"]) {
    const raw = fixture()
    raw.tender = value
    assertError(raw, "json_tender_required")
  }
  for (const value of [undefined, [], {}, "text"]) {
    const raw = fixture()
    raw.requirements = value
    assertError(raw, "json_requirements_required")
  }
  for (const value of [null, [], "text"]) {
    const raw = fixture()
    raw.requirements[0] = value
    assertError(raw, "json_requirement_object", { index: 0 })
  }
})

test("every tender field is required", () => {
  for (const field of [
    "tender_id",
    "title",
    "procuring_entity",
    "bidder",
    "submission_deadline",
  ]) {
    const raw = fixture()
    raw.tender[field] = " "
    assertError(raw, "json_field_required", { field: `tender.${field}` })
  }
})

test("dates represent actual calendar days, including leap years", () => {
  for (const value of ["2024-02-29", "2026-10-20", "0001-01-01", "0099-12-31"])
    assert.equal(isValidIsoDate(value), true)
  for (const value of [
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-01-00",
    "2026-1-01",
    "0000-01-01",
    "garbage",
    null,
  ])
    assert.equal(isValidIsoDate(value), false)
  const raw = fixture()
  raw.tender.submission_deadline = "2026-02-29"
  assertError(raw, "json_deadline_invalid", {
    field: "tender.submission_deadline",
  })
})

test("all validation failures remain locale independent", () => {
  const result = validateRequirementsJson({ tender: {}, requirements: [{}] })
  assert.equal(result.ok, false)
  for (const error of result.errors) {
    assert.equal(typeof error.key, "string")
    assert.equal(typeof error.vars, "object")
    assert.deepEqual(Object.keys(error).sort(), ["key", "vars"])
  }
})
