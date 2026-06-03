# Research: Richer Page Builder

## Decision 1: Keep current client-only architecture
- Decision: Implement the richer page builder in the existing Svelte client app with no backend additions.
- Rationale: Matches repository architecture, preserves static portability, and avoids introducing non-essential infrastructure.
- Alternatives considered:
  - Add backend media processing pipeline: rejected for scope and portability risk.
  - Add cloud asset hosting dependency: rejected because v1 requires deterministic local export assets.

## Decision 2: Extend existing domain model with explicit layer-type contracts
- Decision: Add strict layer type definitions and nesting policy in domain schemas and validators.
- Rationale: Enforces clarified requirements (`root -> section`, `section -> header|text|columns|picture`) and reduces runtime inconsistency.
- Alternatives considered:
  - Free-form tree with UI-only guardrails: rejected because export parity would be harder to guarantee.
  - Hard-coded checks only in component layer: rejected because business rules belong in domain/service layer.

## Decision 3: Use contextual inspector schema map
- Decision: Model inspector fields as shared + per-type schema sets, with validation and coercion rules.
- Rationale: Supports type-aware rendering and testable behavior for FR-006 through FR-012.
- Alternatives considered:
  - Single monolithic form with hide/show conditions: rejected due to complexity and error-prone state handling.
  - Independent hand-built forms without schema abstraction: rejected because validation drift risk is high.

## Decision 4: Add sanitization library where value is substantial
- Decision: Introduce DOMPurify for user-editable text and rich attribute sanitization before preview/export serialization.
- Rationale: Substantial security benefit for text/link/caption inputs with minimal code and maintenance overhead.
- Alternatives considered:
  - Custom sanitization logic: rejected due to security maintenance burden.
  - No sanitization (escape only): rejected because requirement includes safe-by-default behavior.

## Decision 5: Add color utility library where value is substantial
- Decision: Introduce colord for token parsing, normalization, and contrast checks.
- Rationale: Enables deterministic color validation and WCAG-oriented checks with less custom logic.
- Alternatives considered:
  - Regex-only color validation: rejected due to limited correctness and readability.
  - Manual contrast math utilities: rejected because tested library support is lower risk.

## Decision 6: Shared render model for canvas/export parity
- Decision: Use a single canonical render transform that feeds both canvas rendering and export serialization.
- Rationale: Directly satisfies visual truth requirements and prevents drift between editor and exported output.
- Alternatives considered:
  - Separate canvas and export mappers: rejected due to parity regression risk.
  - Export-from-DOM scraping: rejected because deterministic behavior and contract control are weaker.

## Decision 7: Embedded image asset strategy
- Decision: Store image assets in project payload, emit to canonical export paths (`assets/images/*`) in deterministic order.
- Rationale: Aligns with accepted clarification and ensures offline/static portability.
- Alternatives considered:
  - External URL references: rejected by clarification and portability concerns.
  - Inline base64-only output: rejected due to output readability/size concerns.

## Decision 8: Columns behavior defaults and normalization
- Decision: Set default collapse breakpoint to `< 768px` and auto-normalize manual width edits to total 100%.
- Rationale: Delivers predictable responsive output and avoids broken layouts from invalid sums.
- Alternatives considered:
  - Reject non-100% inputs: rejected as too rigid for authoring flow.
  - Accept invalid totals and rely on CSS behavior: rejected due to unpredictable export parity.

## Decision 9: Parity verification strategy with strict tolerance
- Decision: Enforce parity gates using DOM structure equality plus <=1% visual diff for supported fixture pages.
- Rationale: Balances deterministic quality with practical browser rendering variability.
- Alternatives considered:
  - Pixel-perfect only: rejected because too brittle across environments.
  - DOM-only checks: rejected as insufficient for visual truth.

## Decision 10: Testing approach and library additions
- Decision: Continue Vitest/Testing Library/Playwright baseline and add pixelmatch (+pngjs) only for fixture visual diff calculations where needed.
- Rationale: Reuses existing test stack while adding only targeted capability for strict parity assertions.
- Alternatives considered:
  - Add full visual-regression SaaS/toolchain: rejected as heavyweight for current repo scope.
  - Manual screenshot review process: rejected because it is non-deterministic and not CI-friendly.
