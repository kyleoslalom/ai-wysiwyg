# Feature Specification: Canvas Improvements

**Feature Branch**: `003-canvas-improvements`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "Improve Canvas. Canvas should take up most of the screen, respect the theme setting, and allow drag and dropping elements to reorder. It should also reflect the outputted html as accurately as possible, the only difference should be borders around each element when interacting with it."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maximized Canvas Workspace (Priority: P1)

An author opens the editor and the canvas occupies the majority of the screen, giving them
maximum visible editing area. Side panels (inspector, layers) are present but compact so they
do not crowd the canvas.

**Why this priority**: The canvas is the primary authoring surface. Giving it maximum space
directly improves all editing workflows and is a prerequisite for the other improvements to
feel meaningful.

**Independent Test**: Open the editor and confirm the canvas region fills at least 70% of
the viewport width and the full available height, regardless of screen resolution.

**Acceptance Scenarios**:

1. **Given** the editor is open at any supported viewport size, **When** the canvas is visible,
   **Then** it occupies the dominant portion of the screen with side panels taking the remaining
   minority of space.
2. **Given** the editor is open, **When** no project is loaded, **Then** the canvas still fills
   the expected area (empty state does not collapse it).
3. **Given** a project is loaded, **When** the user resizes the browser window, **Then** the
   canvas scales proportionally and continues to fill the dominant portion.

---

### User Story 2 - Theme-Respecting Canvas (Priority: P2)

An author switches between light and dark themes in the editor. The canvas surface, background,
and any UI chrome within it adopt the active theme immediately without requiring a page reload.

**Why this priority**: Consistent theming is essential for authors who work in low-light
environments and for accessibility. It also ensures the editor shell feels cohesive.

**Independent Test**: Toggle the theme setting and confirm every visible part of the canvas
area (background, scrollbars, empty-state messaging) updates to match the selected theme.

**Acceptance Scenarios**:

1. **Given** the dark theme is active, **When** the canvas is visible, **Then** the canvas
   background and surrounding chrome use dark-mode values consistent with the rest of the UI.
2. **Given** the light theme is active, **When** the canvas is visible, **Then** the canvas
   background and surrounding chrome use light-mode values consistent with the rest of the UI.
3. **Given** the author switches theme while a project is open, **When** the theme changes,
   **Then** the canvas updates without a page reload and without losing the current project state.

---

### User Story 3 - Drag-and-Drop Element Reordering (Priority: P2)

An author rearranges elements on the canvas by dragging them to a new position within the same
container. The layer order and the page structure update immediately to reflect the new order.

**Why this priority**: Equal to theme respect in priority because reordering is a core layout
workflow. Authors must be able to restructure content intuitively without switching to the
layers panel.

**Independent Test**: With at least two elements present, drag one element above the other
and confirm the visual stacking order and the layer panel order both update to match, and
the exported HTML reflects the new order.

**Acceptance Scenarios**:

1. **Given** a container has two or more elements, **When** an element is dragged and dropped
   above or below a sibling, **Then** the canvas reflects the new order immediately.
2. **Given** the layers panel is visible, **When** an element is reordered via drag on the
   canvas, **Then** the layers panel updates to reflect the same new order.
3. **Given** an element is being dragged, **When** it hovers over a valid drop target, **Then**
   a visual indicator (insertion line or highlight) shows where the element will land.
4. **Given** a drop is performed, **When** the project is exported, **Then** the exported HTML
   preserves the new element order.
5. **Given** a drag is cancelled (Escape key or drop outside valid target), **When** the drag
   ends, **Then** the element returns to its original position with no state change.

---

### User Story 4 - High-Fidelity HTML Rendering (Priority: P1)

The canvas renders each element using the same visual properties (layout, spacing, typography,
color) that would appear in the final exported HTML. The only visual difference between the
canvas and the exported page is the presence of selection/hover borders around elements when
the author is interacting with them.

**Why this priority**: Equal to canvas size in priority. If the canvas does not reflect
exported output, every other authoring action loses trust. This is a core "Visual Truth"
constitutional obligation.

**Independent Test**: Export a project and open the exported HTML file in a browser.
Side-by-side, confirm that element layout, spacing, colors, and typography are visually
identical between the canvas and the exported page. Borders should appear in the canvas
only on hover/selection.

**Acceptance Scenarios**:

1. **Given** a project with styled elements, **When** the canvas is viewed, **Then** the
   visual appearance (fonts, colors, spacing, layout) matches what the exported HTML produces
   in a browser.
2. **Given** an element is not selected and the cursor is not over it, **When** the canvas
   renders that element, **Then** no selection or interaction border is visible.
3. **Given** an element is hovered or selected, **When** the canvas renders that element,
   **Then** a border is displayed around it to indicate the interactive state.
4. **Given** the author applies a style change (color, font, padding), **When** the change
   is committed, **Then** the canvas immediately reflects the change in the same way the
   exported HTML would.
5. **Given** an element contains text or media, **When** the canvas renders it, **Then**
   the content is displayed without editor-only chrome or placeholder labels that would not
   appear in export.

