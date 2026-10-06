# Commit at 6:31 PM

Build a complete, functional frontend web application called:

TenderPack
Tender Document Package Builder

This application is being built for the DevFest 2026 AI Vibe-Coding Contest.

IMPORTANT:
This must be a WORKING WEB APPLICATION, not just a Figma-style visual mockup.

The app must load a tender requirements JSON file, allow the user to upload multiple PDFs, match those PDFs to tender requirements, validate missing documents and expiry dates, detect exact duplicate PDFs, and generate one final combined submission-ready PDF.

The application must work entirely inside the browser.

==================================================
1. TECHNOLOGY
==================================================

Build with:

- Vite
- React
- JavaScript
- CSS
- React hooks
- pdf-lib
- pdfjs-dist / PDF.js where useful
- Browser Web Crypto API

Do NOT use:

- backend
- Node server
- database
- Firebase
- Supabase
- Appwrite
- serverless functions
- authentication
- cloud file storage
- unnecessary routing
- Redux
- heavy frameworks

Everything must work in the latest Google Chrome.

The finished project must work with:

npm install
npm run dev

It must also be deployable as a static frontend.

Suggested hosting:

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

Tender files must NEVER leave the browser.

==================================================
2. APPLICATION PURPOSE
==================================================

The workflow is:

1. Load requirements.json
2. Display tender details
3. Upload multiple PDFs
4. Read PDF page counts
5. Calculate file hashes
6. Detect exact duplicates
7. Match PDFs with tender requirements
8. Enter expiry dates when required
9. Validate every requirement
10. Show blocking issues
11. Enable package generation only when valid
12. Generate the actual combined PDF
13. Download the final package

Use this flow prominently in the interface:

Requirements
→
Documents
→
Matching
→
Validation
→
Package

Keep this primarily as ONE dashboard.

Do not create a complicated multi-page wizard.

==================================================
3. REQUIREMENTS.JSON
==================================================

The application must dynamically load files following this structure:

{
  "tender": {
    "tender_id": "T-2026-0417",
    "title": "Supply of IT Equipment",
    "procuring_entity": "Directorate of Sample Services",
    "bidder": "Meghna Tech Solutions Ltd.",
    "submission_deadline": "2026-10-20"
  },
  "requirements": [
    {
      "id": "R01",
      "order": 1,
      "title_en": "Trade License",
      "title_bn": "ট্রেড লাইসেন্স",
      "mandatory": true,
      "has_expiry": true
    }
  ]
}

Do NOT hard-code the application for this one tender.

The judges may provide another requirements.json using the same schema.

The application must work dynamically with unseen data.

Always sort requirements according to:

requirement.order

Never sort by:

- filename
- upload order
- requirement ID unless order is unavailable

==================================================
4. ACTUAL SAMPLE TENDER
==================================================

Use this exact sample pack for development and testing.

Tender:

Tender ID:
T-2026-0417

Tender title:
Supply of IT Equipment

Procuring entity:
Directorate of Sample Services

Bidder:
Meghna Tech Solutions Ltd.

Submission deadline:
2026-10-20

There are 10 requirements.

8 mandatory.
2 optional.

Requirements:

R01
Order: 1
English: Trade License
Bangla: ট্রেড লাইসেন্স
Mandatory: Yes
Expiry required: Yes

R02
Order: 2
English: TIN Certificate
Bangla: টিআইএন সনদ
Mandatory: Yes
Expiry required: No

R03
Order: 3
English: VAT Registration Certificate
Bangla: ভ্যাট নিবন্ধন সনদ
Mandatory: Yes
Expiry required: No

R04
Order: 4
English: Bank Solvency Certificate
Bangla: ব্যাংক সচ্ছলতা সনদ
Mandatory: Yes
Expiry required: Yes

R05
Order: 5
English: Experience Certificate
Bangla: অভিজ্ঞতার সনদ
Mandatory: Yes
Expiry required: No

R06
Order: 6
English: Audited Financial Statement
Bangla: নিরীক্ষিত আর্থিক বিবরণী
Mandatory: No
Expiry required: No

R07
Order: 7
English: Manufacturer's Authorization
Bangla: প্রস্তুতকারকের অনুমোদনপত্র
Mandatory: No
Expiry required: Yes

R08
Order: 8
English: Technical Proposal
Bangla: কারিগরি প্রস্তাব
Mandatory: Yes
Expiry required: No

