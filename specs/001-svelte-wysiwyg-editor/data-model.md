# Data Model: Svelte WYSIWYG Editor

## Entity: Project
- Description: User-authored editable site project.
- Fields:
  - `id` (string, UUID-like, required)
  - `name` (string, 1-80 chars, required)
  - `createdAt` (ISO datetime string, required)
  - `updatedAt` (ISO datetime string, required)
  - `rootNodeId` (string, required)
  - `nodes` (map<string, CanvasElement>, required)
  - `styles` (map<string, StyleRule>, required)
  - `interactions` (InteractionBinding[], required)
  - `history` (EditorHistory, optional runtime-only)
  - `version` (integer, required)
- Validation rules:
  - `name` trimmed and non-empty.
  - `rootNodeId` must exist in `nodes`.
  - Node graph must be acyclic.
  - `version` must match supported schema set.

## Entity: CanvasElement
- Description: Renderable editor node and export DOM mapping unit.
- Fields:
  - `id` (string, required)
  - `type` (enum: section|heading|text|image|button|container|custom-safe, required)
  - `parentId` (string|null, required)
  - `children` (string[], required)
  - `content` (object, required)
  - `classList` (string[], required)
  - `inlineStyle` (map<string,string>, optional)
  - `a11y` (object, optional)
- Validation rules:
  - Parent-child references must be consistent both ways.
  - Unsupported style properties rejected by validator.
  - Unsafe attributes blocked in authoring and export.

## Entity: StyleRule
- Description: CSS rule associated with element selectors.
- Fields:
  - `id` (string, required)
  - `selector` (string, required)
  - `declarations` (map<string,string>, required)
  - `order` (integer, required)
- Validation rules:
  - `order` must be unique per stylesheet output.
  - Declarations limited to allowed property list for v1.

## Entity: InteractionPreset
- Description: Predefined safe behavior template.
- Fields:
  - `key` (enum, required)
  - `label` (string, required)
  - `configSchema` (object, required)
  - `exportHandlerId` (string, required)
- Validation rules:
  - `key` must map to a sanctioned handler.
  - Config must pass per-preset schema validation.

## Entity: InteractionBinding
- Description: Binding between an element event and a safe preset.
- Fields:
  - `id` (string, required)
  - `elementId` (string, required)
  - `eventType` (enum: click|keydown|submit|change, required)
  - `presetKey` (string, required)
  - `config` (object, required)
- Validation rules:
  - `elementId` must reference existing element.
  - `presetKey` must exist in registry.
  - Disallow inline script payloads.

## Entity: ProjectRegistry
- Description: LocalStorage index for multiple projects and active project pointer.
- Fields:
  - `activeProjectId` (string|null, required)
  - `projects` (map<string, ProjectMetadata>, required)
  - `lastOpenedAt` (ISO datetime string, optional)
  - `schemaVersion` (integer, required)
- Validation rules:
  - `activeProjectId` must be null or key in `projects`.
  - Registry and project schema versions must be supported.

## Entity: SessionSnapshot
- Description: Saved point-in-time project copy for manual snapshot/reset workflows.
- Fields:
  - `id` (string, required)
  - `projectId` (string, required)
  - `name` (string, required)
  - `savedAt` (ISO datetime string, required)
  - `payload` (Project, required)
- Validation rules:
  - Snapshot payload must validate as `Project`.
  - Snapshot belongs to existing project at save time.

## Entity: ExportManifest
- Description: Deterministic export descriptor included in ZIP.
- Fields:
  - `formatVersion` (string, required)
  - `projectId` (string, required)
  - `generatedAt` (ISO datetime string, required)
  - `entries` (array<ExportEntry>, required)
  - `hashes` (map<string,string>, optional)
- Validation rules:
  - `entries` must be canonical order:
    1. `index.html`
    2. `assets/styles.css`
    3. `assets/app.js`
    4. `manifest.json`
  - Entry paths must be unique and fixed names for v1.

## State Transitions

### Project Lifecycle
1. `created` -> `editing`
2. `editing` -> `autosaved` (debounced write succeeds)
3. `editing` -> `storage_degraded` (quota exceeded)
4. `storage_degraded` -> `editing` (capacity restored and autosave re-enabled)
5. `editing` -> `export_ready`
6. `export_ready` -> `exported`

### Export Lifecycle
1. `idle` -> `building_manifest`
2. `building_manifest` -> `rendering_assets`
3. `rendering_assets` -> `packing_zip`
4. `packing_zip` -> `downloaded` or `failed`

### Restore Lifecycle
1. `app_start` -> `registry_loaded`
2. `registry_loaded` -> `project_restored` or `restore_failed`
3. `restore_failed` -> `new_project_prompted`
