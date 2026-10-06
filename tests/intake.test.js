import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { PDFDocument } from "pdf-lib"
import {
  countPdfPages,
  formatBytes,
  isPdfFile,
  MAX_TOTAL_BYTES,
} from "../src/utils/pdfUtils.js"
import { hashBuffer } from "../src/utils/hashing.js"
import { findDuplicateGroups } from "../src/utils/duplicateDetection.js"

const samples = new URL(
  "../given_documents/sample-pack/documents/",
  import.meta.url,
)
const fixturePages = {
  "01_financial_proposal.pdf": 2,
  "02_technical_proposal.pdf": 6,
  "03_tin_certificate.pdf": 1,
  "04_vat_certificate.pdf": 1,
  "bank_solvency.pdf": 1,
  "experience_cert.pdf": 2,
  "experience_cert (1).pdf": 2,
  "scan_0042.pdf": 1,
  "trade_license_2025.pdf": 1,
  "trade_license_2026.pdf": 1,
}

test("all supplied PDFs, including the image-only scan, count without loading PDF.js", async () => {
  for (const [name, expected] of Object.entries(fixturePages)) {
    const bytes = new Uint8Array(await readFile(new URL(name, samples)))
    const before = bytes.slice()
    assert.equal(await countPdfPages(bytes), expected, name)
    assert.deepEqual(bytes, before, "intake preserves original bytes")
  }
})

test("non-PDF, truncated content and zero-page PDF are rejected", async () => {
  const png = await readFile(new URL("company_logo.png", samples))
  assert.equal(
    isPdfFile({ name: "company_logo.png", type: "image/png" }),
    false,
  )
  await assert.rejects(countPdfPages(png), { code: "damaged" })
  await assert.rejects(
    countPdfPages(new TextEncoder().encode("%PDF-1.4\ninvalid")),
    { code: "damaged" },
  )
  const empty = await PDFDocument.create()
  await assert.rejects(
    countPdfPages(await empty.save({ addDefaultPage: false })),
    { code: "damaged" },
  )
})

test("encrypted PDF is classified as password-protected", async () => {
  const encrypted = new TextEncoder().encode(
    "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Count 0 /Kids [] >> endobj\n3 0 obj << /Filter /Standard >> endobj\ntrailer << /Root 1 0 R /Encrypt 3 0 R >>\n%%EOF",
  )
  await assert.rejects(countPdfPages(encrypted), { code: "password" })
})

test("intake uses the documented decimal 50 MB limit and labels", () => {
  assert.equal(MAX_TOTAL_BYTES, 50_000_000)
  assert.equal(formatBytes(MAX_TOTAL_BYTES), "50.0 MB")
  assert.equal(formatBytes(1500), "2 KB")
})

test("SHA-256 works with native crypto, no crypto, and rejected crypto", async () => {
  const vectors = [
    [
      new Uint8Array(),
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    ],
    [
      new TextEncoder().encode("abc"),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    ],
    [
      new TextEncoder().encode(
        "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
      ),
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    ],
  ]
  for (const length of [55, 56, 63, 64, 65, 262_145]) {
    const bytes = Uint8Array.from({ length }, (_, i) => (i * 37) & 255)
    vectors.push([bytes, createHash("sha256").update(bytes).digest("hex")])
  }
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto")
  const native = globalThis.crypto
  try {
    for (const cryptoValue of [
      native,
      undefined,
      {
        subtle: {
          digest: async () => {
            throw new Error("Blocked")
          },
        },
      },
    ]) {
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        value: cryptoValue,
      })
      for (const [bytes, expected] of vectors)
        assert.equal(await hashBuffer(bytes), expected)
    }
    const backing = new Uint8Array([99, 97, 98, 99, 99])
    assert.equal(await hashBuffer(backing.subarray(1, 4)), vectors[1][1])
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "crypto", descriptor)
    else delete globalThis.crypto
  }
})

test("duplicate detection confirms bytes and tolerates hash collisions", async () => {
  const a = await readFile(new URL("experience_cert.pdf", samples))
  const b = await readFile(new URL("experience_cert (1).pdf", samples))
  const hash = await hashBuffer(a)
  const changed = new Uint8Array(a)
  changed[100] ^= 1
  const groups = findDuplicateGroups([
    { id: "original", hash, bytes: a },
    { id: "copy", hash, bytes: b },
    { id: "collision", hash, bytes: changed },
    { id: "missingBytes", hash },
    { id: "failed", hash, bytes: a, error: "damaged" },
  ])
  assert.deepEqual(groups.get("original").memberIds, ["original", "copy"])
  assert.equal(groups.get("copy"), groups.get("original"))
  assert.equal(groups.size, 2)
})
