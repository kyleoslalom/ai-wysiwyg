---

description: "Task list for Canvas Improvements feature"
---

# Tasks: Canvas Improvements

**Input**: Design documents from `/specs/003-canvas-improvements/`

**Branch**: `003-canvas-improvements`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include test tasks whenever a change can affect visual parity, export integrity,
security, accessibility, or deterministic output. These checks are constitution-required
for affected features.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and structure — no setup tasks needed (project exists).
Verify only that dependencies are installed and the dev server runs.

- [ ] T001 Verify existing project builds and `npm run dev` starts without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Runtime-only data entities and stores that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Create `DragState` type definitions and store in `src/lib/stores/dragState.ts`
  with IDLE / DRAGGING / DROPPED / CANCELLED lifecycle and all fields from data-model.md
- [ ] T003 [P] Create `InteractionBorderConfig` type and default export in `src/lib/domain/interactionBorderConfig.ts`
  with `outline` style, 2px width, themed accent color
- [ ] T004 [P] Create `EditorLayoutConfig` type and default export in `src/lib/domain/editorLayoutConfig.ts`
  with canvasMinWidthFraction (0.7), panelDefaultWidthPx (280), panelCollapsedWidthPx (48)

**Checkpoint**: Foundation ready — all user stories can now be implemented in priority order

---

## Phase 3: User Story 1 - Maximized Canvas Workspace (Priority: P1) 🎯 MVP

**Goal**: The editor canvas occupies at least 70% of the viewport with compact side panels.

**Independent Test**: Open the editor and confirm the canvas region fills at least 70% of
the viewport width and the full available height, regardless of screen resolution.

### Implementation for User Story 1

- [ ] T005 [US1] Refactor `EditorShell.svelte` layout to CSS Grid with
  `grid-template-columns: 280px 1fr 280px` so the canvas center column takes all remaining
  space after fixed-width panels; import and use `EditorLayoutConfig` defaults
- [ ] T006 [US1] Add responsive panel collapse behavior to `EditorShell.svelte` —
  at viewports < 1024px, panels collapse to icon-only (48px width); at viewports < 768px,
  panels can be toggled open/closed via a header button
- [ ] T007 [US1] Add CSS for `.canvas-frame` to fill `1fr` grid cell with `height: 100%`
  and `overflow: auto` in `EditorShell.svelte` or `CanvasSurface.svelte`
- [ ] T008 [US1] Verify canvas area occupancy (≥70%) by writing a Playwright viewport
  size test in `tests/e2e/canvas-sizing.spec.ts` that measures `.canvas-frame` vs viewport
  at 1280px, 1024px, and 768px widths

**Checkpoint**: Canvas occupies dominant portion of the screen. US1 independently testable.

---

## Phase 4: User Story 4 - High-Fidelity HTML Rendering (Priority: P1) 🎯 MVP

**Goal**: The canvas renders elements using the same HTML tags, CSS classes, and computed
styles as the exported HTML. Only interaction borders (`outline`) differ.

**Independent Test**: Export a project and open the exported HTML file in a browser.
Side-by-side, confirm element layout, spacing, colors, and typography are visually identical.

### Implementation for User Story 4

- [ ] T009 [P] [US4] Create `CanvasElementRenderer.svelte` component in
  `src/lib/components/canvas/CanvasElementRenderer.svelte` that renders each element type
  using the same semantic HTML tag and CSS class composition as the export pipeline,
  per the tag mapping in `contracts/canvas-rendering-contract.md`
- [ ] T010 [US4] Create interactive wrapper logic in `CanvasElementRenderer.svelte` —
  wrap each rendered element in a `.canvas-interactive-wrap` div (for click-to-select and
  drag events) with `data-node-id`, `role="button"`, `tabindex="0"`; apply no export-affecting
  attributes inside the inner element
- [ ] T011 [US4] Add selection and hover `outline` CSS to `CanvasElementRenderer.svelte` —
  use `InteractionBorderConfig` values (`outline: 2px solid var(--color-accent)`) on
  `.canvas-interactive-wrap` for hover (`:hover`) and selection (`.selected` class);
  ensure `outline` is never applied in any export path
- [ ] T012 [US4] Refactor `CanvasSurface.svelte` to use `CanvasElementRenderer.svelte`
  instead of the current `<button>` wrapper approach; pass `RenderModel` data as props
  so the inner element classes/styles match export exactly
- [ ] T013 [US4] Remove editor-only placeholder labels from canvas rendering
  (`"Section: ..."`, `"Col 1"`, `"Text"`) so canvas content matches export output;
  replace with actual content from `LayerNode.props`
- [ ] T014 [US4] Write unit tests in `tests/unit/canvas/canvas-element-renderer.test.ts`
  verifying class composition (export classes preserved, `.canvas-node` added),
  tag mapping matches contract table, and `outline` only appears on hover/select states
