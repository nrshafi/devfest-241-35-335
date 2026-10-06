import { ShieldCheck } from "lucide-react";
import { formatDate } from "../utils/dates";

export function TenderSummary({ tender, counts, lang, t }) {
  const fields = [
    [t("tenderId"), tender.tender_id, "font-mono"],
    [t("tender"), tender.title],
    [t("entity"), tender.procuring_entity],
    [t("bidder"), tender.bidder],
    [t("deadline"), formatDate(tender.submission_deadline, lang)],
  ];
  return (
    <section className="rounded-xl border border-line bg-white">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 sm:grid-cols-3 lg:grid-cols-[auto_1.4fr_1.4fr_1.2fr_auto]">
        {fields.map(([label, value, cls]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
            <dd className={`mt-0.5 truncate text-sm font-medium ${cls || ""}`} title={value}>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-xs text-muted">
        <span>{t("reqCounts", counts)}</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-700" aria-hidden /> {t("privacy")}</span>
      </div>
    </section>
  );
}

export function SummaryCards({ summary, t }) {
  const cards = [
    [t("cardRequirements"), summary.total, "text-ink", "bg-slate-300"],
    [t("cardReady"), summary.ready, "text-emerald-800", "bg-emerald-500"],
    [t("cardBlocking"), summary.blocking, summary.blocking ? "text-red-700" : "text-ink", summary.blocking ? "bg-red-500" : "bg-slate-300"],
    [t("cardOptional"), summary.optionalMissing, "text-slate-600", "bg-slate-300"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(([label, value, cls, bar]) => (
        <div key={label} className="relative overflow-hidden rounded-xl border border-line bg-white px-4 py-3">
          <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
          <div className="text-xs font-medium text-muted">{label}</div>
          <div className={`mt-0.5 text-2xl font-semibold tabular-nums ${cls}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}
