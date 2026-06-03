# Richer Page Builder — Feature Guide

## Overview

The Richer Page Builder extends the WYSIWYG editor with semantic layer types, type-aware inspector controls, and strict visual parity between canvas and exported output.

## Layer Types

| Type | Description | Allowed Parent |
|------|-------------|----------------|
| `section` | Container for other layers | Root, Section |
| `header` | Heading element (h1–h6) | Section |
| `text` | Paragraph text with optional link | Section |
| `columns` | Responsive column layout | Section |
| `picture` | Embedded image asset | Section |

### Nesting Rules

- Root node only accepts `section` children.
- `header` is only valid inside a `section`.
- `columns` and `picture` must be inside a `section`.

## Inspector Controls

Each layer type shows contextual fields:

### Common Fields (all types)
- **Name**: Layer display name
- **Visible**: Toggle layer visibility
- **Text Color**: Applied to text-bearing nodes (header, text)

### Header Fields
- **Heading Level**: h1–h6 selector
- **Heading Text**: Text content

### Text Fields
- **Text Content**: Multi-line text area
- **Link URL**: Optional hyperlink

### Columns Fields
- **Column Count**: 1–6 columns
- **Gap**: CSS gap (e.g. `1rem`)
- **Collapse Breakpoint**: Pixels below which columns collapse to single-column (default: 768)
- **Column Widths (%)**: Manual widths; auto-normalized to 100% if needed

### Picture Fields
- **Image Asset**: Embedded asset picker
- **Alt Text**: Required for accessibility
- **Caption**: Optional figure caption

## Validation

- Invalid inputs show non-blocking error messages in the inspector.
- Column widths that don't sum to 100% trigger an auto-normalization notice.
- Alt text is required for picture layers.

## Color Themes

Four built-in presets are available via the Toolbar:
- **Default** — Light, neutral palette
- **Dark** — Dark mode with blue accent
- **Warm** — Orange-brown tones
- **Cool** — Sky blue palette

Themes apply tokenized CSS custom properties (`--color-*`) across all editor surfaces and exported CSS.

## Canvas/Export Parity

The editor uses a shared **render model** that feeds both:
1. The canvas preview (live authoring view)
2. The export serializer (ZIP output)

This ensures DOM structure equality between what you see and what gets exported.

### Parity Gates
- DOM structure: 100% match for supported node types
- Visual diff: ≤ 1% (via pixelmatch for e2e fixture tests)

## Picture Asset Workflow

1. Add a `picture` layer to a section.
2. Use the asset picker to upload a local image file.
3. The image is stored as an **embedded asset** in the project payload.
4. On export, images are emitted to `assets/images/<assetId>.<ext>` with deterministic ordering.

## Testing

```bash
# Unit and integration tests
npm run test

# E2e and parity fixture tests
npm run test:e2e
```

See [quickstart.md](../specs/002-richer-page-builder/quickstart.md) for full local testing guide.

## Architecture

```
src/lib/
├── domain/
│   ├── project/
│   │   ├── layerTypeDefinitions.ts   — Layer type metadata
│   │   ├── inspectorSchemas.ts        — Inspector field definitions
│   │   ├── themeTokens.ts             — Theme preset definitions
│   │   └── sample-project.ts          — Default project seed
│   └── schemas/
│       ├── layerNodeSchema.ts          — LayerNode type system
│       └── projectSchema.ts            — RichProject schema
├── services/
│   ├── a11y/
│   │   └── colorContrast.ts           — Color parsing/contrast
│   ├── editor/
│   │   ├── nodeFactory.ts             — Node creation
│   │   ├── layerOperations.ts         — CRUD operations
│   │   ├── renderModel.ts             — Canonical render model
│   │   ├── assetLibrary.ts            — Asset ingestion/management
│   │   └── columnsLayout.ts           — Column normalization
│   ├── export/
│   │   ├── richExporter.ts            — Rich project export
│   │   ├── assetEmitter.ts            — Deterministic asset emission
│   │   └── styleCompiler.ts           — Theme → export CSS
│   └── validator/
│       ├── layerTreeValidator.ts      — Tree structure validation
│       ├── inputSanitizer.ts          — Content sanitization
│       └── inspectorValidator.ts      — Inspector field validation
├── stores/
│   ├── editorStore.ts                 — Rich editor state
│   ├── themeStore.ts                  — Theme state
│   └── statusStore.ts                 — Parity/status notifications
└── components/
    ├── canvas/
    │   └── CanvasSurface.svelte        — Rich canvas renderer
    ├── inspector/
    │   ├── InspectorPanel.svelte       — Schema-driven inspector
    │   ├── HeaderFields.svelte
    │   ├── SectionTextFields.svelte
    │   └── ColumnsPictureFields.svelte
    ├── layers/
    │   └── LayersPanel.svelte          — Layer tree with actions
    └── shell/
        ├── Toolbar.svelte              — Theme selector toolbar
        └── StatusBar.svelte            — Parity/status feedback
```
