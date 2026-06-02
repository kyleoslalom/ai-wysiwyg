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
