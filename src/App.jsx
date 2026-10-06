import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { AlertCircle, X, Copy } from "lucide-react"
import { Header, WorkflowProgress } from "./components/Header"
import { RequirementsLoader } from "./components/RequirementsLoader"
import { TenderSummary, SummaryCards } from "./components/TenderSummary"
import { RequirementsTable } from "./components/RequirementsTable"
import { FileUploader, UploadedFileList, FilesPanel } from "./components/Files"
import { PdfPreviewModal, ConfirmDialog } from "./components/Dialogs"
import { PackageReadiness } from "./components/PackageReadiness"
import { WorkspaceLayout } from "./components/WorkspaceLayout"
import { makeT } from "./data/translations"
import { sampleRequirements } from "./data/sampleRequirements"
import { validateRequirementsJson } from "./utils/jsonValidation"
import {
  countPdfPages,
  isPdfFile,
  MAX_FILES,
  MAX_TOTAL_BYTES,
} from "./utils/pdfUtils"
import { hashBuffer } from "./utils/hashing"
import { findDuplicateGroups } from "./utils/duplicateDetection"
import { suggestAll } from "./utils/matching"
import {
  computeRows,
  getBlockingIssues,
  summarize,
  STATUS,
} from "./utils/validation"
import {
  generateTenderPackage,
  downloadPackage,
  exportChecklistCsv,
} from "./utils/packageGenerator"
import {
  createSession,
  sessionReducer,
  hasPendingIntake,
  canGenerate,
  freezeGenerationSnapshot,
} from "./state/session"

const STORE = "tenderpack:v1"
function loadLanguage() {
  try {
    return JSON.parse(localStorage.getItem(STORE))?.language === "bn"
      ? "bn"
      : "en"
  } catch {
    return "en"
  }
}
let seq = 0
const uid = (prefix) =>
  `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`

