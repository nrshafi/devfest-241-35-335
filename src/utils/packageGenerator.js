import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { formatDate, todayIso } from "./dates";
import { STATUS } from "./validation";

const INK = rgb(0.09, 0.13, 0.18);
const MUTED = rgb(0.38, 0.43, 0.5);
const RULE = rgb(0.82, 0.85, 0.88);
const ACCENT = rgb(0.06, 0.4, 0.42);

// Standard fonts only cover WinAnsi; replace anything else so generation never fails on unusual text.
const safe = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

function wrap(text, font, size, maxWidth) {
  const words = safe(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCover(doc, fonts, tender, docs) {
  const page = doc.addPage([595.28, 841.89]);
  const { regular, bold } = fonts;
  const L = 64, R = 595.28 - 64, W = R - L;
  let y = 770;
  page.drawRectangle({ x: L, y: y + 8, width: 36, height: 4, color: ACCENT });
  y -= 22;
  page.drawText("TENDER DOCUMENT PACKAGE", { x: L, y, size: 22, font: bold, color: INK });
  y -= 18;
  page.drawText("Submission package compiled with TenderPack", { x: L, y, size: 10, font: regular, color: MUTED });
  y -= 28;
  page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.75, color: RULE });
  y -= 26;
  const fields = [
    ["Tender ID", tender.tender_id],
    ["Tender Title", tender.title],
    ["Procuring Entity", tender.procuring_entity],
    ["Bidder", tender.bidder],
    ["Submission Deadline", formatDate(tender.submission_deadline, "en", true)],
    ["Package Created", formatDate(todayIso(), "en", true)],
  ];
  for (const [label, value] of fields) {
    page.drawText(label.toUpperCase(), { x: L, y, size: 8, font: bold, color: MUTED });
    const lines = wrap(value, regular, 11.5, W - 150);
    lines.forEach((ln, i) => page.drawText(ln, { x: L + 150, y: y - i * 15, size: 11.5, font: regular, color: INK }));
    y -= Math.max(1, lines.length) * 15 + 10;
  }
  y -= 12;
  page.drawText("Included Documents", { x: L, y, size: 13, font: bold, color: INK });
  y -= 20;
  page.drawText("#", { x: L, y, size: 8, font: bold, color: MUTED });
  page.drawText("DOCUMENT", { x: L + 28, y, size: 8, font: bold, color: MUTED });
  page.drawText("PAGES", { x: R - 60, y, size: 8, font: bold, color: MUTED });
  y -= 8;
  page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.5, color: RULE });
  const rowSize = docs.length > 25 ? 9 : 10.5;
  const rowGap = docs.length > 25 ? 15 : 20;
  for (const [i, d] of docs.entries()) {
    y -= rowGap - 4;
    if (y < 70) break;
    page.drawText(String(i + 1), { x: L, y, size: rowSize, font: regular, color: MUTED });
    const title = wrap(d.title, regular, rowSize, W - 120)[0] || "";
    page.drawText(title, { x: L + 28, y, size: rowSize, font: regular, color: INK });
    const range = d.start === d.end ? `${d.start}` : `${d.start}-${d.end}`;
    page.drawText(range, { x: R - 60, y, size: rowSize, font: regular, color: INK });
    y -= 6;
    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.4, color: RULE });
  }
}

function drawIndex(doc, fonts, docs) {
  const page = doc.addPage([595.28, 841.89]);
  const { regular, bold } = fonts;
  const L = 64, R = 595.28 - 64;
  let y = 760;
  page.drawText("Index", { x: L, y, size: 20, font: bold, color: INK });
  y -= 34;
  page.drawText("DOCUMENT", { x: L, y, size: 8, font: bold, color: MUTED });
  page.drawText("STARTS ON PAGE", { x: R - 80, y, size: 8, font: bold, color: MUTED });
  y -= 8;
  page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.5, color: RULE });
  for (const d of docs) {
    y -= 18;
    if (y < 70) break;
    page.drawText(wrap(d.title, regular, 11, R - L - 110)[0] || "", { x: L, y, size: 11, font: regular, color: INK });
    page.drawText(String(d.start), { x: R - 80, y, size: 11, font: regular, color: INK });
    y -= 7;
    page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.4, color: RULE });
  }
}

