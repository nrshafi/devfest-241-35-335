# Architecture Context

## Current State

The application lives at the repository root, with JSX application modules, TypeScript entry/configuration files, React, Vite, Tailwind CSS, pdf-lib, and pdfjs-dist declared in its manifest. The 6 October site repair audits and corrects intake, schema, session integrity, PDF output, localization, responsive workflow, and accessibility; verification evidence is in the tracker. Remaining proposed choices below are not organizer mandates, and local verification does not establish public deployment or contest eligibility.

### Imported Application: Standalone Configuration

The user removed the Figma tooling directory, including `.figma/make/site.json`. Standalone configuration uses the existing React/Tailwind Vite plugins, preserves the `@` source alias and port 8443 default, and removes Figma-specific imports, plugins, and environment variables. Site title, English language, description, and noindex/nofollow metadata live in `index.html`; `public/robots.txt` preserves the previous crawler restriction. There is no Figma configuration dependency. Per the user's instruction, the imported application uses Bun 1.4.2 for package management and script execution, with `bun.lock` as its dependency lockfile. Dependency installation and build results are recorded in the progress tracker. This cleanup does not establish that the imported app satisfies the planned domain, PDF, storage, or UI contracts.

## Proposed Stack

| Layer | Technology | Role |
| --- | --- | --- |
| UI | React, JavaScript ES modules, JSDoc contracts | Single-page checklist and file workspace |
| Tooling | Vite, Bun | Local development and static build |
| Styling | Plain CSS custom properties | Shared theme and responsive bilingual layout |
| PDF | pdf-lib | Parse/count pages, create cover, compose package, draw footers |
| Duplicate detection | Browser Web Crypto SHA-256 and byte equality | Exact-content groups independent of filenames |
| State | React reducer and derived selectors | Atomic assignments and live validation |
| Download | Browser Blob/object URLs | Local PDF download |
| Storage | Memory; optional localStorage for language only | No automatic document persistence |
| Hosting | GitHub Pages through GitHub Actions | Public assets without application server code |

pdf.js is optional if previews are added; page counting alone does not require another PDF dependency. No external API or AI feature is planned for the baseline. Verify and lock exact package/runtime versions during initialization.

## Current Application Layout

Repository-root `AGENTS.md` and `context/` provide the shared development instructions. Application paths below are relative to the repository root:

- `src/main.tsx`: React entrypoint and global CSS import.
- `src/App.jsx`: application composition and session state; start UI work here.
- `src/App.tsx`: re-export wrapper for `App.jsx`.
- `src/components/`: checklist, uploads, summary, dialogs, and shared UI components.
- `src/utils/`: input/date validation, matching, duplicates, hashing, PDF intake/preview, and package generation.
- `src/utils/pdfPageGeometry.js`: crop-preserving external footer-band geometry and clipping.
- `src/state/session.js`: atomic session reducer, pending/readiness checks, and isolated generation snapshots.
- `src/components/WorkspaceLayout.jsx`: uploads/checklist/readiness flow and wide sidebar layout.
- `tests/`: Bun regression checks for intake, schema, states, generation geometry, localization, and session behavior.
- `src/data/`: bilingual dictionaries and sample requirements.
- `src/index.css`: Tailwind v4 import, theme tokens, fonts, and global styles.
- `index.html`: HTML shell, title, description, and crawler metadata.
- `vite.config.ts`: React/Tailwind plugins, `@` source alias, and port configuration.
- `package.json` and `bun.lock`: scripts, dependency declarations, and locked resolutions.
- `public/robots.txt`: crawler restriction copied into static build output.

Use the existing layout for maintenance; the boundaries below remain a proposed baseline organization rather than instructions to relocate modules during cleanup.

## Static Deployment

`.github/workflows/deploy-pages.yml` builds the root application on pushes to `main` and manual runs on `main`. It uses the Bun version declared in `package.json`, installs from `bun.lock` with `--frozen-lockfile`, and uploads only `dist/` for a separate GitHub Pages deployment job. Node.js 24 supplies the Vite runtime.

