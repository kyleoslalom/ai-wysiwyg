# Feature Specification: Richer Page Builder

**Feature Branch**: `[002-svelte-wysiwyg-editor]`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Create a new feature specification to evolve the current Svelte WYSIWYG editor from basic element editing into a richer page builder with stronger visual parity and more expressive design controls. Add multiple layer types (header, section, text, columns, picture), type-aware inspector controls, improved canvas-to-export parity, and a more colorful and accessible UI style system."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build Structured Pages with Rich Layer Types (Priority: P1)

A creator composes pages using semantic layer types so layout and content structure are intentional and reusable.

**Why this priority**: Multi-type authoring is the core capability upgrade and unlocks the rest of the workflows.

**Independent Test**: Can be fully tested by creating a page that includes header, section, text, columns, and picture layers; then reordering, duplicating, renaming, and deleting layers while preserving valid structure.

**Acceptance Scenarios**:

1. **Given** a blank project, **When** the creator adds one of each supported layer type, **Then** each layer is created with sensible defaults and appears in both canvas and layer tree.
2. **Given** a populated layer tree, **When** the creator reorders or nests layers, **Then** only valid parent-child combinations are allowed and invalid drops are blocked with clear feedback.
3. **Given** any supported layer, **When** the creator renames, duplicates, or deletes it, **Then** the layer tree and canvas remain synchronized without orphaned content.

---

### User Story 2 - Edit with Type-Aware Inspector Controls (Priority: P1)

A creator selects any layer and sees only the fields that apply to that selected type, including shared visual controls.

**Why this priority**: Contextual editing reduces mistakes and makes advanced authoring understandable for non-technical users.

**Independent Test**: Can be tested by selecting each layer type and verifying that required contextual controls appear, invalid inputs are rejected with guidance, and unrelated controls are hidden.

**Acceptance Scenarios**:

1. **Given** any selected layer, **When** the inspector loads, **Then** common fields are available (name, spacing, alignment, background, visibility, and text color where relevant).
2. **Given** a selected header layer, **When** the creator edits level, text, and typography settings, **Then** only header-appropriate fields are shown and updates apply immediately.
3. **Given** a selected columns or picture layer, **When** the creator enters invalid values, **Then** the system blocks invalid submission and shows user-friendly recovery guidance.

---

### User Story 3 - Trust Canvas and Export Visual Parity (Priority: P1)

A creator can rely on the canvas to represent how the final exported page will look and behave for supported styles and layer structures.

**Why this priority**: Visual trust is essential for export confidence and is a constitutional requirement.

**Independent Test**: Can be tested by editing representative pages, exporting them, and confirming that structure, styling, and supported interactions match predefined parity fixtures.

**Acceptance Scenarios**:

1. **Given** a representative multi-layer page, **When** the creator compares canvas output to exported output, **Then** supported visual properties match within defined parity tolerances.
2. **Given** a change to any supported style property, **When** the creator exports, **Then** the resulting page reflects that change in the same location and hierarchy.
3. **Given** a known unsupported parity case, **When** export is requested, **Then** the system clearly communicates the specific non-parity limitation.

---

### User Story 4 - Design with a More Expressive Color System (Priority: P2)

A creator applies richer color and theme options so both the editor experience and exported pages feel intentional and visually distinctive.

**Why this priority**: Strong visual language improves perceived quality and differentiation after core authoring and parity are in place.

**Independent Test**: Can be tested by applying color tokens and at least one theme preset, then verifying contrast, responsiveness, and consistent token application across editor surfaces and exported pages.

**Acceptance Scenarios**:

1. **Given** the editor shell panels, **When** a theme preset is applied, **Then** layers, canvas, inspector, and status/footer surfaces update consistently using defined color tokens.
2. **Given** content and controls with new color tokens, **When** accessibility checks run, **Then** text and interactive controls meet defined contrast and focus-visibility expectations.
3. **Given** mobile and desktop viewports, **When** the creator uses themed pages, **Then** critical controls remain visible and usable across screen sizes.

### Edge Cases

- Picture layer has missing or invalid image source.
- Header layer contains extremely long text that would overflow narrow containers.
- Columns layer requests extreme column counts or invalid per-column width values.
- Creator enters malformed color values or values outside accepted ranges.
- Creator applies style updates rapidly across multiple selected layers.
- Creator attempts prohibited nesting (for example picture directly under unsupported parents).
- Selected layer is deleted by another editor action while inspector has unsaved input.

## Constitution Alignment *(mandatory)*

