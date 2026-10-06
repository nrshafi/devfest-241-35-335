const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Validates and normalizes a requirements.json object. Returns { ok, data } or { ok:false, errors }. */
export function validateRequirementsJson(raw) {
  const errors = [];
  if (!raw || typeof raw !== "object") return { ok: false, errors: ["The file does not contain a JSON object."] };
  const tender = raw.tender;
  if (!tender || typeof tender !== "object") errors.push('Missing "tender" object.');
  else {
    for (const k of ["tender_id", "title", "procuring_entity", "bidder", "submission_deadline"]) {
      if (typeof tender[k] !== "string" || !tender[k].trim()) errors.push(`tender.${k} is missing.`);
    }
    if (typeof tender.submission_deadline === "string" && tender.submission_deadline && !isValidIsoDate(tender.submission_deadline))
      errors.push("tender.submission_deadline must be a date in YYYY-MM-DD format.");
  }
  if (!Array.isArray(raw.requirements) || raw.requirements.length === 0) errors.push('"requirements" must be a non-empty list.');
  else {
    const ids = new Set();
    raw.requirements.forEach((r, i) => {
      const label = `requirements[${i}]`;
      if (!r || typeof r !== "object") return errors.push(`${label} is not an object.`);
      if (typeof r.id !== "string" || !r.id.trim()) errors.push(`${label}.id is missing.`);
      else if (ids.has(r.id)) errors.push(`Duplicate requirement id "${r.id}".`);
      else ids.add(r.id);
      if (typeof r.title_en !== "string" || !r.title_en.trim()) errors.push(`${label}.title_en is missing.`);
      if (typeof r.mandatory !== "boolean") errors.push(`${label}.mandatory must be true or false.`);
      if (typeof r.has_expiry !== "boolean") errors.push(`${label}.has_expiry must be true or false.`);
      if (r.order !== undefined && (typeof r.order !== "number" || !Number.isFinite(r.order))) errors.push(`${label}.order must be a number.`);
    });
  }
  if (errors.length) return { ok: false, errors };

  const requirements = raw.requirements
    .map((r, i) => ({
      id: r.id.trim(),
      order: typeof r.order === "number" ? r.order : null,
      title_en: r.title_en.trim(),
      title_bn: typeof r.title_bn === "string" && r.title_bn.trim() ? r.title_bn.trim() : r.title_en.trim(),
      mandatory: r.mandatory,
      has_expiry: r.has_expiry,
      _index: i,
    }))
    .sort((a, b) => {
      if (a.order !== null && b.order !== null && a.order !== b.order) return a.order - b.order;
      if (a.order !== null && b.order === null) return -1;
      if (a.order === null && b.order !== null) return 1;
      if (a.order === null) return a.id.localeCompare(b.id, undefined, { numeric: true });
      return a._index - b._index;
    });
  const t = raw.tender;
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
  };
}
