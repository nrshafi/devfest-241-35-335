import { useEffect, useState } from "react"
import { FileText, X } from "lucide-react"
import { StatusPill, Button, pagesLabel } from "./ui"
import { checkAssignment } from "../utils/matching"

// Keep matching controls in their own Action column; stacked rows retain labels.

const GRID =
  "min-[1440px]:grid min-[1440px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] min-[1440px]:items-start min-[1440px]:gap-3"

export function RequirementsTable({
  rows,
  files,
  matches,
  duplicateInfo,
  deadline,
  disabled = false,
  lang,
  t,
  onAssign,
  onUnmatch,
  onExpiry,
}) {
  return (
    <section
      className="rounded-xl border border-line bg-white"
      aria-labelledby="checklist-h"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 id="checklist-h" className="text-base font-semibold">
          {t("checklist")}
        </h2>
        <p className="text-xs text-muted">{t("checklistHint")}</p>
      </div>
      <div role="table" aria-label={t("checklist")}>
        <div
          role="row"
          className={`hidden border-b border-line bg-slate-50/70 px-4 py-2 text-xs font-medium text-muted ${GRID}`}
        >
          {[
            "colRequirement",
            "colFile",
            "colExpiry",
            "colStatus",
            "colAction",
          ].map((k) => (
            <div role="columnheader" key={k}>
              {t(k)}
            </div>
          ))}
        </div>
        {rows.map((row, i) => (
          <RequirementRow
            key={row.requirement.id}
            row={row}
            index={i}
            files={files}
            matches={matches}
            duplicateInfo={duplicateInfo}
            deadline={deadline}
            disabled={disabled}
            lang={lang}
            t={t}
            onAssign={onAssign}
            onUnmatch={onUnmatch}
            onExpiry={onExpiry}
          />
        ))}
      </div>
    </section>
  )
}

