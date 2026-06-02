# Tasks: Svelte WYSIWYG Editor with Local Persistence and Static Export

**Input**: Design documents from `/specs/001-svelte-wysiwyg-editor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include test tasks whenever changes can affect visual parity, export integrity, security, accessibility, or deterministic output.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the client-side Svelte project, toolchain, and baseline structure.

- [x] T001 Initialize Svelte + Vite + TypeScript project scaffold in package.json
- [x] T002 Install minimal runtime and test dependencies in package.json
- [x] T003 [P] Create baseline source folders for editor modules in src/lib/
- [x] T004 [P] Configure Vitest and Testing Library setup in vitest.config.ts
- [x] T005 [P] Configure Playwright end-to-end test runner in playwright.config.ts
- [x] T006 Add npm scripts for dev, build, test, and e2e flows in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core domain, persistence, validation, and shell foundations required by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Implement core editor domain types in src/lib/domain/types.ts
- [x] T008 [P] Implement Project Registry schema validator in src/lib/domain/schemas/project-registry.ts
- [x] T009 [P] Implement Export Manifest schema validator in src/lib/domain/schemas/export-manifest.ts
- [x] T010 [P] Implement localStorage gateway service in src/lib/services/persistence/local-storage.ts
- [x] T011 Implement project registry store with active project pointer in src/lib/stores/projects.ts
- [x] T012 Implement global editor state store foundation in src/lib/stores/editor.ts
- [x] T013 [P] Implement input sanitization and style validation service in src/lib/services/validator/sanitizer.ts
- [x] T014 Implement app shell layout container for canvas/layers/inspector in src/lib/components/shell/EditorShell.svelte
- [x] T015 [P] Implement operation status store for non-blocking feedback in src/lib/stores/status.ts

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Design and Export a Page (Priority: P1) 🎯 MVP

**Goal**: Users visually edit content/styles and export a deterministic static ZIP.

**Independent Test**: Create a page, edit styles, export ZIP, unzip output, and verify static rendering parity and required files.

### Tests for User Story 1

- [x] T016 [P] [US1] Add unit tests for canvas node creation/reorder/style updates in tests/unit/editor/canvas-editing.test.ts
- [x] T017 [P] [US1] Add integration test for live preview parity during edits in tests/integration/preview-parity.spec.ts
- [x] T018 [P] [US1] Add contract test for deterministic export manifest structure in tests/contract/export-manifest.contract.test.ts

### Implementation for User Story 1

- [x] T019 [P] [US1] Implement canvas element domain helpers in src/lib/domain/project/canvas-element.ts
- [x] T020 [P] [US1] Implement style engine for editor preview and export mapping in src/lib/services/editor/style-engine.ts
- [x] T021 [US1] Implement canvas viewport rendering component in src/lib/components/canvas/CanvasViewport.svelte
- [x] T022 [US1] Implement layer tree management component in src/lib/components/layers/LayersTree.svelte
- [x] T023 [US1] Implement properties inspector editing panel in src/lib/components/inspector/PropertiesPanel.svelte
- [x] T024 [US1] Implement undo/redo action history manager in src/lib/stores/editor-actions.ts
- [x] T025 [US1] Implement safe interaction preset registry and mappings in src/lib/presets/interactions.ts
- [x] T026 [US1] Implement deterministic export builder and ZIP packing in src/lib/services/export/exporter.ts
- [x] T027 [US1] Wire export action and progress states in src/lib/components/shell/TopBar.svelte
- [x] T028 [US1] Add integration test for static ZIP loadability in browser in tests/integration/export-static.spec.ts

**Checkpoint**: User Story 1 is independently functional and exportable.

---

## Phase 4: User Story 2 - Resume Work Reliably (Priority: P2)

**Goal**: Users can autosave, restore, snapshot, reset, and recover from storage quota failures.

**Independent Test**: Edit project, reload browser, verify restoration; simulate storage quota failure and verify degraded mode with recovery actions.

### Tests for User Story 2

- [x] T029 [P] [US2] Add unit tests for project registry CRUD and active pointer behavior in tests/unit/persistence/project-registry.test.ts
- [x] T030 [P] [US2] Add integration test for restore-on-reload flow in tests/integration/restore-session.spec.ts
- [x] T031 [P] [US2] Add integration test for storage-full degraded mode behavior in tests/integration/storage-quota-mode.spec.ts

### Implementation for User Story 2

- [x] T032 [US2] Implement debounced autosave coordinator in src/lib/services/persistence/autosave.ts
- [x] T033 [US2] Implement startup restore bootstrap flow in src/lib/services/persistence/restore.ts
- [x] T034 [US2] Implement snapshot, rename, duplicate, and reset project commands in src/lib/services/persistence/project-commands.ts
- [x] T035 [US2] Implement persistent storage-full warning banner and recovery controls in src/lib/components/shell/StorageStatusBanner.svelte
- [x] T036 [US2] Wire persistence lifecycle into page initialization in src/routes/+page.svelte

**Checkpoint**: User Story 2 is independently functional with robust local persistence behavior.

---

## Phase 5: User Story 3 - Work Efficiently with Accessible Controls (Priority: P3)

**Goal**: Users can efficiently operate the editor with keyboard shortcuts, clear focus states, and non-blocking feedback.

**Independent Test**: Complete add-style-export workflow using keyboard and pointer while verifying focus visibility and operation feedback.

### Tests for User Story 3

- [x] T037 [P] [US3] Add integration test for keyboard-only navigation in shell and panels in tests/integration/keyboard-navigation.spec.ts
- [x] T038 [P] [US3] Add unit tests for shortcut mappings and undo/redo triggers in tests/unit/editor/shortcuts.test.ts

### Implementation for User Story 3

- [x] T039 [US3] Implement global shortcut handling service in src/lib/services/editor/shortcuts.ts
- [x] T040 [US3] Implement focus management and ARIA helper utilities in src/lib/services/a11y/focus-manager.ts
- [x] T041 [US3] Implement operation status live region component in src/lib/components/shell/OperationStatus.svelte
- [x] T042 [US3] Integrate shortcuts and accessibility flows in editor shell in src/lib/components/shell/EditorShell.svelte

**Checkpoint**: User Story 3 is independently functional with accessibility and productivity controls.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cross-story hardening, parity checks, and documentation.

- [x] T043 [P] Add deterministic export regression integration test in tests/integration/deterministic-export.spec.ts
- [x] T044 [P] Add static-host portability contract test in tests/contract/static-host-portability.contract.test.ts
- [x] T045 Add startup performance smoke test for render budget in tests/integration/startup-performance.spec.ts
- [x] T046 Add documentation for architecture and data flow in docs/editor-architecture.md
- [x] T047 Record quickstart validation outcomes and troubleshooting notes in specs/001-svelte-wysiwyg-editor/quickstart.md
- [x] T048 Add browser-support policy documentation and verification notes in docs/browser-support.md
- [x] T049 Add usability validation protocol for SC-003 timing metric in docs/usability-validation.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Story Phases (Phase 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on other user stories.
- **US2 (P2)**: Starts after Foundational; integrates with shared stores but remains independently testable.
- **US3 (P3)**: Starts after Foundational; can run in parallel with US2 after shell and stores exist.

### Within Each User Story

- Tests first, then implementation.
- Domain/service tasks before UI wiring.
- Core behavior before integration tests and polishing.

### Parallel Opportunities

- Setup tasks marked [P] can run concurrently (T003-T005).
- Foundational schema/service tasks marked [P] can run concurrently (T008-T010, T013, T015).
- US1 test tasks T016-T018 can run concurrently.
- US1 domain/service tasks T019-T020 can run concurrently before UI tasks.
- US2 test tasks T029-T031 can run concurrently.
- US3 test tasks T037-T038 can run concurrently.
- Polish tasks T043-T044 can run concurrently.

---

## Parallel Example: User Story 1

```bash
# Parallel test creation
Task: "Add unit tests for canvas node creation/reorder/style updates in tests/unit/editor/canvas-editing.test.ts"
Task: "Add integration test for live preview parity during edits in tests/integration/preview-parity.spec.ts"
Task: "Add contract test for deterministic export manifest structure in tests/contract/export-manifest.contract.test.ts"

