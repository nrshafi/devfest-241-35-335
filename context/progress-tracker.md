# Progress Tracker

Last updated: **6 October 2026, 6:42 PM (Asia/Dhaka, UTC+06:00)**.

Update after every meaningful implementation change with current local date/time, completed work, verification evidence, remaining tasks, and limitations.

## Current Phase and Goal

Context specification complete. The imported React/Vite application, Bun manifest/lockfile, and standalone configuration are tracked at the repository root. `TenderPack Application Development/` no longer exists; active AGENTS.md/context guidance now matches the root layout. A GitHub Actions workflow for GitHub Pages is implemented. A root-layout Bun build with the repository base path passed and generated asset/worker paths were checked. The workflow has not run on GitHub and the live deployment remains unverified. Feature compliance remains unverified; source inspection identified gaps listed below.

## Completed

### Earlier Recorded Work

- Previous tracker recorded rulebook Markdown creation at 5:39 PM and problem-statement Markdown creation at 5:44 PM on 6 October 2026. These are historical notes, not independently verified extraction times or eligible contest timestamps.
- Existing sources are [rulebook.md](../rulebook.md) and [problem_statement.md](../problem_statement.md). Stale links to another workspace and the misspelled problem-statement filename were removed from this tracker.

### 6 October 2026, 6:04 PM — Context Documentation

- Read required context files in order and reviewed AGENTS.md, rulebook, problem statement, original problem PDF, sample requirements JSON, and sample README.
- Replaced placeholders in all six context files with main tasks, status/PDF contracts, limits, bonuses, submission requirements, and development workflow.
- Documented proposed frontend architecture, data model, assignment/duplicate invariants, local storage model, reserved footer-space strategy, bilingual UI, and code standards.
- Inspected ten PDFs for page counts and text, compared original hashes/content, and visually reviewed the image-only signed declaration.
- Preserved source documents, samples, README/LICENSE, and unrelated files. This task performed no app initialization, package installation, commit, push, deployment, or submission.

## Verification Evidence

| Check | Result |
| --- | --- |
| Sample JSON | Ten requirements: eight mandatory, two optional; deadline 2026-10-20 |
| File inventory | Ten PDFs plus company_logo.png, which must be rejected by PDF uploader |
| Old trade license | Expiry 2025-06-30: Expired when assigned with that date |
| Replacement license | Expiry 2027-06-30: valid for tender deadline |
| Bank certificate | Expiry 2026-12-31: valid for tender deadline |
| Duplicate files | Both experience_cert PDFs have identical SHA-256 hashes and bytes |
| Scanned file | scan_0042.pdf visually confirmed as signed declaration; one page with no extractable text |
| Resolved source pages | Eight included documents, 15 source pages; expected core package 16 pages including cover |
| Expected starts | 2, 3, 4, 5, 6, 8, 14, 16 in requirement order |
| Capability references | React, Vite, pdf-lib, and browser hashing documentation reviewed; links in architecture.md |
| Documentation checks | README includes Pages setup; active AGENTS.md and context guidance agree on the repository-root layout |
| App build/tests | Root-layout Bun 1.4.2 frozen offline install and production build with `/devfest-241-35-335/` passed; generated JS/CSS/PDF worker paths resolve to build files; feature/browser tests remain pending |
| Output/live site | No generated submission package, status screenshot, or verified deployment |

Expected page count is a fixture reference, not a claim that an app generated a PDF.

## In Progress

The Pages workflow and associated documentation changes await review/commit. Source modules exist for requirements loading, PDF intake/preview, matching, expiry/statuses, duplicate detection, bilingual UI, package generation, optional index, filename suggestions, and CSV export. Their presence is source evidence, not proof that acceptance criteria pass. Application source and dependency versions were unchanged during workflow setup.

## Next Up