R09
Order: 9
English: Financial Proposal
Bangla: আর্থিক প্রস্তাব
Mandatory: Yes
Expiry required: No

R10
Order: 10
English: Signed Declaration
Bangla: স্বাক্ষরিত ঘোষণাপত্র
Mandatory: Yes
Expiry required: No

==================================================
5. ACTUAL 10 TEST PDF FILES
==================================================

The real sample pack contains exactly these 10 uploaded PDFs.

Use them as development test cases.

1.
01_financial_proposal.pdf

Expected pages:
2

Expected match:
R09 Financial Proposal

2.
02_technical_proposal.pdf

Expected pages:
6

Expected match:
R08 Technical Proposal

3.
03_tin_certificate.pdf

Expected pages:
1

Expected match:
R02 TIN Certificate

4.
04_vat_certificate.pdf

Expected pages:
1

Expected match:
R03 VAT Registration Certificate

5.
bank_solvency.pdf

Expected pages:
1

Expected match:
R04 Bank Solvency Certificate

Actual expiry contained in the sample:
2026-12-31

The core application does NOT need to extract this automatically.

The user should manually enter:

2026-12-31

Because:

2026-12-31 >= 2026-10-20

status must become:

OK

6.
experience_cert.pdf

Expected pages:
2

Expected match:
R05 Experience Certificate

7.
experience_cert (1).pdf

Expected pages:
2

IMPORTANT:

This PDF is byte-for-byte identical to:

experience_cert.pdf

These two files MUST be detected as exact duplicates.

Their SHA-256 hashes are identical.

The application must show a Duplicate warning.

Only ONE of them may be used as the Experience Certificate.

The second identical PDF must NOT be allowed to represent another tender requirement.

8.
scan_0042.pdf

Expected pages:
1

Expected match:
R10 Signed Declaration

IMPORTANT EDGE CASE:

This is a scanned/image-based PDF.

Normal text extraction may return no text.

The application must STILL:

- accept it
- count its pages
- hash it
- preview it if possible
- allow it to be matched
- preserve it in the generated package

DO NOT require extractable PDF text for a PDF to be valid.

9.
trade_license_2025.pdf

Expected pages:
1

Possible match:
R01 Trade License

Expiry:
2025-06-30

This is intentionally EXPIRED relative to the submission deadline:

2026-10-20

If the user matches this PDF to Trade License and enters:

2025-06-30

the requirement status MUST become:

Expired

The package MUST remain blocked.

10.
trade_license_2026.pdf

Expected pages:
1

Correct match:
R01 Trade License

Expiry:
2027-06-30

If the user matches this file and enters:

2027-06-30

the requirement status must become:

OK

because:

2027-06-30 >= 2026-10-20

==================================================
6. IMPORTANT NON-PDF TEST FILE
==================================================

There is also a company image:

company_logo.png

This is NOT one of the 10 tender PDFs.

Do not count it as an uploaded tender document.

If the user drops this PNG into the normal document uploader, reject it with:

"Only PDF files are supported."

Bangla:

"শুধুমাত্র PDF ফাইল সমর্থিত।"

Do not crash.

Do not count the logo as a tender document.

Do NOT make logo upload a required feature.

==================================================
7. EXPECTED STATE IMMEDIATELY AFTER ALL 10 PDFs ARE UPLOADED
==================================================

This section is extremely important.

Use it as a development acceptance test.

Assume:

- requirements.json has already been loaded
- all 10 PDFs have been uploaded
- the user has NOT manually matched anything yet
- no expiry dates have been entered yet

The upload summary should show approximately:

10 PDFs uploaded
18 total source pages
1 duplicate group
2 duplicate files in that group

All files should remain visible.

Uploaded Files panel:

01_financial_proposal.pdf
2 pages
Not matched
Suggested: Financial Proposal

02_technical_proposal.pdf
6 pages
Not matched
Suggested: Technical Proposal

03_tin_certificate.pdf
1 page
Not matched
Suggested: TIN Certificate

04_vat_certificate.pdf
1 page
Not matched
Suggested: VAT Registration Certificate

bank_solvency.pdf
1 page
Not matched
Suggested: Bank Solvency Certificate

experience_cert.pdf
2 pages
Not matched
Duplicate

experience_cert (1).pdf
2 pages
Not matched
Duplicate

Show something like:

"Duplicate content detected"

and:

"Same content as experience_cert.pdf"

