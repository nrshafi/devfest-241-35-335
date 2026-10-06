import { describe, expect, test } from "bun:test"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  StandardFonts,
  decodePDFRawStream,
  degrees,
  rgb,
} from "pdf-lib"
import { generateTenderPackage } from "../src/utils/packageGenerator"
import { FOOTER_BAND, footerGeometry } from "../src/utils/pdfPageGeometry"

const tender = {
  tender_id: "TEST-01",
  title: "Tender",
  procuring_entity: "Entity",
  bidder: "Bidder",
  submission_deadline: "2026-10-20",
}
const requirement = (order = 1, overrides = {}) => ({
  id: `R${order}`,
  order,
  title_en: `Document ${order}`,
  title_bn: "নথি",
  mandatory: true,
  has_expiry: false,
  ...overrides,
})
const row = (bytes, order = 1, overrides = {}) => ({
  requirement: requirement(order),
  file: { id: `F${order}`, name: `source${order}.pdf`, bytes, pageCount: 999 },
  status: "ok",
  ...overrides,
})

function pageStreams(page) {
  const contents = page.node.Contents()
  if (!(contents instanceof PDFArray)) return ""
  return Array.from({ length: contents.size() }, (_, i) => {
    const stream = page.doc.context.lookup(contents.get(i))
    return new TextDecoder().decode(decodePDFRawStream(stream).decode())
  }).join("\n")
}

async function sourcePdf(label = "Original source", configure) {
  const source = await PDFDocument.create()
  const font = await source.embedFont(StandardFonts.Helvetica)
  const page = source.addPage([300, 400])
  page.drawText(label, { x: 5, y: 2, size: 10, font })
  if (configure) await configure(page, source)
  return source.save()
}

