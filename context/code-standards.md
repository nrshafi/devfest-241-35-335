# Code Standards

## General

- Implement [overview](project-overview.md) and [architecture](architecture.md) contracts in small focused modules.
- Validate loaded JSON/files at boundaries before trusting them.
- Keep domain rules independent of UI rendering and PDF drawing.
- Never hardcode sample tender IDs, filenames, counts, page totals, titles, or requirement order in production logic.
- Use readable names; explain non-obvious date, duplicate, and page geometry choices.
- Avoid speculative dependencies and abstractions. Do not claim unverified features are complete.

## Language and React

- Baseline: JavaScript ES modules with JSDoc data contracts. TypeScript is not mandatory; update architecture before changing that choice.
- The imported application currently uses JSX modules with TypeScript entry/configuration files. Preserve existing named/default export contracts and update consumers when changing them; there is no blanket requirement to convert components to default exports.
- Keep JSX tags and braces balanced. Use double quotes or escape apostrophes when a string contains an apostrophe.
- Use session-generated file IDs; filenames are neither unique nor stable identifiers.
- Use a reducer for transitions affecting assignment integrity and pure selectors for statuses, order, duplicate usage, and readiness.
- Do not mutate state in place or put file/PDF side effects in status calculations.
- Guard asynchronous results against stale sessions/removed files; prevent pending intake from exposing false readiness.
- Verify installed package/runtime versions and official documentation before using external APIs/configuration.

## Input Validation

- Safely parse JSON; require expected fields/types and actual calendar dates. Do not silently coerce strings to booleans.
- Validate unique requirement IDs and positive integer order values. Follow the provisional duplicate-order policy in architecture.
- Validate YYYY-MM-DD calendar dates and compare expiry against submission_deadline, never today's date.
- Reject invalid expiry input inline; it cannot produce OK and remains Expiry date needed until accepted valid input exists.
- Enforce 30 retained PDFs and the configured combined byte limit. Duplicate copies count; rejected PNGs do not.
- Extension/MIME are hints; confirm readable PDF content and page count. Scanned PDFs need no text layer/OCR.
- Hash original bytes and confirm exact equality. Filenames, page counts, or similar extracted text are not duplicate evidence.

## Matching and Statuses

- Enforce one file per requirement and one requirement per file or exact-content group in domain/reducer logic, not just disabled selectors.
- Permit change/undo; clear expiry when a matched file changes, is removed, or is unmatched.
- Derive exactly Missing, Expiry date needed, Expired, Not provided, or OK with documented precedence.
- Matched optional expiry failures block; expiry equal to deadline is OK.
- Mark duplicates separately; exclude unused uploads and unmatched optional requirements.
- Revalidate when generating; a disabled button alone is insufficient protection.

## PDF and Browser Resources

- Preserve original file bytes; generate a new artifact.
- Preserve page sequence, orientation, crop geometry, and visible content. Footers never assume existing margins are empty.
- Measure/wrap English cover text and include all required fields and only included documents in order.
- Compute final Y before writing every page footer; include cover and any index.
- Catch parse/save errors, identify the affected file in translated messages, preserve valid work, and restore usable controls. Never silently skip matched pages.
- Revoke replaced object URLs and release obsolete buffers. Use bounded processing rather than parsing 30 large files concurrently.
- Invalidate downloads after package-input changes; avoid artifacts from stale state.
- Verify chosen PDF composition against installed APIs; resolve annotation-preservation behavior when relevant.

## Styling and Localization

- Follow [UI tokens and spacing](ui-context.md).
- Keep English/Bangla keys aligned, including errors/progress/empty/success states.
- Use titles from JSON; preserve supplied tender metadata and filenames.
- Avoid clipped Bengali text and inaccessible custom controls. Verify keyboard operation.
- Keep technical diagnostics out of product messages and never log document contents or secrets.

## Network, Storage, and Licensing

- No production server routes, serverless functions, cloud databases, or remote document storage.
- Memory stores baseline documents; optional language preference can use localStorage. Save/reopen is a separately specified bonus.
- Main tasks have no external API/AI dependency. Optional APIs must use HTTPS/CORS and preserve core functionality on failure.
- No credentials/API keys in source, public assets, bundled environment values, logs, or Git history.
- Use only organizer-provided fictional test data. Respect dependency/font/image licenses and retain attribution.

## Verification and Repository Hygiene

- Focused domain, intake, and generated-PDF regression checks use Bun's built-in test runner (`bun run test` / `bun test`). They exercise requirement normalization, assignment integrity, expiry boundaries, byte equality, and output geometry rather than mirroring UI markup.

- The imported application at the repository root uses Bun per the user's instruction: `bun install`, `bun run dev`, and `bun run build`. Retain `bun.lock`; do not introduce competing package-manager lockfiles.

- Verify relevant behavior before marking a unit complete; update the tracker with Asia/Dhaka date/time and evidence.
- Meaningful checks cover status precedence, deadline equality, optional expiry failures, duplicate conflicts, removal/replacement, invalid inputs, limits, and package order/footers.
- Visually inspect generated PDFs; correct page totals alone do not prove readable non-overlapping footers or preserved scans.
- Run configured build/lint/test commands as applicable. No build can be claimed before a manifest exists and the command succeeds.
- Commit the lockfile after installation; never hand-edit third-party internals or generated build output.
- Preserve source documents and supplied samples unless explicitly authorized to correct them.
- Submission evidence belongs in output/ and screenshots/. Temporary inspection renders/caches/dependency directories are not deliverables.
- Follow contest commit frequency, actual-prompt messages, history, deadlines, and submission rules in [workflow](ai-workflow-rules.md).