The UI may choose one file as the original and mark the other as the duplicate copy.

scan_0042.pdf
1 page
Not matched
Suggested: Signed Declaration

Do not display an error simply because no text could be extracted.

trade_license_2025.pdf
1 page
Not matched
Suggested: Trade License

trade_license_2026.pdf
1 page
Not matched
Suggested: Trade License

Because matching has not occurred yet, requirement statuses should be:

R01 Trade License
Missing

R02 TIN Certificate
Missing

R03 VAT Registration Certificate
Missing

R04 Bank Solvency Certificate
Missing

R05 Experience Certificate
Missing

R06 Audited Financial Statement
Not provided

R07 Manufacturer's Authorization
Not provided

R08 Technical Proposal
Missing

R09 Financial Proposal
Missing

R10 Signed Declaration
Missing

Therefore the readiness summary should show:

10 Requirements
0 Ready
8 Blocking
2 Optional Not Provided

Package status:

Package not ready

Message:

8 blocking issues must be resolved.

Generate Package button:

DISABLED

The two optional missing documents must NOT block generation.

==================================================
8. AUTO-MATCH SUGGESTIONS
==================================================

Implement filename-based match suggestions as a useful enhancement.

Do NOT automatically finalize matches.

The user must confirm.

Suggested mappings for the sample:

01_financial_proposal.pdf
→ Financial Proposal

02_technical_proposal.pdf
→ Technical Proposal

03_tin_certificate.pdf
→ TIN Certificate

04_vat_certificate.pdf
→ VAT Registration Certificate

bank_solvency.pdf
→ Bank Solvency Certificate

experience_cert.pdf
→ Experience Certificate

experience_cert (1).pdf
→ Experience Certificate

scan_0042.pdf
→ Signed Declaration

trade_license_2025.pdf
→ Trade License

trade_license_2026.pdf
→ Trade License

For suggestions show:

Suggested match:
Financial Proposal

[Accept]

Do NOT use external AI for this.

Simple normalized filename matching is enough.

Examples of normalization:

- lowercase
- remove extension
- replace underscores with spaces
- replace hyphens with spaces
- remove extra spaces

The system should NEVER automatically choose between:

trade_license_2025.pdf

and

trade_license_2026.pdf

because both legitimately resemble:

Trade License

The user must choose.

==================================================
9. MATCHING RULES
==================================================

One requirement may have:

at most ONE PDF.

One uploaded PDF may belong to:

at most ONE requirement.

Matches must be reversible.

Controls:

Select File
Change
Remove Match

Do not remove the original upload when a match is removed.

Already matched PDFs should not be selectable elsewhere.

Exact duplicates must not be allowed to represent different requirements.

For example:

experience_cert.pdf
→ Experience Certificate

Then:

experience_cert (1).pdf

must NOT be allowed to represent another requirement.

==================================================
10. DUPLICATE DETECTION
==================================================

Do REAL binary duplicate detection.

Do not compare only:

- filenames
- page count
- file size
- text

Read each file with:

file.arrayBuffer()

Hash it using browser Web Crypto:

crypto.subtle.digest("SHA-256", arrayBuffer)

Convert the digest to a hexadecimal hash.

Files with the same SHA-256 hash are exact duplicates.

Create a helper such as:

async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

For this sample:

experience_cert.pdf

and

experience_cert (1).pdf

must produce identical hashes.

Show:

Duplicate

and:

"Identical content detected."

Do not hide duplicate files.

The user needs to see what happened.

==================================================
11. PDF PAGE COUNTS
==================================================

The exact expected page counts for testing are:

01_financial_proposal.pdf
2

02_technical_proposal.pdf
6

03_tin_certificate.pdf
1

04_vat_certificate.pdf
1

bank_solvency.pdf
1

experience_cert.pdf
2

experience_cert (1).pdf
2

scan_0042.pdf
1

trade_license_2025.pdf
1

trade_license_2026.pdf
1

Total uploaded pages:

18

Use PDF.js or another reliable browser-compatible approach to calculate these dynamically.

Do NOT hard-code these numbers.

These numbers are only acceptance-test values.

==================================================
12. STATUS LOGIC
==================================================

Every tender requirement must have exactly ONE status.

Possible statuses:

Missing
Expiry date needed
Expired
Not provided
OK

-----------------------
MISSING
-----------------------

Condition:

mandatory === true
AND
no matched file

Blocking:
YES

Visual:
red