1. Establish whether further work is contest submission work or practice; verify actual announced T+0 and submission state before contest code/Git/deployment changes.
2. Enable GitHub Actions as the Pages source, commit/push the workflow to `main`, and verify its build/deployment jobs and public URL.
3. Audit existing JSON loading, PDF intake/removal/limits, duplicate grouping, and bilingual shell against baseline contracts before marking them complete.
4. Resolve and verify status/assignment behavior, exact-byte duplicate confirmation, pending intake/generation guards, and session replacement/persistence behavior.
5. Resolve and verify English cover completeness, ordered assembly, protected footer space, snapshot-safe download, and page geometry in the existing generator.
6. Verify the entire main workflow in both languages using supplied fictional samples and boundary cases derived from them.
7. Generate output/T-2026-0417_Package.pdf, visually inspect it, and capture a real app status screenshot under screenshots/.
8. Finish README verification with current-layout execution evidence, confirmed AI tool contributions/most useful prompt, and the published live URL. Participant name and MIT license holder now match; registration is omitted at the user's request.
9. Complete static HTTPS hosting and submission evidence within applicable authorized timing. Bonuses follow working main tasks.

## Open Questions and Provisional Policies

- **Timing/submission:** announced T+0 and submission state are unknown. Listed clock times do not establish an exact eligible deadline. Never backdate or imply post-deadline work is eligible.
- **Identity:** user confirmed Nafiur Rahman Shafi. No registration number was provided; the user requested removing that field from README. Repository naming is not registration confirmation.
- **Hosting:** user selected GitHub Pages. Workflow and setup instructions are present; repository Pages settings and the public HTTPS deployment have not been checked.
- **Versions:** root package.json declares Bun 1.4.2 and React/Vite/Tailwind/PDF dependencies. Root-layout frozen installation and Pages-base production build passed; GitHub's Ubuntu build remains unverified.
- **Application location:** app files live at the repository root and the former subfolder no longer exists. Active README, AGENTS.md, and context guidance now agree; older session records retain their historical paths.
- **Input units:** provisionally 50 MB = 50,000,000 bytes; clarify decimal versus binary interpretation with organizers if possible.
- **Order ties:** provisionally reject duplicate order values with a clear error; clarify whether unseen packs allow ties. Positive integer/unique ID validation is a defensive policy.
- **Large cover text:** establish a single-page cover layout for long metadata and many requirements. No maximum JSON requirement count is stated.
- **PDF geometry/annotations:** verify extra footer band with rotation, crop boxes, mixed page sizes, and interactive annotations before promising preservation.
- **Bangla:** verify proposed translations/font fallback in actual UI. Bangla PDF shaping is optional and unverified.
- **Scoring:** Problem Statement Section 10 references Rulebook Section 11 for marks, but that section covers licensing and gives no scoring table. No weights invented.

## Proposed Architecture Decisions

| Decision | Reason |
| --- | --- |
| React/Vite JavaScript, plain token CSS | Small static frontend consistent with README draft, not an organizer mandate |
| pdf-lib baseline; pdf.js only for optional previews | Documented browser parsing/counting/composition without unnecessary duplication |
| Reducer/pure selectors | Consistent assignment integrity and live statuses |
| Memory-only PDF session | No remote persistence; save/reopen remains bonus |
| Hash and exact-byte equality | Duplicate identity must not depend on filename |
| Footer band outside source content | Avoid covering existing source text, footers, scans |
| English mandatory PDF cover | Required in either UI locale; Bangla PDF text optional |
| No core API/AI dependency | Main features work without external services |

These remain baseline proposals. The imported app differs in several places (including useState transitions, localStorage for requirements JSON, and footer overlays); do not treat the table as verified implementation. Update architecture before adopting different contracts.

## Session Notes

- Current request: write a GitHub Actions workflow for GitHub Pages. Workflow, deployment instructions, root-layout guidance, and this tracker were updated; live deployment and feature fixes remain future work.
- All six context files now contain concrete content.
- Sample facts are acceptance fixtures only; unseen packs must derive behavior from loaded JSON and bytes.
- Users enter expiry dates; old/new filenames do not determine status automatically.
- Browser-local processing does not promise offline reload or automatic saved work.
- Required package path is output/<tender_id>_Package.pdf. Temporary sample inspection images are not submission screenshots.
- Git read-only inspection used a per-command safe.directory override for checkout ownership; no global Git configuration changed.
## Standalone Configuration Cleanup — 6 October 2026, 6:22 PM (Asia/Dhaka)

