/** Stop pending preview work without retaining a document after its modal closes. */
export function loadPreviewDocument({
  readBytes,
  openDocument,
  onReady,
  onError,
}) {
  let stopped = false
  let document
  const dispose = (doc) => {
    // PDF.js destruction is asynchronous; cleanup failures must not become
    // unhandled rejections when the user has already closed the preview.
    try {
      Promise.resolve(doc.destroy()).catch(() => {})
    } catch {}
  }
  const settled = (async () => {
    try {
      const bytes = await readBytes()
      if (stopped) return
      const loaded = await openDocument(bytes)
      if (stopped) {
        dispose(loaded)
        return
      }
      document = loaded
      onReady(loaded)
    } catch (error) {
      if (!stopped) onError(error)
    }
  })()
  return {
    settled,
    stop() {
      if (stopped) return
      stopped = true
      if (document) dispose(document)
      document = undefined
    },
  }
}

/** Cancel PDF.js RenderTask rather than only ignoring its eventual completion. */
export function renderPreviewPage({
  document,
  pageNumber,
  canvas,
  maxWidth,
  pixelRatio,
  onReady,
  onError,
}) {
  let stopped = false
  let task
  const settled = (async () => {
    try {
      const page = await document.getPage(pageNumber)
      if (stopped) return
      const base = page.getViewport({ scale: 1 })
      const ratio = pixelRatio || 1
      const scale = Math.min(2, Math.max(1, maxWidth) / base.width) * ratio
      const viewport = page.getViewport({ scale })
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.width = `${Math.floor(viewport.width / ratio)}px`
      task = page.render({
        canvas,
        canvasContext: canvas.getContext("2d"),
        viewport,
      })
      await task.promise
      if (!stopped) onReady()
    } catch (error) {
      if (!stopped) onError(error)
    }
  })()
  return {
    settled,
    stop() {
      if (stopped) return
      stopped = true
      task?.cancel()
    },
  }
}