- **CA-001 Visual Truth**: Canvas and exported output MUST use equivalent rendering rules for supported layer types and style properties, verified through parity acceptance scenarios.
- **CA-002 Export Artifact Integrity**: ZIP export MUST still include valid static HTML, CSS, and JavaScript with complete references after introducing new layer types.
- **CA-003 Static Portability**: Exported output for all new layer types MUST run as static files in modern browsers without additional tooling.
- **CA-004 Safety by Default**: User-provided text, attributes, and media metadata MUST be validated/sanitized before preview and export.
- **CA-005 Determinism**: Equivalent project state MUST produce equivalent output structure and behavior for the added layer and style capabilities.
- **CA-006 Accessibility & Performance**: New inspector controls and themed surfaces MUST preserve keyboard access, visible focus, and responsive interaction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support layer creation for these types: header, section, text, columns, picture.
- **FR-002**: System MUST define and enforce allowed nesting rules for each supported layer type.
- **FR-003**: System MUST assign sensible defaults when each layer type is created.
- **FR-004**: System MUST support create, rename, reorder, duplicate, and delete operations for all supported layer types.
- **FR-005**: System MUST show layer type labels and distinct type indicators in the layer tree.
- **FR-006**: System MUST provide common inspector fields for applicable layer types: name/id, spacing, alignment, background, visibility, and text color where relevant.
- **FR-007**: System MUST provide header-specific inspector fields: level, text, font weight, font size, and line height.
- **FR-008**: System MUST provide section-specific inspector fields: container width, padding, margin, background style, border, and corner radius.
- **FR-009**: System MUST provide text-specific inspector fields: content, font family, font size, font weight, line height, color, and link options.
- **FR-010**: System MUST provide columns-specific inspector fields: column count, gap, responsive collapse behavior, and per-column width controls.
- **FR-011**: System MUST provide picture-specific inspector fields: image source, alt text, caption, fit mode, focal position, width/height constraints, border, and corner radius.
- **FR-012**: System MUST validate inspector inputs and present user-friendly error states and recovery guidance.
- **FR-013**: System MUST render canvas output using the same structural and style mapping rules used for export generation for supported layer types.
- **FR-014**: System MUST include parity verification scenarios that compare representative canvas output and exported output.
- **FR-015**: System MUST disclose known parity exceptions in user-facing feedback and product documentation.
- **FR-016**: System MUST define and apply a color token system including at least: surface, panel, accent, muted, success, and warning.
- **FR-017**: System MUST apply the color token system consistently across layer panel, canvas panel, inspector panel, and status/footer panel.
- **FR-018**: System MUST provide at least one user-selectable theme preset that affects editor chrome and exported page styling.
- **FR-019**: System MUST preserve readable contrast and visible focus states for text and controls under all provided theme presets.
- **FR-020**: System MUST keep core authoring workflows usable on both desktop and mobile viewport widths.
- **FR-021**: System MUST keep inspector updates and canvas rerenders responsive during normal editing activity.

### Key Entities *(include if feature involves data)*

- **Layer Node**: A page structure item with type, identity metadata, parent relationship, order index, and visibility state.
- **Layer Type Definition**: Rules for each supported layer type, including allowed children, default values, and applicable inspector fields.
- **Inspector Schema**: Contextual field model defining shared and type-specific editable properties, validation rules, and error messages.
- **Render Model**: Canonical representation used to drive both in-editor canvas rendering and export output generation.
- **Theme Token Set**: Named visual tokens for color roles used by editor surfaces and exported pages.
- **Parity Fixture**: A representative page configuration used to verify canvas-to-export visual consistency.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of first-time creators can build and export a page containing header, section, text, columns, and picture layers within 5 minutes.
- **SC-002**: 100% of supported layer types display only type-correct inspector controls during validation scenarios.
- **SC-003**: 95% of predefined parity fixtures pass canvas-to-export visual comparison checks for supported properties.
- **SC-004**: 100% of theme presets meet defined contrast and focus-visibility accessibility checks for core controls.
- **SC-005**: In usability testing, at least 90% of users report that the updated interface feels more visually expressive than the prior baseline.

## Assumptions

- Existing persistence and export workflows remain in scope and are extended rather than replaced.
- The v1 picture layer supports browser-accessible image sources and metadata editing; advanced media processing is out of scope.
- Responsive behavior targets mobile and desktop for core workflows; tablet-specific optimizations can reuse desktop behavior.
- Color tokens and themes are limited to a curated set for consistency and accessibility in this feature.
- Visual parity is evaluated for supported layer types and properties; explicitly documented exceptions are acceptable for unsupported combinations.
