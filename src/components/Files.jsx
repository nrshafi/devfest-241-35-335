import { useRef, useState } from "react";
import { UploadCloud, FileText, Eye, Trash2, Copy, Loader2, AlertCircle, Link2, Sparkles, X } from "lucide-react";
import { Button, Card, pagesLabel } from "./ui";
import { formatBytes, MAX_FILES, MAX_TOTAL_BYTES } from "../utils/pdfUtils";

export function FileUploader({ onFiles, messages, onDismiss, t }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
        className={`rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${over ? "border-brand bg-brand-soft" : "border-slate-300 bg-slate-50/60"}`}
      >
        <UploadCloud size={22} className="mx-auto text-brand" aria-hidden />
        <p className="mt-2 text-sm text-ink">{t("uploadHint")}</p>
        <Button variant="secondary" className="mt-3" onClick={() => input.current?.click()}>{t("browse")}</Button>
        <p className="mt-2 text-[11px] text-muted">{t("limits", { files: MAX_FILES, mb: MAX_TOTAL_BYTES / 1024 / 1024 })}</p>
        <input ref={input} type="file" multiple accept="application/pdf,.pdf" className="sr-only" aria-label={t("browse")} onChange={(e) => { onFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
      </div>
      <div aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} role="alert" className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <AlertCircle size={14} className="mt-px shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{m.text}</div>
              {m.names && <div className="truncate text-red-700/80">{m.names.join(", ")}</div>}
            </div>
            <button type="button" onClick={() => onDismiss(m.id)} aria-label={t("close")} className="shrink-0 rounded p-0.5 hover:bg-red-100"><X size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UploadedFileList({ files, duplicateInfo, matchByFile, suggestions, matches, reqTitle, t, onPreview, onRemove, onAccept }) {
  if (!files.length) return <p className="py-3 text-center text-xs text-muted">{t("noUploads")}</p>;
  const nameOf = (id) => files.find((f) => f.id === id)?.name;
  return (
    <ul className="space-y-2">
      {files.map((f) => {
        const dup = duplicateInfo.get(f.id);
        const matchedReq = matchByFile[f.id];
        const sug = suggestions[f.id];
        const sugTaken = sug && matches[sug.requirementId];
        return (
          <li key={f.id} className={`rounded-lg border px-3 py-2.5 ${f.error ? "border-red-200 bg-red-50/40" : dup ? "border-amber-200 bg-amber-50/30" : "border-line"}`}>
            <div className="flex items-start gap-2.5">
              <div className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md ${f.error ? "bg-red-100 text-red-700" : "bg-red-50 text-red-700"}`}>
                {f.status === "processing" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <FileText size={15} aria-hidden />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium" title={f.name}>{f.name}</div>
                <div className="text-xs text-muted">
                  {f.status === "processing" ? t("processing") : f.pageCount ? `${pagesLabel(f.pageCount, t)} · ${formatBytes(f.size)}` : formatBytes(f.size)}
                </div>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <button type="button" disabled={!f.pageCount} onClick={() => onPreview(f)} title={t("preview")} aria-label={`${t("preview")} ${f.name}`} className="grid size-7 place-items-center rounded-md text-muted hover:bg-slate-100 hover:text-ink disabled:opacity-30"><Eye size={15} /></button>
                <button type="button" onClick={() => onRemove(f)} title={t("remove")} aria-label={`${t("remove")} ${f.name}`} className="grid size-7 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button>
              </div>
            </div>
            {f.error ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-800"><AlertCircle size={13} aria-hidden />{t(f.error === "password" ? "errPassword" : "errDamaged")}</p>
            ) : f.pageCount ? (
              <div className="mt-2 space-y-1.5 pl-[42px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {matchedReq ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-200"><Link2 size={12} aria-hidden />{t("matchedTo", { req: reqTitle(matchedReq) })}</span>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{t("notMatched")}</span>
                  )}
                  {dup && <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900"><Copy size={12} aria-hidden />{t("duplicate")}</span>}
                </div>
                {dup && (
                  <p className="text-xs text-amber-900">
                    {dup.originalId === f.id ? t("dupOriginal", { n: dup.memberIds.length }) : t("dupCopy", { name: nameOf(dup.originalId) })}
                  </p>
                )}
                {!matchedReq && sug && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted"><Sparkles size={12} className="text-brand" aria-hidden />{t(sug.weak ? "possible" : "suggested", { req: reqTitle(sug.requirementId) })}</span>
                    {sugTaken ? (
                      <span className="text-slate-400">({t("reqHasFile", { req: reqTitle(sug.requirementId) })})</span>
                    ) : (
                      <Button size="sm" variant="ghost" className="ring-1 ring-inset ring-brand/30" onClick={() => onAccept(f.id, sug.requirementId)}>{t("accept")}</Button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function FilesPanel({ children, summary, t }) {
  return (
    <Card aria-labelledby="files-h">
      <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 id="files-h" className="text-sm font-semibold">{t("upload")}</h2>
      </div>
      <div className="space-y-4 p-4">{children}</div>
      {summary}
    </Card>
  );
}
