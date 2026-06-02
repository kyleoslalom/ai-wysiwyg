# Tasks: Richer Page Builder

**Input**: Design documents from `/specs/002-richer-page-builder/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test tasks whenever a change can affect visual parity, export integrity,
security, accessibility, or deterministic output. These checks are constitution-required for
affected features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths align to the existing Svelte frontend structure documented in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and baseline scaffolding for richer page-builder work.

- [ ] T001 Add planned dependencies (dompurify, colord, pixelmatch, pngjs) to `package.json`
- [ ] T002 Install and lock new dependencies in `package-lock.json`
- [ ] T003 [P] Create parity fixture seed project in `tests/e2e/fixtures/mixed-layout.project.json`
- [ ] T004 [P] Add feature-level testing notes for local execution in `specs/002-richer-page-builder/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core architecture updates required before implementing user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Define layer type metadata and nesting constraints in `src/lib/domain/project/layerTypeDefinitions.ts`
- [ ] T006 Add richer layer node schema types in `src/lib/domain/schemas/layerNodeSchema.ts`
- [ ] T007 [P] Extend project schema for embedded assets and theme selection in `src/lib/domain/schemas/projectSchema.ts`
- [ ] T008 Implement tree validation rules (root->section, header-in-section) in `src/lib/services/validator/layerTreeValidator.ts`
- [ ] T009 Implement shared canonical render model transform in `src/lib/services/editor/renderModel.ts`
- [ ] T010 [P] Create input sanitization service for inspector/export paths in `src/lib/services/validator/inputSanitizer.ts`
- [ ] T011 [P] Create color parsing and contrast utility wrapper in `src/lib/services/a11y/colorContrast.ts`
- [ ] T012 Wire foundational schema and render-model usage into editor store in `src/lib/stores/editorStore.ts`
- [ ] T013 Add foundational validator and render-model unit tests in `tests/unit/editor/foundation-rules.test.ts`

**Checkpoint**: Foundation ready; user stories can proceed.

---

## Phase 3: User Story 1 - Build Structured Pages with Rich Layer Types (Priority: P1) 🎯 MVP

**Goal**: Enable semantic layer creation and full layer lifecycle operations with valid nesting.

