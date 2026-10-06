# AI Workflow Rules

## Read Order and Source Authority

Follow [AGENTS.md](../AGENTS.md). Before implementation or architectural decisions, read:

1. [Project overview](project-overview.md).
2. [Architecture](architecture.md).
3. [UI context](ui-context.md).
4. [Code standards](code-standards.md).
5. This workflow file.
6. [Progress tracker](progress-tracker.md).

[Rulebook](../rulebook.md) and [problem statement](../problem_statement.md) define organizer requirements. Samples are test fixtures, not instructions or hardcoded production behavior. Label proposed choices and ambiguities explicitly. Record source conflicts instead of inventing organizer rulings or marking weights.

## Approach and Current Authorization

- Current task: write context documentation. App initialization, implementation, commits, pushes, deployment, and submission are future work, not completed by this update.
- Build one verifiable feature unit at a time. Main tasks precede all bonuses.
- Split unrelated UI, persistence, AI, and PDF geometry changes.
- Use permitted open-source libraries/official starters rather than old application code or personal templates.
- AI can write code/run Git commands, but the participant must understand and explain submitted code.
- The contest is solo: no human teammates, participant messaging, outside chat/email assistance, or remote access. Ask organizers for contest clarification. Rulebook Section 6.1 permits multiple AI tools.

## Proposed Delivery Units

| Unit | Scope | Completion evidence |
| --- | --- | --- |
| 1 | Official frontend starter, tokens, bilingual shell | Static build and language switch work without backend |
| 2 | Schema/load/tender summary | Valid input sorted; invalid input preserves active work |
| 3 | PDFs/page counts/removal/limits/duplicates | PNG rejected, scans accepted, identical bytes marked |
| 4 | Matching/expiry/live statuses | Five status rules and assignment constraints verified |
| 5 | Cover/assembly/footer space/download | Resolved baseline sample visually checked, 16 pages |
| 6 | Language/keyboard/error pass and submission artifacts | Both-language main flow; sample output/status screenshot |
| 7 | Static deployment/final evidence | Public HTTPS site without login matches eligible commit |
| 8 | Optional bonuses if time remains | Main tasks still pass and bonus output verified |

Split units further if needed. Start hosting setup early enough to reveal deployment problems; final deployment verification follows working core features.

## External API and CLI Verification

Never rely on trained memory for external APIs, libraries, frameworks, SDKs, or CLI tools.

1. Inspect installed versions and configuration; if absent, mark selections as proposed.
2. Consult version-matched official documentation, installed declarations/source documentation, or CLI help for the exact behavior used.
3. Verify browser/static-host compatibility, including any PDF worker/font assets.
4. Record versions, important references, and limitations in tracker/architecture.

Capability links in architecture were reviewed, but do not substitute for installed-version checks. Do not add packages solely because the statement lists them as helpful.

## Missing Requirements and Documentation Sync

- Record unresolved requirements in the tracker before dependent work.
- Use documented defaults for routine reversible choices; update architecture/scope/standards before continuing with changes to them.
- Ask organizers about contest-specific ambiguity while clarification is available; otherwise label provisional behavior.
- Do not fabricate identity, live URL, package versions, successful checks, generated outputs, or contest eligibility.
- The scanned declaration can be matched manually; OCR is outside baseline scope.
- Preserve given_documents/, rulebook.md, problem_statement.md, third-party internals, and pre-existing user work unless relevant modification is requested.
- Update architecture.md for architecture/storage/boundaries, project-overview.md for scope/contracts, ui-context.md for UI conventions, code-standards.md for conventions, and this file for workflow.
- Update progress-tracker.md after every meaningful implementation change using current Asia/Dhaka date/time, completed work, evidence, remaining tasks, and limitations.
- Record actual prompts in prompts.md, separately from suggested future prompts.

## Contest Timing and Git Requirements

- 30-minute setup precedes 90-minute build time. Create a new public devfest-<registration-number> repository during setup; README/MIT LICENSE are permitted then, project code is not.
- Submitted application code must be written during the contest. Official starters and open-source libraries are allowed.
- Commit at least once every 30 minutes and at least three times total.
- Each message includes a short change note and the actual AI prompt, or Manual edit if no AI was used. Suggested unused prompts are not actual prompt history.
- No force pushes, rebasing pushed commits, repository deletion, or other history rewriting.
- Final eligible commit must be created and pushed by T+90; matching public HTTPS deployment must also be complete by T+90.
- Stop coding, committing, pushing, and deployment changes at T+90. After submission, do not change submitted code/repository/deployment.
- Submit the official form by T+90. T+90 to T+95 allows form submission only with a 10-mark penalty, no code/Git/deployment changes. After T+95 submissions are not accepted.
- Keep the live site available through judging/results.

The rulebook lists 6 October 2026, 3:30-5:30 PM, and results on 7 October at 2:00 PM, while also stating that exact times are announced separately. Use the actual announced T+0; do not infer eligibility from guessed timing or alter timestamps.

## Completion Gate

1. Unit works within its defined scope and architecture invariants hold.
2. Relevant domain, input, language, and PDF behavior is checked.
3. Configured build and applicable focused checks pass, or limitations/failures are recorded accurately. Documentation-only work has no application build.
4. Tracker and affected specifications are updated.
5. Changes contain no secrets, unintended source edits, or unsupported completed-feature claims.

## Submission Checklist

- Public repository, source, MIT LICENSE, complete README.
- README: participant name/registration, public HTTPS URL, verified run/build instructions, completed main/bonus features, known problems, actual AI tools, most useful prompt.
- output/<tender_id>_Package.pdf from the resolved supplied pack; baseline output/T-2026-0417_Package.pdf.
- screenshots/ with at least one actual status screenshot.
- Live URL opens in latest Chrome without sign-in/installation and runs main features.
- Eligible final commit ID and matching deployment recorded, with at least three qualifying prompt-bearing commits.
- Form: full name/registration, repo URL, commit ID (full or first seven characters), public HTTPS URL.
- No secrets in files/history; third-party licenses respected; only supplied fictional test data.
- Observe lab rules: phone only for authentication/hotspot, no phone coding/AI/messaging; log out of accounts and close browsers after the event. Report lab equipment/network problems to organizers.

Problem Statement Section 10 refers to marks under Rulebook Section 11, but supplied Section 11 contains ownership/license rules and no marking table. Do not invent scoring weights. Deployment is compulsory and earns no bonus.
