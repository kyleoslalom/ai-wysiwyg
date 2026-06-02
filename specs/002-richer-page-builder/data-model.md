# Data Model: Richer Page Builder

## Entity: Project
- Description: Full authoring state for one page-builder project.
- Fields:
  - `id` (string, required)
  - `name` (string, 1-80 chars, required)
  - `createdAt` (ISO datetime string, required)
  - `updatedAt` (ISO datetime string, required)
  - `rootNodeId` (string, required)
  - `nodes` (map<string, LayerNode>, required)
  - `theme` (ThemeSelection, required)
  - `assets` (map<string, EmbeddedAsset>, required)
  - `version` (integer, required)
- Validation rules:
  - `rootNodeId` references an existing node of type `section-root` or root container.
  - Graph is acyclic and parent-child references are consistent.
  - Node types must match allowed layer type enum.

## Entity: LayerNode
- Description: Canonical content node used by layers panel, canvas rendering, inspector editing, and export rendering.
- Fields:
  - `id` (string, required)
  - `type` (enum: section|header|text|columns|picture, required)
  - `parentId` (string|null, required)
  - `children` (string[], required)
  - `name` (string, required)
  - `visible` (boolean, required)
  - `style` (LayerStyle, required)
  - `props` (HeaderProps|SectionProps|TextProps|ColumnsProps|PictureProps, required)
- Validation rules:
  - Root accepts only `section` children.
  - `header` nodes are valid only when parent type is `section`.
  - `columns` node children comply with type rules from LayerTypeDefinition.

## Entity: LayerTypeDefinition
- Description: Type metadata controlling defaults, allowed parent/child types, and inspector schema mapping.
- Fields:
  - `type` (enum, required)
  - `defaultName` (string, required)
  - `defaultProps` (object, required)
  - `allowedParentTypes` (enum array, required)
  - `allowedChildTypes` (enum array, required)
  - `inspectorSchemaKey` (string, required)
- Validation rules:
  - Parent/child constraints must not create impossible cycles.
  - Every `type` must map to one inspector schema.

## Entity: InspectorSchema
- Description: Definition for rendering and validating contextual inspector controls.
- Fields:
  - `key` (string, required)
  - `commonFields` (InspectorField[], required)
  - `typeFields` (map<LayerType, InspectorField[]>, required)
  - `validators` (map<string, ValidationRule>, required)
- Validation rules:
  - Required fields must exist for each layer type.
  - Invalid inputs produce structured validation errors with user-facing messages.

## Entity: ColumnsLayout
- Description: Responsive and width behavior payload for `columns` nodes.
- Fields:
  - `count` (integer, 1-6, required)
  - `gap` (CSS size token/string, required)
  - `collapseMode` (enum, required)
  - `collapseBreakpointPx` (integer, required, default 768)
  - `manualWidths` (number[], optional)
  - `normalizedWidths` (number[], required when manual widths provided)
- Validation rules:
  - If `manualWidths` provided and sum != 100, widths are auto-normalized to 100.
  - Width arrays must match `count`.

## Entity: EmbeddedAsset
- Description: Binary-backed project asset that is exported as local file.
- Fields:
  - `assetId` (string, required)
  - `kind` (enum: image, required)
  - `mimeType` (string, required)
  - `originalName` (string, required)
  - `canonicalPath` (string, required, pattern `assets/images/...`)
  - `bytes` (base64 or binary container, required)
  - `hash` (string, required)
- Validation rules:
  - `canonicalPath` unique per project export.
  - `mimeType` must be allowed image type set.

## Entity: ThemeTokenSet
- Description: Named color token map for editor surfaces and exported page styles.
- Fields:
  - `id` (string, required)
  - `label` (string, required)
  - `tokens` (map<string,string>, required)
  - `contrastReport` (object, optional)
- Validation rules:
  - Must include at least `surface`, `panel`, `accent`, `muted`, `success`, `warning`.
  - Required control/text token pairings must pass configured contrast thresholds.

## Entity: ParityFixture
- Description: Snapshot-compatible fixture definition used to compare canvas and export output.
- Fields:
  - `id` (string, required)
  - `projectSeed` (Project, required)
  - `supportedNodeSet` (string[], required)
  - `domAssertions` (array, required)
  - `visualDiffThreshold` (number, required, default 0.01)
- Validation rules:
  - Threshold must be <= 0.01 for v1.
  - Fixtures must include at least one mixed-type layout.

## State Transitions

### Layer Authoring Lifecycle
1. `node_created` -> `node_named`
2. `node_named` -> `node_configured`
3. `node_configured` -> `node_reordered` (optional repeat)
4. `node_configured` -> `node_deleted` (terminal)

### Inspector Validation Lifecycle
1. `input_changed` -> `validating`
2. `validating` -> `valid`
3. `validating` -> `invalid`
4. `invalid` -> `normalized` (for auto-correct rules such as column widths)
5. `normalized` -> `valid`

### Export Lifecycle (with assets)
1. `idle` -> `materializing_render_model`
2. `materializing_render_model` -> `assembling_assets`
3. `assembling_assets` -> `serializing_files`
4. `serializing_files` -> `zipping`
5. `zipping` -> `downloaded` or `failed`