- User removed Figma scaffolding, including `.figma/make/site.json`; removed the dangling import and Figma-specific Vite plugins/environment variables.
- Moved the supplied description, English page language, and noindex/nofollow metadata into `index.html`; added `public/robots.txt` with the original crawler restriction and set the title to TenderPack.
- Preserved React/Tailwind plugins, source alias, port 8443 default, and development-mode source-map behavior. Updated imported AGENTS.md to describe standalone operation.
- User requested Bun instead of pnpm. Bun 1.4.2 exists at `C:/Users/Administrator/.bun/bin/bun.exe` but is absent from this shell's PATH. Declared `packageManager`, documented Bun commands, and started migration to `bun.lock`; removed only dependency directories generated by this session's pnpm install.
- Verified configuration APIs against official Vite/Tailwind documentation and Vite 8.3.2 installed declarations, and Bun migration/options against official docs and installed CLI help. Ego-browser CLI was unavailable, so official documentation was accessed through the web tool.
- Bun installation completed: 53 packages, with React/React DOM 19.3.0, Vite 8.3.2, Tailwind 4.3.3, TypeScript 5.9.3, pdf-lib 1.17.1, and pdfjs-dist 6.4.299. Migrated resolved versions to `bun.lock` and removed the session-generated `pnpm-lock.yaml`. Production `bun run build` passed outside the sandbox after the sandbox blocked a required Windows helper process. `bun install --frozen-lockfile --offline --cache-dir .cache/bun` passed with no changes. Verified `dist/index.html` contains the title, description, English language and robots metadata, and `dist/robots.txt` matches the original crawler restriction. No stale Figma import/HTML placeholders or pnpm references remain in the active config, manifest, HTML, or imported AGENTS.md. Build warnings remain for the inherited `__dirname` alias under a future native config loader and a large PDF-containing bundle. No feature-compliance, deployment, or contest-eligibility claim is made by this cleanup.

## Agent Instructions Consolidation — 6 October 2026, 6:26 PM (Asia/Dhaka)

- Removed `TenderPack Application Development/AGENTS.md` at the user's request. Root `AGENTS.md` now explicitly covers the application and identifies the repository root as the base for context paths.
- Preserved Bun commands, lockfile/version guidance, default port 8443 and PORT override, actual application entrypoints, source layout, and Tailwind/global stylesheet conventions in root instructions and context documents.
- Corrected the former scaffold guidance: `src/App.jsx` contains the application, while `src/App.tsx` is a re-export wrapper; existing named exports remain valid. Updated the proposed tooling entry from npm to Bun and replaced the stale documentation-only authorization note.
- Updated README local setup/build/preview commands to use Bun from the application folder and the configured port. Participant identity, repository/live URL placeholders, and unverified feature claims were not filled in.
- Verified the nested file is absent, root instructions remain, documented source paths exist, and no live reference points to the deleted file. Historical tracker entries about the former file remain as an audit record.
- This is an instructions/documentation change with no application-source or dependency changes. The prior Bun build result remains the latest build verification; no new build was needed.

## Uncommitted Change Review — 6 October 2026, 6:30 PM (Asia/Dhaka)

