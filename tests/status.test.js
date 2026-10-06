import { test, expect } from "bun:test"
import {
  STATUS,
  getRequirementStatus,
  computeRows,
  summarize,
} from "../src/utils/validation.js"

const deadline = "2026-10-20"
const required = { id: "R1", mandatory: true, has_expiry: true }
const optional = { ...required, id: "R2", mandatory: false }
const file = { id: "F1", pageCount: 1 }

test("official status set and no-match precedence", () => {
  expect(Object.values(STATUS)).toHaveLength(5)
  expect(getRequirementStatus(required, null, "2020-01-01", deadline)).toBe(
    STATUS.MISSING,
  )
  expect(getRequirementStatus(optional, null, "bad", deadline)).toBe(
    STATUS.NOT_PROVIDED,
  )
})

test("matched optional documents obey expiry and deadline equality", () => {
  expect(getRequirementStatus(optional, file, "", deadline)).toBe(
    STATUS.EXPIRY_NEEDED,
  )
  expect(getRequirementStatus(optional, file, "2026-10-19", deadline)).toBe(
    STATUS.EXPIRED,
  )
  expect(getRequirementStatus(optional, file, deadline, deadline)).toBe(
    STATUS.OK,
  )
  expect(getRequirementStatus(optional, file, "2026-10-21", deadline)).toBe(
    STATUS.OK,
  )
})

test("invalid calendar dates remain expiry-needed with a separate inline error", () => {
  const rows = computeRows(
    [required],
    [file],
    { R1: "F1" },
    { R1: "2026-02-30" },
    deadline,
  )
  expect(rows[0].status).toBe(STATUS.EXPIRY_NEEDED)
  expect(rows[0].expiryError).toBe(true)
  expect(summarize(rows).blocking).toBe(1)
  expect(
    computeRows([required], [file], {}, { R1: "bad" }, deadline)[0].expiryError,
  ).toBe(false)
})
