# Tender Document Package Builder

## Purpose and Sources

Build a frontend-only web app that helps office staff turn tender requirements and PDF files into one checked, correctly ordered PDF package. Staff must be able to complete the workflow in English or Bangla without technical help.

Sources: [Official Rulebook](../rulebook.md), [Problem Statement](../problem_statement.md), [original problem PDF](../given_documents/AIDevFest-ViveCoding%20ProblemStatement.pdf), and [provided sample pack](../given_documents/sample-pack/). Mandatory requirements below come from these documents. Stack, visual design, and defensive input policies in the other context files are proposed project decisions, not organizer requirements.

## Goals

1. Complete all nine main tasks in Problem Statement Section 4 before bonuses.
2. Prevent incomplete or expired document packages and conflicting duplicate assignments.
3. Preserve all included source pages and produce the required English cover, ordering, footers, and filename.
4. Process documents entirely in the browser and support unseen packs using the supplied schema.
5. Prepare the required static live site, repository, generated sample PDF, and status screenshots.

## Core User Flow

1. Open requirements.json and inspect the tender details and requirements sorted by order.
2. Upload multiple PDFs; inspect names, page counts, and duplicate markers. Remove files when necessary.
3. Manually match files to requirements, with at most one file per requirement and one requirement per file or duplicate-content group.
4. Enter expiry dates for matched requirements with has_expiry: true.
5. Resolve blocking statuses; change or undo matches at any time.
6. Generate and download <tender_id>_Package.pdf when no blocking problems remain.
7. Switch between English and Bangla at any point without losing work. The mandatory PDF cover stays English.

## Main Features

| Task | Required behavior |
| --- | --- |
| 4.1 Load the list | Show all tender details and requirement titles, sorted numerically by order. |
| 4.2 Upload files | Multi-PDF upload, filenames, page counts, clear non-PDF rejection, and removal. |
| 4.3 Match files | One-to-one assignments with change and undo actions. |
| 4.4 Enter expiry | An expiry input for every matched requirement with has_expiry: true. |
| 4.5 Live statuses | Exactly one official status per requirement, updated after every relevant change. |
| 4.6 Duplicates | Detect exactly equal content even under different names; prohibit use across different requirements. |
| 4.7 Generate | Disable generation while blocked and show every blocking reason. |
| 4.8 Download | Download the combined PDF as <tender_id>_Package.pdf. |
| 4.9 Two languages | Translate main labels, buttons, messages, instructions, and document names. |

## Status Rules

Evaluate no-match conditions first, then expiry conditions. Optional matched documents are subject to the same expiry rules as mandatory matched documents.

| Status | Condition | Blocks generation |
| --- | --- | --- |
| Missing | Mandatory requirement with no matched file | Yes |
| Not provided | Optional requirement with no matched file | No |
| Expiry date needed | Matched, has_expiry: true, no entered expiry date | Yes |
| Expired | Matched expiry-controlled document expires before submission_deadline | Yes |
| OK | Matched and no expiry check applies, or expiry is on/after submission_deadline | No |

Compare against the tender deadline, not today's date. Expiry on the deadline is OK. Reject invalid calendar dates with an inline error; an invalid value does not count as a valid entered date. Duplicate markers appear in the uploaded-file list, not as a sixth checklist status.

## PDF Contract

- Page 1 is an English cover containing tender ID, tender title, procuring entity, bidder, submission deadline, package creation date, and the included-document list in order.
- Include all pages of matched documents, sorted by requirement order, preserving each file's original page sequence.
- Skip unmatched optional documents and all unused uploads.
- Every page, including cover, has the footer `<tender_id> | Page X of Y`, starting at 1 with the final total Y.
- Footers are readable and do not cover source content. Reserve space as described in [architecture](architecture.md).
- A bonus index, if implemented, follows the cover and participates in numbering.

## Scope and Limits

### Mandatory

- Latest Google Chrome; judges need no installation or sign-in.
- PDFs only in the document uploader, at most 30 retained uploaded files and 50 MB combined input size.
- All document processing in the browser.
- Core features work without external APIs or AI.
- Public HTTPS static deployment, public devfest-<registration-number> repository, MIT License, and required submission evidence.

### Optional Bonuses, Only After Main Tasks Work

