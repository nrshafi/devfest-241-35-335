import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { Button, pagesLabel } from "./ui";
import { openPdf, renderPage } from "../utils/pdfUtils";

function Modal({ labelledBy, onClose, children, wide }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev?.focus?.(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={`flex max-h-[92vh] w-full flex-col rounded-xl bg-white shadow-xl outline-none ${wide ? "max-w-3xl" : "max-w-md"}`}>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, body, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <Modal labelledBy="confirm-h" onClose={onCancel}>
      <div className="p-5">
        <div className="flex gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700"><AlertTriangle size={18} aria-hidden /></div>
          <div>
            <h2 id="confirm-h" className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

export function PdfPreviewModal({ file, onClose, t }) {
  const canvas = useRef(null);
  const docRef = useRef(null);
  const [page, setPage] = useState(1);
  const [state, setState] = useState("loading");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        docRef.current = await openPdf(await file.file.arrayBuffer());
        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; docRef.current?.destroy(); docRef.current = null; };
  }, [file]);

  useEffect(() => {
    if (!docRef.current || state === "loading" || state === "error") return;
    let live = true;
    setBusy(true);
    renderPage(docRef.current, page, canvas.current, Math.min(680, window.innerWidth - 80))
      .then(() => live && setBusy(false))
      .catch(() => live && setState("error"));
    return () => { live = false; };
  }, [page, state]);

  return (
    <Modal labelledBy="preview-h" onClose={onClose} wide>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 id="preview-h" className="truncate text-sm font-semibold">{file.name}</h2>
          <p className="text-xs text-muted">{pagesLabel(file.pageCount, t)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={t("close")} className="grid size-8 place-items-center rounded-md text-muted hover:bg-slate-100"><X size={16} /></button>
      </div>
      <div className="relative flex-1 overflow-auto bg-slate-100 p-4">
        {state === "error" ? (
          <p className="py-16 text-center text-sm text-muted">{t("previewFail")}</p>
        ) : (
          <div className="flex justify-center">
            <canvas ref={canvas} className="max-w-full bg-white shadow-sm ring-1 ring-slate-200" aria-label={t("pageOf", { x: page, y: file.pageCount })} />
            {busy && <Loader2 className="absolute top-10 animate-spin text-muted" size={20} aria-hidden />}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
        <div className="flex items-center gap-1">
          <Button size="sm" disabled={busy || page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} aria-hidden />{t("prev")}</Button>
          <span className="px-2 text-xs tabular-nums text-muted" aria-live="polite">{t("pageOf", { x: page, y: file.pageCount })}</span>
          <Button size="sm" disabled={busy || page >= file.pageCount} onClick={() => setPage((p) => p + 1)}>{t("next")}<ChevronRight size={14} aria-hidden /></Button>
        </div>
        <Button onClick={onClose}>{t("close")}</Button>
      </div>
    </Modal>
  );
}