/** Draws "<id> | Page X of Y" at the visual bottom centre, respecting crop box and page rotation. */
function drawFooter(page, font, text) {
  const size = 9;
  const tw = font.widthOfTextAtSize(text, size);
  const { x, y, width, height } = page.getCropBox();
  const rot = ((page.getRotation().angle % 360) + 360) % 360;
  const m = 16, pad = 5;
  const box = { color: rgb(1, 1, 1), opacity: 0.9 };
  const txt = { size, font, color: rgb(0.2, 0.24, 0.3) };
  if (rot === 90) {
    const bx = x + width - m;
    page.drawRectangle({ x: bx - size - 2, y: y + height / 2 - tw / 2 - pad, width: size + pad + 2, height: tw + pad * 2, ...box });
    page.drawText(text, { x: bx, y: y + height / 2 - tw / 2, rotate: degrees(90), ...txt });
  } else if (rot === 180) {
    const by = y + height - m;
    page.drawRectangle({ x: x + width / 2 - tw / 2 - pad, y: by - 3, width: tw + pad * 2, height: size + pad, ...box });
    page.drawText(text, { x: x + width / 2 + tw / 2, y: by, rotate: degrees(180), ...txt });
  } else if (rot === 270) {
    const bx = x + m;
    page.drawRectangle({ x: bx - 3, y: y + height / 2 - tw / 2 - pad, width: size + pad, height: tw + pad * 2, ...box });
    page.drawText(text, { x: bx, y: y + height / 2 + tw / 2, rotate: degrees(270), ...txt });
  } else {
    const by = y + m;
    page.drawRectangle({ x: x + width / 2 - tw / 2 - pad, y: by - 4, width: tw + pad * 2, height: size + pad + 2, ...box });
    page.drawText(text, { x: x + width / 2 - tw / 2, y: by, ...txt });
  }
}

/**
 * Builds the package: cover (+ optional index) then matched PDFs in requirement order.
 * `rows` must already be sorted by requirement.order.
 */
export async function generateTenderPackage({ tender, rows, includeIndex = false }) {
  const included = rows.filter((r) => r.file && r.status === STATUS.OK);
  const out = await PDFDocument.create();
  out.setTitle(`${tender.tender_id} Tender Document Package`);
  out.setAuthor(tender.bidder);
  out.setProducer("TenderPack");
  out.setCreator("TenderPack");
  const fonts = { regular: await out.embedFont(StandardFonts.Helvetica), bold: await out.embedFont(StandardFonts.HelveticaBold) };

  const front = 1 + (includeIndex ? 1 : 0);
  let cursor = front + 1;
  const docs = included.map((r) => {
    const d = { title: r.requirement.title_en, fileName: r.file.name, start: cursor, end: cursor + r.file.pageCount - 1 };
    cursor += r.file.pageCount;
    return d;
  });

  drawCover(out, fonts, tender, docs);
  if (includeIndex) drawIndex(out, fonts, docs);

  for (const r of included) {
    let src;
    try {
      src = await PDFDocument.load(await r.file.file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
    } catch {
      throw Object.assign(new Error(`Could not read ${r.file.name}`), { fileName: r.file.name });
    }
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }

  const all = out.getPages();
  all.forEach((p, i) => drawFooter(p, fonts.regular, safe(`${tender.tender_id} | Page ${i + 1} of ${all.length}`)));

  const bytes = await out.save();
  return { bytes, pageCount: all.length, documents: docs, fileName: packageFileName(tender) };
}

export function packageFileName(tender) {
  return `${tender.tender_id.replace(/[\\/:*?"<>|]+/g, "-")}_Package.pdf`;
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadPackage(result) {
  downloadBlob(new Blob([result.bytes], { type: "application/pdf" }), result.fileName);
}

export function exportChecklistCsv(tender, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const label = { ok: "OK", missing: "Missing", expiry_needed: "Expiry date needed", expired: "Expired", not_provided: "Not provided", invalid_date: "Invalid date" };
  const lines = [["Order", "Document", "Mandatory", "File Name", "Pages", "Expiry Date", "Status"].map(esc).join(",")];
  rows.forEach((r, i) => {
    lines.push([r.requirement.order ?? i + 1, r.requirement.title_en, r.requirement.mandatory ? "Yes" : "No", r.file?.name || "", r.file?.pageCount || "", r.requirement.has_expiry && r.file ? r.expiry : "", label[r.status]].map(esc).join(","));
  });
  downloadBlob(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), `${tender.tender_id}_Checklist.csv`);
}