- [ ] T015 [US4] Write integration test in `tests/integration/canvas-rendering-parity.test.ts`
  — render a project fixture in the canvas, export it, and compare DOM structure
  (excluding `.canvas-*` classes and `outline` properties)

**Checkpoint**: Canvas rendering fidelity matches export. US4 independently testable.

---

## Phase 5: User Story 2 - Theme-Respecting Canvas (Priority: P2)

**Goal**: Canvas surface, background, and chrome adopt the active theme immediately
without page reload.

**Independent Test**: Toggle the theme setting and confirm every visible part of the canvas
area updates to match the selected theme.

### Implementation for User Story 2

- [ ] T016 [US2] Add canvas surface CSS custom property support — ensure theme tokens
  include `--surface-bg`, `--canvas-bg`, `--canvas-text` and that `applyThemeToDom()`
  sets them on `:root` alongside existing tokens in `src/lib/stores/themeStore.ts`
- [ ] T017 [US2] Apply canvas theme tokens to `CanvasSurface.svelte` — set
  `background: var(--canvas-bg)` and `color: var(--canvas-text)` on the canvas frame
- [ ] T018 [US2] Ensure canvas chrome (empty-state messaging, scrollbars, selection
  outlines) uses themed CSS custom properties in `CanvasSurface.svelte` so they update
  reactively when the theme store changes
- [ ] T019 [US2] Add undefined token fallback logic in `src/lib/stores/themeStore.ts` —
  if a canvas token is missing in the active theme, fall back to a safe default from the
  opposite theme or a hardcoded value (e.g., `#ffffff` / `#1a1a1a`); log a console warning
- [ ] T020 [US2] Write integration test in `tests/integration/canvas-theme.test.ts` —
  toggle theme, assert canvas background and text computed styles update within 100ms
  without page reload or project state loss

**Checkpoint**: Canvas respects active theme. US2 independently testable.

---

## Phase 6: User Story 3 - Drag-and-Drop Element Reordering (Priority: P2)

**Goal**: Authors reorder elements on the canvas by dragging to a new position.
Layer order and export output update to match.

**Independent Test**: With at least two elements present, drag one above another and
confirm visual order, layer panel order, and exported HTML order all match.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Add native HTML Drag and Drop event handlers to
  `CanvasElementRenderer.svelte` — `dragstart`, `dragover`, `dragend` events that
  update `DragState` store with `draggedNodeId`, `sourceParentId`, `sourceIndex`,
  `currentTargetParentId`, `currentDropIndex`, `isValidTarget`
- [ ] T022 [US3] Create `DropIndicator.svelte` in
  `src/lib/components/canvas/DropIndicator.svelte` — renders an absolutely-positioned
  insertion line between sibling elements using a themed accent-colored border,
  controlled by `DragState.currentTargetParentId` and `currentDropIndex`
- [ ] T023 [US3] Implement drop handler in `CanvasSurface.svelte` — on `drop` event,
  read `DragState` payload, call `reorderLayer()` (same parent) or `moveLayer()` (cross
  parent) from `src/lib/services/editor/layerOperations.ts`, commit project state change
- [ ] T024 [US3] Add Escape key cancel and invalid target feedback to drag handlers —
  on `Escape`, set `DragState.isCancelled = true`, restore `draggedNodeId` to original
  `sourceParentId`/`sourceIndex`; show `cursor: not-allowed` on invalid targets
  per contract
- [ ] T025 [US3] Add mid-drag source deletion guard — if the `draggedNodeId` is deleted
  (via layers panel or keyboard) during a drag, cancel drag silently and restore any
  partial state changes
- [ ] T026 [US3] Wire drag state changes to `LayersPanel.svelte` — when a drop completes,
  the layers panel re-renders from the updated project state (already reactive via
  `onProjectChange`); add visual dimming/grayscale to the dragged element in the layer
  tree during drag
- [ ] T027 [US3] Add `Alt+ArrowUp` / `Alt+ArrowDown` keyboard shortcut handlers in
  `LayersPanel.svelte` for keyboard-equivalent element reordering — call existing
  `handleMoveUp()`/`handleMoveDown()` handlers on the currently selected layer
- [ ] T028 [US3] Write unit tests in `tests/unit/canvas/drag-state.test.ts` verifying
  `DragState` lifecycle transitions (IDLE→DRAGGING→DROPPED, IDLE→DRAGGING→CANCELLED)
  and state reset on dragend
- [ ] T029 [US3] Write integration test in `tests/integration/canvas-drag-reorder.test.ts`
  testing same-container reorder, cross-container reorder, Escape cancel, and layers panel
  state sync after drop
- [ ] T030 [US3] Write E2E test in `tests/e2e/canvas-drag-reorder.spec.ts` — full
  drag-reorder-export pipeline: drag element → drop → export ZIP → verify element order
  in exported HTML matches canvas order; also test keyboard reorder via Alt+↑/↓

**Checkpoint**: Drag-and-drop reordering works with full tree scope. US3 independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation that affect multiple user stories.

