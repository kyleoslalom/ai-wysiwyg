# Implementation Plan: Richer Page Builder

**Branch**: `[002-svelte-wysiwyg-editor]` | **Date**: 2026-06-02 | **Spec**: [specs/002-richer-page-builder/spec.md](specs/002-richer-page-builder/spec.md)

**Input**: Feature specification from `/specs/002-richer-page-builder/spec.md`

## Summary

Extend the current Svelte WYSIWYG editor into a richer page builder with semantic layer types (header, section, text, columns, picture), strict type-aware inspector controls, and stronger visual parity between canvas and exported output. The implementation keeps the existing client-only architecture and import footprint lean, adding libraries only where they provide substantial benefit (sanitization, color validation/contrast, and deterministic visual parity assertions).

## Technical Context

**Language/Version**: TypeScript 6.x, Svelte 5, Vite 8

**Primary Dependencies**: Existing: Svelte, Bits UI, fflate. Planned additions (substantial benefit only): DOMPurify (safe user content sanitization), colord (color parsing/contrast), pixelmatch (+ pngjs) for strict visual parity diffing.

**Storage**: Browser localStorage (existing project registry + project payloads) with embedded image assets included in project payload and exported into canonical asset paths.

**Testing**: Vitest + Testing Library (unit/integration), Playwright (e2e and parity fixtures), contract tests for schemas in `tests/contract`.

**Target Platform**: Modern browser environment (desktop and mobile), static export execution without server/runtime dependencies.

**Project Type**: Single frontend web application.

**Performance Goals**:
- Maintain interactive authoring responsiveness with inspector/canvas updates under normal project sizes.
- Keep first meaningful editor render within prior baseline targets.
- Keep parity checks stable and deterministic in CI using fixture-based comparisons.

**Constraints**:
- Root allows only section layers; header allowed only inside section.
- Picture layers use embedded local export assets only; no runtime external URLs for v1 baseline.
- Columns default collapse to one column below 768px.
- Column width edits auto-normalize to 100% total with non-blocking notice.
- Parity gate requires DOM structure equality and <=1% visual diff for supported nodes.

**Scale/Scope**:
- Incremental feature extension on existing repo architecture.
- Single-user in-browser authoring; no backend/cloud scope.
- Focus on deterministic static export quality and UX fidelity.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Visual truth defined: PASS. Shared render model and parity fixtures are explicit with <=1% diff and DOM equality.
- Export-first scope: PASS. Feature work is constrained to what improves exported quality and confidence.
- Standards portability: PASS. Output remains static HTML/CSS/JS and browser-native.
- Readability target: PASS. Export structure remains canonical and human-readable with explicit contracts.
- Security by default: PASS. Sanitization and safe content handling are planned for new rich fields and media metadata.
- Determinism strategy: PASS. Canonical pathing, normalization rules, and parity fixtures are deterministic.
- Accessibility and performance baseline: PASS. Keyboard focus, contrast, and responsive behavior remain required gates.
- Testing obligations: PASS. Unit/integration/contract/e2e and parity checks are mapped.

## Project Structure

### Documentation (this feature)

```text
specs/002-richer-page-builder/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── export-manifest.schema.json
│   ├── project-registry.schema.json
│   └── layer-node.schema.json
└── tasks.md             # created later by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   ├── canvas/
│   │   ├── inspector/
│   │   ├── layers/
│   │   └── shell/
│   ├── domain/
│   │   ├── project/
│   │   └── schemas/
│   ├── presets/
│   ├── services/
│   │   ├── a11y/
│   │   ├── editor/
│   │   ├── export/
│   │   ├── persistence/
│   │   └── validator/
│   └── stores/
├── app.css
└── App.svelte

tests/
├── contract/
├── e2e/
├── integration/
└── unit/
    ├── editor/
    └── persistence/
```

**Structure Decision**: Continue with the existing single-project Svelte frontend layout. New behavior is implemented inside current `src/lib` vertical slices (domain, services, stores, components), with schema and parity coverage added under existing `tests` directories.

## Complexity Tracking

No constitution violations identified; no exceptions required.

## Phase 0 Output: Research

Research decisions and alternatives are documented in [specs/002-richer-page-builder/research.md](specs/002-richer-page-builder/research.md).

## Phase 1 Output: Design & Contracts

- Data model: [specs/002-richer-page-builder/data-model.md](specs/002-richer-page-builder/data-model.md)
- Contracts:
  - [specs/002-richer-page-builder/contracts/project-registry.schema.json](specs/002-richer-page-builder/contracts/project-registry.schema.json)
  - [specs/002-richer-page-builder/contracts/export-manifest.schema.json](specs/002-richer-page-builder/contracts/export-manifest.schema.json)
  - [specs/002-richer-page-builder/contracts/layer-node.schema.json](specs/002-richer-page-builder/contracts/layer-node.schema.json)
- Quickstart: [specs/002-richer-page-builder/quickstart.md](specs/002-richer-page-builder/quickstart.md)

## Post-Design Constitution Check

- Visual truth: PASS (shared render model + strict parity fixture gates)
- Export is product: PASS (export contract remains canonical and expanded for embedded assets)
- Standards over lock-in: PASS (no backend/proprietary runtime requirements)
- Human-readable output: PASS (fixed paths, predictable structure, schema coverage)
- Safe by default: PASS (sanitization and attribute validation for new fields)
- Deterministic builds: PASS (canonical ordering and normalization rules)
- Progressive capability: PASS (extends existing architecture with scoped additions)
- Browser-native experience: PASS (desktop/mobile plus keyboard/focus constraints)