**Independent Test**: Create a mixed-type page, perform create/rename/reorder/duplicate/delete operations, and confirm canvas/layer-tree sync and enforced nesting.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add integration test for rich layer CRUD and valid nesting in `tests/integration/layers-rich-types.test.ts`
- [ ] T015 [P] [US1] Add contract test for richer layer node schema in `tests/contract/layer-node.contract.test.ts`

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement default node factory payloads for all layer types in `src/lib/services/editor/nodeFactory.ts`
- [ ] T017 [US1] Implement create/rename/reorder/duplicate/delete operations in `src/lib/services/editor/layerOperations.ts`
- [ ] T018 [US1] Enforce root/header nesting guardrails in drag-drop/reorder logic in `src/lib/services/editor/layerOperations.ts`
- [ ] T019 [P] [US1] Update layer tree labels and type icons in `src/lib/components/layers/LayersPanel.svelte`
- [ ] T020 [US1] Implement picture asset ingestion and canonical asset path assignment in `src/lib/services/editor/assetLibrary.ts`
- [ ] T021 [US1] Integrate rich layer actions into shell workflows in `src/lib/components/shell/EditorShell.svelte`
- [ ] T022 [US1] Add integration coverage for picture asset layering workflow in `tests/integration/layer-assets.test.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Edit with Type-Aware Inspector Controls (Priority: P1)

**Goal**: Provide contextual inspector fields, strong validation, and user-friendly correction flows.

**Independent Test**: Select each layer type and verify only relevant fields are shown; invalid inputs are blocked with clear guidance and column widths auto-normalize.

### Tests for User Story 2

- [ ] T023 [P] [US2] Add integration test for contextual inspector rendering by selected type in `tests/integration/inspector-contextual-fields.test.ts`
- [ ] T024 [P] [US2] Add unit test for column width normalization and notice behavior in `tests/unit/editor/columns-normalization.test.ts`

### Implementation for User Story 2

- [ ] T025 [P] [US2] Define shared and per-type inspector field schemas in `src/lib/domain/project/inspectorSchemas.ts`
- [ ] T026 [US2] Implement schema-driven inspector orchestration in `src/lib/components/inspector/InspectorPanel.svelte`
- [ ] T027 [P] [US2] Add header-specific inspector controls in `src/lib/components/inspector/HeaderFields.svelte`
- [ ] T028 [P] [US2] Add section and text inspector controls in `src/lib/components/inspector/SectionTextFields.svelte`
- [ ] T029 [P] [US2] Add columns and picture inspector controls in `src/lib/components/inspector/ColumnsPictureFields.svelte`
- [ ] T030 [US2] Implement inspector validation and non-blocking error messaging in `src/lib/services/validator/inspectorValidator.ts`
- [ ] T031 [US2] Implement columns breakpoint default and width auto-normalization in `src/lib/services/editor/columnsLayout.ts`
- [ ] T032 [US2] Wire inspector state, validation, and notices into editor store in `src/lib/stores/editorStore.ts`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Trust Canvas and Export Visual Parity (Priority: P1)

**Goal**: Ensure shared rendering behavior between canvas and export with strict parity checks.

**Independent Test**: Run parity fixtures and verify DOM structure equality with <=1% visual diff for supported nodes.

### Tests for User Story 3

- [ ] T033 [P] [US3] Add e2e parity fixture test for mixed layouts in `tests/e2e/parity-mixed-layout.spec.ts`
- [ ] T034 [P] [US3] Add unit test for shared render-model parity mapping in `tests/unit/editor/render-model-parity.test.ts`
- [ ] T035 [P] [US3] Add contract test for export manifest entries including image assets in `tests/contract/export-manifest-rich.contract.test.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Refactor canvas renderer to consume canonical render model in `src/lib/components/canvas/CanvasSurface.svelte`
- [ ] T037 [US3] Refactor exporter to consume canonical render model in `src/lib/services/export/exporter.ts`
- [ ] T038 [US3] Implement deterministic asset emission ordering in `src/lib/services/export/assetEmitter.ts`
- [ ] T039 [US3] Add DOM + visual parity assertion utility (<=1% threshold) in `tests/e2e/utils/parityAssert.ts`
- [ ] T040 [US3] Surface parity exceptions and diagnostics messaging in `src/lib/stores/statusStore.ts`
- [ ] T041 [US3] Display parity-related status feedback in shell status UI in `src/lib/components/shell/StatusBar.svelte`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: User Story 4 - Design with a More Expressive Color System (Priority: P2)

**Goal**: Introduce tokenized theme styling across editor panels and exported output while preserving accessibility.

**Independent Test**: Apply theme presets and verify consistent token usage across panels and exported CSS with contrast/focus checks passing.

### Tests for User Story 4

- [ ] T042 [P] [US4] Add integration test for token application across layers/canvas/inspector/status panels in `tests/integration/theme-token-application.test.ts`
- [ ] T043 [P] [US4] Add unit tests for color parsing and contrast rules in `tests/unit/editor/theme-contrast.test.ts`

### Implementation for User Story 4

- [ ] T044 [US4] Define theme token presets and role mappings in `src/lib/domain/project/themeTokens.ts`
- [ ] T045 [US4] Implement theme selection and persistence state in `src/lib/stores/themeStore.ts`
- [ ] T046 [P] [US4] Apply tokenized styling to shell chrome surfaces in `src/lib/components/shell/EditorShell.svelte`
- [ ] T047 [P] [US4] Apply tokenized styling to layers panel in `src/lib/components/layers/LayersPanel.svelte`
- [ ] T048 [P] [US4] Apply tokenized styling to inspector panel in `src/lib/components/inspector/InspectorPanel.svelte`
- [ ] T049 [US4] Apply tokenized styling to canvas and status surfaces in `src/lib/components/canvas/CanvasSurface.svelte`
- [ ] T050 [US4] Add theme preset selector controls to toolbar in `src/lib/components/shell/Toolbar.svelte`
- [ ] T051 [US4] Emit selected theme tokens into export CSS generation in `src/lib/services/export/styleCompiler.ts`

