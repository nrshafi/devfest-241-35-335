const GENERIC = new Set(["certificate", "cert", "certificates", "proposal", "statement", "document", "doc", "copy", "letter", "of", "the", "and", "for", "a", "an", "s", "final", "signed"]);

export function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[_\-.()[\]]+/g, " ")
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokens = (s) => normalizeName(s).split(" ").filter((t) => t.length >= 2 && !/^\d+$/.test(t));

function tokenHit(fileTok, titleTok) {
  if (fileTok === titleTok) return true;
  if (fileTok.length >= 3 && titleTok.startsWith(fileTok)) return true;
  if (titleTok.length >= 3 && fileTok.startsWith(titleTok)) return true;
  return false;
}

function score(fileToks, title) {
  const titleToks = tokens(title);
  if (!titleToks.length) return 0;
  let total = 0, hit = 0, strong = false;
  for (const tt of titleToks) {
    const w = GENERIC.has(tt) ? 0.5 : 1;
    total += w;
    if (fileToks.some((ft) => tokenHit(ft, tt))) {
      hit += w;
      if (w === 1) strong = true;
    }
  }
  return strong ? hit / total : 0;
}

/** Best filename-based suggestion for one file. Returns { requirementId, score } or null. */
export function suggestMatch(fileName, requirements) {
  const ft = tokens(fileName);
  let best = null;
  for (const r of requirements) {
    const s = Math.max(score(ft, r.title_en), r.title_bn ? score(tokens(fileName), r.title_bn) : 0);
    if (s >= 0.5 && (!best || s > best.score)) best = { requirementId: r.id, score: s };
  }
  return best;
}

/**
 * Suggestions for every valid file. Names alone decide, except for one
 * elimination rule: if exactly one file has no name-based suggestion and
 * exactly one mandatory requirement has no suggested candidate, pair them as
 * a weaker "possible" suggestion (e.g. a generically named scan).
 */
export function suggestAll(files, requirements, duplicateInfo) {
  const result = {};
  const valid = files.filter((f) => !f.error && f.pageCount);
  for (const f of valid) {
    const s = suggestMatch(f.name, requirements);
    if (s) result[f.id] = { ...s, weak: false };
  }
  // copies of the same content count as one file for elimination
  const unsuggested = valid.filter((f) => !result[f.id] && !(duplicateInfo.get(f.id) && duplicateInfo.get(f.id).originalId !== f.id));
  const covered = new Set(Object.values(result).map((s) => s.requirementId));
  const open = requirements.filter((r) => r.mandatory && !covered.has(r.id));
  if (unsuggested.length === 1 && open.length === 1) result[unsuggested[0].id] = { requirementId: open[0].id, score: 0, weak: true };
  return result;
}

/** Checks whether a file may be assigned to a requirement. Returns null if allowed, or an error descriptor. */
export function checkAssignment(fileId, requirementId, files, matches, duplicateInfo) {
  const file = files.find((f) => f.id === fileId);
  if (!file) return { code: "file_missing" };
  if (file.error || !file.pageCount) return { code: "file_invalid" };
  for (const [reqId, fid] of Object.entries(matches)) {
    if (reqId === requirementId) continue;
    if (fid === fileId) return { code: "already_matched", requirementId: reqId };
    const g = duplicateInfo.get(fileId);
    if (g && g.memberIds.includes(fid)) return { code: "duplicate_used", requirementId: reqId, otherFileId: fid };
  }
  return null;
}
