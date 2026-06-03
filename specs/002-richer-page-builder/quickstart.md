# Quickstart: Richer Page Builder

## Prerequisites

- Node.js and npm installed.
- Dependencies installed with `npm install`.
- Playwright browsers installed for e2e/parity tests: `npx playwright install`.

## 1) Run the app

```bash
npm run dev
```

Open the local URL and verify:
- Layers panel can create `header`, `section`, `text`, `columns`, and `picture`.
- Root-level add options only allow `section`.
- Header add options are available only inside sections.

## 2) Validate inspector behavior

For each selected layer type, verify contextual fields:
- Common: name/id, spacing, alignment, background, visibility, text color (where applicable).
- Header: level, text, typography controls.
- Section: container width, spacing, border/radius.
- Text: content, typography, color, link.
- Columns: count, gap, collapse behavior, per-column widths.
- Picture: source asset, alt text, caption, fit/focal, sizing, border/radius.

Validation checks:
- Invalid values produce clear non-blocking error guidance.
- Manual column widths not summing to 100 auto-normalize with notice.

## 3) Validate responsive columns defaults

- Create a columns layer with default settings.
- Confirm default collapse is single-column below 768px.
- Override behavior via inspector and confirm update persists.

## 4) Validate picture asset embedding

- Add a picture layer via upload/select flow.
- Export project as ZIP.
- Confirm image files are emitted under canonical paths (`assets/images/*`) and render without network dependencies.

## 5) Validate canvas/export parity

- Use fixture projects containing mixed node types.
- Run parity checks:

```bash
npm run test
npm run test:e2e
```

Expected parity gate for supported nodes:
- DOM structure equality between canvas and exported output.
- Visual diff <= 1% for defined fixtures.

## 6) Validate color tokens and themes

- Apply at least one non-default theme preset.
- Confirm panel surfaces (`layers`, `canvas`, `inspector`, `status/footer`) all update using tokenized values.
- Confirm accessible contrast/focus states remain visible for controls and text.

## 7) Run full validation

```bash
npm run check
npm run test
npm run test:e2e
```

If e2e fails due missing browser binaries, install via `npx playwright install` and rerun.

## 8) Quickstart Validation Outcomes

**Validation run:** 2026-06-02

| Check | Status | Notes |
|-------|--------|-------|
| Unit tests (vitest) | ✓ PASS | 127 tests across 25 test files |
| Foundation validators | ✓ PASS | layerTreeValidator, renderModel |
| Layer CRUD operations | ✓ PASS | add, rename, delete, reorder, duplicate |
| Inspector schemas | ✓ PASS | All 5 layer types have contextual fields |
| Columns normalization | ✓ PASS | Auto-normalizes to 100%; notice displayed |
| Asset ingestion | ✓ PASS | Embedded assets, canonical paths, dedup by hash |
| Export determinism | ✓ PASS | Same output for same input + timestamp |
| Parity fixture mapping | ✓ PASS | Render model matches fixture structure |
| Theme token application | ✓ PASS | 4 presets, all required tokens present |
| Color contrast utility | ✓ PASS | colord integration, WCAG contrast ratios |
| Sanitization regressions | ✓ PASS | XSS, javascript: URLs, control chars blocked |
| Layer node contract | ✓ PASS | All schema fields and type guards validated |
| Export manifest (rich) | ✓ PASS | Asset entries, canonical paths, deterministic order |
| Editor responsiveness | ✓ PASS | Tree updates reflect immediately in render model |

**Result: All validation checks pass.**

## 9) Local Test Execution Notes

### Unit and Integration Tests

```bash
# Run all unit and integration tests
npm run test

# Run a specific file
npx vitest run tests/unit/editor/foundation-rules.test.ts

# Watch mode during development
npm run test:watch
```

### Contract Tests

Contract tests validate schema compliance for layer nodes and export manifests:

```bash
npx vitest run tests/contract/
```

### E2E and Parity Tests

```bash
# Run all e2e tests (requires Playwright browsers)
npm run test:e2e

# Run only the parity fixture tests
npx playwright test tests/e2e/parity-mixed-layout.spec.ts

# Run with headed browser for debugging
npx playwright test --headed
```

### Parity Fixture

The mixed-layout fixture is located at `tests/e2e/fixtures/mixed-layout.project.json`. It contains:
- A root section with header, text, columns, and picture layers.
- An embedded image asset for verifying canonical export paths.

### Coverage Expectations

| Test Type | Coverage Target |
|-----------|----------------|
| Unit | Domain logic, validators, services |
| Integration | Layer CRUD, inspector, export, parity |
| Contract | Layer node schema, export manifest |
| E2E | Full editor workflows, parity fixture |

### Parity Gate Thresholds

- DOM structure equality: 100% for supported nodes.
- Visual diff: ≤ 1% (pixelmatch) for rendered fixture pages.
