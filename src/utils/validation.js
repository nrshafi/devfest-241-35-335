import { isValidIsoDate } from "./jsonValidation";

export const STATUS = { MISSING: "missing", EXPIRY_NEEDED: "expiry_needed", EXPIRED: "expired", INVALID_DATE: "invalid_date", NOT_PROVIDED: "not_provided", OK: "ok" };
export const BLOCKING = new Set([STATUS.MISSING, STATUS.EXPIRY_NEEDED, STATUS.EXPIRED, STATUS.INVALID_DATE]);

/** ISO YYYY-MM-DD strings compare correctly as strings; same-day expiry is valid. */
export function getRequirementStatus(requirement, matchedFile, expiryDate, submissionDeadline) {
  if (!matchedFile) return requirement.mandatory ? STATUS.MISSING : STATUS.NOT_PROVIDED;
  if (requirement.has_expiry) {
    if (!expiryDate) return STATUS.EXPIRY_NEEDED;
    if (!isValidIsoDate(expiryDate)) return STATUS.INVALID_DATE;
    if (expiryDate < submissionDeadline) return STATUS.EXPIRED;
  }
  return STATUS.OK;
}

export function computeRows(requirements, files, matches, expiryDates, deadline) {
  return requirements.map((r) => {
    const file = files.find((f) => f.id === matches[r.id]) || null;
    return { requirement: r, file, expiry: expiryDates[r.id] || "", status: getRequirementStatus(r, file, expiryDates[r.id], deadline) };
  });
}

export function getBlockingIssues(rows) {
  return rows.filter((row) => BLOCKING.has(row.status));
}

export function summarize(rows) {
  return {
    total: rows.length,
    mandatory: rows.filter((r) => r.requirement.mandatory).length,
    optional: rows.filter((r) => !r.requirement.mandatory).length,
    ready: rows.filter((r) => r.status === STATUS.OK).length,
    blocking: getBlockingIssues(rows).length,
    optionalMissing: rows.filter((r) => r.status === STATUS.NOT_PROVIDED).length,
  };
}
