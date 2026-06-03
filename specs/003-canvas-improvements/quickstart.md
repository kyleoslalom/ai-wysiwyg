# Quickstart: Canvas Improvements

**Branch**: `003-canvas-improvements` | **Date**: 2026-06-03

## Prerequisites

- Node.js 20+ installed
- Dependencies installed: `npm install`
- Development server: `npm run dev`
- Existing feature specs and data model from `002-richer-page-builder`

## Key Design Decisions

| Area | Decision | Rationale |
|---|---|---|
| Drag-and-drop | Native HTML DnD API | No new dependencies; existing `reorderLayer()`/`moveLayer()` handle state |
| Rendering parity | Shared CSS approach | Same tags/classes as export; only `outline` differs |
| Canvas sizing | CSS Grid `1fr` center column | Natural 70%+ occupancy without JS resize logic |
| Theme | CSS custom properties | Already applied via `applyThemeToDom()`; cascade handles canvas |
| Interaction borders | CSS `outline` | Sits outside element border; excluded from export naturally |
| Keyboard reorder | Alt+↑/↓ in layers panel | Already has move up/down handlers; extend with keyboard shortcuts |

## Architecture Overview

```
EditorShell.svelte (CSS Grid: panel | canvas | panel)
  │
  ├── LayersPanel.svelte (Alt+↑/↓ reorder, move buttons)
  │     └── layerOperations.ts (reorderLayer / moveLayer)
  │
  ├── CanvasSurface.svelte (shared CSS rendering, drag source)
  │     ├── RenderModel / LayerNode → semantic HTML tags
  │     ├── DragState (runtime-only store)
  │     ├── DropIndicator (transient visual)
  │     └── InteractionBorderConfig (outline CSS)
  │
  └── InspectorPanel.svelte (no changes expected)
```

## Files to Create

| File | Description |
|---|---|
| `src/lib/stores/dragState.ts` | Drag-and-drop runtime state store (DragState entity) |
| `src/lib/components/canvas/DropIndicator.svelte` | Visual insertion line during drag |
| `src/lib/components/canvas/CanvasElementRenderer.svelte` | Shared-CSS element renderer (extracted from CanvasSurface) |

## Files to Modify

| File | Changes |
|---|---|
| `src/lib/components/shell/EditorShell.svelte` | CSS Grid layout → canvas `1fr`, panel toggle support |
| `src/lib/components/canvas/CanvasSurface.svelte` | Refactor rendering to shared CSS approach; add drag event handlers; add selection/hover outline |
| `src/lib/components/layers/LayersPanel.svelte` | Add Alt+↑/↓ keyboard shortcuts for reorder; subscribe to drag state for real-time layer tree updates |
| `src/lib/stores/themeStore.ts` | Add canvas-specific surface token application (if not already covered) |
| `src/lib/services/editor/layerOperations.ts` | Verify `moveLayer()` handles all cross-container cases; add validation hook for tree position validity during drag |

## Testing Strategy

### Unit Tests
- DragState lifecycle: IDLE → DRAGGING → DROPPED / CANCELLED
- drop indicator positioning logic
- Interaction border visibility toggle (hover/selected/idle)
- Canvas element class composition (export classes preserved, editor classes added)

### Integration Tests
- Drag-and-drop reorder within same container → layers panel updates
- Drag-and-drop reorder across containers → `moveLayer()` called
- Theme switch → canvas surface tokens update
- Canvas size at 70%+ viewport at various resolutions

### E2E Tests
- Full drag-reorder-export pipeline: drag → drop → export → verify element order in HTML
- Side-by-side visual parity: canvas screenshot vs export HTML screenshot
- Keyboard reorder via Alt+↑/↓ → export verifies new order
- Escape cancel → elements return to original position

## Running

```bash
# Dev server
npm run dev

# Unit + integration tests
npm test

# E2E tests
npm run test:e2e

# Type check
npm run check
```

## Export Impact

This feature makes NO changes to the export pipeline. Export behavior is affected only insofar as:
- Element order (from drag-and-drop) is read from `RichProject.nodes[parentId].children` → export preserves the persisted order.
- No new content, styles, or markup are added to exported output.
- Interaction chrome (`outline`, opacity changes, data attributes) is NEVER included in exported ZIP.