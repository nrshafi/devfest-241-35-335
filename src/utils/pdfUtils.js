import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export const MAX_FILES = 30;
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

export function isPdfFile(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function hasPdfSignature(buffer) {
  const head = new Uint8Array(buffer.slice(0, 1024));
  const text = String.fromCharCode(...head);
  return text.includes("%PDF-");
}

export function openPdf(buffer) {
  // pdf.js transfers the buffer to its worker, so always hand it a copy
  return pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)), isEvalSupported: false }).promise;
}

/** Counts pages. Throws Error with code "password" | "damaged". Never depends on text extraction. */
export async function countPdfPages(buffer) {
  if (!hasPdfSignature(buffer)) throw Object.assign(new Error("Not a PDF"), { code: "damaged" });
  let doc;
  try {
    doc = await openPdf(buffer);
  } catch (e) {
    if (e && e.name === "PasswordException") throw Object.assign(new Error("Password protected"), { code: "password" });
    throw Object.assign(new Error("Damaged"), { code: "damaged" });
  }
  const n = doc.numPages;
  await doc.destroy();
  if (!n) throw Object.assign(new Error("No pages"), { code: "damaged" });
  return n;
}

export async function renderPage(doc, pageNumber, canvas, maxWidth) {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2, maxWidth / base.width) * (window.devicePixelRatio || 1);
  const viewport = page.getViewport({ scale });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${Math.floor(viewport.width / (window.devicePixelRatio || 1))}px`;
  const task = page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport });
  await task.promise;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
