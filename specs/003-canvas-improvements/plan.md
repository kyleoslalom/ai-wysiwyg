# Implementation Plan: Canvas Improvements

**Branch**: `003-canvas-improvements` | **Date**: 2026-06-03 | **Spec**: [specs/003-canvas-improvements/spec.md](specs/003-canvas-improvements/spec.md)

**Input**: Feature specification from `/specs/003-canvas-improvements/spec.md`

## Summary

Improve the editor canvas to: (1) maximize it to at least 70% of the editor viewport with compact side panels, (2) respect the active theme (light/dark) without page reload, (3) enable drag-and-drop element reordering across the full document tree with visual drop indicators, and (4) achieve HTML rendering parity between canvas and export via a shared CSS approach — interaction borders use CSS `outline` and are the only visual difference.

## Technical Context

**Language/Version**: TypeScript 6.x, Svelte 5, Vite 8

**Primary Dependencies**: Existing: Svelte, Bits UI, fflate, colord, DOMPurify, pixelmatch + pngjs. No new dependencies planned; canvas improvements are editor-only using existing libraries.

**Storage**: Browser localStorage (existing project registry + project payloads). Drag-and-drop reorder persists element order to the project state; no new storage layer needed.

**Testing**: Vitest + Testing Library (unit/integration), Playwright (e2e and parity fixtures), contract tests for schemas in `tests/contract`.

**Target Platform**: Modern browser environment (desktop and mobile), static export execution without server/runtime dependencies.

**Project Type**: Single frontend web application (incremental feature extension on existing repo architecture).

**Performance Goals**:
- Canvas rendering at or above current baseline for projects up to 50 elements (no visible frame drops during scroll or interaction).
- Theme switch reflected on canvas within 100ms, no page reload.
- Drag-and-drop operations feel responsive (no perceptible lag between drop and state update).

**Constraints**:
- Shared CSS approach: canvas elements use the same CSS classes and DOM structure as export output.
- Interaction borders use CSS `outline` (not `border`), so they never conflict with element styles and are naturally excluded from export.
- Drag reorder is full tree scope — elements can move into any container, not only same-parent.
- Keyboard reorder via Alt+↑/↓ in the layers panel (supplemented by move buttons).
- Invalid drop targets show "no-drop" cursor; mid-drag source deletion cancels drag silently.
- Mobile/touch drag-and-drop is a nice-to-have (out of scope for v1 unless low effort).

**Scale/Scope**:
- Incremental feature extension on existing repo architecture.
- Single-user in-browser authoring; no backend/cloud scope.
- Focus on canvas UX improvements and visual fidelity without introducing new export-side complexity.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Visual truth defined**: PASS. Shared CSS rendering approach with outline-only interaction chrome. Side-by-side comparison specified in SC-004. No layout/spacing/color/typography differences for standard element types.
- **Export-first scope**: PASS. Canvas improvements are editor-only. Drag-and-drop reorder persists element order to project state, which is reflected in deterministic export. No new export-side changes needed.
- **Standards portability**: PASS. No new runtime dependencies introduced. Shared CSS approach uses the same output DOM/CSS structure. Exported output remains fully static.
- **Readability target**: PASS. No changes to export structure, naming conventions, or output organization. Canvas-only improvements do not affect export readability.
- **Security by default**: PASS. Shared CSS approach reuses existing sanitization (DOMPurify). No new injection vectors from canvas reordering or theming. Interaction chrome is `outline` only, no content mutation.
- **Determinism strategy**: PASS. Element order established by drag-and-drop is persisted to project state (nodes array order). Repeated exports from same state produce identical output.
- **Accessibility and performance baseline**: PASS. Keyboard reordering via Alt+↑/↓ in layers panel (FR-010). Drag-and-drop cancellable via Escape. Performance threshold at 50 elements. Theme changes must not regress keyboard navigation.
- **Testing obligations**: PASS. Side-by-side rendering parity tests, drag-and-drop order integrity tests, theme responsiveness tests, interaction border absence in export, keyboard reorder tests.
- **Visual verification**: PASS. After implementation, the agent will launch the app, screenshot all affected canvas UI areas (maximized layout, themed rendering, drag reorder, hover/selection borders), and confirm visual match with spec.

**Gate result**: ALL PASS. No violations. Complexity tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-canvas-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   ├── canvas/       # Canvas surface, drop zone, drag overlay, element renderers
│   │   ├── inspector/    # Inspector fields (theme, element selection)
│   │   ├── layers/       # Layer panel (keyboard reorder, Alt+↑/↓)
│   │   └── shell/        # Editor shell layout (canvas sizing, panel toggle)
│   ├── domain/
│   │   ├── types.ts      # CanvasElement, ElementType, Project
│   │   └── schemas/      # JSON Schema contracts
│   ├── services/
│   │   ├── export/       # Export pipeline (no changes expected)
│   │   ├── editor/       # Editor state management
│   │   └── persistence/  # localStorage project save/load
│   └── stores/
│       ├── editor.ts     # Element order, selection, drag state
│       └── themeStore.ts # Theme toggle → canvas surface tokens

tests/
├── contract/             # Schema contract tests (no changes expected)
├── integration/          # Drag-and-drop reorder, theme application, rendering parity
├── e2e/                  # Full drag-reorder-export pipeline, side-by-side canvas vs export
└── unit/                 # Canvas element ordering, drag state machine, outline logic
```

**Structure Decision**: Single frontend web application. This is an incremental feature on the existing architecture. Canvas-related components live under `src/lib/components/canvas/`, drag state and order logic in stores, and rendering parity validation in integration/e2e tests. No new top-level directories needed.

## Complexity Tracking

No constitutional violations. Complexity tracking is not applicable.
