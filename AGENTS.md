## Application Building Context

Read the following files in order before implementing
or making any architectural decision:

1. `context/project-overview.md` — product definition,
   goals, features, and scope
2. `context/architecture.md` — system structure,
   boundaries, storage model, and invariants
3. `context/ui-context.md` — theme, colors, typography,
   and component conventions
4. `context/code-standards.md` — implementation rules
   and conventions
5. `context/ai-workflow-rules.md` — development workflow,
   scoping rules, and delivery approach
6. `context/progress-tracker.md` — current phase,
   completed work, open questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## Application Workspace

- This root `AGENTS.md` governs the application in `TenderPack Application Development/`. Resolve the context paths above from the repository root, even when working inside the application folder.
- Run application commands from `TenderPack Application Development/`: `bun install`, `bun run dev`, `bun run build`, `bun run preview`, and `bun run format`. Retain `bun.lock`; use the Bun version declared in `package.json`.
- A development server is not guaranteed to be running. The default local URL is `http://localhost:8443`; the `PORT` environment variable can override the port.
- Start UI work in `src/App.jsx`. `src/App.tsx` is a re-export wrapper; `src/main.tsx` is the entrypoint and imports `src/index.css`.
- Follow the current application layout in `context/architecture.md`, styling conventions in `context/ui-context.md`, and implementation conventions in `context/code-standards.md`.

## Documentation and API Verification

Never rely on trained model memory or assumptions for external APIs, libraries, frameworks, SDKs, or CLI tools. Training data is often outdated and out of sync with installed package versions.
