import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, X, Copy } from "lucide-react";
import { Header, WorkflowProgress } from "./components/Header";
import { RequirementsLoader } from "./components/RequirementsLoader";
import { TenderSummary, SummaryCards } from "./components/TenderSummary";
import { RequirementsTable } from "./components/RequirementsTable";
import { FileUploader, UploadedFileList, FilesPanel } from "./components/Files";
import { PdfPreviewModal, ConfirmDialog } from "./components/Dialogs";
import { PackageReadiness } from "./components/PackageReadiness";
import { makeT } from "./data/translations";
import { sampleRequirements } from "./data/sampleRequirements";
import { validateRequirementsJson } from "./utils/jsonValidation";
import { countPdfPages, isPdfFile, MAX_FILES, MAX_TOTAL_BYTES } from "./utils/pdfUtils";
import { hashBuffer } from "./utils/hashing";
import { findDuplicateGroups } from "./utils/duplicateDetection";
import { suggestAll, checkAssignment } from "./utils/matching";
import { computeRows, getBlockingIssues, summarize, STATUS } from "./utils/validation";
import { generateTenderPackage, downloadPackage, exportChecklistCsv } from "./utils/packageGenerator";

const STORE = "tenderpack:v1";
const loadStore = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } };
let seq = 0;
const uid = (p) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export default function App() {
  const stored = useMemo(loadStore, []);
  const [language, setLanguage] = useState(stored.language === "bn" ? "bn" : "en");
  const [data, setData] = useState(() => {
    const v = stored.requirementsJson && validateRequirementsJson(stored.requirementsJson);
    return v && v.ok ? { ...v.data, raw: stored.requirementsJson } : null;
  });
  const [jsonErrors, setJsonErrors] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [matches, setMatches] = useState({});
  const [expiryDates, setExpiryDates] = useState({});
  const [uploadMessages, setUploadMessages] = useState([]);
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [includeIndex, setIncludeIndex] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null);
  const filesRef = useRef(uploadedFiles);
  filesRef.current = uploadedFiles;

  const t = useMemo(() => makeT(language), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORE, JSON.stringify({ language, requirementsJson: data?.raw ?? null }));
  }, [language, data]);

  useEffect(() => { setResult(null); setGenError(null); }, [matches, expiryDates, uploadedFiles, includeIndex, data]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(id);
  }, [notice]);

  // ---------- derived ----------
  const requirements = data?.requirements ?? [];
  const duplicateInfo = useMemo(() => findDuplicateGroups(uploadedFiles), [uploadedFiles]);
  const suggestions = useMemo(() => suggestAll(uploadedFiles, requirements, duplicateInfo), [uploadedFiles, requirements, duplicateInfo]);
  const rows = useMemo(() => {
    if (!data) return [];
    return computeRows(requirements, uploadedFiles, matches, expiryDates, data.tender.submission_deadline).map((r) => ({ ...r, allRequirements: requirements }));
  }, [data, requirements, uploadedFiles, matches, expiryDates]);
  const summary = useMemo(() => summarize(rows), [rows]);
  const issues = useMemo(() => getBlockingIssues(rows), [rows]);
  const matchByFile = useMemo(() => Object.fromEntries(Object.entries(matches).map(([r, f]) => [f, r])), [matches]);
  const reqTitle = useCallback((id) => { const r = requirements.find((q) => q.id === id); return r ? (language === "bn" ? r.title_bn : r.title_en) : id; }, [requirements, language]);
  const validFiles = uploadedFiles.filter((f) => f.pageCount);
  const totalPages = validFiles.reduce((s, f) => s + f.pageCount, 0);
  const dupGroups = new Set([...duplicateInfo.values()].map((g) => g.id));
  const plan = useMemo(() => {
    const inc = rows.filter((r) => r.file && r.status === STATUS.OK);
    return { docs: inc.length, pages: inc.reduce((s, r) => s + r.file.pageCount, 0) };
  }, [rows]);

  const mandatoryMatched = rows.length > 0 && rows.every((r) => !r.requirement.mandatory || r.file);
  const steps = [
    data ? "done" : "current",
    validFiles.length ? "done" : data ? "current" : "todo",
    mandatoryMatched ? "done" : validFiles.length ? "current" : "todo",
    data && mandatoryMatched && summary.blocking === 0 ? "done" : mandatoryMatched ? "current" : "todo",
    result ? "done" : data && summary.blocking === 0 ? "current" : "todo",
  ];

  // ---------- requirements ----------
  function applyRequirements(raw) {
    const v = validateRequirementsJson(raw);
    if (!v.ok) return setJsonErrors(v.errors);
    setJsonErrors(null);
    setData({ ...v.data, raw });
    setMatches({});
    setExpiryDates({});
  }
  async function loadJsonFile(file) {
    try {
      applyRequirements(JSON.parse(await file.text()));
    } catch {
      setJsonErrors([t("notJson")]);
    }
  }

  // ---------- uploads ----------
  function addFiles(list) {
    if (!list.length) return;
    if (!data) return setUploadMessages((m) => [...m, { id: uid("m"), text: t("loadRequirementsFirst") }]);
    const msgs = [];
    const nonPdf = list.filter((f) => !isPdfFile(f));
    if (nonPdf.length) msgs.push({ id: uid("m"), text: t("onlyPdf"), names: nonPdf.map((f) => f.name) });
    let pdfs = list.filter(isPdfFile);
    const current = filesRef.current;
    const room = MAX_FILES - current.length;
    if (pdfs.length > room) {
      msgs.push({ id: uid("m"), text: t("tooMany", { max: MAX_FILES, n: pdfs.length - Math.max(0, room) }), names: pdfs.slice(Math.max(0, room)).map((f) => f.name) });
      pdfs = pdfs.slice(0, Math.max(0, room));
    }
    let bytes = current.reduce((s, f) => s + f.size, 0);
    const accepted = [];
    for (const f of pdfs) {
      if (bytes + f.size > MAX_TOTAL_BYTES) { msgs.push({ id: uid("m"), text: t("tooLarge", { mb: MAX_TOTAL_BYTES / 1024 / 1024, name: f.name }) }); continue; }
      bytes += f.size;
      accepted.push({ id: uid("f"), file: f, name: f.name, size: f.size, pageCount: null, hash: null, duplicateGroup: null, error: null, status: "processing" });
    }
    setUploadMessages(msgs);
    if (!accepted.length) return;
    filesRef.current = [...current, ...accepted];
    setUploadedFiles((fs) => [...fs, ...accepted]);
    accepted.forEach(processFile);
  }

  async function processFile(entry) {
    let patch;
    try {
      const buffer = await entry.file.arrayBuffer();
      const hash = await hashBuffer(buffer);
      try {
        patch = { hash, pageCount: await countPdfPages(buffer), status: "ready" };
      } catch (e) {
        patch = { hash, error: e.code || "damaged", status: "error" };
      }
    } catch {
      patch = { error: "damaged", status: "error" };
    }
    setUploadedFiles((fs) => fs.map((f) => (f.id === entry.id ? { ...f, ...patch } : f)));
  }

  function requestRemove(file) {
    const req = matchByFile[file.id];
    if (req) setConfirm({ file, req });
    else removeFile(file.id);
  }
  function removeFile(fileId) {
    const req = matchByFile[fileId];
    setUploadedFiles((fs) => fs.filter((f) => f.id !== fileId));
    if (req) {
      setMatches(({ [req]: _, ...rest }) => rest);
      setExpiryDates(({ [req]: _, ...rest }) => rest);
    }
    setConfirm(null);
  }

  // ---------- matching ----------
  function assign(reqId, fileId) {
    const err = checkAssignment(fileId, reqId, uploadedFiles, matches, duplicateInfo);
    if (err) {
      const file = uploadedFiles.find((f) => f.id === fileId);
      if (err.code === "already_matched") setNotice(t("errAlready", { file: file?.name, req: reqTitle(err.requirementId) }));
      else if (err.code === "duplicate_used") setNotice(t("errDup", { file: file?.name, other: uploadedFiles.find((f) => f.id === err.otherFileId)?.name, req: reqTitle(err.requirementId) }));
      else setNotice(t("errInvalid"));
      return;
    }
    if (matches[reqId] !== fileId) setExpiryDates(({ [reqId]: _, ...rest }) => rest);
    setMatches((m) => ({ ...m, [reqId]: fileId }));
  }
  function unmatch(reqId) {
    setMatches(({ [reqId]: _, ...rest }) => rest);
    setExpiryDates(({ [reqId]: _, ...rest }) => rest);
  }

  // ---------- package ----------
  async function generate() {
    if (summary.blocking > 0) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await generateTenderPackage({ tender: data.tender, rows, includeIndex });
      setResult(res);
    } catch (e) {
      setGenError(e?.message || "Unknown error");
    } finally {
      setGenerating(false);
    }
  }

  function reset() {
    if (!window.confirm(t("resetConfirm"))) return;
    setData(null); setUploadedFiles([]); setMatches({}); setExpiryDates({}); setUploadMessages([]); setJsonErrors(null); setResult(null); setIncludeIndex(false);
  }

  return (
    <div className="min-h-screen text-[14px]" lang={language}>
      <Header lang={language} setLang={setLanguage} onReset={reset} t={t} canReset={!!data || uploadedFiles.length > 0} />
      <div className="border-b border-line bg-white/60">
        <div className="mx-auto max-w-[1440px] px-4 py-2 sm:px-6"><WorkflowProgress steps={steps} t={t} /></div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
        {!data ? (
          <RequirementsLoader onFile={loadJsonFile} onSample={() => applyRequirements(sampleRequirements)} errors={jsonErrors} t={t} />
        ) : (
          <div className="space-y-4">
            <TenderSummary tender={data.tender} counts={{ total: summary.total, mandatory: summary.mandatory, optional: summary.optional }} lang={language} t={t} />
            <SummaryCards summary={summary} t={t} />
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
              <RequirementsTable rows={rows} files={uploadedFiles} matches={matches} duplicateInfo={duplicateInfo} lang={language} t={t} onAssign={assign} onUnmatch={unmatch} onExpiry={(id, v) => setExpiryDates((d) => ({ ...d, [id]: v }))} />
              <div className="space-y-4 lg:sticky lg:top-4">
                <FilesPanel
                  t={t}
                  summary={uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-slate-50/70 px-4 py-2 text-xs text-muted rounded-b-xl">
                      <span className="font-medium text-ink">{t("uploadSummary", { files: validFiles.length, pages: totalPages })}</span>
                      {dupGroups.size > 0 && <span className="inline-flex items-center gap-1 text-amber-900"><Copy size={12} aria-hidden />{t("dupSummary", { groups: dupGroups.size, files: duplicateInfo.size })}</span>}
                    </div>
                  )}
                >
                  <FileUploader onFiles={addFiles} messages={uploadMessages} onDismiss={(id) => setUploadMessages((m) => m.filter((x) => x.id !== id))} t={t} />
                  {uploadedFiles.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("uploaded")}</h3>
                      <div className="max-h-[560px] overflow-y-auto pr-1">
                        <UploadedFileList files={uploadedFiles} duplicateInfo={duplicateInfo} matchByFile={matchByFile} suggestions={suggestions} matches={matches} reqTitle={reqTitle} t={t} onPreview={setPreview} onRemove={requestRemove} onAccept={(fid, rid) => assign(rid, fid)} />
                      </div>
                    </div>
                  )}
                </FilesPanel>
                <PackageReadiness summary={summary} issues={issues} lang={language} t={t} plan={plan} includeIndex={includeIndex} setIncludeIndex={setIncludeIndex} onGenerate={generate} generating={generating} result={result} onDownload={() => downloadPackage(result)} genError={genError} onExportCsv={() => exportChecklistCsv(data.tender, rows)} />
              </div>
            </div>
          </div>
        )}
      </main>

      {notice && (
        <div role="alert" className="fixed bottom-4 left-1/2 z-40 flex w-[min(560px,calc(100%-2rem))] -translate-x-1/2 items-start gap-2 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-900 shadow-lg">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-700" aria-hidden />
          <p className="flex-1">{notice}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label={t("close")} className="rounded p-0.5 text-muted hover:bg-slate-100"><X size={14} /></button>
        </div>
      )}
      {confirm && (
        <ConfirmDialog title={t("removeTitle")} body={t("removeMatched", { req: reqTitle(confirm.req) })} confirmLabel={t("removeFile")} cancelLabel={t("cancel")} onConfirm={() => removeFile(confirm.file.id)} onCancel={() => setConfirm(null)} />
      )}
      {preview && <PdfPreviewModal file={preview} onClose={() => setPreview(null)} t={t} />}
    </div>
  );
}
