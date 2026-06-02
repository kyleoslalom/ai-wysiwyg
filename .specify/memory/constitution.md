<!--
Sync Impact Report
Version change: template-placeholder -> 1.0.0
Modified principles:
- template principle 1 -> I. Visual Truth First
- template principle 2 -> II. Export Is the Product
- template principle 3 -> III. Standards Over Lock-In
- template principle 4 -> IV. Human-Readable Output
- template principle 5 -> V. Safe by Default
Added principles:
- VI. Deterministic Builds
- VII. Progressive Capability
- VIII. Browser-Native Experience
Added sections:
- Non-Negotiable Outcomes
- Definition of Done for Major Features
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ⚠ pending: .specify/templates/commands/*.md (directory does not exist in this repository)
Follow-up TODOs:
- None
-->

# ai-wysiwyg Constitution

## Core Principles

### I. Visual Truth First
The canvas MUST faithfully represent final output behavior and structure. A user action that
appears correct in the editor MUST produce equivalent rendered output after export. This keeps
authoring trust high and prevents hidden runtime surprises.

### II. Export Is the Product
The primary deliverable MUST be a reliable ZIP package containing static HTML, CSS, and
JavaScript. Editor-only capabilities that do not improve export quality, integrity, or
usability MUST NOT take priority over export outcomes.

### III. Standards Over Lock-In
Generated output MUST use open web standards and remain portable across common static hosts.
Exported projects MUST run in modern browsers without a build step, proprietary runtime, or
server-side dependency.

### IV. Human-Readable Output
Export artifacts MUST be understandable by humans and maintainable by downstream developers.
File structure, naming, and formatting MUST favor clear handoff, debugging, and direct editing.

### V. Safe by Default
The editor and export pipeline MUST apply secure defaults. Unsafe script injection patterns,
untrusted content execution paths, and export-time code assembly that increases obvious XSS risk
MUST be blocked or sanitized.

### VI. Deterministic Builds
The same saved project state MUST produce the same export bundle contents across supported
browsers. Any non-deterministic behavior in output ordering, naming, or generated code MUST be
treated as a defect.

### VII. Progressive Capability
Core editing and export workflows MUST remain stable and performant before advanced features are
added. New complexity MUST be introduced only when it does not compromise baseline authoring,
preview, or export reliability.

### VIII. Browser-Native Experience
The product MUST run fully in-browser and provide accessible interactions on modern desktop and
mobile browsers. Feature design MUST preserve usability for keyboard, pointer, and touch input.

## Non-Negotiable Outcomes

- Users MUST be able to create or modify page layout, style, and behavior visually.
- Users MUST be able to export a ZIP containing at least one HTML file, one CSS file, and one
	JavaScript file.
- Exported artifacts MUST run statically in a browser without a build step.
- Exported projects MUST be portable to common static hosting providers.
- Core workflows MUST remain accessible and performant for normal project sizes.

## Definition of Done for Major Features

- Feature behavior MUST be correct both in-editor and in exported output.
- Exported code MUST remain standards-compliant and human-readable.
- Regression tests MUST cover rendering parity and export integrity.
- Security and accessibility checks MUST pass for affected workflows.
- Documentation MUST explain user-visible behavior and export impact.

## Governance

This constitution supersedes conflicting local conventions for feature planning and delivery.
Amendments require: (1) a written rationale, (2) explicit updates to affected templates and
guidance files, and (3) approval in the same change set as the constitution edit.

Versioning policy follows semantic versioning:
- MAJOR for backward-incompatible principle removals or redefinitions.
- MINOR for new principles or materially expanded governance sections.
- PATCH for clarifications, wording refinements, and typo-level edits.

Compliance review expectations:
- Every plan MUST complete a constitution check before research and after design.
- Every feature spec MUST document visual/export parity requirements and measurable outcomes.
- Every task list MUST include validation work for export integrity, accessibility, and security.
- Pull requests that violate constitutional requirements MUST include a documented exception and
	mitigation plan or be rejected.

**Version**: 1.0.0 | **Ratified**: 2026-06-02 | **Last Amended**: 2026-06-02
