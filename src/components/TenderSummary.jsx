import { ShieldCheck } from "lucide-react"
import { formatDate } from "../utils/dates"
import { Button } from "./ui"

export function TenderSummary({
  tender,
  counts,
  lang,
  t,
  onReplace,
  disabled = false,
}) {
  const fields = [
    [t("tenderId"), tender.tender_id, "font-mono"],
    [t("tender"), tender.title],
    [t("entity"), tender.procuring_entity],
    [t("bidder"), tender.bidder],
    [t("deadline"), formatDate(tender.submission_deadline, lang)],
  ]
  return (
    <section className="rounded-xl border border-line bg-white">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
        {fields.map(([label, value, cls]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-medium text-muted">{label}</dt>
            <dd
              className={`mt-0.5 text-sm font-medium [overflow-wrap:anywhere] ${cls || ""}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-xs text-muted">
        <span>{t("reqCounts", counts)}</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-700" aria-hidden />{" "}
          {t("privacy")}
        </span>
        {onReplace && (
          <Button
            size="sm"
            className="min-h-11"
            disabled={disabled}
            onClick={onReplace}
          >
            {t("replaceJson")}
          </Button>
        )}
      </div>
    </section>
  )
}

export function SummaryCards({ summary, t }) {
  const cards = [
    [t("cardRequirements"), summary.total, "text-ink"],
    [t("cardReady"), summary.ready, "text-emerald-800"],
    [
      t("cardBlocking"),
      summary.blocking,
      summary.blocking ? "text-red-700" : "text-ink",
    ],
    [t("cardOptional"), summary.optionalMissing, "text-slate-600"],
  ]
  return (
    <dl className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 px-1 py-1 text-sm">
      {cards.map(([label, value, cls]) => (
        <div key={label} className="flex items-baseline gap-2">
          <dt className="text-muted">{label}</dt>
          <dd className={`font-semibold tabular-nums ${cls}`}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