# Parallel domain foundation
Task: "Implement canvas element domain helpers in src/lib/domain/project/canvas-element.ts"
Task: "Implement style engine for editor preview and export mapping in src/lib/services/editor/style-engine.ts"
```

## Parallel Example: User Story 2

```bash
# Parallel persistence tests
Task: "Add unit tests for project registry CRUD and active pointer behavior in tests/unit/persistence/project-registry.test.ts"
Task: "Add integration test for restore-on-reload flow in tests/integration/restore-session.spec.ts"
Task: "Add integration test for storage-full degraded mode behavior in tests/integration/storage-quota-mode.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate deterministic static export and visual parity.
5. Demo/deploy MVP.

### Incremental Delivery

1. Setup + Foundational establishes reusable core.
2. Deliver US1 for visual editing + export.
3. Deliver US2 for persistence reliability.
4. Deliver US3 for accessibility and efficient controls.
5. Complete cross-cutting polish and documentation.

### Parallel Team Strategy

1. Team completes Setup/Foundational together.
2. After Phase 2:
   - Developer A: US1 export + preview path
   - Developer B: US2 persistence + recovery path
   - Developer C: US3 accessibility + shortcuts path
3. Merge via cross-cutting tests in Phase 6.

---

## Notes

- Each task follows required checklist format: `- [ ] T### [P?] [US?] Description with file path`.
- User story labels are used only in user story phases.
- Tasks are specific enough for direct LLM execution without additional context.
- Validate tests before and after implementation for each user story.
