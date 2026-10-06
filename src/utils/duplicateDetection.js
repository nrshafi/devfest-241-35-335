function equalBytes(left, right) {
  if (!left || !right) return false
  const a = left instanceof Uint8Array ? left : new Uint8Array(left)
  const b = right instanceof Uint8Array ? right : new Uint8Array(right)
  if (a.byteLength !== b.byteLength) return false
  for (let i = 0; i < a.byteLength; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/** Confirms exact bytes among SHA-256 candidates. Returns Map(fileId -> group). */
export function findDuplicateGroups(files) {
  const byHash = new Map()
  for (const f of files) {
    if (!f.hash || f.error || !f.bytes) continue
    if (!byHash.has(f.hash)) byHash.set(f.hash, [])
    byHash.get(f.hash).push(f)
  }
  const info = new Map()
  let n = 0
  for (const [hash, members] of byHash) {
    const identicalSets = []
    for (const member of members) {
      const same = identicalSets.find((group) =>
        equalBytes(group[0].bytes, member.bytes),
      )
      if (same) same.push(member)
      else identicalSets.push([member])
    }
    for (const identical of identicalSets) {
      if (identical.length < 2) continue
      n += 1
      const group = {
        id: `D${n}`,
        hash,
        originalId: identical[0].id,
        memberIds: identical.map((m) => m.id),
      }
      for (const member of identical) info.set(member.id, group)
    }
  }
  return info
}
