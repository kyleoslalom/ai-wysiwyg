# Data Model: Canvas Improvements

**Branch**: `003-canvas-improvements` | **Date**: 2026-06-03

This document extends the data model from the previous feature (`002-richer-page-builder`) with new entities and entity extensions required for canvas improvements. Entities from the prior feature (Project, CanvasElement/LayerNode, StyleRule, ThemeTokenSet, etc.) remain unchanged unless explicitly noted below.

## Entity Extensions

### Entity: EditorLayoutConfig (NEW)
- Description: Controls the spatial layout of the editor shell — canvas and panel dimensions.
- Fields:
  - `canvasMinWidthFraction` (number, default 0.7, required) — Fraction of available horizontal space the canvas must occupy
  - `panelDefaultWidthPx` (integer, default 280, required) — Default width for inspector and layers panels
  - `panelCollapsedWidthPx` (integer, default 48, required) — Panel width when collapsed to icon-only
  - `leftPanelCollapsed` (boolean, default false, optional)
  - `rightPanelCollapsed` (boolean, default false, optional)
  - `activePanelSide` (enum: 'left' | 'right' | null, optional)
- Validation rules:
  - `canvasMinWidthFraction` must be between 0.5 and 1.0.
  - `panelDefaultWidthPx` must be >= 200.
- Runtime only: This entity is not serialized in project state (it is an editor UI preference).

### Entity: DragState (NEW — Runtime Only)
- Description: Tracks an in-progress drag-and-drop reorder operation. Exists only during a drag session; not persisted.
- Fields:
  - `draggedNodeId` (string, required)
  - `sourceParentId` (string, required) — The container the element was in before drag started
  - `sourceIndex` (integer, required) — The element's index in source parent before drag
  - `currentTargetParentId` (string | null, optional) — The container currently hovered
  - `currentDropIndex` (integer | null, optional) — The insertion index at current target
  - `dropIndicatorType` (enum: 'between' | 'none', default 'none')
  - `isValidTarget` (boolean, default true)
  - `isCancelled` (boolean, default false) — Set to true when Escape pressed or source deleted mid-drag
- Validation rules:
  - `draggedNodeId` must reference a valid element in the project at drag start.
  - `sourceParentId` must be a container that contains `draggedNodeId`.
  - If `isCancelled` is true, all position fields must be cleared.
- Lifecycle states:

  ```
  IDLE → DRAGGING → DROPPED (persist reorder)
                   → CANCELLED (restore original position)
                   → SOURCE_DELETED (silent cancel, state restored)
  ```

### Entity: InteractionBorderConfig (NEW)
- Description: Defines the visual treatment for selection/hover borders on canvas elements.
- Fields:
  - `style` (enum: 'outline', default 'outline', required)
  - `width` (string, default '2px', required)
  - `color` (string, default themed accent/token 'color-accent', required)
  - `offset` (integer, default 2, optional)
- Validation rules:
  - Must always use `outline` CSS property (not `border`) per spec clarification.
  - This entity is consumed by canvas rendering only; never written to export output.
- Runtime only: Not serialized in project or export state.

### Entity: DropIndicator (NEW)
- Description: A transient visual affordance rendered during drag operations to show insertion point.
- Fields:
  - `type` (enum: 'between-siblings', required)
  - `position` (object: `{ parentId: string, siblingIndex: number, rect: DOMRect }`)
  - `visible` (boolean, required)
- Validation rules:
  - Only rendered while `DragState` is active and `isCancelled` is false.
  - Position must map to a valid insertion point in the current target container.
- Runtime only: Not serialized.

### Entity: CanvasElement — Extended
- Description: The existing `CanvasElement` / `LayerNode` entity gains additional runtime rendering properties for the canvas improvements feature.
- Additional runtime fields (not persisted to project state):
  - `_isHovered` (boolean, optional) — Set by pointer events on canvas
  - `_isSelected` (boolean, optional) — Mirrors `selectedNodeId` from editor state
  - `_isDragging` (boolean, optional) — True when this element is being dragged
  - `_dropTargetState` (enum: 'valid' | 'invalid' | 'none', optional) — For cursor feedback
- Validation rules:
  - `_isHovered` and `_isSelected` are mutually exclusive with `_isDragging`.
  - These fields are NEVER included in export serialization.

## State Transitions

### Drag-and-Drop Lifecycle

```
                    ┌──────────────────────────────────────────────┐
                    │                   IDLE                        │
                    │    (no DragState, no DropIndicator)           │
                    └──────────┬───────────────────────────────────┘
                               │ dragstart (pointer down + move)
                               ▼
                    ┌──────────────────────────────────────────────┐
                    │                DRAGGING                       │
                    │  DragState: draggedNodeId, sourceParentId,   │
                    │  sourceIndex, currentTarget, currentIndex    │
                    │  DropIndicator: visible=true at insertion pt │
                    └──┬───────────────┬───────────────────────────┘
         ┌─────────────┘               └──────────────┐
         ▼                                             ▼
┌───────────────────┐                    ┌──────────────────────────┐
│     DROPPED       │                    │       CANCELLED          │
│ Valid drop target │                    │ Escape key or drop on    │
│ → reorderLayer()  │                    │ invalid target           │
│   or moveLayer()  │                    │ → restore original pos   │
│ → IDLE            │                    │ → IDLE                   │
└───────────────────┘                    └──────────────────────────┘
```

### Canvas Sizing Lifecycle

```
EditorShell mounts
    │
    ▼
Read EditorLayoutConfig defaults
    │
    ▼
Apply CSS Grid: "panel-width 1fr panel-width"
    │
    ▼
Window resize / panel toggle
    │
    ▼
Recompute `1fr` fraction → canvas auto-scales
```

### Theme Application Flow

```
Theme store changes (selectTheme())
    │
    ▼
applyThemeToDom() updates CSS custom properties on :root
    │
    ▼
Canvas background reads var(--surface-bg), var(--text)
Canvas chrome reads var(--color-accent), etc.
    │
    ▼
No Svelte reactivity needed — CSS cascade handles update
```

## Key Relationships

- **DragState** is created by canvas `dragstart` and consumed by the layers panel (for real-time order updates) and the canvas drop handler (for state mutation).
- **DropIndicator** position is derived from `DragState.currentDropIndex` and `currentTargetParentId`.
- **InteractionBorderConfig** is consumed by canvas element renderers to add `outline` CSS during hover/selection.
- **EditorLayoutConfig** is consumed by `EditorShell.svelte` to set the CSS Grid template layout.