---

### Edge Cases

- What happens when a drag begins on an element inside a deeply nested container — does the
  drop scope stay within the same container or allow cross-container moves?
- How does the canvas handle extremely large or complex projects where full-fidelity rendering
  may affect scroll performance?
- How is the interaction border rendered for elements with custom border styles already applied
  — does the selection border visually conflict with the element's own border?
- What happens if an element's theme-dependent style token is undefined in the active theme?

## Constitution Alignment *(mandatory)*

- **CA-001 Visual Truth**: The high-fidelity rendering story (US4) directly satisfies Visual
  Truth. Canvas rendering will be validated by side-by-side comparison with exported HTML
  output, and rendering parity tests will cover layout, spacing, color, and typography.
- **CA-002 Export Artifact Integrity**: Drag-and-drop reordering (US3) must preserve element
  order in the exported ZIP. Export integrity tests will verify HTML structure matches the
  in-canvas order after reordering.
- **CA-003 Static Portability**: No new runtime dependencies will be introduced. Canvas
  improvements are editor-only and do not affect the exported artifact's portability.
- **CA-004 Safety by Default**: The canvas renders user-authored content in a sandboxed
  manner. No new vectors for script injection are introduced by rendering improvements.
- **CA-005 Determinism**: Element order established by drag-and-drop is persisted to the
  project state and produces identical export output on repeated export runs.
- **CA-006 Accessibility & Performance**: Drag-and-drop must support keyboard-equivalent
  reordering. Canvas size and theme changes must not regress keyboard navigation. Rendering
  fidelity improvements must not cause visible performance degradation for typical project
  sizes (up to 50 elements).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The canvas MUST occupy the dominant portion of the editor viewport, taking up
  at least 70% of available horizontal space when all panels are shown.
- **FR-002**: The canvas MUST apply the active theme's background, text, and surface colors
  without a page reload when the theme setting changes.
- **FR-003**: Authors MUST be able to reorder elements within a container by dragging an
  element and dropping it at a new position among its siblings.
- **FR-004**: A visual drop indicator (insertion line or highlight) MUST be shown during
  a drag operation to show where the element will be placed.
- **FR-005**: An in-progress drag MUST be cancellable via the Escape key, returning the
  element to its original position.
- **FR-006**: The canvas MUST render each element's visual properties (layout, spacing,
  typography, color) to match what the exported HTML produces in a browser.
- **FR-007**: Selection and hover borders MUST appear on elements only during active
  interaction (hover or selection); they MUST NOT appear in exported output.
- **FR-008**: After a drag-and-drop reorder, the exported HTML MUST reflect the new element
  order without requiring any additional author action.
- **FR-009**: The layers panel MUST update its order in real time when elements are
  reordered via drag on the canvas.
- **FR-010**: The canvas MUST support keyboard-equivalent reordering for authors who cannot
  use a pointer device (e.g., via keyboard shortcuts or an accessible mechanism in the
  layers panel).

### Key Entities

- **Canvas**: The primary visual authoring surface that renders the current page layout and
  responds to author interactions.
- **Element**: An individual content or layout block on the canvas that can be selected,
  styled, and reordered.
- **Container**: A parent element that holds one or more child elements and defines the
  drag-and-drop scope for reordering.
- **Theme**: The global visual style setting (e.g., light/dark) whose tokens are applied
  to both the editor shell and the canvas surface.
- **Drop Indicator**: A transient visual affordance displayed during drag operations to
  communicate the prospective insertion point.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The canvas region occupies at least 70% of the editor's horizontal viewport
  in the default layout across all supported screen widths.
- **SC-002**: Theme switching is reflected on the canvas within 100 milliseconds of the
  user changing the setting, with no page reload.
- **SC-003**: 95% of drag-and-drop reorder operations complete successfully (element lands
  at the intended position and state is persisted) in usability testing.
- **SC-004**: Side-by-side visual comparison of the canvas and the exported HTML shows no
  layout, spacing, color, or typography differences for standard element types.
- **SC-005**: Interaction borders are absent from exported HTML output in 100% of export
  test cases.
- **SC-006**: Keyboard-based element reordering is achievable without a pointer device for
  all standard element types.
- **SC-007**: Canvas rendering performance remains at or above the current baseline for
  projects containing up to 50 elements (no visible frame drops during scroll or interaction).

## Assumptions

- The canvas currently renders elements using some approximation of their exported styles;
  this feature brings that approximation to full fidelity rather than rebuilding from scratch.
- Drag-and-drop reordering is scoped to sibling reordering within the same container for
  this feature; cross-container moves are out of scope.
- The theme system already has tokens defined for light and dark modes; this feature applies
  them to the canvas, not redesigns the token system.
- Mobile/touch drag-and-drop is a nice-to-have and will be addressed only if it does not
  significantly increase implementation scope.
- "Most of the screen" means the canvas is the visually dominant area; the exact percentage
  split may be adjusted during implementation to balance usability of side panels.
