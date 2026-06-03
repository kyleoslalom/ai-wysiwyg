# Canvas Drag-and-Drop Contract

**Branch**: `003-canvas-improvements` | **Date**: 2026-06-03

## Purpose

Define the interface contract between the canvas (source of drag events) and the layers panel + editor state (consumers of drop results) for element reordering.

## Event Flow

```
CanvasSurface                                 layerOperations.ts          LayersPanel
    │                                              │                        │
    │── dragstart(nodeId, sourceParentId) ────────►│                        │
    │                                              │                        │
    │── dragover(targetParentId, targetIndex) ────►│                        │
    │       ↓ DropIndicator position update        │                        │
    │                                              │                        │
    │── drop(targetParentId, targetIndex) ────────►│                        │
    │                                              ├── reorderLayer() ─────►│
    │                                              │  or moveLayer()        │  (update layer tree)
    │                                              │                        │
    │◄─── new project state ───────────────────────┤                        │
    │                                              │                        │
    │── dragend (cleanup) ────────────────────────►│                        │
    │       ↓ DragState cleared                    │                        │
```

## Drag Event Payloads

### dragstart
```typescript
interface DragStartPayload {
  draggedNodeId: string;
  sourceParentId: string;
  sourceIndex: number;
}
```

### dragover (frequency-throttled to ~60fps)
```typescript
interface DragOverPayload {
  targetParentId: string;
  targetIndex: number;        // insertion index among siblings
  isValidTarget: boolean;      // checked via canAddChildOfType / tree validation
  dropSideRect: DOMRect | null; // for DropIndicator positioning
}
```

### drop
```typescript
interface DropPayload {
  draggedNodeId: string;
  sourceParentId: string;
  targetParentId: string;
  targetIndex: number;
}
```

### dragend / cancel
```typescript
interface DragEndPayload {
  wasCancelled: boolean;       // true if Escape pressed or no valid drop target
  restoredPosition: boolean;   // true if source position was restored
}
```

## Reorder Operations (backend contract)

### Same-parent reorder: `reorderLayer()`
```
reorderLayer(project, parentNodeId, nodeId, newIndex)
  → LayerOperationResult { project, error? }
```
Already exists in `src/lib/services/editor/layerOperations.ts`.

### Cross-parent move: `moveLayer()`
```
moveLayer(project, nodeId, targetParentId, targetIndex)
  → LayerOperationResult { project, error? }
```
Already exists in `src/lib/services/editor/layerOperations.ts`.

## Visual Feedback Contract

| State | Canvas Element | Cursor | Layers Panel |
|---|---|---|---|
| Idle | No outline | default | Normal tree |
| Hover | `outline: 2px solid var(--color-accent)` | pointer | — |
| Selected | `outline: 2px solid var(--color-accent)` | default | Highlighted row |
| Dragging | Reduced opacity (0.5), no outline | grabbing | Grayed out / dimmed |
| Valid drop target (dragover) | Drop indicator line shown | default | — |
| Invalid drop target | No indicator | not-allowed | — |

## No-Go Guarantees

- Drag state is NEVER persisted to project state (`RichProject.nodes`).
- `_isHovered`, `_isSelected`, `_isDragging`, `_dropTargetState` fields are NEVER serialized in export.
- Interaction `outline` is NEVER included in exported CSS or HTML.
- Drop indicators are NEVER rendered outside a drag session.