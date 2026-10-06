import {
  PDFDict,
  PDFDocument,
  PDFName,
  StandardFonts,
  rgb,
  degrees,
} from "pdf-lib"
import { formatDate, todayIso } from "./dates"
import { getRequirementStatus, STATUS } from "./validation"
import { validateRequirementsJson } from "./jsonValidation"
import { footerGeometry, reserveFooterBand } from "./pdfPageGeometry"

const INK = rgb(0.09, 0.13, 0.18),
  MUTED = rgb(0.38, 0.43, 0.5),
  RULE = rgb(0.82, 0.85, 0.88)
const PAGE_WIDTH = 595.28,
  PAGE_HEIGHT = 841.89,
  LEFT = 56,
  RIGHT = PAGE_WIDTH - LEFT

export class PackageGenerationError extends Error {
  constructor(code, params = {}) {
    super(code)
    this.name = "PackageGenerationError"
    this.code = code
    this.params = params
    this.fileName = params.fileName
  }
}
const fail = (code, params) => {
  throw new PackageGenerationError(code, params)
}

function assertSupportedText(font, text, field) {
  try {
    font.encodeText(String(text))
  } catch {
    fail("UNSUPPORTED_TEXT", { field })
  }
}

/** Wrap all words, including long unbroken IDs; never discard a title line. */
function wrap(text, font, size, width) {
  const lines = []
  let line = ""
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate
      continue
    }
    if (line) {
      lines.push(line)
      line = ""
    }
    for (const char of word) {
      if (line && font.widthOfTextAtSize(line + char, size) > width) {
        lines.push(line)
        line = ""
      }
      line += char
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : [""]
}

function coverFields(tender) {
  return [
    ["Tender ID", tender.tender_id],
    ["Tender Title", tender.title],
    ["Procuring Entity", tender.procuring_entity],
    ["Bidder", tender.bidder],
    ["Submission Deadline", formatDate(tender.submission_deadline, "en", true)],
    ["Package Created", formatDate(todayIso(), "en", true)],
  ]
}

function coverLayout(font, fields, docs, size) {
  let y = 698
  const entries = fields.map(([label, value]) => {
    const lines = wrap(value, font, size, RIGHT - LEFT - 138)
    const entry = { label, lines, y }
    y -= lines.length * (size + 3) + 11
    return entry
  })
  y -= 20
  const headingY = y
  y -= 34
  const rows = docs.map((doc, i) => {
    const lines = wrap(doc.title, font, size, RIGHT - LEFT - 116)
    const entry = { doc, i, lines, y }
    y -= lines.length * (size + 3) + 9
    return entry
  })
  return { entries, rows, headingY, bottom: y, size }
}

function drawCover(doc, fonts, tender, docs) {
  const fields = coverFields(tender)
  let layout
  for (let size = 11.5; size >= 8.5; size -= 0.5) {
    const candidate = coverLayout(fonts.regular, fields, docs, size)
    if (candidate.bottom >= 60) {
      layout = candidate
      break
    }
  }
  if (!layout) fail("COVER_TOO_LARGE")
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  page.drawText("TENDER DOCUMENT PACKAGE", {
    x: LEFT,
    y: 762,
    size: 22,
    font: fonts.bold,
    color: INK,
  })
  page.drawText("Submission package compiled with TenderPack", {
    x: LEFT,
    y: 742,
    size: 10,
    font: fonts.regular,
    color: MUTED,
  })
  page.drawLine({
    start: { x: LEFT, y: 725 },
    end: { x: RIGHT, y: 725 },
    thickness: 0.75,
    color: RULE,
  })
  const text = { size: layout.size, font: fonts.regular, color: INK }
  for (const entry of layout.entries) {
    page.drawText(entry.label.toUpperCase(), {
      x: LEFT,
      y: entry.y,
      size: 8,
      font: fonts.bold,
      color: MUTED,
    })
    entry.lines.forEach((line, i) =>
      page.drawText(line, {
        x: LEFT + 138,
        y: entry.y - i * (layout.size + 3),
        ...text,
      }),
    )
  }
  page.drawText("Included Documents", {
    x: LEFT,
    y: layout.headingY,
    size: 13,
    font: fonts.bold,
    color: INK,
  })
  page.drawText("#", {
    x: LEFT,
    y: layout.headingY - 21,
    size: 8,
    font: fonts.bold,
    color: MUTED,
  })
  page.drawText("DOCUMENT", {
    x: LEFT + 28,
    y: layout.headingY - 21,
    size: 8,
    font: fonts.bold,
    color: MUTED,
  })
  page.drawText("PAGES", {
    x: RIGHT - 76,
    y: layout.headingY - 21,
    size: 8,
    font: fonts.bold,
    color: MUTED,
  })
  for (const { doc: entry, i, lines, y } of layout.rows) {
    page.drawText(String(i + 1), { x: LEFT, y, ...text })
    lines.forEach((line, n) =>
      page.drawText(line, {
        x: LEFT + 28,
        y: y - n * (layout.size + 3),
        ...text,
      }),
    )
    const range =
      entry.start === entry.end
        ? `${entry.start}`
        : `${entry.start}-${entry.end}`
    page.drawText(range, { x: RIGHT - 76, y, ...text })
  }
  return page
}

