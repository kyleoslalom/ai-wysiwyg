# Research: Svelte WYSIWYG Editor with Local Persistence and Static Export

## Decision 1: Client-side architecture only (no backend)
- Decision: Implement as a pure browser application with all authoring, persistence, validation, and export logic executed in the client.
- Rationale: Matches explicit scope, simplifies deployment to static hosting, and aligns with standards/portability constitution principles.
- Alternatives considered:
  - Thin backend for export generation: rejected because it adds server dependency and breaks static-only portability.
  - Optional cloud sync service in v1: rejected because it increases scope and external dependency footprint.

## Decision 2: Framework and language baseline
- Decision: Use Svelte 5 + Vite + TypeScript for the app shell, state modules, and export pipeline.
- Rationale: Svelte provides fast startup/runtime performance and low framework overhead; TypeScript improves deterministic data-shape handling across editor/persistence/export flows.
- Alternatives considered:
  - Svelte + JavaScript only: rejected because typed schemas reduce restore/export regression risk.
  - React or Vue: rejected because feature request explicitly calls for Svelte.

## Decision 3: Component library choice
- Decision: Use Bits UI as the component primitive library, with custom styling tokens and app-specific components.
- Rationale: Provides accessible primitives while keeping dependency count lower than full design-system bundles; supports keyboard/focus requirements.
- Alternatives considered:
  - Full CSS framework + large component kits: rejected to satisfy “minimize external libraries.”
  - No component library: rejected because accessible keyboard/focus behaviors would be slower to deliver reliably.

## Decision 4: State and persistence model
- Decision: Use Svelte writable/derived stores with a Project Registry model persisted in localStorage (multi-project + active project id).
- Rationale: Store-based architecture is native to Svelte and keeps client-only complexity manageable; directly supports accepted clarify decisions.
- Alternatives considered:
  - IndexedDB first: rejected for v1 due to added implementation complexity when localStorage is sufficient for target scope.
  - Single-project storage key: rejected because rename/duplicate/switch workflows require project registry semantics.

## Decision 5: Autosave and quota-failure behavior
- Decision: Debounced autosave (default 500ms idle) with persistent storage-full banner, autosave pause, and manual recovery actions.
- Rationale: Preserves editing continuity while preventing silent data loss and aligns with clarified failure-handling requirements.
- Alternatives considered:
  - Hard-block editing on quota failure: rejected due to poor UX and unnecessary interruption.
  - Silent retry loops: rejected due to hidden failure risk.

## Decision 6: Safe interaction model
- Decision: Only allow predefined interaction presets (e.g., toggle class, show/hide, anchor scroll, accordion state), compiled to sanctioned JS.
- Rationale: Meets safe-by-default constitution requirement and clarified “no arbitrary JS authoring” policy.
- Alternatives considered:
  - Freeform user-authored JS: rejected for security and determinism risks.
  - No interactions at all: rejected because behavior editing is in scope.

## Decision 7: Deterministic static export format
- Decision: Export canonical ZIP structure with fixed filenames and stable ordering:
  - `index.html`
  - `assets/styles.css`
  - `assets/app.js`
  - `manifest.json`
- Rationale: Ensures deterministic builds, reproducible validation, and easier QA.
- Alternatives considered:
  - Timestamped filenames: rejected (non-deterministic).
  - User-chosen file naming per export: rejected (inconsistent output contracts).

## Decision 8: ZIP generation dependency
- Decision: Use `fflate` as the only archive dependency for ZIP creation.
- Rationale: Small footprint and browser-friendly performance; lower dependency weight than heavier ZIP libraries.
- Alternatives considered:
  - JSZip: rejected due to larger dependency footprint for v1 goals.
  - Native CompressionStream-only path: rejected because browser support is inconsistent for current scope.

## Decision 9: Testing strategy for parity and integrity
- Decision: Use Vitest + Testing Library (unit/component) and Playwright (integration/e2e for render parity and export integrity).
- Rationale: Provides direct coverage of constitution gates (visual truth, deterministic export, accessibility, storage failure handling).
- Alternatives considered:
  - Unit tests only: rejected because parity/export checks require browser-level integration validation.
  - Cypress instead of Playwright: acceptable alternative, not chosen to keep single modern automation stack.
