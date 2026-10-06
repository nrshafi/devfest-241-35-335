# UI Context

## Design Intent

Proposed direction: a light office workspace with clear labels, strong contrast, and a visible checklist. No visual theme or component library is prescribed by the organizers. Prioritize completing the task in either language over decorative effects.

## Color Tokens

Define these CSS custom properties once; components use tokens instead of hardcoded colors.

| Role | Variable | Proposed value |
| --- | --- | --- |
| Page background | --bg-base | #F4F7FB |
| Surface | --bg-surface | #FFFFFF |
| Secondary surface | --bg-subtle | #EAF0F7 |
| Primary text | --text-primary | #172B4D |
| Muted text | --text-muted | #526176 |
| Primary accent | --accent-primary | #175CD3 |
| Accent hover | --accent-hover | #144BA8 |
| Text on accent | --text-on-accent | #FFFFFF |
| Border | --border-default | #CBD5E1 |
| Error / blocked | --state-error | #B42318 |
| Error background | --state-error-bg | #FEF3F2 |
| Warning | --state-warning | #854D0E |
| Warning background | --state-warning-bg | #FEF9C3 |
| Success | --state-success | #166534 |
| Success background | --state-success-bg | #F0FDF4 |
| Focus ring | --focus-ring | #175CD3 |

Verify actual contrast during implementation. Every badge includes a text label; color alone is insufficient.

## Typography, Spacing, and Shape

- --font-sans: system UI stack with a Bengali-capable fallback such as Nirmala UI. Bundle a licensed Bengali font if necessary and record attribution; core operations must not depend on a remote font request.
- --font-mono: system monospace stack for IDs/filenames only.
- Default body size 16px with line height about 1.5. Avoid fixed heights that clip Bengali marks or wrapped text.
- Use a 4px spacing scale: 4, 8, 12, 16, 24, 32px.
- Radius tokens: --radius-sm: 6px for controls; --radius-md: 10px for cards; --radius-lg: 14px for dialogs. Status badges may use a pill shape.
- Primary controls should be comfortably clickable, approximately 44px tall, with visible keyboard focus.

## Components

Use native buttons, selects, file inputs, and date inputs with reusable React wrappers as needed. No component library is required. Actions use text labels. Icons are optional; use consistent simple stroke icons, verify third-party licensing, and never rely on an icon alone.

## Main Layout

1. Header: app name, short browser-local processing explanation, and visible English / বাংলা switch.
2. Requirements panel: JSON chooser, validation feedback, tender details, submission deadline.
3. Upload panel: multi-PDF chooser, 30-file/50 MB limits, retained count/size, filenames, page counts, duplicate groups, remove actions.
4. Checklist: ordered rows with title, mandatory/optional label, file selector, page count, conditional expiry input, exactly one status, and unmatch action.
5. Generation summary: included documents/pages, all blocking reasons, Generate button, progress, successful download.

On wide screens uploads/checklist may sit side by side. On small screens stack in workflow order and wrap filenames/titles. Rows may become cards while retaining all actions. A sticky summary must not cover controls or focus.

## Matching and Feedback

- Requirement order is fixed by JSON; no baseline drag reordering.
- Include an Unmatched selector choice; show files already used or reserved by a duplicate-group assignment.
- Identify duplicate filenames together and explain that only one copy can be used. Keep removal available.
- Show expiry inputs with the deadline nearby and explain that equality is acceptable.
- Show generation reasons outside disabled buttons/tooltips.
- Recalculate visible statuses immediately on matching, expiry edits, removal, and unmatching.
- Give intake/generation progress and translated file-specific failure messages; preserve valid work.
- Confirm before loading a different tender would discard work. Invalid JSON preserves the session.
- Empty, loading, validation-error, and successful-download states clearly identify the next action.

## Language Contract

Use parallel English/Bangla dictionaries with stable keys. Translate navigation, labels, actions, placeholders, instructions, limits, validation, statuses, duplicate warnings, blockers, progress, and confirmations.

| English status | Proposed Bangla label |
| --- | --- |
| Missing | অনুপস্থিত |
| Expiry date needed | মেয়াদ শেষের তারিখ প্রয়োজন |
| Expired | মেয়াদোত্তীর্ণ |
| Not provided | প্রদান করা হয়নি |
| OK | ঠিক আছে |

Use title_en/title_bn from loaded JSON. Tender/entity/bidder names, IDs, and filenames remain original data; do not invent translations. Store ISO dates independently of localized display. Set the document language to the active locale; Bangla is left-to-right. Switching language preserves the whole session.

The mandatory PDF cover and footer remain English. Bangla PDF text is a separate bonus; browser font rendering does not establish PDF shaping support.

## Accessibility and PDF Presentation

- Associate labels with inputs; name file removal and unmatch controls using the affected file/document.
- Support keyboard file selection, matching, expiry entry, language switching, and download. Any drag-and-drop feature keeps a normal file chooser.
- Announce significant status/errors without moving focus after every change.
- Errors remain next to affected controls. Do not rely on hover/color/icons alone.
- Cover is a printable English summary; source content remains readable and footers occupy reserved space on every page size/orientation.
