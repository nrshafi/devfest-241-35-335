# TenderPack

Tender Document Package Builder — a frontend application for loading tender requirements, matching PDF documents, checking expiry dates, and compiling a combined PDF package in the browser. The interface supports English and Bangla.

Built for the DevFest 2026 AI Vibe-Coding Contest. The application is present in source; full workflow and contest acceptance checks are still pending.

## Participant and Links

- **Name:** Nafiur Rahman Shafi
- **Repository:** [nrshafi/devfest-241-35-335](https://github.com/nrshafi/devfest-241-35-335)
- **Live website:** Not published yet.

## Running Locally

### Requirements

- Either Bun **1.4.2** (the primary package manager declared in [package.json](package.json)) or npm, available on your PATH.
- Node.js **20.19.x or 22.12.0+**, matching the installed Vite package's engine requirement. The earlier successful build used Node.js 24.19.0.
- Latest Google Chrome for the target browser workflow.

### Setup with Bun

The application files currently live at the **repository root**, alongside `package.json` and `bun.lock`.

```bash
git clone https://github.com/nrshafi/devfest-241-35-335.git
cd devfest-241-35-335
bun install
bun run dev
```

### Setup with npm

If you use npm, run the following from a fresh checkout:

```bash
git clone https://github.com/nrshafi/devfest-241-35-335.git
cd devfest-241-35-335
npm install --package-lock=false
npm run dev
```

The `--package-lock=false` option avoids creating a competing root `package-lock.json`, keeping `bun.lock` as the project's committed lockfile. See the [npm install documentation](https://docs.npmjs.com/cli/v11/commands/npm-install/#package-lock). npm resolves dependencies from `package.json` rather than `bun.lock`, so installed versions may differ from the stack table below. Use Bun when you need the project's locked dependency versions.

Open [http://localhost:8443](http://localhost:8443). The `PORT` environment variable overrides the configured default for development and preview. Development uses a strict port, so stop any other process using it or select another port.

### Available Commands

Run these from the repository root:

| Bun | npm | Purpose |
| --- | --- | --- |
| `bun install` | `npm install --package-lock=false` | Install dependencies; Bun uses `bun.lock`, npm resolves manifest ranges |
| `bun run dev` | `npm run dev` | Start the Vite development server |
| `bun run build` | `npm run build` | Create the static production site in `dist/` |
| `bun run preview` | `npm run preview` | Preview the production build locally |
| `bun run format` | `npm run format` | Format the project with oxfmt; modifies files |

Keep `bun.lock` for reproducible dependency resolution. No lint or test script is currently configured.

A root-layout Bun production build with the GitHub Pages base path and a frozen offline dependency install passed, as recorded in the [progress tracker](context/progress-tracker.md). Generated JavaScript, CSS, and PDF worker references include the repository path and point to existing build files. Browser acceptance checks and a live Pages deployment remain pending. The npm instructions match the manifest scripts and official install documentation; npm installation and builds have not been tested in this environment.

## Deploying to GitHub Pages

The [deployment workflow](.github/workflows/deploy-pages.yml) builds with the Bun version declared in `package.json` and the committed `bun.lock`, then publishes `dist/`. It runs on pushes to `main` and can also be started manually on `main`.

1. In the GitHub repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source.
2. Commit and push the workflow and application files to `main`. Alternatively, open **Actions → Deploy TenderPack to GitHub Pages → Run workflow** after the workflow is committed.
3. Wait for both the build and deploy jobs to pass. The `github-pages` environment and deployment job show the published URL.

Expected project URL: [https://nrshafi.github.io/devfest-241-35-335/](https://nrshafi.github.io/devfest-241-35-335/). This is the expected address, not a verified live deployment. No personal access token or custom secret is required.

The workflow reads the Pages base path and passes it to Vite, so bundled JavaScript, CSS, and the PDF.js worker use the repository path. Local development retains the `/` base. For a local build with the same project path:

```bash
bun run build --base /devfest-241-35-335/
bun run preview --base /devfest-241-35-335/
```

Open [http://localhost:8443/devfest-241-35-335/](http://localhost:8443/devfest-241-35-335/). Configuration follows the official [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

## Using TenderPack

1. Load a `requirements.json` file, or use the built-in sample requirements. Tender details and requirements come from the loaded data.
2. Upload PDFs through the file chooser or drag and drop. Review filenames, page counts, processing errors, and duplicate markers.
3. Select a PDF for each requirement, or review and accept a suggested match. A file or detected duplicate group can be assigned to only one requirement. Change or undo matches as needed.
4. Enter expiry dates for matched requirements that require them. Expiry is compared with the tender's submission deadline; expiry on that deadline is accepted.
5. Resolve the listed blocking issues. Unmatched optional requirements are skipped; matched optional documents still undergo expiry checks.
6. Optionally include an index, then generate and download `<tender_id>_Package.pdf`. The generator creates an English cover, includes matched documents in requirement order, and adds `<tender_id> | Page X of Y` footers.

Switch between English and Bangla using the header control. The generated cover and index remain English. See the limitations below before relying on generated output.

## Main Feature Status

The following features have source implementations. They are **not yet certified as completed acceptance checks**.

| Feature | Current implementation |
| --- | --- |
| Requirements loading | JSON validation, tender summary, and sorting by requirement order |
| PDF upload and removal | Multiple uploads, page counts, processing errors, and matched-file removal confirmation |
| Manual matching | One file per requirement, assignment conflict checks, change and unmatch actions |
| Expiry checks | Manual expiry entry, deadline comparison, and blocking for expired or missing dates |
| Live checklist | Derived statuses, readiness totals, and a list of blocking requirements |
| Duplicate detection | SHA-256 grouping independent of filename, duplicate markers, and assignment restrictions |
| Package generation | English cover, ordered PDF merging, numbered footers, and download |
| Two-language interface | English/Bangla dictionaries, requirement titles, and responsive layouts |

## Bonus and Supporting Features

Present in source, with runtime verification pending:

- Optional index page with document start pages.
- CSV checklist export with filenames, page counts, expiry dates, and statuses.
- Filename-based match suggestions that require user acceptance.
- PDF page previews and error handling for damaged/password-protected inputs.

PNG seal/signature placement, Excel export, Bangla PDF text, AI assistance, and full project save/reopen are not implemented.

## Sample Pack

The organizer fixtures are in [given_documents/sample-pack](given_documents/sample-pack/). Load its [requirements.json](given_documents/sample-pack/requirements.json), then select the PDFs from its `documents/` directory. The built-in sample button loads requirements only.

For tender **T-2026-0417**, the deadline is **2026-10-20**. Match `trade_license_2026.pdf` with expiry **2027-06-30**, `bank_solvency.pdf` with expiry **2026-12-31**, one experience certificate copy, and the remaining mandatory documents. Leave the two unavailable optional requirements unmatched.

- `trade_license_2025.pdf` with expiry **2025-06-30** should block generation as expired.
- The two experience certificate PDFs have identical content; use only one.
- `scan_0042.pdf` is an image-only signed declaration and does not need a text layer.
- `company_logo.png` must be rejected by the PDF uploader.

The resolved fixture has **15 source pages**, so the expected package has **16 pages** with the cover, or **17** with the optional index. These are fixture expectations, not proof of a generated result. The required `output/T-2026-0417_Package.pdf` and real status screenshots have not been recorded yet.

## Data and Privacy

PDF processing runs in the browser, with no application backend, remote document storage, or AI API dependency. Uploaded PDFs, assignments, expiry entries, and generated bytes stay in memory and are lost on refresh. Language preference and loaded requirements JSON are saved in browser `localStorage`; this does not restore a full document session.

The stylesheet requests fonts from Google Fonts and has system fallbacks. Full offline reload support has not been verified.

## Known Problems and Verification Gaps

- Footers are drawn over copied source pages rather than in reserved space, so they may obscure existing content. Long cover/index lists can be truncated, and unsupported PDF text characters are replaced with `?`.
- Invalid expiry input produces an extra **Invalid date** checklist status; the required contract allows only five statuses and calls for an inline validation error instead.
- Duplicate grouping uses hashes without the documented additional byte-equality confirmation.
- The uploader allows 30 files and **52,428,800 bytes (50 MiB)**, displayed as 50 MB. This differs from the provisional decimal limit of 50,000,000 bytes in the context documents.
- Upload processing is concurrent, and generation lacks complete pending-intake guards and snapshot protection against edits during generation.
- JSON validation does not fully enforce the planned positive integer/unique order rules or mandatory Bangla titles. Some validation and generation errors are English-only.
- End-to-end behavior, keyboard/mobile usability, PDF page geometry, and preservation of annotations remain unverified. Earlier build notes record a large bundle warning and a future native-config-loader warning about `__dirname`.

## Tech Stack

Versions resolved in `bun.lock`:

| Technology | Version / role |
| --- | --- |
| React / React DOM | 19.3.0 — UI and state |
| Vite | 8.3.2 — development and static build |
| Tailwind CSS | 4.3.3 — styling |
| pdf-lib | 1.17.1 — package creation and merging |
| pdfjs-dist | 6.4.299 — page counting and previews |
| Lucide React | 1.52.0 — icons |
| JavaScript / JSX | Application components and utilities |
| TypeScript | Entrypoint, wrapper, and configuration files |
| Browser Web Crypto | SHA-256 file hashing |
| Bun | 1.4.2 — package management and scripts |

## AI Tools Used

- Codex
- ChatGPT Gemini (Antigravity), and Figma Make:**

### Recorded Development Prompt

The full supplied development prompt is preserved in [used_prompt.md](used_prompt.md). A useful excerpt states:

> The app must load a tender requirements JSON file, allow the user to upload multiple PDFs, match those PDFs to tender requirements, validate missing documents and expiry dates, detect exact duplicate PDFs, and generate one final combined submission-ready PDF.
>
> The application must work entirely inside the browser.

The prompt records development intent; the current manifest declares Bun as primary, with npm setup documented above as an alternative. Participant confirmation of the most useful prompt and contest timing remains pending.

## Project Documentation

- [Project overview](context/project-overview.md): required features and acceptance contracts.
- [Architecture](context/architecture.md), [UI context](context/ui-context.md), and [code standards](context/code-standards.md): implementation guidance and proposed baseline.
- [AI workflow rules](context/ai-workflow-rules.md) and [progress tracker](context/progress-tracker.md): workflow, evidence, and remaining work.
- [Rulebook](rulebook.md) and [problem statement](problem_statement.md): organizer requirements.
- [AGENTS.md](AGENTS.md): shared development instructions.

## License

This project is licensed under the [MIT License](LICENSE).
