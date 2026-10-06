import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Clock } from "lucide-react";

const PILL = {
  ok: ["bg-emerald-50 text-emerald-800 ring-emerald-200", CheckCircle2],
  missing: ["bg-red-50 text-red-800 ring-red-200", XCircle],
  expired: ["bg-red-50 text-red-800 ring-red-200", XCircle],
  invalid_date: ["bg-red-50 text-red-800 ring-red-200", AlertTriangle],
  expiry_needed: ["bg-amber-50 text-amber-900 ring-amber-200", Clock],
  not_provided: ["bg-slate-100 text-slate-600 ring-slate-200", MinusCircle],
};

export function StatusPill({ status, t }) {
  const [cls, Icon] = PILL[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <Icon size={13} aria-hidden />
      {t(`statuses.${status}`)}
    </span>
  );
}

const BTN = {
  primary: "bg-brand text-white hover:bg-brand-dark disabled:bg-slate-300 disabled:text-slate-500",
  secondary: "bg-white text-ink ring-1 ring-inset ring-line hover:bg-slate-50 disabled:text-slate-400",
  ghost: "text-brand hover:bg-brand-soft disabled:text-slate-400",
  danger: "bg-red-700 text-white hover:bg-red-800",
  dangerGhost: "text-red-700 hover:bg-red-50",
};

export function Button({ variant = "secondary", size = "md", className = "", ...props }) {
  const sz = size === "sm" ? "h-7 px-2 text-xs gap-1" : size === "lg" ? "h-11 px-4 text-sm gap-2" : "h-9 px-3 text-sm gap-1.5";
  return <button type="button" className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${sz} ${BTN[variant]} ${className}`} {...props} />;
}

export function Card({ className = "", children, ...rest }) {
  return (
    <section className={`rounded-xl border border-line bg-white ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function pagesLabel(n, t) {
  return `${n} ${n === 1 ? t("page") : t("pages")}`;
}