-----------------------
EXPIRY DATE NEEDED
-----------------------

Condition:

matched file exists
AND
has_expiry === true
AND
expiry date is empty

Blocking:
YES

Visual:
amber or red

-----------------------
EXPIRED
-----------------------

Condition:

matched file exists
AND
has_expiry === true
AND
expiryDate < submissionDeadline

Blocking:
YES

Visual:
red

-----------------------
NOT PROVIDED
-----------------------

Condition:

mandatory === false
AND
no matched file

Blocking:
NO

Visual:
gray

-----------------------
OK
-----------------------

Condition:

matched file exists

AND either:

has_expiry === false

OR

expiryDate >= submissionDeadline

Blocking:
NO

Visual:
green

IMPORTANT:

An expiry date exactly equal to the submission deadline is VALID.

Example:

Submission:
2026-10-20

Expiry:
2026-10-20

Result:
OK

==================================================
13. SAMPLE EXPIRY TEST
==================================================

Tender submission deadline:

2026-10-20

Test Case A:

Match:

trade_license_2025.pdf

Enter:

2025-06-30

Expected:

Trade License
Expired

Show:

"Expired before the tender submission deadline."

Package remains blocked.

Test Case B:

Replace that match with:

trade_license_2026.pdf

Enter:

2027-06-30

Expected:

Trade License
OK

Test Case C:

Match:

bank_solvency.pdf

Before entering expiry:

Expiry date needed

After entering:

2026-12-31

Expected:

OK

==================================================
14. EXPECTED CORRECT FINAL MATCHING
==================================================

The fully resolved sample should contain these matches:

R01 Trade License
→ trade_license_2026.pdf
Expiry: 2027-06-30
Status: OK

R02 TIN Certificate
→ 03_tin_certificate.pdf
Status: OK

R03 VAT Registration Certificate
→ 04_vat_certificate.pdf
Status: OK

R04 Bank Solvency Certificate
→ bank_solvency.pdf
Expiry: 2026-12-31
Status: OK

R05 Experience Certificate
→ experience_cert.pdf
OR
experience_cert (1).pdf
Status: OK

Only ONE duplicate copy should be used.

R06 Audited Financial Statement
→ No file
Status: Not provided

R07 Manufacturer's Authorization
→ No file
Status: Not provided

R08 Technical Proposal
→ 02_technical_proposal.pdf
Status: OK

R09 Financial Proposal
→ 01_financial_proposal.pdf
Status: OK

R10 Signed Declaration
→ scan_0042.pdf
Status: OK

==================================================
15. EXPECTED FULLY RESOLVED DASHBOARD
==================================================

After all correct matches and expiry dates are entered, show:

Requirements:
10

Ready:
8

Blocking:
0

Optional Not Provided:
2

Package status:

Ready to generate

Supporting text:

"All mandatory requirements are satisfied."

The two optional requirements remain:

Audited Financial Statement
Not provided

Manufacturer's Authorization
Not provided

These must NOT stop package generation.

Generate Package button:

ENABLED

==================================================
16. MAIN UI
==================================================

Create a professional procurement/document-management dashboard.

The intended user is:

an office worker with no technical knowledge.

The app should feel:

- trustworthy
- clean
- professional
- calm
- simple
- efficient

Avoid:

- flashy startup visuals
- giant gradients
- excessive animation
- glassmorphism everywhere
- oversized headings
- excessive empty space

Prioritize readability and workflow clarity.

==================================================
17. HEADER
==================================================

Top-left:

Simple document/package icon

TenderPack

Subtitle:

Tender Document Package Builder

Top-right:

EN | বাংলা

Reset Project

Language switching must change the important application UI.

==================================================
18. EMPTY STATE
==================================================

Before requirements.json is loaded show:

Prepare a tender package without missing a document.

Supporting description:

Load the tender requirements, match your PDFs, fix validation issues, and generate one submission-ready package.

Primary CTA:

Load requirements.json

Secondary privacy text:

Your tender documents stay in your browser.

Also support drag-and-drop for requirements.json.

==================================================
19. TENDER SUMMARY
==================================================

After JSON loading, display:

Tender ID
T-2026-0417

Tender
Supply of IT Equipment

Procuring Entity
Directorate of Sample Services

Bidder
Meghna Tech Solutions Ltd.

Submission Deadline
20 Oct 2026

Also calculate dynamically:

10 requirements
8 required
2 optional

