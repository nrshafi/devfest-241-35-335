import { useRef, useState } from "react";
import { FileJson, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "./ui";

export function RequirementsLoader({ onFile, onSample, errors, t }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  return (
    <div className="mx-auto max-w-2xl py-12">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        className={`rounded-xl border bg-white p-8 sm:p-10 ${over ? "border-brand ring-4 ring-brand-soft" : "border-line"}`}
      >
        <div className="mb-5 grid size-11 place-items-center rounded-lg bg-brand-soft text-brand"><FileJson size={22} aria-hidden /></div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("emptyTitle")}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t("emptyBody")}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="lg" onClick={() => input.current?.click()}>
            <FileJson size={16} aria-hidden /> {t("loadJson")}
          </Button>
          <span className="text-xs text-muted">{t("dropJson")}</span>
        </div>
        <input ref={input} type="file" accept=".json,application/json" className="sr-only" aria-label={t("loadJson")} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        {errors && (
          <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-center gap-2 font-medium"><AlertCircle size={15} aria-hidden /> {t("invalidJson")}</div>
            <ul className="mt-1.5 list-disc pl-6 text-xs">{errors.slice(0, 6).map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-700" aria-hidden /> {t("privacy")}</span>
          <button type="button" onClick={onSample} className="font-medium text-brand underline-offset-2 hover:underline">{t("loadSample")}</button>
        </div>
      </div>
    </div>
  );
}
