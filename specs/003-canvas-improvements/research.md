# Research: Canvas Improvements

**Branch**: `003-canvas-improvements` | **Date**: 2026-06-03 | **Phase**: 0

## Research Tasks

| Unknown / Question | Resolution | Source |
|---|---|---|
| Canvas rendering approach | Shared CSS — canvas uses the same CSS classes/DOM structure as export output | Clarification Q3 — Option A |
| Drag-and-drop scope | Full tree reorder — elements can move into any container, cross-branch allowed | Clarification Q1 — Option C |
| Invalid drop target & mid-drag deletion | "No-drop" cursor on invalid targets; cancel drag silently with state restore on deletion | Clarification Q2 — Option B |
| Keyboard reorder mechanism | Alt+↑/↓ shortcuts in layers panel + optional move up/down buttons | Clarification Q4 — Option A |
| Interaction border technique | CSS `outline` (2px solid blue) outside element's own border, excluded from export | Clarification Q5 — Option A |
| Existing canvas rendering | `CanvasSurface.svelte` uses `RenderModel` → renders elements as `<button>` wrappers with inline styles; not yet at full HTML parity with export | Codebase audit: `src/lib/components/canvas/CanvasSurface.svelte` |
| Existing theme system | `themeStore.ts` manages light/dark tokens; `applyThemeToDom()` sets CSS custom properties on `:root`; already called in `EditorShell.svelte` | Codebase audit: `src/lib/stores/themeStore.ts` |
| Existing reorder infrastructure | `reorderLayer()` (same-parent) and `moveLayer()` (cross-parent) exist in `layerOperations.ts`; `LayersPanel.svelte` has move up/down handlers | Codebase audit: `src/lib/services/editor/layerOperations.ts` |
| Existing layout system | `EditorShell.svelte` manages overall layout; canvas may not yet take 70%+ of viewport | Codebase audit: `src/lib/components/shell/EditorShell.svelte` |
| Drag-and-drop library choice | Native HTML Drag and Drop API (no external library) — lightweight, no new dependencies, sufficient for same-container and cross-container reorder | Decision below |

## Decisions

### Decision 1: Drag-and-Drop Implementation

- **Decision**: Use the native HTML Drag and Drop API (`dragstart`, `dragover`, `drop`, `dragend` events) with Svelte event handlers.
- **Rationale**:
  - Zero additional dependencies — aligns with the "no new deps" constraint.
  - The existing `reorderLayer()` and `moveLayer()` operations already handle the state mutations needed on drop.
  - Svelte's reactive event system integrates cleanly with native DnD events.
  - Touch support can be added later via pointer events without changing the drop-handler logic.
- **Alternatives considered**:
  - **dnd-kit/sortable**: Powerful but introduces a 15KB+ dependency for a relatively simple same-scope reorder.
  - **@neodrag/svelte**: Good but adds a dependency; native API is sufficient.
  - **Custom pointer-event DnD**: More flexible for custom animations but more code to maintain.

### Decision 2: Canvas Rendering Fidelity

- **Decision**: Refactor `CanvasSurface.svelte` to render elements using the same HTML tag structure and CSS classes that the export pipeline produces. Interaction chrome (selection/hover borders) is added via CSS `outline` on a wrapper layer, never injected into the element's own markup.
- **Rationale**: Shared CSS approach minimizes the surface area for visual drift between canvas and export. Elements render as their semantic HTML tags (e.g., `<h1>`, `<p>`, `<img>`) instead of `<button>` wrappers, matching the export output.
- **Alternatives considered**:
  - **Dual-render**: Separate render paths for canvas vs export — rejected because it doubles the maintenance burden and guarantees drift over time.
  - **Iframe-based preview**: Full fidelity but adds complexity for interaction handling (click-to-select, drag-to-reorder crossing iframe boundaries).

### Decision 3: Canvas Sizing Strategy

- **Decision**: Use CSS Grid in `EditorShell.svelte` with a flexible grid template (e.g., `grid-template-columns: 280px 1fr 280px`) so the canvas center column takes all remaining space after fixed-width side panels. At narrow viewports, panels collapse to icons/toggle.
- **Rationale**: Full responsive behavior with minimal JS. The `1fr` center column naturally occupies 70%+ at desktop widths when side panels are ~280px each.
- **Alternatives considered**:
  - **JS-based resizing**: Over-engineered for this use case.
  - **CSS `calc()` with fixed percentages**: Less flexible than Grid's `fr` unit for panel toggle states.

### Decision 4: Theme Application to Canvas Surface

- **Decision**: The canvas surface reads CSS custom properties set by `applyThemeToDom()` (already called in `EditorShell.svelte`). The canvas background uses `var(--canvas-bg)` / `var(--surface-bg)` tokens; no additional JS theming needed.
- **Rationale**: Zero additional runtime cost. Theme tokens are already applied as CSS custom properties on `:root` and update reactively when the theme store changes.
- **Alternatives considered**: Passing theme tokens as Svelte props to every canvas component — unnecessarily verbose when CSS cascade handles it.

### Decision 5: Drop Indicator Rendering

- **Decision**: Use a CSS-only insertion line rendered as an absolutely-positioned `<div>` with a subtle colored border (matching the theme accent color) that appears between sibling elements during drag. The line position updates on `dragover` via `element.insertBefore()` or computed coordinates.
- **Rationale**: No canvas re-layout needed. Lightweight, performant, and thematically consistent.
- **Alternatives considered**: SVG overlay, canvas overlay — both add complexity with no UX benefit.

## Open Questions (Deferred)

- Touch drag-and-drop support will be evaluated after desktop DnD is stable. Scope is explicitly deferred per spec Assumptions.
- Multi-select drag (moving multiple elements at once) is out of scope for this feature.
- Undo/redo for drag operations reuses existing `editorActionHistoryStore` snapshots — no new undo infrastructure needed.