- Reviewed `git status --short`, tracked diffs, untracked file inventory, root configuration, and representative application modules. No staged changes were present. Used a per-command Git safe.directory override; no global Git configuration changed.
- Tracked modifications cover `.gitignore`, root `AGENTS.md`, README, and five context files (workflow, architecture, code standards, UI context, and this tracker). They document Bun/standalone setup and consolidated instructions. `.gitignore` now excludes dependencies, builds, caches, environment files, logs, and temporary files; its existing `*.pdf` rule still excludes the required generated PDF unless explicitly handled later.
- Untracked application files comprise `bun.lock`, `package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `public/robots.txt`, and `src/` entrypoints, components, data, styles, and utility modules. Source/configuration is at the repository root; the prior application subfolder is empty. This review records the move without changing paths or instructions elsewhere.
- Root configuration declares Bun 1.4.2, dev/build/preview/format scripts, React/Tailwind Vite plugins, the `@` source alias, and default port 8443 with a PORT override. HTML includes TenderPack title/description, English language, and crawler restrictions. These were inspected as files; no new install, build, browser check, or formatting run was performed.
- Source inspection found baseline gaps requiring follow-up: `validation.js` exposes a sixth `invalid_date` status; `duplicateDetection.js` groups hashes without byte-equality confirmation; `pdfUtils.js` uses 50 × 1024 × 1024 bytes rather than the documented decimal limit; `App.jsx` persists requirements JSON as well as language, starts intake concurrently, and lacks explicit pending-intake/generation snapshot protection; `packageGenerator.js` draws footer backgrounds over copied source pages and can truncate long cover/index lists. These are observations from code, not a complete feature audit or runtime test.
- Optional index, CSV export, PDF preview, and filename suggestion code is present but unverified. Requirements JSON restoration does not restore uploaded PDF bytes or assignments and must not be claimed as full save/reopen support.
- Updated current phase, verification evidence, in-progress work, next steps, and open questions to remove stale claims that no manifest/source exists. Earlier build/sample evidence remains historical. No commit, push, deployment, submission artifact, or contest-eligibility verification occurred in this review.

## README Refresh — 6 October 2026, 6:35 PM (Asia/Dhaka)

- Replaced the README template with TenderPack's purpose, current repository link, root-layout Bun setup/scripts, browser workflow, feature/bonus source status, sample-pack guidance, storage/privacy behavior, resolved stack versions, known problems, and project documentation links.
- User confirmed participant name Nafiur Rahman Shafi, requested omitting the unavailable registration number, and confirmed the live site is not published. README reflects those details without a placeholder deployment URL.
- Checked commands against root package.json and vite.config.ts, versions against bun.lock, Node compatibility against installed Vite package metadata, and feature/limitation claims against source and earlier verification evidence. Preserved the historical successful build as historical; no new build or runtime acceptance claim is made.
- Linked the actual supplied development prompt in used_prompt.md and quoted its browser/PDF workflow excerpt. Codex usage is confirmed; prior README-listed ChatGPT/Gemini/Figma Make contributions and the participant's most useful prompt remain unconfirmed.
- Confirmed the former application directory is absent. Updated this tracker's current-state notes; remaining AGENTS.md/context path reconciliation is outside this README-only change.
- Documentation verification checks local link targets, manifest scripts, placeholders, whitespace, and the README/tracker diff. No application source, dependencies, Git history, deployment, or submission artifacts were changed.

## npm README Instructions — 6 October 2026, 6:38 PM (Asia/Dhaka)

- Added npm setup and equivalent dev/build/preview/format commands at the user's request. Bun 1.4.2 remains the declared primary package manager; manifest and lockfile are unchanged.
- Documented `npm install --package-lock=false` using the official npm install documentation to avoid adding a competing root lockfile, and explained that npm resolves manifest ranges rather than the Bun lockfile's versions.
- Updated prerequisites and the recorded-prompt note to describe both setup options. Checked script names against package.json and Markdown whitespace. npm is unavailable on this shell's PATH, so no npm installation/build result is claimed. This is documentation-only work with no application build.

## GitHub Pages Workflow — 6 October 2026, 6:42 PM (Asia/Dhaka)

- Added `.github/workflows/deploy-pages.yml`: push/manual triggers on `main`, separate build/deploy jobs, serialized deployments, GitHub Pages environment URL, and job-specific Pages/OIDC permissions. Only `dist/` is uploaded. Uses official Pages actions, Node.js 24, and setup-bun's `packageManager` detection for Bun 1.4.2.
- Installation uses `bun install --frozen-lockfile`; build overrides Vite's base through `configure-pages` metadata for repository, root, or custom-domain sites. No Vite source configuration or dependency changes were necessary.
- Updated architecture before workflow implementation and reconciled active root instructions/context paths with the actual root application. Added README Pages setup, expected (unverified) project URL, and local Pages-base build/preview commands.
- Verified action versions/inputs, Pages permissions/environment requirements, base-path metadata, Bun version detection, and Vite's CLI base option against official [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages), [configure-pages metadata](https://github.com/actions/configure-pages/blob/main/action.yml), [setup-bun](https://github.com/oven-sh/setup-bun), installed Vite 8.3.2 declarations/CLI source, and Bun 1.4.2 CLI help. Ego-browser was unavailable; web access supplied official references.
- `bun install --frozen-lockfile --offline --cache-dir .cache/bun` passed with no dependency changes. `bun run build --base /devfest-241-35-335/` passed after running outside the sandbox because the sandbox blocked Vite's required Windows helper (`spawn EPERM`). Existing `__dirname` future-loader and large-bundle warnings remain.
- Checked generated JS/CSS URLs and PDF.js worker URL for the repository prefix and corresponding existing files; `dist/robots.txt` exists. Git whitespace validation passed. No commit, push, workflow dispatch, repository settings change, public deployment, browser acceptance check, or contest-eligibility claim was made.
