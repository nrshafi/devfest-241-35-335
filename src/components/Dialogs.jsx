import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button, pagesLabel } from "./ui"
import { openPdf } from "../utils/pdfUtils"
import { loadPreviewDocument, renderPreviewPage } from "./previewLifecycle"

function Modal({ labelledBy, onClose, children, wide }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const dialog = ref.current
    const prev = document.activeElement
    const previousOverflow = document.body.style.overflow
    // The native modal makes the rest of the document inert, including
    // pointer and assistive-technology interaction with background controls.
    dialog.showModal()
    document.body.style.overflow = "hidden"
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (prev?.isConnected) prev.focus?.()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-modal="true"
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return
        const controls = [
          ...event.currentTarget.querySelectorAll(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
          ),
        ].filter((element) => element.getClientRects().length)
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (
          (event.shiftKey && document.activeElement === first) ||
          (!event.shiftKey && document.activeElement === last)
        ) {
          event.preventDefault()
          ;(event.shiftKey ? last : first)?.focus()
        }
      }}
      className={`fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] flex-col overflow-hidden rounded-xl border-0 bg-white p-0 text-ink shadow-xl backdrop:bg-slate-900/40 open:flex ${
        wide ? "max-w-3xl" : "max-w-md"
      }`}
    >
      {children}
    </dialog>
  )
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  return (
    <Modal labelledBy={titleId} onClose={onCancel}>
      <div className="overflow-y-auto p-5">
        <div className="flex gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle size={18} aria-hidden />
          </div>
          <div className="min-w-0 break-words">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function PdfPreviewModal({ file, onClose, t }) {
  const titleId = useId()
  const canvas = useRef(null)
  const docRef = useRef(null)
  const [page, setPage] = useState(1)
  const [state, setState] = useState("loading")
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    setState("loading")
    setBusy(true)
    setPage(1)
    const loading = loadPreviewDocument({
      readBytes: () => file.bytes || file.file.arrayBuffer(),
      openDocument: openPdf,
      onReady: (document) => {
        docRef.current = document
        setState("ready")
      },
      onError: () => {
        setBusy(false)
        setState("error")
      },
    })
    return () => {
      loading.stop()
      docRef.current = null
    }
  }, [file])

  useEffect(() => {
    if (!docRef.current || state === "loading" || state === "error") return
    setBusy(true)
    const rendering = renderPreviewPage({
      document: docRef.current,
      pageNumber: page,
      canvas: canvas.current,
      maxWidth: Math.min(680, window.innerWidth - 64),
      pixelRatio: window.devicePixelRatio,
      onReady: () => setBusy(false),
      onError: () => {
        setBusy(false)
        setState("error")
      },
    })
    return () => rendering.stop()
  }, [page, state])

  return (
    <Modal labelledBy={titleId} onClose={onClose} wide>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 id={titleId} className="break-words text-sm font-semibold">
            {file.name}
          </h2>
          <p className="text-xs text-muted">{pagesLabel(file.pageCount, t)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-slate-100"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
      <div
        className="relative min-h-32 flex-1 overflow-auto bg-slate-100 p-4"
        aria-busy={busy}
      >
        {state === "error" ? (
          <p className="py-16 text-center text-sm text-muted">
            {t("previewFail")}
          </p>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvas}
              role="img"
              className="max-w-full bg-white shadow-sm ring-1 ring-slate-200"
              aria-label={t("pageOf", { x: page, y: file.pageCount })}
            />
            {busy && (
              <Loader2
                className="absolute top-10 animate-spin text-muted"
                size={20}
                aria-hidden
              />
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            disabled={state !== "ready" || busy || page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={14} aria-hidden />
            {t("prev")}
          </Button>
          <span
            className="px-2 text-xs tabular-nums text-muted"
            aria-live="polite"
          >
            {t("pageOf", { x: page, y: file.pageCount })}
          </span>
          <Button
            size="sm"
            disabled={state !== "ready" || busy || page >= file.pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("next")}
            <ChevronRight size={14} aria-hidden />
          </Button>
        </div>
        <Button onClick={onClose}>{t("close")}</Button>
      </div>
    </Modal>
  )
}