Do NOT hard-code these display values into the business logic.

==================================================
20. SUMMARY CARDS
==================================================

Show compact summary cards:

Requirements
Ready
Blocking Issues
Optional Missing

Example after initial requirements load:

Requirements
10

Ready
0

Blocking Issues
8

Optional Missing
2

After full resolution:

Requirements
10

Ready
8

Blocking Issues
0

Optional Missing
2

==================================================
21. MAIN LAYOUT
==================================================

Desktop:

Two-column layout.

Left:
approximately 65%

Right:
approximately 35%

LEFT:

Document Checklist

RIGHT:

Uploaded PDFs
Package Readiness

On narrow screens:

stack vertically.

==================================================
22. DOCUMENT CHECKLIST
==================================================

Desktop table columns:

Order
Requirement
Type
Matched File
Pages
Expiry
Status
Action

Example:

01
Trade License
Required · Expiry required
trade_license_2026.pdf
1 page
2027-06-30
OK
Change

Use clear status pills.

Recommended colors:

OK:
green

Missing:
red

Expired:
red

Expiry date needed:
amber

Not provided:
gray

Always show status TEXT.

Never use color alone.

==================================================
23. PDF UPLOAD AREA
==================================================

Right sidebar:

Upload PDF Documents

Text:

Drop PDF files here or browse your computer.

Button:

Browse PDFs

Allow:

multiple PDF selection.

Maximum:

30 PDFs

Maximum combined size:

50 MB

Reject non-PDF files.

Example error:

Only PDF files are supported.

For Bangla:

শুধুমাত্র PDF ফাইল সমর্থিত।

==================================================
24. UPLOADED FILE CARDS
==================================================

Each file card should show:

PDF icon
filename
page count
file size
match status
duplicate state
preview button
remove button

Examples:

02_technical_proposal.pdf
6 pages · 9 KB
Suggested: Technical Proposal
Not matched

[Preview]
[Remove]

For duplicate:

experience_cert (1).pdf
2 pages
Duplicate

Identical to:
experience_cert.pdf

==================================================
25. FILE REMOVAL
==================================================

If an unmatched PDF is removed:

remove immediately or with a light confirmation.

If a MATCHED PDF is removed:

warn:

"This file is currently matched to Experience Certificate. Removing it will make that requirement incomplete."

Buttons:

Cancel
Remove File

If removed:

automatically remove the match.

Recalculate statuses instantly.

==================================================
26. PDF PREVIEW
==================================================

Clicking Preview opens a modal or side drawer.

Show:

filename
page count
first-page preview if possible

Controls:

Close

Optional:
Previous / Next for small documents

But do NOT build a complex PDF viewer at the expense of core functionality.

For scan_0042.pdf:

the scanned page should display normally.

==================================================
27. EXPIRY DATE INPUT
==================================================

Only show an expiry date field when:

has_expiry === true

AND

a file is matched.

Use:

<input type="date">

Do not show expiry inputs for:

TIN Certificate
VAT Registration Certificate
Experience Certificate
Technical Proposal
Financial Proposal
Signed Declaration

For:

Trade License

show expiry after file matching.

For:

Bank Solvency Certificate

show expiry after matching.

==================================================
28. PACKAGE READINESS PANEL
==================================================

Right sidebar section:

Package Readiness

When blocked:

Package not ready

Example:

3 blocking issues must be fixed.

Then list each issue.

Example:

Trade License
Expired

Bank Solvency Certificate
Expiry date needed

Signed Declaration
Missing

Do not include optional "Not provided" documents in blocking issues.

==================================================
29. GENERATE BUTTON
==================================================

Large primary button:

Generate Package

Disabled whenever any blocking requirement exists.

Example disabled message:

Resolve 3 blocking issues before generating the package.

When ready:

Ready to generate

All mandatory requirements are satisfied.

[Generate Package]

==================================================
30. REAL PDF GENERATION
==================================================

This must generate a REAL PDF.

Do not fake package generation.

Use pdf-lib.

All processing happens in-browser.

The generated package consists of:

1. Generated English cover page
2. Included PDFs in requirement order

Optional documents without files are skipped.

==================================================
31. COVER PAGE
==================================================

Page 1 must be a generated ENGLISH cover page.

Title:

TENDER DOCUMENT PACKAGE

Include:

Tender ID:
T-2026-0417

Tender Title:
Supply of IT Equipment