export default function App() {
  const [language, setLanguage] = useState(loadLanguage)
  const [state, dispatch] = useReducer(sessionReducer, undefined, createSession)
  const stateRef = useRef(state)
  // Reserve capacity synchronously, including back-to-back upload gestures.
  const act = useCallback((action) => {
    stateRef.current = sessionReducer(stateRef.current, action)
    dispatch(action)
    return stateRef.current
  }, [])
  const [jsonErrors, setJsonErrors] = useState(null)
  const [uploadMessages, setUploadMessages] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [preview, setPreview] = useState(null)
  const replaceInput = useRef(null)
  const jsonRead = useRef(0)
  const intakeQueue = useRef([])
  const intakeRunning = useRef(false)
  const {
    data,
    files: uploadedFiles,
    matches,
    expiryDates,
    includeIndex,
    result,
    genError,
    notice,
  } = state
  const generating = !!state.generation
  const pending = hasPendingIntake(state)
  const t = useMemo(() => makeT(language), [language])

  useEffect(() => {
    document.documentElement.lang = language
    // Remove the legacy partial restoration, retaining only the preference.
    try {
      localStorage.setItem(STORE, JSON.stringify({ language }))
    } catch {
      /* Optional storage. */
    }
  }, [language])
  useEffect(() => {
    const protectWork = (event) => {
      const current = stateRef.current
      if (current.data || current.files.length || current.generation) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", protectWork)
    return () => window.removeEventListener("beforeunload", protectWork)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => act({ type: "notice", notice: null }), 7000)
    return () => clearTimeout(timer)
  }, [notice, act])

  const requirements = data?.requirements ?? []
  const duplicateInfo = useMemo(
    () => findDuplicateGroups(uploadedFiles),
    [uploadedFiles],
  )
  const suggestions = useMemo(
    () => suggestAll(uploadedFiles, requirements, duplicateInfo),
    [uploadedFiles, requirements, duplicateInfo],
  )
  const rows = useMemo(
    () =>
      data
        ? computeRows(
            requirements,
            uploadedFiles,
            matches,
            expiryDates,
            data.tender.submission_deadline,
          ).map((row) => ({ ...row, allRequirements: requirements }))
        : [],
    [data, requirements, uploadedFiles, matches, expiryDates],
  )
  const summary = useMemo(() => summarize(rows), [rows])
  const issues = useMemo(() => getBlockingIssues(rows), [rows])
  const matchByFile = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(matches).map(([rid, fid]) => [fid, rid]),
      ),
    [matches],
  )
  const reqTitle = useCallback(
    (id) => {
      const requirement = requirements.find((r) => r.id === id)
      return requirement
        ? language === "bn"
          ? requirement.title_bn
          : requirement.title_en
        : id
    },
    [requirements, language],
  )
  const validFiles = uploadedFiles.filter((f) => f.status === "ready")
  const totalPages = validFiles.reduce((sum, file) => sum + file.pageCount, 0)
  const dupGroups = new Set(
    [...duplicateInfo.values()].map((group) => group.id),
  )
  const plan = useMemo(() => {
    const included = rows.filter((row) => row.file && row.status === STATUS.OK)
    return {
      docs: included.length,
      pages: included.reduce((sum, row) => sum + row.file.pageCount, 0),
    }
  }, [rows])
  const mandatoryMatched =
    rows.length > 0 &&
    rows.every((row) => !row.requirement.mandatory || row.file)
  const ready = canGenerate(state)
  const steps = [
    data ? "done" : "current",
    validFiles.length && !pending ? "done" : data ? "current" : "todo",
    mandatoryMatched ? "done" : validFiles.length ? "current" : "todo",
    ready ? "done" : mandatoryMatched ? "current" : "todo",
    result ? "done" : ready ? "current" : "todo",
  ]

  function finishReplacement(nextData) {
    jsonRead.current += 1
    intakeQueue.current = []
    act({ type: "replace", data: nextData })
    setJsonErrors(null)
    setUploadMessages([])
    setConfirm(null)
    setPreview(null)
  }
  function applyRequirements(raw) {
    const validation = validateRequirementsJson(raw)
    if (!validation.ok) {
      setJsonErrors(validation.errors)
      return
    }
    setJsonErrors(null)
    if (stateRef.current.data || stateRef.current.files.length) {
      setConfirm({
        kind: "replace",
        data: validation.data,
        session: stateRef.current.session,
      })
    } else finishReplacement(validation.data)
  }
  async function loadJsonFile(file) {
    if (!file) return
    const request = ++jsonRead.current
    const session = stateRef.current.session
    try {
      const raw = JSON.parse(await file.text())
      if (request !== jsonRead.current || session !== stateRef.current.session)
        return
      applyRequirements(raw)
    } catch {
      if (request === jsonRead.current && session === stateRef.current.session)
        setJsonErrors([{ key: "notJson", vars: {} }])
    }
  }

  async function drainIntake() {
    if (intakeRunning.current) return
    intakeRunning.current = true
    try {
      while (intakeQueue.current.length) {
        const { entry, session } = intakeQueue.current.shift()
        const retained = () =>
          stateRef.current.session === session &&
          stateRef.current.files.some(
            (f) => f.id === entry.id && f.status === "processing",
          )
        if (!retained()) continue
        let patch
        try {
          const buffer = await entry.file.arrayBuffer()
          if (!retained()) continue
          const pageCount = await countPdfPages(buffer)
          if (!retained()) continue
          const hash = await hashBuffer(buffer)
          patch = {
            hash,
            pageCount,
            bytes: new Uint8Array(buffer),
            status: "ready",
          }
        } catch (error) {
          patch = {
            error: error?.code === "password" ? "password" : "damaged",
            status: "error",
          }
        }
        act({ type: "intake", session, id: entry.id, patch })
      }
    } finally {
      intakeRunning.current = false
    }
  }
  function addFiles(selected) {
    const list = Array.from(selected)
    if (!list.length) return
    const current = stateRef.current
    if (!current.data) {
      setUploadMessages((messages) => [
        ...messages,
        { id: uid("m"), key: "loadRequirementsFirst", vars: {} },
      ])
      return
    }
    const messages = []
    const nonPdf = list.filter((file) => !isPdfFile(file))
    if (nonPdf.length)
      messages.push({
        id: uid("m"),
        key: "onlyPdf",
        vars: {},
        names: nonPdf.map((file) => file.name),
      })
    let pdfs = list.filter(isPdfFile)
    const room = Math.max(0, MAX_FILES - current.files.length)
    if (pdfs.length > room) {
      messages.push({
        id: uid("m"),
        key: "tooMany",
        vars: { max: MAX_FILES, n: pdfs.length - room },
        names: pdfs.slice(room).map((file) => file.name),
      })
      pdfs = pdfs.slice(0, room)
    }
    let bytes = current.files.reduce((sum, file) => sum + file.size, 0)
    const accepted = []
    for (const file of pdfs) {
      if (bytes + file.size > MAX_TOTAL_BYTES) {
        messages.push({
          id: uid("m"),
          key: "tooLarge",
          vars: { mb: MAX_TOTAL_BYTES / 1_000_000, name: file.name },
        })
        continue
      }
      bytes += file.size
      accepted.push({
        id: uid("f"),
        file,
        name: file.name,
        size: file.size,
        pageCount: null,
        hash: null,
        bytes: null,
        error: null,
        status: "processing",
      })
    }
    setUploadMessages(messages)
    if (!accepted.length) return
    act({ type: "add", session: current.session, files: accepted })
    intakeQueue.current.push(
      ...accepted.map((entry) => ({ entry, session: current.session })),
    )
    void drainIntake()
  }
  function removeFile(fileId) {
    act({ type: "remove", id: fileId })
    intakeQueue.current = intakeQueue.current.filter(
      ({ entry }) => entry.id !== fileId,
    )
    if (preview?.id === fileId) setPreview(null)
    setConfirm(null)
  }
  function requestRemove(file) {
    const requirementId = Object.entries(stateRef.current.matches).find(
      ([, id]) => id === file.id,
    )?.[0]
    if (requirementId) setConfirm({ kind: "remove", file, req: requirementId })
    else removeFile(file.id)
  }
  const assign = (requirementId, fileId) =>
    act({ type: "assign", requirementId, fileId })
  const unmatch = (requirementId) => act({ type: "unmatch", requirementId })
  async function generate() {
    const current = stateRef.current
    if (current.generation) return
    const snapshot = freezeGenerationSnapshot(current)
    if (!snapshot) {
      act({
        type: "notice",
        notice: {
          key: hasPendingIntake(current)
            ? "intakePending"
            : "generationBlocked",
          vars: {},
        },
      })
      return
    }
    const token = {
      id: uid("g"),
      session: current.session,
      revision: current.revision,
    }
    act({ type: "generate", token })
    try {
      const generated = await generateTenderPackage(snapshot)
      act({ type: "generated", token, result: generated })
    } catch (error) {
      act({
        type: "generated",
        token,
        error: { code: error?.code || "UNKNOWN", params: error?.params || {} },
      })
    }
  }
  function reset() {
    jsonRead.current += 1
    intakeQueue.current = []
    act({ type: "reset" })
    setJsonErrors(null)
    setUploadMessages([])
    setConfirm(null)
    setPreview(null)
  }
  const renderMessage = (message) =>
    t(message.key, {
      ...message.vars,
      ...(message.requirementId
        ? { req: reqTitle(message.requirementId) }
        : {}),
    })

  const uploads = (
    <FilesPanel
      t={t}
      summary={
        uploadedFiles.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-line bg-slate-50/70 px-4 py-2 text-xs text-muted">
            <span className="font-medium text-ink">
              {t("uploadSummary", {
                files: validFiles.length,
                pages: totalPages,
              })}
            </span>
            {dupGroups.size > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-900">
                <Copy size={12} aria-hidden />
                {t("dupSummary", {
                  groups: dupGroups.size,
                  files: duplicateInfo.size,
                })}
              </span>
            )}
          </div>
        )
      }
    >
      <FileUploader
        onFiles={addFiles}
        messages={uploadMessages}
        onDismiss={(id) =>
          setUploadMessages((messages) =>
            messages.filter((message) => message.id !== id),
          )
        }
        t={t}
      />
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted">
            {t("uploaded")}
          </h3>
          <div className="min-w-0 min-[1440px]:max-h-[560px] min-[1440px]:overflow-y-auto min-[1440px]:pr-1">
            <UploadedFileList
              files={uploadedFiles}
              duplicateInfo={duplicateInfo}
              matchByFile={matchByFile}
              suggestions={suggestions}
              matches={matches}
              reqTitle={reqTitle}
              t={t}
              onPreview={setPreview}
              onRemove={requestRemove}
              onAccept={(fid, rid) => assign(rid, fid)}
            />
          </div>
        </div>
      )}
    </FilesPanel>
  )
  const checklist = (
    <RequirementsTable
      rows={rows}
      files={uploadedFiles}
      matches={matches}
      duplicateInfo={duplicateInfo}
      deadline={data?.tender.submission_deadline}
      lang={language}
      t={t}
      onAssign={assign}
      onUnmatch={unmatch}
      onExpiry={(requirementId, value) =>
        act({ type: "expiry", requirementId, value })
      }
    />
  )
  const readiness = data && (
    <PackageReadiness
      summary={summary}
      issues={issues}
      lang={language}
      t={t}
      plan={plan}
      pending={pending}
      includeIndex={includeIndex}
      setIncludeIndex={(value) => act({ type: "index", value })}
      onGenerate={generate}
      generating={generating}
      result={result}
      onDownload={() => {
        const latest = stateRef.current
        if (latest.result && canGenerate(latest)) downloadPackage(latest.result)
      }}
      genError={genError}
      onExportCsv={() => exportChecklistCsv(data.tender, rows)}
    />
  )

  return (
    <div className="min-h-screen text-[14px]" lang={language}>
      <Header
        lang={language}
        setLang={setLanguage}
        onReset={() => setConfirm({ kind: "reset" })}
        t={t}
        canReset={!!data || uploadedFiles.length > 0}
      />
      <div className="border-b border-line bg-white/60">
        <div className="mx-auto max-w-[1440px] px-4 py-2 sm:px-6">
          <WorkflowProgress steps={steps} t={t} />
        </div>
      </div>
      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
        <p className="mb-4 text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">
          {t("sessionWarning")}
        </p>
        <input
          ref={replaceInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label={t("replaceJson")}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            void loadJsonFile(file)
          }}
        />
        {!data ? (
          <RequirementsLoader
            onFile={loadJsonFile}
            onSample={() => applyRequirements(sampleRequirements)}
            errors={jsonErrors}
            t={t}
          />
        ) : (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold sm:text-2xl">{t("workspaceTitle")}</h1>
            {jsonErrors && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-900"
              >
                <p className="font-semibold">{t("invalidJson")}</p>
                <ul className="list-disc pl-5">
                  {jsonErrors.map((error, index) => (
                    <li key={index}>{renderMessage(error)}</li>
                  ))}
                </ul>
              </div>
            )}
            <TenderSummary
              tender={data.tender}
              counts={{
                total: summary.total,
                mandatory: summary.mandatory,
                optional: summary.optional,
              }}
              lang={language}
              t={t}
              onReplace={() => replaceInput.current?.click()}
            />
            <SummaryCards summary={summary} t={t} />
            <WorkspaceLayout
              uploads={uploads}
              checklist={checklist}
              readiness={readiness}
            />
          </div>
        )}
      </main>
      {notice && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-40 flex w-[min(560px,calc(100%-2rem))] -translate-x-1/2 items-start gap-2 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-900 shadow-lg"
        >
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-red-700"
            aria-hidden
          />
          <p className="flex-1">{renderMessage(notice)}</p>
          <button
            type="button"
            onClick={() => act({ type: "notice", notice: null })}
            aria-label={t("close")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-muted hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {confirm?.kind === "remove" && (
        <ConfirmDialog
          title={t("removeTitle")}
          body={t("removeMatched", { req: reqTitle(confirm.req) })}
          confirmLabel={t("removeFile")}
          cancelLabel={t("cancel")}
          onConfirm={() => removeFile(confirm.file.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.kind === "replace" && (
        <ConfirmDialog
          title={t("replaceTitle")}
          body={t("replaceConfirm")}
          confirmLabel={t("replaceJson")}
          cancelLabel={t("cancel")}
          onConfirm={() => {
            if (confirm.session === stateRef.current.session)
              finishReplacement(confirm.data)
            else setConfirm(null)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.kind === "reset" && (
        <ConfirmDialog
          title={t("reset")}
          body={t("resetConfirm")}
          confirmLabel={t("reset")}
          cancelLabel={t("cancel")}
          onConfirm={reset}
          onCancel={() => setConfirm(null)}
        />
      )}
      {preview && (
        <PdfPreviewModal
          file={preview}
          onClose={() => setPreview(null)}
          t={t}
        />
      )}
    </div>
  )
}
