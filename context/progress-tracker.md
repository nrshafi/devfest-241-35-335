# Progress Tracker

Last updated: **6 October 2026, 6:05 PM (Asia/Dhaka, UTC+06:00)**.

Update after every meaningful implementation change with current local date/time, completed work, verification evidence, remaining tasks, and limitations.

## Current Phase and Goal

Context specification complete. Application implementation has not started. The requested documentation task is complete; initialization, implementation, deployment, and submission remain future work.

## Completed

### Earlier Recorded Work

- Previous tracker recorded rulebook Markdown creation at 5:39 PM and problem-statement Markdown creation at 5:44 PM on 6 October 2026. These are historical notes, not independently verified extraction times or eligible contest timestamps.
- An additional tracker entry recorded prompt-log initialization at 6:00 PM. This history is retained; prompts.md now separates the actual context-writing prompt from suggested future implementation prompts.
- Existing sources are [rulebook.md](../rulebook.md) and [problem_statement.md](../problem_statement.md). Stale links to another workspace and the misspelled problem-statement filename were removed from this tracker.

### 6 October 2026, 6:04 PM — Context Documentation

- Read required context files in order and reviewed AGENTS.md, rulebook, problem statement, original problem PDF, sample requirements JSON, and sample README.
- Replaced placeholders in all seven context files with main tasks, status/PDF contracts, limits, bonuses, submission requirements, and development workflow.
- Documented proposed frontend architecture, data model, assignment/duplicate invariants, local storage model, reserved footer-space strategy, bilingual UI, and code standards.
- Added the actual user prompt and explicitly unexecuted future prompts in prompts.md.
- Inspected ten PDFs for page counts and text, compared original hashes/content, and visually reviewed the image-only signed declaration.
- Preserved source documents, samples, README/LICENSE, and unrelated files. This task performed no app initialization, package installation, commit, push, deployment, or submission.

### 6 October 2026, 6:05 PM — Previous Prompt Log Update

- Updated the existing context-documentation entry in prompts.md to preserve the previous user prompt verbatim and identify its source and verification time, without adding a duplicate entry.

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
| Documentation checks | All seven files non-empty; UTF-8, internal links, and stale-template checks passed; sample JSON, exact duplicates, and 16-page reference independently rechecked |
| App build/tests | Not run: no application source or package.json exists |
| Output/live site | No generated submission package, status screenshot, or verified deployment |

Expected page count is a fixture reference, not a claim that an app generated a PDF.

## In Progress

No application implementation is in progress. Architecture folders and dependency selections remain proposed until initialized.

## Next Up

1. Establish whether further work is contest submission work or practice; verify actual announced T+0 and submission state before contest code/Git/deployment changes.
2. Initialize official React/Vite JavaScript frontend; verify runtime/package versions, lock dependencies, configure actual commands, add tokens/bilingual shell.
3. Implement JSON validation/loading, PDF intake/page counts/removal/limits, and exact-content duplicate groups.
4. Implement atomic assignments, manual expiry entry, five statuses, and all blocking reasons.
5. Implement English cover, ordered assembly, protected footer space, snapshot-safe download, and page-geometry verification.
6. Verify the entire main workflow in both languages using supplied fictional samples and boundary cases derived from them.
7. Generate output/T-2026-0417_Package.pdf, visually inspect it, and capture a real app status screenshot under screenshots/.
8. Complete README with actual identity, verified commands, implemented features, AI tools, limitations, and live URL; verify MIT license details.
9. Complete static HTTPS hosting and submission evidence within applicable authorized timing. Bonuses follow working main tasks.

## Open Questions and Provisional Policies

- **Timing/submission:** announced T+0 and submission state are unknown. Listed clock times do not establish an exact eligible deadline. Never backdate or imply post-deadline work is eligible.
- **Identity:** full name and confirmed registration are not supplied; directory name is not sufficient proof. README still has placeholders.
- **Hosting:** choose a static provider and verify final public HTTPS URL; credentials/deployment identity have not been checked.
- **Versions:** no app manifest exists; verify compatible package/runtime versions before initializing.
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

These are proposals, not implemented capabilities. Update architecture before changing them.

## Session Notes

- User requested context documentation only. Continue application work when requested, respecting applicable contest restrictions.
- All seven files now contain concrete content, including prompts.md, which was empty at initial inspection.
- Sample facts are acceptance fixtures only; unseen packs must derive behavior from loaded JSON and bytes.
- Users enter expiry dates; old/new filenames do not determine status automatically.
- Browser-local processing does not promise offline reload or automatic saved work.
- Required package path is output/<tender_id>_Package.pdf. Temporary sample inspection images are not submission screenshots.
- Git read-only inspection used a per-command safe.directory override for checkout ownership; no global Git configuration changed.
