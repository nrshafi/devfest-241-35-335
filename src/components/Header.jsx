import { Package, RotateCcw, Check } from "lucide-react"

export function Header({ lang, setLang, onReset, t, canReset }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-white">
            <Package size={19} aria-hidden />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">
              TenderPack
            </div>
            <div className="text-xs text-muted">{t("appSubtitle")}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div
            role="group"
            aria-label={t("languageLabel")}
            className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium"
          >
            {[
              ["en", "EN"],
              ["bn", "বাংলা"],
            ].map(([code, label]) => (
              <button
                key={code}
                type="button"
                lang={code}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`min-h-11 min-w-11 rounded-md px-2.5 py-2 ${
                  lang === code
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            aria-label={t("reset")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted ring-1 ring-inset ring-line hover:bg-slate-50 hover:text-ink disabled:opacity-50"
          >
            <RotateCcw size={13} aria-hidden />
            <span className="hidden sm:inline">{t("reset")}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export function WorkflowProgress({ steps, t }) {
  // steps: array of "done" | "current" | "todo"
  const labels = t("steps")
  return (
    <nav aria-label={t("workflowLabel")}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-xs">
        {labels.map((label, i) => {
          const s = steps[i]
          return (
            <li key={label} className="flex items-center gap-1">
              <span
                aria-current={s === "current" ? "step" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ${
                  s === "done"
                    ? "text-emerald-800"
                    : s === "current"
                      ? "bg-brand-soft text-brand"
                      : "text-muted"
                }`}
              >
                <span
                  className={`grid size-4 place-items-center rounded-full text-[10px] ${
                    s === "done"
                      ? "bg-emerald-600 text-white"
                      : s === "current"
                        ? "bg-brand text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {s === "done" ? (
                    <Check size={10} strokeWidth={3} aria-hidden />
                  ) : (
                    i + 1
                  )}
                </span>
                {label}
              </span>
              {i < labels.length - 1 && (
                <span aria-hidden className="text-slate-300">
                  →
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
