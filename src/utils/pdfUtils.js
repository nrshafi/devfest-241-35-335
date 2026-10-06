import { PDFDocument } from "pdf-lib"

let previewLibrary
async function getPreviewLibrary() {
  // Optional preview failures must not prevent PDF intake and assembly.
  if (!previewLibrary) {
    previewLibrary = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ])
      .then(([library, worker]) => {
        library.GlobalWorkerOptions.workerSrc = worker.default
        return library
      })
      .catch((error) => {
        previewLibrary = null
        throw error
      })
  }
  return previewLibrary
}

export const MAX_FILES = 30
export const MAX_TOTAL_BYTES = 50_000_000

export function isPdfFile(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name)
}

export function hasPdfSignature(buffer) {
  const head = new Uint8Array(buffer.slice(0, 1024))
  const text = String.fromCharCode(...head)
  return text.includes("%PDF-")
}

export async function openPdf(buffer) {
  const pdfjsLib = await getPreviewLibrary()
  // pdf.js transfers the buffer to its worker, so always hand it a copy
  return pdfjsLib.getDocument({
    data: new Uint8Array(buffer.slice(0)),
    isEvalSupported: false,
  }).promise
}

/** Counts pages. Throws Error with code "password" | "damaged". Never depends on text extraction. */
export async function countPdfPages(buffer) {
  if (!hasPdfSignature(buffer))
    throw Object.assign(new Error("Not a PDF"), { code: "damaged" })
  try {
    // Read the encryption flag explicitly: pdf-lib's transpiled Error subclass
    // does not reliably preserve instanceof across runtimes. Never accept it.
    const doc = await PDFDocument.load(buffer, {
      updateMetadata: false,
      ignoreEncryption: true,
    })
    if (doc.isEncrypted)
      throw Object.assign(new Error("Password protected"), { code: "password" })
    const pages = doc.getPageCount()
    if (!pages) throw new Error("No pages")
    return pages
  } catch (e) {
    if (e?.code === "password") throw e
    throw Object.assign(new Error("Damaged"), { code: "damaged" })
  }
}

export async function renderPage(doc, pageNumber, canvas, maxWidth) {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const scale =
    Math.min(2, maxWidth / base.width) * (window.devicePixelRatio || 1)
  const viewport = page.getViewport({ scale })
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  canvas.style.width = `${Math.floor(viewport.width / (window.devicePixelRatio || 1))}px`
  const task = page.render({
    canvas,
    canvasContext: canvas.getContext("2d"),
    viewport,
  })
  await task.promise
}

export function formatBytes(bytes) {
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}
