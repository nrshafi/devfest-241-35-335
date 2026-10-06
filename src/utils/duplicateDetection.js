/** Groups files with identical SHA-256 hashes. Returns Map(fileId -> { group, originalId, members }). */
export function findDuplicateGroups(files) {
  const byHash = new Map();
  for (const f of files) {
    if (!f.hash || f.error) continue;
    if (!byHash.has(f.hash)) byHash.set(f.hash, []);
    byHash.get(f.hash).push(f);
  }
  const info = new Map();
  let n = 0;
  for (const [hash, members] of byHash) {
    if (members.length < 2) continue;
    n += 1;
    const group = { id: `D${n}`, hash, originalId: members[0].id, memberIds: members.map((m) => m.id) };
    for (const m of members) info.set(m.id, group);
  }
  return info;
}
