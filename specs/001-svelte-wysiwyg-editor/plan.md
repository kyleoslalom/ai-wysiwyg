# Implementation Plan: Svelte WYSIWYG Editor with Local Persistence and Static Export

**Branch**: `[001-create-feature-branch]` | **Date**: 2026-06-02 | **Spec**: [specs/001-svelte-wysiwyg-editor/spec.md](specs/001-svelte-wysiwyg-editor/spec.md)

**Input**: Feature specification from `/specs/001-svelte-wysiwyg-editor/spec.md`

## Summary

Build a fully client-side Svelte editor that provides visual page authoring, local multi-project persistence, safe interaction presets, and deterministic static ZIP export (`index.html`, `assets/styles.css`, `assets/app.js`, `manifest.json`).

Technical approach emphasizes minimal external dependencies: Svelte + Vite + TypeScript baseline, Bits UI for accessible primitives, and `fflate` for ZIP generation. Persist project registry and project payloads in localStorage with debounced autosave and storage-full degraded mode.

## Technical Context

**Language/Version**: TypeScript 5.x, Svelte 5, Vite 6

**Primary Dependencies**: Svelte, Bits UI (component primitives), fflate (ZIP generation)

**Storage**: Browser localStorage only (Project Registry + Project payloads + Snapshots)

**Testing**: Vitest + @testing-library/svelte (unit/component), Playwright (integration/e2e)

**Target Platform**: Modern desktop/tablet browsers (best-effort matrix per spec clarification)

**Project Type**: Client-side web application (single frontend project, no backend)

**Performance Goals**:
- First meaningful render < 2s on typical laptop-class device
- Non-blocking autosave UX during editing
- Export generation responsive for normal project sizes

**Constraints**:
- Entirely client-side, no backend services
- Use Svelte and an appropriate component library
- Minimize external libraries beyond framework + UI primitives + ZIP utility
- No arbitrary user-authored JavaScript (safe interaction presets only)
- Deterministic canonical export filenames and ordering

**Scale/Scope**:
- Single-user, browser-local authoring sessions
- Multi-project registry in local storage
- v1 scope centered on brochure/landing-page style outputs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Visual truth defined: PASS. Integration tests will compare editor render state and exported output render for supported element types and styles.
- Export-first scope: PASS. Canonical ZIP contract and export flow are primary deliverables.
- Standards portability: PASS. Export artifacts are static HTML/CSS/JS with no runtime build/server dependency.
- Readability target: PASS. Export contract enforces stable file layout and manifest metadata.
- Security by default: PASS. Interaction model is preset-only; arbitrary user JS authoring is excluded.
- Determinism strategy: PASS. Canonical filenames and fixed manifest order are required and contract-tested.
- Accessibility and performance baseline: PASS. Keyboard navigation and focus visibility are required; startup and interaction responsiveness are measured.
- Testing obligations: PASS. Test strategy includes parity, export integrity, persistence recovery, and accessibility-focused checks.

## Project Structure

### Documentation (this feature)

```text
specs/001-svelte-wysiwyg-editor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── project-registry.schema.json
│   └── export-manifest.schema.json
└── tasks.md             # created later by /speckit.tasks
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── lib/
│   ├── components/
│   │   ├── shell/
│   │   ├── canvas/
│   │   ├── layers/
│   │   └── inspector/
│   ├── stores/
│   ├── services/
│   ├── domain/
│   └── presets/
├── routes/
└── app.css

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Single frontend-only Svelte project. No backend directory is planned because all required workflows (editing, persistence, export) run in-browser.

## Complexity Tracking

No constitution violations identified; complexity exceptions are not required.

## Phase 0 Output: Research

Research decisions and alternatives are documented in [specs/001-svelte-wysiwyg-editor/research.md](specs/001-svelte-wysiwyg-editor/research.md).

## Phase 1 Output: Design & Contracts

- Data model: [specs/001-svelte-wysiwyg-editor/data-model.md](specs/001-svelte-wysiwyg-editor/data-model.md)
- Contracts:
  - [specs/001-svelte-wysiwyg-editor/contracts/project-registry.schema.json](specs/001-svelte-wysiwyg-editor/contracts/project-registry.schema.json)
  - [specs/001-svelte-wysiwyg-editor/contracts/export-manifest.schema.json](specs/001-svelte-wysiwyg-editor/contracts/export-manifest.schema.json)
- Quickstart: [specs/001-svelte-wysiwyg-editor/quickstart.md](specs/001-svelte-wysiwyg-editor/quickstart.md)

## Post-Design Constitution Check

- Visual truth: PASS (parity tests planned across editor and exported render)
- Export is product: PASS (deterministic export contract included in design)
- Standards over lock-in: PASS (pure static artifacts and browser APIs)
- Human-readable output: PASS (fixed structure + manifest contract)
- Safe by default: PASS (preset-only interactions, no arbitrary JS)
- Deterministic builds: PASS (fixed names and manifest ordering)
- Progressive capability: PASS (core editing/export/persistence prioritized ahead of advanced features)
- Browser-native experience: PASS (keyboard/touch/focus requirements in scope)