function drawIndex(doc, fonts, docs) {
  let layout
  for (let size = 11; size >= 8.5; size -= 0.5) {
    let y = 700
    const rows = docs.map((entry) => {
      const lines = wrap(entry.title, fonts.regular, size, RIGHT - LEFT - 110)
      const row = { entry, lines, y }
      y -= lines.length * (size + 3) + 10
      return row
    })
    if (y >= 60) {
      layout = { rows, size }
      break
    }
  }
  if (!layout) fail("INDEX_TOO_LARGE")
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  page.drawText("Index", {
    x: LEFT,
    y: 762,
    size: 20,
    font: fonts.bold,
    color: INK,
  })
  page.drawText("DOCUMENT", {
    x: LEFT,
    y: 725,
    size: 8,
    font: fonts.bold,
    color: MUTED,
  })
  page.drawText("STARTS ON PAGE", {
    x: RIGHT - 90,
    y: 725,
    size: 8,
    font: fonts.bold,
    color: MUTED,
  })
  for (const { entry, lines, y } of layout.rows) {
    const options = { size: layout.size, font: fonts.regular, color: INK }
    lines.forEach((line, i) =>
      page.drawText(line, {
        x: LEFT,
        y: y - i * (layout.size + 3),
        ...options,
      }),
    )
    page.drawText(String(entry.start), { x: RIGHT - 90, y, ...options })
  }
  return page
}

function drawFooter(page, font, text, geometry) {
  const { source: box, rotation, band, visualWidth } = geometry
  const size = Math.min(9, (visualWidth - 20) / font.widthOfTextAtSize(text, 1))
  if (size < 7) fail("FOOTER_TOO_LONG")
  const width = font.widthOfTextAtSize(text, size),
    offset = (band - size) / 2
  let x, y
  if (rotation === 0) {
    x = box.x + (box.width - width) / 2
    y = box.y - band + offset
  }
  if (rotation === 90) {
    x = box.x + box.width + band - offset
    y = box.y + (box.height - width) / 2
  }
  if (rotation === 180) {
    x = box.x + (box.width + width) / 2
    y = box.y + box.height + band - offset
  }
  if (rotation === 270) {
    x = box.x - band + offset
    y = box.y + (box.height + width) / 2
  }
  page.drawText(text, {
    x,
    y,
    size,
    font,
    rotate: degrees(rotation),
    color: MUTED,
  })
}

const sameBytes = (a, b) =>
  a.length === b.length && a.every((value, i) => value === b[i])