The workflow configures Pages before building and passes its `base_path` output plus a trailing slash to `bun run build --base`. This overrides the local Vite `/` default for repository sites and supports root/custom-domain sites. Vite rewrites bundled assets, including the PDF.js worker imported with `?url`. Enable GitHub Actions as the repository's Pages source before running the workflow. No application backend or deployment secret is needed; the deployment uses the workflow's GitHub token and OIDC permissions. The public deployment remains unverified until a successful Actions run.

## Proposed Boundaries

- src/app/: app composition and workflow.
- src/components/: tender summary, inputs, upload list, checklist, expiry controls, language switch, and generation summary.
- src/domain/: schema/date validation, ordering, assignment constraints, statuses, and readiness; pure logic.
- src/state/: reducer actions and selectors.
- src/lib/files/: file reads, intake limits, hashes, duplicate groups, resource cleanup.
- src/lib/pdf/: PDF intake metadata, cover layout, assembly, footer geometry.
- src/i18n/: English/Bangla dictionaries and formatting.
- src/styles/: tokens, layout, component styles.
- public/: licensed static assets; optional clearly labeled sample fixtures.
- tests/: focused domain/PDF checks once a runner is selected.
- given_documents/: preserved organizer input fixtures.
- output/: required generated sample package; not app persistence.
- screenshots/: actual app submission evidence.
- context/: specifications, decisions, workflow, progress.

These boundaries are not all implemented in the imported application. Create only those needed by an authorized feature change.

## Data and Storage

| Record | Fields / responsibility |
| --- | --- |
| Tender | tender_id, title, procuring_entity, bidder, submission_deadline |
| Requirement | id, order, title_en, title_bn, mandatory, has_expiry; retain source schema |
| Uploaded file | Session ID, original filename, size, original File/bytes, page count, hash, intake state, duplicate-group key |
| Assignment | Requirement ID mapped to file ID and optional normalized expiry date |
| UI state | Language, progress, validation messages, current download artifact |
| Derived state | Sorted requirements, file usage, statuses, duplicate usage, blockers, included page count, readiness |

Keep source bytes and metadata in memory. Refresh restoration is not promised by the baseline. Do not serialize large PDFs or File objects to localStorage. If save/reopen is added, specify a versioned project-file or IndexedDB format first, including bytes and mappings. Static hosting never stores user uploads.

Derive statuses/readiness from current inputs instead of independently mutable flags. A generated artifact is valid only for the input snapshot used to build it.

## Input and State Policies

These defensive policies resolve implementation details not specified by organizers:

1. Validate required tender/requirement fields, non-empty strings, boolean flags, real ISO dates, unique requirement IDs, and positive integer order values before accepting JSON. Provisionally reject duplicate order values as ambiguous; record organizer clarification if available.
2. Invalid JSON preserves the active session. Valid replacement requirements start a new tender session; confirm only when existing work would be discarded.
3. Count retained accepted PDFs, including duplicate copies, against the 30-file limit. Reject non-PDF inputs separately. Provisionally interpret 50 MB as 50,000,000 bytes and label it clearly until units are clarified.
4. Parse actual PDF content rather than trusting extension/MIME. A renamed PNG is invalid; an image-only scanned PDF is valid without OCR.
5. Hash original bytes, then confirm equality among hash/size candidates. Similar filenames, text, or page counts do not establish duplication.
6. Keep duplicate uploads visible. At most one member of an exact-content group may be assigned anywhere at once. Unused duplicates are warnings, not blockers.
7. Match/unmatch/reassign atomically, explain conflicts, and allow changes. Removing a file removes its assignment and expiry.
8. Replacing a matched file clears its entered expiry; unmatching clears assignment-specific expiry.
9. Store validated dates as YYYY-MM-DD calendar strings and compare them directly; avoid timezone conversion and today's date.
10. Disable generation during unfinished intake or generation as an operational state, without inventing extra checklist statuses.
11. Revalidate at generation time, freeze a snapshot or lock editing until completion, and invalidate prior downloads after package input changes.
12. Catch file/generation errors, preserve valid work, and restore usable controls. Never silently omit a matched file to make generation succeed.

## Package Assembly

### Repair Decisions — 6 October 2026

The authorized repair uses pdf-lib for intake page counts, independent of the optional PDF.js preview worker. Preview loading is lazy. SHA-256 has a local fallback when Web Crypto is unavailable, and duplicate groups require equal retained bytes as well as matching hash/size.