- Index page showing each document's starting page.
- PNG seal/signature placement on chosen pages through a separate image input.
- CSV or Excel checklist export: document, filename, pages, expiry, status.
- Save/reopen using project export/import or browser storage.
- Correct Bangla PDF text on a cover/index while retaining required English cover information.
- Filename-based match suggestions requiring user review.
- Clear handling of damaged/password-protected PDFs instead of crashing.
- AI help with a key entered by the user; no embedded key or dependence by main features.

No bonus is implemented or guaranteed yet. Basic error recovery is an engineering safeguard; full damaged/password-protected file handling is an organizer-listed bonus.

### Excluded from the Baseline

- Participant-controlled servers, serverless functions, remote databases, or online document storage, including Firebase/Supabase/Appwrite used for persistence.
- Accounts, collaboration, automatic tender submission, OCR, legal authenticity checks, or automatic expiry extraction.
- Multiple files per requirement, inclusion of unmatched uploads, or user overrides of requirement order.
- ZIP import: users may select the extracted JSON and PDFs.
- Real personal/private company test data; use only supplied fictional samples.

## Verified Sample Acceptance Reference

Tender T-2026-0417: Supply of IT Equipment; Directorate of Sample Services; Meghna Tech Solutions Ltd.; deadline 2026-10-20. The supplied JSON has ten requirements, eight mandatory and two optional. The documents folder contains ten PDFs and one PNG.

| Order / ID | Requirement | Resolved sample file | Pages | Expiry / expected status |
| --- | --- | --- | --- | --- |
| 1 / R01 | Trade License | trade_license_2026.pdf | 1 | Enter 2027-06-30: OK |
| 2 / R02 | TIN Certificate | 03_tin_certificate.pdf | 1 | No expiry: OK |
| 3 / R03 | VAT Registration Certificate | 04_vat_certificate.pdf | 1 | No expiry: OK |
| 4 / R04 | Bank Solvency Certificate | bank_solvency.pdf | 1 | Enter 2026-12-31: OK |
| 5 / R05 | Experience Certificate | One of the two experience_cert PDFs | 2 | No expiry: OK |
| 6 / R06 | Audited Financial Statement | None supplied | 0 | Optional: Not provided |
| 7 / R07 | Manufacturer's Authorization | None supplied | 0 | Optional: Not provided |
| 8 / R08 | Technical Proposal | 02_technical_proposal.pdf | 6 | No expiry: OK |
| 9 / R09 | Financial Proposal | 01_financial_proposal.pdf | 2 | No expiry: OK |
| 10 / R10 | Signed Declaration | scan_0042.pdf | 1 | No expiry: OK |

Verified by PDF parsing/text, hashes, and visual review of the image-only declaration:

- trade_license_2025.pdf expires 2025-06-30: Expired if assigned with that date. The newer license is a valid replacement.
- experience_cert.pdf and experience_cert (1).pdf have identical bytes and form a duplicate group.
- company_logo.png must be rejected by the PDF uploader, even if a separate bonus PNG uploader exists.
- scan_0042.pdf is a scanned signed declaration with no extractable text. That does not make it an invalid PDF.
- Financial/technical filename prefixes are different from required package order.

The resolved baseline has 15 source pages plus one cover: **16 pages**. Included document start pages are 2, 3, 4, 5, 6, 8, 14, and 16 respectively. A one-page bonus index would increase the total to 17 and shift starts by one. These are fixture expectations, never app constants.

## Success Criteria and Deliverables

1. All main tasks work in both languages, including remove, reassignment, and undo.
2. All five statuses obey the table, including equal-deadline expiry and matched optional expiry failures.
3. Duplicate copies cannot be assigned to different requirements; unused duplicates do not block an otherwise ready package.
4. The resolved sample generates the expected 16-page baseline with correct cover, order, and non-overlapping footers; unseen packs use their own data.
5. Repository includes source, README, MIT LICENSE, output/T-2026-0417_Package.pdf, and screenshots/ with at least one real status screenshot.
6. README includes participant identity/registration, live HTTPS URL, verified run/build commands, completed main/bonus features, known problems, actual AI tools, and most useful prompt.
7. Final eligible commit and matching deployment are complete by T+90; see [workflow](ai-workflow-rules.md).