Procuring Entity:
Directorate of Sample Services

Bidder:
Meghna Tech Solutions Ltd.

Submission Deadline:
20 October 2026

Package Created:
current local date

Then:

Included Documents

List:

1. Trade License
2. TIN Certificate
3. VAT Registration Certificate
4. Bank Solvency Certificate
5. Experience Certificate
8. Technical Proposal
9. Financial Proposal
10. Signed Declaration

A cleaner display may renumber them sequentially:

1. Trade License
2. TIN Certificate
3. VAT Registration Certificate
4. Bank Solvency Certificate
5. Experience Certificate
6. Technical Proposal
7. Financial Proposal
8. Signed Declaration

Either way, document ordering MUST reflect requirement.order.

Do not include:

Audited Financial Statement

because no optional file exists.

Do not include:

Manufacturer's Authorization

because no optional file exists.

==================================================
32. CORRECT FINAL PDF ORDER
==================================================

For the resolved sample, the package MUST use:

Cover Page

then:

trade_license_2026.pdf

then:

03_tin_certificate.pdf

then:

04_vat_certificate.pdf

then:

bank_solvency.pdf

then:

ONE of:
experience_cert.pdf
OR
experience_cert (1).pdf

then:

02_technical_proposal.pdf

then:

01_financial_proposal.pdf

then:

scan_0042.pdf

IMPORTANT:

Even though the Financial Proposal filename begins with:

01_

it belongs AFTER the Technical Proposal.

Do NOT sort using filenames.

Tender order wins.

==================================================
33. EXACT EXPECTED FINAL PAGE COUNT
==================================================

Correct selected source pages:

Trade License:
1

TIN:
1

VAT:
1

Bank Solvency:
1

Experience:
2

Technical Proposal:
6

Financial Proposal:
2

Signed Declaration:
1

Total document pages:

15

Add cover:

1

FINAL EXPECTED PACKAGE:

16 pages

This assumes the optional bonus Index Page is disabled.

The generated success screen should therefore show:

Package generated successfully

16 pages
8 included documents
0 blocking issues

==================================================
34. PAGE NUMBER FOOTERS
==================================================

Every generated page must have:

<tender_id> | Page X of Y

For this sample final package:

T-2026-0417 | Page 1 of 16

through:

T-2026-0417 | Page 16 of 16

Footer applies to:

- cover
- imported PDF pages
- scanned declaration page

Do NOT merely preserve existing source-page numbering.

The final combined PDF must receive its own package page numbering.

The footer must:

- be readable
- stay near the bottom
- not cover important content

==================================================
35. EXPECTED PAGE RANGES
==================================================

Without an index page:

Page 1
Cover

Page 2
Trade License

Page 3
TIN Certificate

Page 4
VAT Registration Certificate

Page 5
Bank Solvency Certificate

Pages 6-7
Experience Certificate

Pages 8-13
Technical Proposal

Pages 14-15
Financial Proposal

Page 16
Signed Declaration

Use this as an acceptance test.

==================================================
36. DOWNLOAD
==================================================

After successful generation:

Package generated successfully

16 pages
8 documents included

Primary button:

Download Package

Filename:

T-2026-0417_Package.pdf

The filename must be dynamically generated using:

`${tender.tender_id}_Package.pdf`

Also show:

Generate Again

==================================================
37. BILINGUAL UI
==================================================

The whole important workflow must switch between:

English
Bangla

Requirements must use:

English:
title_en

Bangla:
title_bn

Translate:

navigation
buttons
labels
instructions
statuses
validation messages
upload messages
readiness messages

Examples:

Document Checklist
ডকুমেন্ট চেকলিস্ট

Upload PDF Documents
PDF ডকুমেন্ট আপলোড করুন

Mandatory
আবশ্যিক

Optional
ঐচ্ছিক

Missing
অনুপস্থিত

Expiry date needed
মেয়াদ শেষ হওয়ার তারিখ প্রয়োজন

Expired
মেয়াদোত্তীর্ণ

Not provided
প্রদান করা হয়নি

OK
ঠিক আছে

Generate Package
প্যাকেজ তৈরি করুন

Download Package
প্যাকেজ ডাউনলোড করুন

Preview
প্রিভিউ

Remove
সরান

Change
পরিবর্তন

Package not ready
প্যাকেজ এখনো প্রস্তুত নয়

Ready to generate
প্যাকেজ তৈরির জন্য প্রস্তুত