PDF output retains copied source content and extends MediaBox/CropBox at the visual bottom according to rotation (0: bottom, 90: right, 180: top, 270: left). Source coordinates remain unchanged; footers occupy only the new band. Form appearances are flattened before copying, with an explicit error if preservation fails.

Cover and index text is measured and wrapped without dropping entries. A single mandatory cover uses a minimum readable 8.5pt size; inputs that cannot fit fail with a specific error instead of producing an incomplete cover. Unsupported standard-font characters fail with a field-specific error instead of being replaced with question marks. Full Unicode PDF font support remains a limitation; supplied names and document titles are never silently altered.

Session repairs keep PDFs in memory and persist only language. The UI explains refresh loss and protects active work with a leave-page warning. Replacement JSON is validated before confirmation and starts a clean session only after confirmation. Asynchronous intake and generation use session/revision guards, and pending intake disables generation.

1. Derive included requirements, sort by numeric order, and revalidate every referenced source.
2. Create a single English cover with all required tender fields and the included-document list. Measure and wrap text; no clipping or silently added core cover pages. Establish a policy for oversized unseen metadata before claiming full support.
3. Include every source page in its original sequence, preserving readable content, visible extent, and orientation for scans, landscape, rotated pages, and non-default crop boxes.
4. Proposed footer strategy: compose each output document page with a new bottom band outside the original visible content and place source content above it. Draw the footer in that reserved band. Never assume an existing margin is blank or paint over source content. Page dimensions may increase; uniform A4 is not required.
5. Validate the chosen composition technique against installed APIs and representative geometry. Embedding page visuals may lose interactive annotations; establish preservation behavior if such inputs are encountered.
6. Add a bonus index only after baseline assembly passes; calculate starts from its actual page count.
7. After every page exists, add `<tender_id> | Page X of Y` using final Y to cover, documents, and any index.
8. Save and download <tender_id>_Package.pdf; release obsolete object URLs and byte references.

Creation date is the user's local calendar date at generation time. It does not affect expiry validation. UI locale does not change mandatory English cover information or footer wording.

## Access and Network Model

- No authentication, ownership database, production server, or API routes. Each tab processes files selected by its user.
- Baseline tender processing sends no document bytes or extracted content to remote services.
- Bundle core dependencies/assets so operations do not depend on an external API. Full offline reload is not mandatory.
- Optional APIs must use HTTPS, support browser CORS, and fail without disabling main features. AI keys must be entered by the user and excluded from source, builds, logs, and Git history.
- No telemetry containing tender data, secrets, or PDF contents.

## Invariants

1. No participant-controlled backend/serverless function, remote database, or online document storage.
2. Loaded JSON determines requirements, tender data, titles, and ordering; sample values never drive production logic.
3. At most one file per requirement and one requirement per file/exact-content group.
4. Matched optional expiry failures block generation; expiry equal to deadline is valid.
5. Each requirement has exactly one official status; duplicates remain file markers.
6. Generation cannot bypass blockers, pending intake, bad references, or unreadable matched PDFs.
7. Cover/order/footer rules apply to every package; source page sequence and visible content are preserved.
8. Original source bytes remain unchanged; footers never obscure content.
9. Language changes affect presentation, not assignments, dates, ordering, or readiness.
10. No secrets or real/private test data enter submitted source/artifacts.

## Documentation Verification

Capability references reviewed on 6 October 2026; no installed app versions have been verified:

- [Vite static deployment](https://vite.dev/guide/static-deploy.html): static build output and preview/deployment guidance.
- [React reducers](https://react.dev/learn/extracting-state-logic-into-a-reducer): centralized state transitions.
- [pdf-lib](https://pdf-lib.js.org/) and [PDFDocument API](https://pdf-lib.js.org/docs/api/classes/pdfdocument): browser parsing, page counting, creation, and composition.
- [PDFPage API](https://pdf-lib.js.org/docs/api/classes/pdfpage): page geometry and drawing.
- [Web Crypto digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest): hashing in secure browser contexts.

Consult version-matched official documentation, installed type definitions, or CLI help before specific implementation calls. Record versions and material limitations in the tracker.
