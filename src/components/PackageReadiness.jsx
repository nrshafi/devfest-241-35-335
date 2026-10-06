import { PackageCheck, PackageX, Download, RefreshCw, Loader2, CheckCircle2, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button, Card, StatusPill } from "./ui";

export function PackageReadiness({ summary, issues, lang, t, plan, includeIndex, setIncludeIndex, onGenerate, generating, result, onDownload, genError, onExportCsv }) {
  const ready = summary.blocking === 0;
  const title = (r) => (lang === "bn" ? r.title_bn : r.title_en);
  return (
    <Card aria-labelledby="ready-h">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 id="ready-h" className="text-sm font-semibold">{t("readiness")}</h2>
        <button type="button" onClick={onExportCsv} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"><FileSpreadsheet size={13} aria-hidden />{t("exportCsv")}</button>
      </div>
      <div className="p-4">
        {result ? (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900"><CheckCircle2 size={17} aria-hidden />{t("success")}</div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[[result.pageCount, t("successPages")], [result.documents.length, t("successDocs")], [0, t("successBlocking")]].map(([v, l]) => (
                <div key={l} className="rounded-md bg-white px-2 py-2 ring-1 ring-emerald-100">
                  <dd className="text-lg font-semibold tabular-nums">{v}</dd>
                  <dt className="text-[11px] leading-tight text-muted">{l}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-3 truncate font-mono text-xs text-muted" title={result.fileName}>{result.fileName}</p>
            <Button variant="primary" size="lg" className="mt-2 w-full" onClick={onDownload}><Download size={16} aria-hidden />{t("download")}</Button>
            <Button variant="ghost" className="mt-1 w-full" onClick={onGenerate} disabled={generating}><RefreshCw size={14} aria-hidden />{t("again")}</Button>
          </div>
        ) : (
          <>
            <div className={`flex items-start gap-3 rounded-lg p-3 ${ready ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
              {ready ? <PackageCheck size={20} className="mt-0.5 shrink-0" aria-hidden /> : <PackageX size={20} className="mt-0.5 shrink-0" aria-hidden />}
              <div>
                <div className="text-sm font-semibold">{ready ? t("readyTitle") : t("notReady")}</div>
                <div className="text-xs">{ready ? t("readyMsg") : summary.blocking === 1 ? t("blockingMsg1") : t("blockingMsg", { n: summary.blocking })}</div>
              </div>
            </div>
            {!ready && (
              <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
                {issues.map((row) => (
                  <li key={row.requirement.id}>
                    <a href={`#req-${row.requirement.id}`} className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                      <span className="min-w-0 truncate">{title(row.requirement)}</span>
                      <StatusPill status={row.status} t={t} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {summary.optionalMissing > 0 && <p className="mt-3 text-xs text-muted">{t("optionalSkipped", { n: summary.optionalMissing })}</p>}
            {ready && <p className="mt-2 text-xs text-muted">{t("willContain", { docs: plan.docs, pages: plan.pages + 1 + (includeIndex ? 1 : 0) })}</p>}
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-ink">
              <input type="checkbox" checked={includeIndex} onChange={(e) => setIncludeIndex(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
              {t("includeIndex")}
            </label>
            {genError && <p role="alert" className="mt-3 flex items-start gap-1.5 rounded-md bg-red-50 p-2 text-xs text-red-800"><AlertCircle size={13} className="mt-px shrink-0" aria-hidden />{t("genFail", { msg: genError })}</p>}
            <Button variant="primary" size="lg" className="mt-3 w-full" disabled={!ready || generating} onClick={onGenerate} aria-describedby={!ready ? "gen-why" : undefined}>
              {generating ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <PackageCheck size={16} aria-hidden />}
              {generating ? t("generating") : t("generate")}
            </Button>
            {!ready && <p id="gen-why" className="mt-2 text-center text-xs text-muted">{t("resolveFirst", { n: summary.blocking })}</p>}
          </>
        )}
      </div>
    </Card>
  );
}
