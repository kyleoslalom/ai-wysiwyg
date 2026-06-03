# Canvas Rendering Fidelity Contract

**Branch**: `003-canvas-improvements` | **Date**: 2026-06-03

## Purpose

Define the contract for how the canvas renders elements to achieve visual parity with exported HTML output. The shared CSS approach means canvas elements use the same HTML tags, CSS classes, and computed styles as the export pipeline.

## Tag Mapping (Canvas ↔ Export)

| Element Type | Canvas HTML Tag | Export HTML Tag | Notes |
|---|---|---|---|
| section | `<section>` | `<section>` | Same tag, same class composition |
| header/h1..h6 | `<h1>`..`<h6>` | `<h1>`..`<h6>` | Same tag; canvas wraps in interactive container |
| text | `<p>` or `<span>` | `<p>` or `<span>` | Same tag; `<p>` default |
| columns | `<div>` with grid | `<div>` with grid | Same `display: grid` layout |
| picture | `<figure>` > `<img>` + `<figcaption>` | `<figure>` > `<img>` + `<figcaption>` | Same structure |
| button | `<button>` | `<button>` | Same tag |

## Interactive Wrapping

Canvas elements are wrapped in an interactive container (for selection and drag) but the inner element's HTML structure matches export exactly:

```html
<!-- Canvas (interactive wrapper visible, outline on .canvas-interactive-wrap) -->
<div class="canvas-interactive-wrap" data-node-id="..." role="button" tabindex="0">
  <h1 class="export-heading export-heading--h1">Title</h1>
</div>

<!-- Export (no wrapper, same inner element) -->
<h1 class="export-heading export-heading--h1">Title</h1>
```

## CSS Boundaries

| Property | Canvas | Export | Notes |
|---|---|---|---|
| Element classes | Same as export + `.canvas-node` | Export classes only | `.canvas-node` is editor-only CSS |
| Element inline style | Same as export | Same as export | Both read from `LayerNode.style` |
| Interaction outline | `outline: 2px solid var(--color-accent)` on hover/select | None | Never in export |
| Opacity during drag | `opacity: 0.5` on dragged element | Full opacity (1.0) | Never in export |
| Selection wrappers | `.canvas-interactive-wrap` | No wrapper | Editor-only |
| Theme CSS variables | Same as export (`var(--color-*)`) | Same | Both use `applyThemeToDom()` output |

## Parity Validation

Side-by-side comparison (SC-004) checks:
- DOM structure equality (same tag nesting, same class names excluding `.canvas-*` prefix)
- Layout parity (same element positions, dimensions, grid placement)
- Typography parity (same font family, size, weight, line-height, color)
- Spacing parity (same padding, margin, gap computed values)
- Color parity (same background, text, border computed colors)

## No-Go Guarantees

- Canvas NEVER renders `outline` in exported HTML/CSS.
- Canvas NEVER renders `.canvas-interactive-wrap` in export.
- Canvas NEVER renders editor-only data attributes (`data-node-id`, `data-testid`) in export.
- Canvas NEVER shows placeholder labels or editor-only chrome in export (`"Section: ..."`, `"Col 1"`, `"Text"`).