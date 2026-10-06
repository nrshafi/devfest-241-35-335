const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)
const hasText = (value) => typeof value === "string" && value.trim().length > 0

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false
  const [y, m, d] = value.split("-").map(Number)
  // setUTCFullYear avoids Date.UTC's special treatment of years 00–99.
  const dt = new Date(0)
  dt.setUTCFullYear(y, m - 1, d)
  return (
    y > 0 &&
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  )
}

/**
 * Validates and normalizes requirements.json without changing the input.
 * Failures contain locale-independent { key, vars } messages for the UI.
 * @returns {{ok: true, data: object} | {ok: false, errors: Array<{key: string, vars: object}>}}
 */
export function validateRequirementsJson(raw) {
  const errors = []
  const addError = (key, vars = {}) => errors.push({ key, vars })
  if (!isObject(raw))
    return { ok: false, errors: [{ key: "json_object_required", vars: {} }] }
  const tender = raw.tender
  if (!isObject(tender)) addError("json_tender_required")
  else {
    for (const k of [
      "tender_id",
      "title",
      "procuring_entity",
      "bidder",
      "submission_deadline",
    ]) {
      if (!hasText(tender[k]))
        addError("json_field_required", { field: `tender.${k}` })
    }
    if (
      hasText(tender.submission_deadline) &&
      !isValidIsoDate(tender.submission_deadline.trim())
    )
      addError("json_deadline_invalid", { field: "tender.submission_deadline" })
  }
  if (!Array.isArray(raw.requirements) || raw.requirements.length === 0)
    addError("json_requirements_required")
  else {
    const ids = new Set()
    const orders = new Set()
    raw.requirements.forEach((r, i) => {
      const label = `requirements[${i}]`
      if (!isObject(r)) return addError("json_requirement_object", { index: i })
      for (const field of ["id", "title_en", "title_bn"]) {
        if (!hasText(r[field]))
          addError("json_field_required", { field: `${label}.${field}` })
      }
      if (hasText(r.id)) {
        // Check the normalized form used by assignment maps.
        const id = r.id.trim()
        if (ids.has(id)) addError("json_duplicate_id", { id })
        else ids.add(id)
      }
      for (const field of ["mandatory", "has_expiry"]) {
        if (typeof r[field] !== "boolean")
          addError("json_boolean_required", { field: `${label}.${field}` })
      }
      if (!Number.isSafeInteger(r.order) || r.order <= 0) {
        addError("json_order_invalid", { field: `${label}.order` })
      } else if (orders.has(r.order)) {
        // Duplicate orders are ambiguous under the documented provisional policy.
        addError("json_duplicate_order", { order: r.order })
      } else orders.add(r.order)
    })
  }
  if (errors.length) return { ok: false, errors }

  const requirements = raw.requirements
    .map((r, i) => ({
      id: r.id.trim(),
      order: r.order,
      title_en: r.title_en.trim(),
      title_bn: r.title_bn.trim(),
      mandatory: r.mandatory,
      has_expiry: r.has_expiry,
      _index: i,
    }))
    .sort((a, b) => a.order - b.order)
  const t = raw.tender
  return {
    ok: true,
    data: {
      tender: {
        tender_id: t.tender_id.trim(),
        title: t.title.trim(),
        procuring_entity: t.procuring_entity.trim(),
        bidder: t.bidder.trim(),
        submission_deadline: t.submission_deadline.trim(),
      },
      requirements,
    },
  }
}
