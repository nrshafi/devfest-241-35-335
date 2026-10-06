import {
  PackageCheck,
  PackageX,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react"
import { Button, Card, StatusPill } from "./ui"

export function PackageReadiness({
  summary,
  issues,
  lang,
  t,
  plan,
  includeIndex,
  setIncludeIndex,
  onGenerate,
  generating,
  pending = false,
  result,
  onDownload,
  genError,
  onExportCsv,
}) {
  const checklistReady = summary.blocking === 0
  const ready = checklistReady && !pending && !generating
  const generationMessage = genError
    ? t(
        `generationErrors.${
          Object.hasOwn(t("generationErrors"), genError.code)
            ? genError.code
            : "UNKNOWN"
        }`,
        genError.params,
      )
    : ""
  const title = (r) => (lang === "bn" ? r.title_bn : r.title_en)
  return (
    <Card aria-labelledby="ready-h">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 id="ready-h" className="text-base font-semibold">
          {t("readiness")}
        </h2>
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          <FileSpreadsheet size={13} aria-hidden />
          {t("exportCsv")}
        </button>
      </div>
      <div className="p-4">
        {result && ready ? (
          <div role="status" className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <CheckCircle2 size={17} aria-hidden />
              {t("success")}
            </div>
            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {[
                [result.pageCount, t("successPages")],
                [result.documents.length, t("successDocs")],
                [0, t("successBlocking")],
              ].map(([v, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <dt className="text-muted">{l}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p
              className="mt-3 font-mono text-sm text-ink [overflow-wrap:anywhere]"
              title={result.fileName}
            >
              {result.fileName}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-2 w-full"
              onClick={onDownload}
            >
              <Download size={16} aria-hidden />
              {t("download")}
            </Button>
            <Button
              variant="ghost"
              className="mt-1 w-full"
              onClick={onGenerate}
              disabled={!ready}
            >
              <RefreshCw size={14} aria-hidden />
              {t("again")}
            </Button>
          </div>
        ) : (
          <>
            <div
              id="gen-why"
              role="status"
              className={`flex min-w-0 items-start gap-2 ${
                pending || generating
                  ? "text-muted"
                  : ready
                    ? "text-emerald-900"
                    : "text-red-900"
              }`}
            >
              {pending || generating ? (
                <Loader2
                  size={20}
                  className="mt-0.5 shrink-0 animate-spin"
                  aria-hidden
                />
              ) : ready ? (
                <PackageCheck
                  size={20}
                  className="mt-0.5 shrink-0"
                  aria-hidden
                />
              ) : (
                <PackageX size={20} className="mt-0.5 shrink-0" aria-hidden />
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold">
                  {pending
                    ? t("intakePending")
                    : generating
                      ? t("generating")
                      : ready
                        ? t("readyTitle")
                        : t("notReady")}
                </div>
                {ready && <p className="mt-1 text-sm">{t("readyMsg")}</p>}
              </div>
            </div>
            {!checklistReady && (
              <ul className="mt-3 divide-y divide-line">
                {issues.map((row) => (
                  <li key={row.requirement.id}>
                    <a
                      href={`#req-${row.requirement.id}`}
                      className="flex min-h-11 flex-wrap items-center justify-between gap-2 py-2 text-sm hover:bg-slate-50"
                    >
                      <span className="min-w-0 break-words">
                        {title(row.requirement)}
                      </span>
                      <StatusPill status={row.status} t={t} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {summary.optionalMissing > 0 && (
              <p className="mt-3 text-xs text-muted">
                {t("optionalSkipped", { n: summary.optionalMissing })}
              </p>
            )}
            {ready && (
              <p className="mt-2 text-xs text-muted">
                {t("willContain", {
                  docs: plan.docs,
                  pages: plan.pages + 1 + (includeIndex ? 1 : 0),
                })}
              </p>
            )}
            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-xs text-ink">
              <input
                type="checkbox"
                checked={includeIndex}
                disabled={generating}
                onChange={(e) => setIncludeIndex(e.target.checked)}
                className="size-4 accent-[var(--color-brand)]"
              />
              {t("includeIndex")}
            </label>
            {genError && (
              <p
                role="alert"
                className="mt-3 flex items-start gap-1.5 rounded-md bg-red-50 p-2 text-xs text-red-800"
              >
                <AlertCircle size={13} className="mt-px shrink-0" aria-hidden />
                {t("genFail", { msg: generationMessage })}
              </p>
            )}
            <Button
              variant="primary"
              size="lg"
              className="mt-3 w-full"
              disabled={!ready}
              onClick={onGenerate}
              aria-describedby={!ready ? "gen-why" : undefined}
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <PackageCheck size={16} aria-hidden />
              )}
              {generating ? t("generating") : t("generate")}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