/** Validates the snapshot again; no matched row or source page may be silently skipped. */
export async function generateTenderPackage({
  tender,
  rows,
  includeIndex = false,
}) {
  if (
    !Array.isArray(rows) ||
    !rows.length ||
    rows.some((row) => !row?.requirement)
  )
    fail("INVALID_INPUT")
  const schema = validateRequirementsJson({
    tender,
    requirements: rows.map((row) => row.requirement),
  })
  if (!schema.ok) fail("INVALID_INPUT")
  const sorted = [...rows].sort(
    (a, b) => a.requirement.order - b.requirement.order,
  )
  for (const row of sorted) {
    if (
      getRequirementStatus(
        row.requirement,
        row.file,
        row.expiry,
        tender.submission_deadline,
      ) !== (row.file ? STATUS.OK : STATUS.NOT_PROVIDED)
    ) {
      fail("BLOCKED_REQUIREMENT", { title: row.requirement.title_en })
    }
    if (
      row.file?.error ||
      (row.file &&
        (!row.file.id ||
          (!row.file.bytes?.byteLength && !row.file.file?.arrayBuffer)))
    )
      fail("INVALID_REFERENCE", { title: row.requirement.title_en })
  }
  const included = sorted.filter((row) => row.file)
  const ids = new Set(),
    sources = []
  for (const row of included) {
    if (ids.has(row.file.id))
      fail("DUPLICATE_SOURCE", { fileName: row.file.name })
    ids.add(row.file.id)
    let bytes, source
    try {
      bytes = row.file.bytes?.byteLength
        ? new Uint8Array(row.file.bytes).slice()
        : new Uint8Array(await row.file.file.arrayBuffer())
      source = await PDFDocument.load(bytes, { updateMetadata: false })
    } catch {
      fail("UNREADABLE_SOURCE", { fileName: row.file.name })
    }
    if (!source.getPageCount())
      fail("UNREADABLE_SOURCE", { fileName: row.file.name })
    if (sources.some((other) => sameBytes(other.bytes, bytes)))
      fail("DUPLICATE_SOURCE", { fileName: row.file.name })
    try {
      const form = source.getForm()
      if (form.getFields().length) {
        const widgetRefs = new Set()
        for (const page of source.getPages()) {
          const annotations = page.node.Annots()
          if (annotations)
            for (let i = 0; i < annotations.size(); i++) {
              const annotation = annotations.lookup(i, PDFDict)
              if (
                annotation.get(PDFName.of("Subtype")) === PDFName.of("Widget")
              )
                widgetRefs.add(annotations.get(i))
            }
        }
        form.flatten({ updateFieldAppearances: false })
        // pdf-lib 1.17.1 removes field objects but can leave their original
        // widget references in /Annots. Remove only the recorded widgets.
        for (const page of source.getPages()) {
          const annotations = page.node.Annots()
          if (annotations)
            for (let i = annotations.size() - 1; i >= 0; i--) {
              if (widgetRefs.has(annotations.get(i))) annotations.remove(i)
            }
        }
      }
    } catch {
      fail("UNSUPPORTED_ANNOTATION", { fileName: row.file.name })
    }
    sources.push({ row, bytes, source })
  }
  const out = await PDFDocument.create()
  out.setTitle(`${tender.tender_id} Tender Document Package`)
  out.setAuthor(tender.bidder)
  out.setProducer("TenderPack")
  out.setCreator("TenderPack")
  const fonts = {
    regular: await out.embedFont(StandardFonts.Helvetica),
    bold: await out.embedFont(StandardFonts.HelveticaBold),
  }
  for (const [key, value] of Object.entries(tender))
    if (typeof value === "string")
      assertSupportedText(fonts.regular, value, `tender.${key}`)
  for (const { row } of sources)
    assertSupportedText(
      fonts.regular,
      row.requirement.title_en,
      `requirements.${row.requirement.id}.title_en`,
    )
  let cursor = 2 + (includeIndex ? 1 : 0)
  const docs = sources.map(({ row, source }) => {
    const entry = {
      title: row.requirement.title_en,
      fileName: row.file.name,
      start: cursor,
      end: cursor + source.getPageCount() - 1,
    }
    cursor += source.getPageCount()
    return entry
  })
  const geometries = []
  const reserve = (page, fileName) => {
    let geometry
    try {
      geometry = footerGeometry(page)
    } catch {
      fail("UNSUPPORTED_GEOMETRY", { fileName: fileName || "cover" })
    }
    try {
      reserveFooterBand(page, geometry)
    } catch {
      fail("UNSUPPORTED_ANNOTATION", { fileName: fileName || "cover" })
    }
    geometries.push(geometry)
  }
  reserve(drawCover(out, fonts, tender, docs))
  if (includeIndex) reserve(drawIndex(out, fonts, docs))
  for (const { row, source } of sources) {
    const pages = await out.copyPages(source, source.getPageIndices())
    for (const page of pages) {
      out.addPage(page)
      reserve(page, row.file.name)
    }
  }
  const all = out.getPages()
  all.forEach((page, i) =>
    drawFooter(
      page,
      fonts.regular,
      `${tender.tender_id} | Page ${i + 1} of ${all.length}`,
      geometries[i],
    ),
  )
  return {
    bytes: await out.save(),
    pageCount: all.length,
    documents: docs,
    fileName: packageFileName(tender),
  }
}

export function packageFileName(tender) {
  return `${tender.tender_id.replace(/[\\/:*?"<>|]+/g, "-")}_Package.pdf`
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function downloadPackage(result) {
  downloadBlob(
    new Blob([result.bytes], { type: "application/pdf" }),
    result.fileName,
  )
}

export function exportChecklistCsv(tender, rows) {
  const esc = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`
  const labels = {
    ok: "OK",
    missing: "Missing",
    expiry_needed: "Expiry date needed",
    expired: "Expired",
    not_provided: "Not provided",
  }
  const lines = [
    [
      "Order",
      "Document",
      "Mandatory",
      "File Name",
      "Pages",
      "Expiry Date",
      "Status",
    ]
      .map(esc)
      .join(","),
  ]
  rows.forEach((row, i) => {
    lines.push(
      [
        row.requirement.order ?? i + 1,
        row.requirement.title_en,
        row.requirement.mandatory ? "Yes" : "No",
        row.file?.name || "",
        row.file?.pageCount || "",
        row.requirement.has_expiry && row.file ? row.expiry : "",
        labels[row.status],
      ]
        .map(esc)
        .join(","),
    )
  })
  downloadBlob(
    new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    }),
    `${tender.tender_id}_Checklist.csv`,
  )
}