describe("PDF generation boundary", () => {
  test("sorts rows, uses actual parsed counts, and numbers all pages", async () => {
    const first = await sourcePdf("First document"),
      second = await sourcePdf("Second document")
    const result = await generateTenderPackage({
      tender,
      rows: [row(second, 2), row(first)],
    })
    expect(result.pageCount).toBe(3)
    expect(result.documents.map((entry) => entry.fileName)).toEqual([
      "source1.pdf",
      "source2.pdf",
    ])
    expect(result.documents.map((entry) => entry.start)).toEqual([2, 3])
    const output = await PDFDocument.load(result.bytes)
    const font = await output.embedFont(StandardFonts.Helvetica)
    output.getPages().forEach((page, i) => {
      const encodedFooter = font
        .encodeText(`${tender.tender_id} | Page ${i + 1} of 3`)
        .toString()
      expect(pageStreams(page)).toContain(encodedFooter)
      // Last stream draws the footer after the source clip's restoring Q.
      const contents = page.node.Contents()
      const last = new TextDecoder().decode(
        decodePDFRawStream(
          page.doc.context.lookup(contents.get(contents.size() - 1)),
        ).decode(),
      )
      expect(last).toContain(encodedFooter)
    })
    expect(pageStreams(output.getPage(1))).toContain(
      font.encodeText("First document").toString(),
    )
    expect(pageStreams(output.getPage(2))).toContain(
      font.encodeText("Second document").toString(),
    )
  })

  test("rejects blocked matched rows and missing mandatory requirements", async () => {
    const bytes = await sourcePdf()
    await expect(
      generateTenderPackage({
        tender,
        rows: [
          row(bytes, 1, {
            requirement: requirement(1, { has_expiry: true }),
            expiry: "2026-01-01",
          }),
        ],
      }),
    ).rejects.toMatchObject({ code: "BLOCKED_REQUIREMENT" })
    await expect(
      generateTenderPackage({
        tender,
        rows: [{ requirement: requirement(), file: null, status: "ok" }],
      }),
    ).rejects.toMatchObject({ code: "BLOCKED_REQUIREMENT" })
  })

  test("rejects duplicate identities and exact bytes even with different names and IDs", async () => {
    const bytes = await sourcePdf()
    await expect(
      generateTenderPackage({
        tender,
        rows: [row(bytes), row(bytes.slice(), 2)],
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_SOURCE" })
    const other = row(await sourcePdf("Different"), 2)
    other.file.id = "F1"
    await expect(
      generateTenderPackage({ tender, rows: [row(bytes), other] }),
    ).rejects.toMatchObject({ code: "DUPLICATE_SOURCE" })
  })

  test("rejects malformed sources and unsupported glyphs instead of replacing text", async () => {
    await expect(
      generateTenderPackage({ tender, rows: [row(new Uint8Array([1, 2]))] }),
    ).rejects.toMatchObject({
      code: "UNREADABLE_SOURCE",
      params: { fileName: "source1.pdf" },
    })
    const bytes = await sourcePdf()
    await expect(
      generateTenderPackage({
        tender: { ...tender, bidder: "বাংলা" },
        rows: [row(bytes)],
      }),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_TEXT",
      params: { field: "tender.bidder" },
    })
  })

  test("rejects oversized single covers without omitting any entries", async () => {
    const bytes = await sourcePdf()
    await expect(
      generateTenderPackage({
        tender: { ...tender, title: "Very long metadata ".repeat(500) },
        rows: [row(bytes)],
      }),
    ).rejects.toMatchObject({ code: "COVER_TOO_LARGE" })
  })

  test("includes every wrapped long-title line in cover and optional index", async () => {
    const bytes = await sourcePdf()
    const title = "Complete document title ".repeat(8) + "FINAL-WORD"
    const result = await generateTenderPackage({
      tender,
      rows: [
        row(bytes, 1, { requirement: requirement(1, { title_en: title }) }),
      ],
      includeIndex: true,
    })
    const output = await PDFDocument.load(result.bytes)
    const font = await output.embedFont(StandardFonts.Helvetica)
    expect(pageStreams(output.getPage(0))).toContain(
      font.encodeText("FINAL-WORD").toString().slice(1, -1),
    )
    expect(pageStreams(output.getPage(1))).toContain(
      font.encodeText("FINAL-WORD").toString().slice(1, -1),
    )
    expect(result.documents[0].start).toBe(3)
  })
})

describe("PDF visible geometry", () => {
  for (const rotation of [0, 90, 180, 270]) {
    test(`preserves source coordinates and orientation with a ${rotation}-degree crop`, async () => {
      const bytes = await sourcePdf("At source bottom", (page) => {
        page.setCropBox(20, 30, 240, 300)
        page.setRotation(degrees(rotation))
        page.drawRectangle({
          x: 20,
          y: 30,
          width: 240,
          height: 3,
          color: rgb(1, 0, 0),
        })
      })
      const source = await PDFDocument.load(bytes)
      const expected = footerGeometry(source.getPage(0))
      const result = await generateTenderPackage({ tender, rows: [row(bytes)] })
      const output = await PDFDocument.load(result.bytes)
      const page = output.getPage(1)
      expect(page.getRotation().angle).toBe(rotation)
      expect(page.getCropBox()).toEqual(expected.crop)
      expect(pageStreams(page)).toContain("20 30 240 300 re\nW\nn")
      expect(pageStreams(page)).toContain("1 0 0 1 20 30 cm")
      expect(
        rotation % 180 ? page.getCropBox().width : page.getCropBox().height,
      ).toBe((rotation % 180 ? 240 : 300) + FOOTER_BAND)
      await mkdir(".cache/pdf-repair", { recursive: true })
      await writeFile(
        `.cache/pdf-repair/geometry-${rotation}-source.pdf`,
        bytes,
      )
      await writeFile(
        `.cache/pdf-repair/geometry-${rotation}-output.pdf`,
        result.bytes,
      )
    })
  }

  test("preserves contained link annotations and rejects crossing crop annotations", async () => {
    const annotated = async (rect) =>
      sourcePdf("Link", (page, document) => {
        const annotation = document.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: rect,
          A: { Type: "Action", S: "URI", URI: "https://example.com" },
        })
        page.node.addAnnot(document.context.register(annotation))
      })
    const bytes = await annotated([10, 10, 100, 30])
    const result = await generateTenderPackage({ tender, rows: [row(bytes)] })
    const output = await PDFDocument.load(result.bytes)
    const annotation = output.getPage(1).node.Annots().lookup(0, PDFDict)
    expect(
      annotation
        .lookup(PDFName.of("Rect"), PDFArray)
        .asArray()
        .map((value) => value.asNumber()),
    ).toEqual([10, 10, 100, 30])
    await expect(
      generateTenderPackage({
        tender,
        rows: [row(await annotated([10, -10, 100, 30]))],
      }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_ANNOTATION" })
  })

  test("flattens field appearance without losing visible field content", async () => {
    const bytes = await sourcePdf("Form", (page, source) => {
      const field = source.getForm().createTextField("bidder")
      field.setText("Visible bidder")
      field.addToPage(page, { x: 30, y: 60, width: 150, height: 24 })
    })
    const result = await generateTenderPackage({ tender, rows: [row(bytes)] })
    const output = await PDFDocument.load(result.bytes)
    expect(output.getForm().getFields()).toHaveLength(0)
    expect(output.getPage(1).node.Annots()?.size() || 0).toBe(0)
    expect(pageStreams(output.getPage(1))).toContain("FlatWidget")
  })
})

test("resolved supplied fixture has 16 pages and correct starts", async () => {
  const pack = JSON.parse(
    await readFile("given_documents/sample-pack/requirements.json", "utf8"),
  )
  const names = {
    R01: "trade_license_2026.pdf",
    R02: "03_tin_certificate.pdf",
    R03: "04_vat_certificate.pdf",
    R04: "bank_solvency.pdf",
    R05: "experience_cert.pdf",
    R08: "02_technical_proposal.pdf",
    R09: "01_financial_proposal.pdf",
    R10: "scan_0042.pdf",
  }
  const rows = await Promise.all(
    pack.requirements.map(async (requirement) => {
      const name = names[requirement.id]
      const bytes = name
        ? new Uint8Array(
            await readFile(`given_documents/sample-pack/documents/${name}`),
          )
        : null
      return {
        requirement,
        file: bytes
          ? { id: requirement.id, name, bytes, pageCount: 999 }
          : null,
        expiry:
          requirement.id === "R01"
            ? "2027-06-30"
            : requirement.id === "R04"
              ? "2026-12-31"
              : "",
        status: name ? "ok" : "not_provided",
      }
    }),
  )
  const result = await generateTenderPackage({ tender: pack.tender, rows })
  expect(result.pageCount).toBe(16)
  expect(result.documents.map((entry) => entry.start)).toEqual([
    2, 3, 4, 5, 6, 8, 14, 16,
  ])
  const output = await PDFDocument.load(result.bytes)
  expect(output.getPageCount()).toBe(16)
  await mkdir(".cache/pdf-repair", { recursive: true })
  await writeFile(".cache/pdf-repair/T-2026-0417_Package.pdf", result.bytes)
})