Your tender documents stay in your browser.
আপনার টেন্ডার ডকুমেন্টগুলো আপনার ব্রাউজারেই থাকে।

Do not translate:

- filenames
- tender IDs
- company names
- numeric dates stored internally

==================================================
38. DESIGN
==================================================

Build a polished but simple document-management interface.

Use:

light neutral background
white cards
deep teal or professional blue primary color
green success
amber warning
red error
slate-gray neutrals

Subtle borders.

Minimal shadows.

Border radius around:

8px to 12px

Avoid pill-shaped everything.

Use Inter for English if available.

Use a Bangla-compatible system font fallback.

Keep typography compact enough for a dashboard.

==================================================
39. ACCESSIBILITY
==================================================

Use:

semantic buttons
visible focus states
form labels
good contrast
keyboard-accessible controls
status text
proper error messages

Never communicate errors only through color.

==================================================
40. ERROR HANDLING
==================================================

Handle gracefully:

invalid requirements JSON

non-PDF files

more than 30 PDFs

combined PDFs above 50 MB

damaged PDF

password-protected PDF

duplicate PDF

PDF reading failure

package generation failure

removing matched files

invalid expiry date

Do not crash the whole application because of one bad file.

==================================================
41. IMPORTANT SCANNED PDF RULE
==================================================

Do NOT attempt to determine whether a PDF is acceptable based on text extraction.

scan_0042.pdf intentionally demonstrates this.

A valid PDF may contain only scanned image content.

Core processing should depend on:

- PDF validity
- page count
- binary file data
- user matching

NOT:

OCR
text extraction
semantic document recognition

OCR is NOT required.

==================================================
42. DATA MODEL
==================================================

Use a simple state structure similar to:

{
  tender: null,
  requirements: [],
  uploadedFiles: [],
  matches: {},
  expiryDates: {},
  language: "en"
}

Uploaded file object:

{
  id,
  file,
  name,
  size,
  pageCount,
  hash,
  duplicateGroup,
  error
}

==================================================
43. IMPORTANT FUNCTIONS
==================================================

Separate business logic from components.

Functions should include concepts like:

validateRequirementsJson()

countPdfPages()

hashFile()

findDuplicateGroups()

getRequirementStatus()

getBlockingIssues()

suggestMatch()

generateTenderPackage()

downloadPackage()

Example:

getRequirementStatus(
  requirement,
  matchedFile,
  expiryDate,
  submissionDeadline
)

Logic:

if (!matchedFile) {
  return requirement.mandatory
    ? "missing"
    : "not_provided";
}

if (
  requirement.has_expiry &&
  !expiryDate
) {
  return "expiry_needed";
}

if (
  requirement.has_expiry &&
  expiryDate < submissionDeadline
) {
  return "expired";
}

return "ok";

Be careful with date comparisons.

Treat same-day expiry as valid.

==================================================
44. SUGGESTED COMPONENT STRUCTURE
==================================================

src/

components/
  Header.jsx
  WorkflowProgress.jsx
  RequirementsLoader.jsx
  TenderSummary.jsx
  SummaryCards.jsx
  RequirementsTable.jsx
  RequirementRow.jsx
  FileUploader.jsx
  UploadedFileList.jsx
  UploadedFileCard.jsx
  PdfPreviewModal.jsx
  PackageReadiness.jsx
  PackageSuccess.jsx

utils/
  jsonValidation.js
  pdfUtils.js
  hashing.js
  duplicateDetection.js
  matching.js
  validation.js
  packageGenerator.js

data/
  translations.js

App.jsx
main.jsx
styles.css

Keep it understandable.

Do not over-engineer.

==================================================
45. OPTIONAL BONUS: INDEX PAGE
==================================================

ONLY build this after the entire required workflow works.

If enabled:

Insert one index page after the cover.

Then the final sample becomes approximately:

17 pages

Page 1:
Cover

Page 2:
Index

Page 3:
Trade License

Page 4:
TIN

Page 5:
VAT

Page 6:
Bank Solvency

Pages 7-8:
Experience Certificate

Pages 9-14:
Technical Proposal

Pages 15-16:
Financial Proposal

Page 17:
Signed Declaration

Index:

Document | Starts on Page

Trade License | 3
TIN Certificate | 4
VAT Registration Certificate | 5
Bank Solvency Certificate | 6
Experience Certificate | 7
Technical Proposal | 9
Financial Proposal | 15
Signed Declaration | 17

