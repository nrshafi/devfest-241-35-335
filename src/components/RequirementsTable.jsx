import { useState } from "react";
import { FileText, X } from "lucide-react";
import { StatusPill, Button, pagesLabel } from "./ui";
import { checkAssignment } from "../utils/matching";

const GRID = "lg:grid lg:grid-cols-[44px_minmax(0,1.35fr)_minmax(0,1.35fr)_132px_minmax(0,1fr)_128px] lg:items-center lg:gap-3";

export function RequirementsTable({ rows, files, matches, duplicateInfo, lang, t, onAssign, onUnmatch, onExpiry }) {
  return (
    <section className="rounded-xl border border-line bg-white" aria-labelledby="checklist-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 id="checklist-h" className="text-sm font-semibold">{t("checklist")}</h2>
        <p className="text-xs text-muted">{t("checklistHint")}</p>
      </div>
      <div role="table" aria-label={t("checklist")}>
        <div role="row" className={`hidden border-b border-line bg-slate-50/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted ${GRID}`}>
          {["colOrder", "colRequirement", "colFile", "colExpiry", "colStatus", "colAction"].map((k) => <div role="columnheader" key={k}>{t(k)}</div>)}
        </div>
        {rows.map((row, i) => (
          <RequirementRow key={row.requirement.id} row={row} index={i} files={files} matches={matches} duplicateInfo={duplicateInfo} lang={lang} t={t} onAssign={onAssign} onUnmatch={onUnmatch} onExpiry={onExpiry} />
        ))}
      </div>
    </section>
  );
}

function RequirementRow({ row, index, files, matches, duplicateInfo, lang, t, onAssign, onUnmatch, onExpiry }) {
  const { requirement: r, file, status, expiry } = row;
  const [editing, setEditing] = useState(false);
  const title = lang === "bn" ? r.title_bn : r.title_en;
  const orderLabel = String(r.order ?? index + 1).padStart(2, "0");
  const blocking = ["missing", "expired", "expiry_needed", "invalid_date"].includes(status);
  const help = t(`statusHelp.${status}`);
  const showSelect = !file || editing;
  const selectId = `sel-${r.id}`;

  return (
    <div role="row" id={`req-${r.id}`} className={`relative border-b border-line px-4 py-3 last:border-b-0 ${GRID}`}>
      {blocking && <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 ${status === "expiry_needed" ? "bg-amber-400" : "bg-red-500"}`} />}
      <div role="cell" className="mb-1 font-mono text-xs text-muted lg:mb-0">{orderLabel}</div>
      <div role="cell" className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted">
          <span className={r.mandatory ? "font-medium text-ink/80" : ""}>{r.mandatory ? t("mandatory") : t("optional")}</span>
          {r.has_expiry && <span>· {t("expiryRequired")}</span>}
        </div>
      </div>
      <div role="cell" className="mt-2 min-w-0 lg:mt-0">
        {file ? (
          <div className="flex min-w-0 items-start gap-2">
            <FileText size={15} className="mt-0.5 shrink-0 text-red-700" aria-hidden />
            <div className="min-w-0">
              <div className="truncate text-sm" title={file.name}>{file.name}</div>
              <div className="text-xs text-muted">{pagesLabel(file.pageCount, t)}</div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">{t("noFile")}</span>
        )}
      </div>
      <div role="cell" className="mt-2 lg:mt-0">
        {r.has_expiry && file ? (
          <label className="block">
            <span className="sr-only">{t("expiryLabel", { req: title })}</span>
            <input
              type="date"
              value={expiry}
              onChange={(e) => onExpiry(r.id, e.target.value)}
              aria-invalid={status === "expired" || status === "invalid_date" || status === "expiry_needed"}
              className={`h-8 w-full max-w-[160px] rounded-md border bg-white px-2 text-sm tabular-nums ${status === "expired" ? "border-red-400" : status === "expiry_needed" ? "border-amber-400" : "border-line"}`}
            />
          </label>
        ) : (
          <span className="hidden text-sm text-slate-300 lg:inline" aria-label="Not applicable">{t("notRequired")}</span>
        )}
      </div>
      <div role="cell" className="mt-2 lg:mt-0">
        <StatusPill status={status} t={t} />
        {help && status !== "not_provided" && <p className={`mt-1 text-xs ${status === "expiry_needed" ? "text-amber-800" : "text-red-700"}`}>{help}</p>}
      </div>
      <div role="cell" className="mt-3 lg:mt-0">
        {showSelect ? (
          <div className="flex items-center gap-1">
            <label htmlFor={selectId} className="sr-only">{t("selectFile")} — {title}</label>
            <select
              id={selectId}
              value=""
              autoFocus={editing}
              onChange={(e) => { if (e.target.value) { onAssign(r.id, e.target.value); setEditing(false); } }}
              className="h-8 w-full min-w-0 max-w-[220px] rounded-md border border-line bg-white px-2 text-xs font-medium text-ink lg:max-w-none"
            >
              <option value="">{files.length ? (editing ? t("chooseFile") : t("selectFile")) : t("noPdfsYet")}</option>
              {files.map((f) => {
                if (f.id === file?.id) return null;
                const err = f.pageCount ? checkAssignment(f.id, r.id, files, matches, duplicateInfo) : { code: "file_invalid" };
                let reason = "";
                if (err?.code === "already_matched") reason = t("optInUse", { req: reqTitle(err.requirementId) });
                else if (err?.code === "duplicate_used") reason = t("optDuplicate", { req: reqTitle(err.requirementId) });
                else if (err) reason = t("optUnreadable");
                return <option key={f.id} value={f.id} disabled={!!err}>{f.name}{reason ? ` — ${reason}` : ""}</option>;
              })}
            </select>
            {editing && <button type="button" onClick={() => setEditing(false)} aria-label={t("cancel")} className="grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-slate-100"><X size={14} /></button>}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" onClick={() => setEditing(true)}>{t("change")}</Button>
            <Button size="sm" variant="dangerGhost" onClick={() => onUnmatch(r.id)}>{t("removeMatch")}</Button>
          </div>
        )}
      </div>
    </div>
  );

  function reqTitle(id) {
    const el = row.allRequirements?.find((q) => q.id === id);
    return el ? (lang === "bn" ? el.title_bn : el.title_en) : id;
  }
}