function RequirementRow({
  row,
  index,
  files,
  matches,
  duplicateInfo,
  deadline,
  disabled,
  lang,
  t,
  onAssign,
  onUnmatch,
  onExpiry,
}) {
  const { requirement: r, file, status, expiry, expiryError } = row
  const [editing, setEditing] = useState(false)
  const [nativeDateError, setNativeDateError] = useState(false)
  useEffect(() => {
    setNativeDateError(false)
  }, [file?.id])
  const title = lang === "bn" ? r.title_bn : r.title_en
  const orderLabel = String(r.order ?? index + 1).padStart(2, "0")
  const blocking = ["missing", "expired", "expiry_needed"].includes(status)
  const help = t(`statusHelp.${status}`)
  const showSelect = !file || editing
  const selectId = `sel-${r.id}`
  const expiryId = `expiry-${r.id}`
  const expiryErrorId = `${expiryId}-error`
  const expiryHintId = `${expiryId}-hint`
  const invalidExpiry = expiryError || nativeDateError

  return (
    <div
      role="row"
      id={`req-${r.id}`}
      className={`relative border-b border-line px-4 py-3 last:border-b-0 ${GRID}`}
    >
      {blocking && (
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-0.5 ${
            status === "expiry_needed" ? "bg-amber-400" : "bg-red-500"
          }`}
        />
      )}
      <div role="cell" className="min-w-0">
        <div className="text-sm font-medium [overflow-wrap:anywhere]">
          <span className="mr-2 font-mono text-xs text-muted">
            {orderLabel}
          </span>
          {title}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
          <span className={r.mandatory ? "font-medium text-ink/80" : ""}>
            {r.mandatory ? t("mandatory") : t("optional")}
          </span>
          {r.has_expiry && <span>· {t("expiryRequired")}</span>}
        </div>
      </div>
      <div role="cell" className="mt-2 min-w-0 min-[1440px]:mt-0">
        <p className="mb-1 text-xs font-medium text-muted min-[1440px]:hidden">
          {t("colFile")}
        </p>
        {file ? (
          <div className="flex min-w-0 items-start gap-2">
            <FileText
              size={15}
              className="mt-0.5 shrink-0 text-muted"
              aria-hidden
            />
            <div className="min-w-0">
              <div className="text-sm [overflow-wrap:anywhere]">
                {file.name}
              </div>
              <div className="text-xs text-muted">
                {pagesLabel(file.pageCount, t)}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted">{t("noFile")}</span>
        )}
      </div>
      <div role="cell" className="mt-2 min-w-0 min-[1440px]:mt-0">
        {r.has_expiry && file ? (
          <div>
            <label
              htmlFor={expiryId}
              className="mb-1 block text-xs font-medium text-muted"
            >
              <span className="sr-only">
                {t("expiryLabel", { req: title })}
              </span>
              <span aria-hidden>{t("colExpiry")}</span>
            </label>
            <input
              id={expiryId}
              type="date"
              value={expiry}
              disabled={disabled}
              onChange={(e) => {
                setNativeDateError(!e.target.validity.valid)
                onExpiry(r.id, e.target.value)
              }}
              aria-invalid={!!invalidExpiry || status === "expired"}
              aria-describedby={
                [
                  deadline ? expiryHintId : "",
                  invalidExpiry ? expiryErrorId : "",
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              className={`min-h-11 w-full max-w-[200px] min-w-0 rounded-md border bg-white px-2 py-2 text-sm tabular-nums disabled:opacity-50 ${
                invalidExpiry || status === "expired"
                  ? "border-red-400"
                  : status === "expiry_needed"
                    ? "border-amber-400"
                    : "border-line"
              }`}
            />
            {deadline && (
              <p
                id={expiryHintId}
                className="mt-1 text-xs text-muted [overflow-wrap:anywhere]"
              >
                {t("expiryHint", { deadline })}
              </p>
            )}
            {invalidExpiry && (
              <p id={expiryErrorId} className="mt-1 text-xs text-red-700">
                {t("invalidExpiry")}
              </p>
            )}
          </div>
        ) : (
          <span
            className="hidden text-sm text-muted min-[1440px]:inline"
            aria-label={t("notApplicable")}
          >
            {t("notRequired")}
          </span>
        )}
      </div>
      <div role="cell" className="mt-2 min-w-0 min-[1440px]:mt-0">
        <StatusPill status={status} t={t} />
        {help && status !== "not_provided" && (
          <p
            className={`mt-1 text-xs ${
              status === "expiry_needed" ? "text-amber-800" : "text-red-700"
            }`}
          >
            {help}
          </p>
        )}
      </div>
      <div role="cell" className="mt-3 min-w-0 min-[1440px]:mt-0">
        <p className="mb-1 text-xs font-medium text-muted min-[1440px]:hidden">{t("colAction")}</p>
        {showSelect ? (
          <div className="flex items-center gap-1">
            <label htmlFor={selectId} className="sr-only">
              {t("selectFile")} — {title}
            </label>
            <select
              id={selectId}
              value=""
              disabled={disabled}
              autoFocus={editing}
              onChange={(e) => {
                if (e.target.value) {
                  onAssign(r.id, e.target.value)

                  setEditing(false)
                }
              }}
              className="min-h-11 w-full min-w-0 max-w-[320px] rounded-md border border-line bg-white px-2 py-2 text-sm font-medium text-ink disabled:opacity-50 min-[1440px]:max-w-none"
            >
              <option value="">
                {files.length
                  ? editing
                    ? t("chooseFile")
                    : t("selectFile")
                  : t("noPdfsYet")}
              </option>
              {files.map((f) => {
                if (f.id === file?.id) return null

                const err = f.pageCount
                  ? checkAssignment(f.id, r.id, files, matches, duplicateInfo)
                  : { code: "file_invalid" }

                let reason = ""

                if (err?.code === "already_matched")
                  reason = t("optInUse", { req: reqTitle(err.requirementId) })
                else if (err?.code === "duplicate_used")
                  reason = t("optDuplicate", {
                    req: reqTitle(err.requirementId),
                  })
                else if (err) reason = t("optUnreadable")

                return (
                  <option key={f.id} value={f.id} disabled={!!err}>
                    {f.name}
                    {reason ? ` — ${reason}` : ""}
                  </option>
                )
              })}
            </select>
            {editing && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => setEditing(false)}
                aria-label={`${t("cancel")} — ${title}`}
                className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-slate-100"
              >
                <X size={14} aria-hidden />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              className="min-h-11"
              disabled={disabled}
              aria-label={`${t("change")} — ${title}`}
              onClick={() => setEditing(true)}
            >
              {t("change")}
            </Button>
            <Button
              size="sm"
              className="min-h-11"
              disabled={disabled}
              variant="dangerGhost"
              aria-label={`${t("removeMatch")} — ${title}`}
              onClick={() => onUnmatch(r.id)}
            >
              {t("removeMatch")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  function reqTitle(id) {
    const el = row.allRequirements?.find((q) => q.id === id)
    return el ? (lang === "bn" ? el.title_bn : el.title_en) : id
  }
}
