import { expect, test } from "bun:test"
import {
  loadPreviewDocument,
  renderPreviewPage,
} from "../src/components/previewLifecycle"

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

test("closing while file bytes are loading skips preview parsing", async () => {
  const bytes = deferred()
  let opened = false
  const loading = loadPreviewDocument({
    readBytes: () => bytes.promise,
    openDocument: () => {
      opened = true
    },
    onReady: () => {},
    onError: () => {},
  })
  loading.stop()
  bytes.resolve(new Uint8Array([1]))
  await loading.settled
  expect(opened).toBe(false)
})

test("a document resolving after close is destroyed without updating UI", async () => {
  const result = deferred()
  let destroyed = 0,
    ready = 0,
    errors = 0
  const loading = loadPreviewDocument({
    readBytes: () => new Uint8Array([1]),
    openDocument: () => result.promise,
    onReady: () => ready++,
    onError: () => errors++,
  })
  await Promise.resolve()
  loading.stop()
  result.resolve({
    destroy: () => {
      destroyed++
      return Promise.resolve()
    },
  })
  await loading.settled
  expect([destroyed, ready, errors]).toEqual([1, 0, 0])
})

test("closing a loaded preview destroys its document exactly once", async () => {
  let destroyed = 0
  const document = {
    destroy: () => {
      destroyed++
      return Promise.resolve()
    },
  }
  let received
  const loading = loadPreviewDocument({
    readBytes: () => new Uint8Array([1]),
    openDocument: () => document,
    onReady: (doc) => {
      received = doc
    },
    onError: () => {},
  })
  await loading.settled
  expect(received).toBe(document)
  loading.stop()
  loading.stop()
  expect(destroyed).toBe(1)
})

function renderingOptions(document) {
  return {
    document,
    pageNumber: 2,
    canvas: { width: 0, height: 0, style: {}, getContext: () => ({}) },
    maxWidth: 300,
    pixelRatio: 2,
    onReady: () => {},
    onError: () => {},
  }
}

test("closing during getPage prevents a late render from touching canvas", async () => {
  const result = deferred()
  let rendered = false
  const rendering = renderPreviewPage(
    renderingOptions({ getPage: () => result.promise }),
  )
  rendering.stop()
  result.resolve({
    render: () => {
      rendered = true
    },
  })
  await rendering.settled
  expect(rendered).toBe(false)
})

test("page navigation or close cancels RenderTask and suppresses cancellation errors", async () => {
  const result = deferred()
  let cancelled = 0,
    ready = 0,
    errors = 0
  const page = {
    getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale }),
    render: () => ({
      promise: result.promise,
      cancel: () => {
        cancelled++
        result.reject(new Error("cancelled"))
      },
    }),
  }
  const options = renderingOptions({ getPage: () => page })
  options.onReady = () => ready++
  options.onError = () => errors++
  const rendering = renderPreviewPage(options)
  await Promise.resolve()
  expect(options.canvas.style.width).toBe("300px")
  expect(options.canvas.height).toBe(800)
  rendering.stop()
  rendering.stop()
  await rendering.settled
  expect([cancelled, ready, errors]).toEqual([1, 0, 0])
})

test("active preview parse and rendering errors are reported", async () => {
  const failure = new Error("preview failed")
  const errors = []
  const loading = loadPreviewDocument({
    readBytes: () => Promise.reject(failure),
    openDocument: () => {},
    onReady: () => {},
    onError: (error) => errors.push(error),
  })
  const options = renderingOptions({ getPage: () => Promise.reject(failure) })
  options.onError = (error) => errors.push(error)
  const rendering = renderPreviewPage(options)
  await Promise.all([loading.settled, rendering.settled])
  expect(errors).toEqual([failure, failure])
})