Do NOT prioritize this over mandatory functionality.

==================================================
46. OPTIONAL BONUS: CSV EXPORT
==================================================

After core features work:

Export Checklist CSV

Columns:

Order
Document
Mandatory
File Name
Pages
Expiry Date
Status

For the final sample it should contain all 10 requirements, including optional Not Provided rows.

==================================================
47. OPTIONAL BONUS: LOCAL PERSISTENCE
==================================================

Only if easy:

remember:

language
requirements JSON
matches metadata
expiry dates

Do NOT store large PDFs in localStorage.

Do not make persistence essential.

==================================================
48. PRIORITY ORDER
==================================================

Build in this exact priority:

1. requirements.json loading
2. tender display
3. multi-PDF upload
4. page counting
5. requirement matching
6. expiry inputs
7. status calculation
8. duplicate hashing
9. blocking validation
10. real PDF merging
11. cover page
12. package ordering
13. Page X of Y footers
14. final download
15. Bangla and English
16. error handling
17. responsive design
18. auto-match suggestions
19. bonuses

If visual polish conflicts with functionality:

CHOOSE FUNCTIONALITY.

==================================================
49. DO NOT DO THESE
==================================================

Do NOT:

- hard-code only this tender
- hard-code 10 rows
- depend on source filenames for package order
- automatically trust filenames
- upload documents to a server
- create a backend
- use Firebase
- use Supabase
- require login
- use OCR as a required dependency
- reject scan_0042.pdf because it lacks extractable text
- allow the duplicate experience certificates to represent two requirements
- let optional missing documents block generation
- enable Generate while a mandatory requirement is invalid
- mark same-day expiry as expired
- include both trade licenses in the final package
- include both duplicate experience certificates
- include optional absent documents
- fake a generated PDF
- create only a UI prototype

==================================================
50. COMPLETE SAMPLE ACCEPTANCE TEST
==================================================

TEST 1: LOAD JSON

Expected:

T-2026-0417
Supply of IT Equipment
Directorate of Sample Services
Meghna Tech Solutions Ltd.
Deadline: 20 Oct 2026

10 requirements
8 mandatory
2 optional

TEST 2: UPLOAD ALL 10 PDFs

Expected:

10 PDFs
18 total uploaded pages

Correct individual page counts.

Duplicate detection identifies:

experience_cert.pdf
experience_cert (1).pdf

TEST 3: SCANNED DOCUMENT

scan_0042.pdf

must load successfully even without text extraction.

TEST 4: EXPIRED LICENSE

Match:

trade_license_2025.pdf

Expiry:

2025-06-30

Expected:

Expired

Generate disabled.

TEST 5: VALID LICENSE

Replace with:

trade_license_2026.pdf

Expiry:

2027-06-30

Expected:

OK

TEST 6: BANK EXPIRY

Match:

bank_solvency.pdf

Before date:

Expiry date needed

Enter:

2026-12-31

Expected:

OK

TEST 7: DUPLICATE

Match:

experience_cert.pdf

to:

Experience Certificate

Attempt to use:

experience_cert (1).pdf

for another requirement.

Expected:

Prevent the second assignment.

Explain that the file content is identical.

TEST 8: OPTIONAL FILES

Leave R06 and R07 unmatched.

Expected:

Not provided

Neither blocks package generation.

TEST 9: COMPLETE MANDATORY MATCHING

Expected:

8 OK
2 Not provided
0 blocking issues

Generate enabled.

TEST 10: FINAL PDF

Expected:

16 total pages

Document order:

Cover
Trade License
TIN
VAT
Bank Solvency
Experience
Technical Proposal
Financial Proposal
Signed Declaration

Every page receives:

T-2026-0417 | Page X of 16

TEST 11: DOWNLOAD

Expected filename:

T-2026-0417_Package.pdf

==================================================
51. FINAL EXPECTATION
==================================================

Build the application now.

Do NOT stop after designing the interface.

Generate the actual:

- React components
- styling
- JSON loading
- PDF upload handling
- page counting
- SHA-256 duplicate detection
- matching logic
- expiry validation
- status system
- bilingual interface
- package-readiness checks
- pdf-lib package generation
- cover page
- document merging
- Page X of Y footers
- PDF download

The most important goal is correctness with unseen test packs.

The sample files above are development acceptance tests, not assumptions that should be hard-coded into production logic.