**Checkpoint**: User Story 4 is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, documentation, and final regression coverage across stories.

- [ ] T052 [P] Add keyboard accessibility workflow e2e coverage in `tests/e2e/accessibility-workflows.spec.ts`
- [ ] T053 Add deterministic repeat-export integration test in `tests/integration/export-determinism.test.ts`
- [ ] T054 Add sanitization security regression tests for inspector/export inputs in `tests/unit/editor/sanitization-regressions.test.ts`
- [ ] T055 Add editor responsiveness integration checks for inspector/canvas updates in `tests/integration/editor-responsiveness.test.ts`
- [ ] T056 [P] Update feature usage and validation guidance in `docs/richer-page-builder.md`
- [ ] T057 Run and document quickstart validation outcomes in `specs/002-richer-page-builder/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3-6 (User Stories)**: Depend on Phase 2 completion.
- **Phase 7 (Polish)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts immediately after foundational completion; delivers MVP.
- **US2 (P1)**: Starts after foundational; depends on US1 store/action surfaces for best integration stability.
- **US3 (P1)**: Starts after foundational; depends on US1 canonical node behavior and benefits from US2 validation outcomes.
- **US4 (P2)**: Starts after foundational; can run partly in parallel with US2/US3 but should finalize after parity/UI components stabilize.

### Within Each User Story

- Tests should be authored first and confirmed failing before implementation.
- Domain/schema and model changes before UI wiring.
- Service-layer logic before component integration.
- Story-specific regression checks before declaring story complete.

### Parallel Opportunities

- Setup tasks marked [P] can run concurrently.
- Foundational utility tasks marked [P] can run concurrently.
- In each user story, tests and independent component files marked [P] can run concurrently.
- US2 and US3 can be staffed in parallel after US1 baseline integration is stable.

---

## Parallel Example: User Story 1

```bash
# Run US1 tests in parallel:
Task T014 in tests/integration/layers-rich-types.test.ts
Task T015 in tests/contract/layer-node.contract.test.ts

# Implement independent US1 files in parallel:
Task T016 in src/lib/services/editor/nodeFactory.ts
Task T019 in src/lib/components/layers/LayersPanel.svelte
```

## Parallel Example: User Story 2

```bash
# Build independent inspector field components in parallel:
Task T027 in src/lib/components/inspector/HeaderFields.svelte
Task T028 in src/lib/components/inspector/SectionTextFields.svelte
Task T029 in src/lib/components/inspector/ColumnsPictureFields.svelte
```

## Parallel Example: User Story 3

```bash
# Run parity-focused tests in parallel:
Task T033 in tests/e2e/parity-mixed-layout.spec.ts
Task T034 in tests/unit/editor/render-model-parity.test.ts
Task T035 in tests/contract/export-manifest-rich.contract.test.ts
```

## Parallel Example: User Story 4

```bash
# Apply panel token styling in parallel:
Task T046 in src/lib/components/shell/EditorShell.svelte
Task T047 in src/lib/components/layers/LayersPanel.svelte
Task T048 in src/lib/components/inspector/InspectorPanel.svelte
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently via T014/T015/T022 and quickstart checks.
5. Demo/export as MVP increment.

### Incremental Delivery

1. Foundation complete (Phases 1-2).
2. Deliver US1 (MVP) and validate.
3. Deliver US2 and validate contextual editing.
4. Deliver US3 and validate strict parity.
5. Deliver US4 and validate themed visual system.
6. Finish with polish and cross-cutting regressions.

### Parallel Team Strategy

1. Team aligns on setup/foundational tasks first.
2. After Phase 2:
   - Engineer A: US2 inspector stack.
   - Engineer B: US3 parity/export stack.
   - Engineer C: US4 theming and panel application.
3. Integrate continuously via shared store/render-model contracts.

---

## Notes

- [P] tasks indicate file-level parallelism with minimal dependency overlap.
- [US#] labels provide traceability from task to user story.
- Every story remains independently testable by design.
- Preserve deterministic export and safety constraints on every change.
