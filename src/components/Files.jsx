import { useRef, useState } from "react"
import {
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  Copy,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"
import { Button, Card, pagesLabel } from "./ui"
import { formatBytes, MAX_FILES, MAX_TOTAL_BYTES } from "../utils/pdfUtils"

export function FileUploader({ onFiles, messages, onDismiss, t }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          onFiles(Array.from(e.dataTransfer.files))
        }}
        className={`rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${
          over
            ? "border-brand bg-brand-soft"
            : "border-slate-300 bg-slate-50/60"
        }`}
      >
        <UploadCloud size={22} className="mx-auto text-brand" aria-hidden />
        <p className="mt-2 text-sm text-ink">{t("uploadHint")}</p>
        <Button
          variant="secondary"
          size="lg"
          className="mt-3"
          onClick={() => input.current?.click()}
        >
          {t("browse")}
        </Button>
        <p className="mt-2 text-xs text-muted">
          {t("limits", { files: MAX_FILES, mb: MAX_TOTAL_BYTES / 1_000_000 })}
        </p>
        <input
          ref={input}
          type="file"
          multiple
          accept="application/pdf,.pdf"
          className="hidden"
          tabIndex={-1}
          aria-label={t("browse")}
          onChange={(e) => {
            onFiles(Array.from(e.target.files || []))
            e.target.value = ""
          }}
        />
      </div>
      <div aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            role="alert"
            className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
          >
            <AlertCircle size={14} className="mt-px shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{t(m.key, m.vars)}</div>
              {m.names && (
                <div className="break-words text-red-700/80">
                  {m.names.join(", ")}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(m.id)}
              aria-label={t("close")}
              className="grid size-11 shrink-0 place-items-center rounded hover:bg-red-100"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UploadedFileList({
  files,
  duplicateInfo,
  matchByFile,
  suggestions,
  matches,
  reqTitle,
  t,
  onPreview,
  onRemove,
  onAccept,
}) {
  if (!files.length)
    return (
      <p className="py-3 text-center text-xs text-muted">{t("noUploads")}</p>
    )
  const nameOf = (id) => files.find((f) => f.id === id)?.name
  return (
    <ul className="divide-y divide-line">
      {files.map((f) => {
        const dup = duplicateInfo.get(f.id)
        const matchedReq = matchByFile[f.id]
        const sug = suggestions[f.id]
        const sugTaken = sug && matches[sug.requirementId]
        return (
          <li
            key={f.id}
            className={`min-w-0 py-3 ${
              f.error
                ? "bg-red-50/40"
                : dup
                  ? ""
                  : ""
            }`}
          >
            <div className="flex min-w-0 flex-wrap items-start gap-2">
              <div
                className={`mt-1 shrink-0 ${f.error ? "text-red-700" : "text-muted"}`}
              >
                {f.status === "processing" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                ) : (
                  <FileText size={15} aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium [overflow-wrap:anywhere]" title={f.name}>
                  {f.name}
                </div>
                <div className="text-xs text-muted">
                  {f.status === "processing"
                    ? t("processing")
                    : f.pageCount
                      ? `${pagesLabel(f.pageCount, t)} · ${formatBytes(f.size)}`
                      : formatBytes(f.size)}
                </div>
              </div>
              <div className="flex w-full flex-wrap gap-1 pl-6 sm:w-auto sm:pl-0 min-[1440px]:w-full min-[1440px]:pl-6">
                <button
                  type="button"
                  disabled={!f.pageCount}
                  onClick={() => onPreview(f)}
                  title={t("preview")}
                  aria-label={`${t("preview")} ${f.name}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-slate-100 hover:text-ink disabled:opacity-30"
                >
                  <Eye size={16} aria-hidden /> {t("preview")}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(f)}
                  title={t("remove")}
                  aria-label={`${t("remove")} ${f.name}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={16} aria-hidden /> {t("remove")}
                </button>
              </div>
            </div>
            {f.error ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-800">
                <AlertCircle size={13} aria-hidden />
                {t(
                  { password: "errPassword", read: "errRead", hash: "errHash" }[
                    f.error
                  ] || "errDamaged",
                )}
              </p>
            ) : f.pageCount ? (
              <div className="mt-2 space-y-1.5 pl-6">
                <div className="flex flex-wrap items-center gap-1.5">
                  {matchedReq ? (
                    <span className="text-xs text-muted">
                      {t("matchedTo", { req: reqTitle(matchedReq) })}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">
                      {t("notMatched")}
                    </span>
                  )}
                  {dup && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-900">
                      <Copy size={12} aria-hidden />
                      {t("duplicate")}
                    </span>
                  )}
                </div>
                {dup && (
                  <p className="break-words text-xs text-amber-900">
                    {dup.originalId === f.id
                      ? t("dupOriginal", { n: dup.memberIds.length })
                      : t("dupCopy", { name: nameOf(dup.originalId) })}
                  </p>
                )}
                {!matchedReq && sug && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted">
                      {t(sug.weak ? "possible" : "suggested", {
                        req: reqTitle(sug.requirementId),
                      })}
                    </span>
                    {sugTaken ? (
                      <span className="text-muted">
                        ({t("reqHasFile", { req: reqTitle(sug.requirementId) })}
                        )
                      </span>
                    ) : (
                      <Button
                        size="lg"
                        variant="ghost"
                        className="ring-1 ring-inset ring-brand/30"
                        onClick={() => onAccept(f.id, sug.requirementId)}
                      >
                        {t("accept")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function FilesPanel({ children, summary, t }) {
  return (
    <Card aria-labelledby="files-h">
      <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 id="files-h" className="text-base font-semibold">
          {t("upload")}
        </h2>
      </div>
      <div className="space-y-4 p-4">{children}</div>
      {summary}
    </Card>
  )
}