- [ ] T031 [P] Update `EditorShell.svelte` and `CanvasSurface.svelte` CSS for scrollbar
  theming — use `var(--color-muted)` for scrollbar thumb and track colors so they match
  the active theme
- [ ] T032 Run `npm run check` (svelte-check + tsc) and fix any type errors introduced
  by the canvas improvements
- [ ] T033 Run `npm test` (all unit + integration tests) and fix any regressions
- [ ] T034 Run `npm run test:e2e` (Playwright) and fix any regressions
- [ ] T035 Verify deterministic export — export the same project state twice and diff
  the ZIP contents (file list, HTML structure, CSS) to confirm they are identical
- [ ] T036 Verify interaction borders (`outline`) are absent from exported HTML in
  `tests/e2e/canvas-interaction-borders.spec.ts` — export a project and assert no
  `outline` CSS property appears in the output HTML or CSS files
- [ ] T037 Run quickstart.md validation steps to confirm all scenarios pass

---

## Phase 8: Visual Verification (Constitution-Required)

**Purpose**: Confirm specification requirements are captured in the UI before marking
the feature complete.

**⚠️ REQUIRED**: This phase MUST be completed for every feature. Do not skip.

- [ ] T038 Launch the application (`npm run dev` or equivalent)
- [ ] T039 Capture screenshots of all UI areas modified by this feature:
  - Full editor viewport showing canvas occupying ≥70% of horizontal space
  - Canvas with dark theme active
  - Canvas with light theme active
  - Canvas with two elements showing drop indicator during drag
  - Canvas element in hover state showing `outline` border
  - Canvas element in selected state showing `outline` border
  - Layers panel showing keyboard reorder (Alt+↑/↓) in action
- [ ] T040 Verify each screenshot against the corresponding acceptance criteria in spec.md
  (US1: 3 scenarios, US2: 3 scenarios, US3: 5 scenarios, US4: 5 scenarios)
- [ ] T041 Document any discrepancies found and resolve or escalate before marking
  tasks done
- [ ] T042 Attach or reference screenshot evidence in the task completion record

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 — Maximized Canvas (Phase 3)**: Depends on Foundational — no story dependencies
- **US4 — Rendering Fidelity (Phase 4)**: Depends on Foundational — no story dependencies;
  can run in parallel with US1
- **US2 — Theme (Phase 5)**: Depends on Foundational — ideally after US4 so canvas surface
  exists, but CSS variable approach is independent enough for parallel execution
- **US3 — Drag-and-Drop (Phase 6)**: Depends on Foundational — ideally after US4 so
  elements have proper render structure for drag targets
- **Polish (Phase 7)**: Depends on all user stories being complete
- **Visual Verification (Phase 8)**: Depends on all user stories and polish complete

### User Story Dependencies

- **US1** (P1): Can start after Phase 2 — No dependencies on other stories
- **US4** (P1): Can start after Phase 2 — No dependencies on other stories
- **US2** (P2): Can start after Phase 2 — Works independently; richer when combined with US4
- **US3** (P2): Can start after Phase 2 — Best after US4 (proper element render targets)

### Parallel Execution Opportunities

Within each user story, `[P]`-marked tasks can run in parallel. Across stories:

- **Phase 3 (US1)** and **Phase 4 (US4)** can run in parallel (both P1, no cross-dependencies)
- **Phase 5 (US2)** can start when Phase 2 is done (independently of US1/US4)
- **Phase 6 (US3)** should start after Phase 4 (needs proper element rendering)
- All phases within Phase 7 are optional and can run in parallel (marked `[P]`)

### Within Each User Story

Tasks within a story should be executed in the order listed. `[P]`-marked tasks
within a story can run in parallel (different files, no dependencies between them).

---

## Implementation Strategy

### MVP Scope (Minimum Viable)

Phase 1 + Phase 2 + Phase 3 (US1) = **7 tasks minimum**.
Delivers: Canvas takes ≥70% of viewport. Foundational stores exist.

### Incremental Delivery

1. **MVP Drop 1** (Phases 1-3): Maximized canvas + foundational stores. Core UX improvement.
2. **MVP Drop 2** (Phase 4): High-fidelity rendering. Visual truth foundation established.
3. **Drop 3** (Phase 5): Theme respect. Surface matches editor shell theme.
4. **Drop 4** (Phase 6): Drag-and-drop reorder. Full interaction model.
5. **Drop 5** (Phases 7-8): Polish, E2E validation, screenshots. Feature complete.

### Risk Items

- Refactoring `CanvasSurface.svelte` from `<button>` wrappers to semantic HTML tags
  (US4) risks breaking existing element selection and interaction patterns — mitigate
  by keeping the `.canvas-interactive-wrap` wrapper layer
- Native HTML DnD API has inconsistent behavior across browsers — mitigate by testing
  in Chromium (primary target) and Firefox during polish phase
- Theme token fallback for undefined tokens (US2) could mask configuration errors —
  mitigate by always logging console warnings