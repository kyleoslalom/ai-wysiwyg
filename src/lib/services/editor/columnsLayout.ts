const MIN_COLUMNS = 1
const MAX_COLUMNS = 6

export const DEFAULT_COLLAPSE_BREAKPOINT = 768

export function getColumnsBreakpointDefault(): number {
  return DEFAULT_COLLAPSE_BREAKPOINT
}

export function normalizeColumnWidths(widths: number[]): number[] {
  if (widths.length === 0) return []
  const sum = widths.reduce((acc, v) => acc + v, 0)
  if (sum === 0) {
    const equal = 100 / widths.length
    return widths.map(() => equal)
  }
  return widths.map((w) => (w / sum) * 100)
}

export function applyColumnCount(count: number, existingWidths?: number[]): number[] {
  if (count < MIN_COLUMNS || count > MAX_COLUMNS) {
    throw new RangeError(`Column count must be between ${MIN_COLUMNS} and ${MAX_COLUMNS}`)
  }

  if (!existingWidths || existingWidths.length === 0) {
    const equal = 100 / count
    return Array.from({ length: count }, () => equal)
  }

  if (existingWidths.length === count) {
    return normalizeColumnWidths(existingWidths)
  }

  // Add or remove columns, distribute evenly and normalize
  const base = Array.from({ length: count }, (_, i) => existingWidths[i] ?? (100 / count))
  return normalizeColumnWidths(base)
}

export interface WidthValidationResult {
  valid: boolean
  notice?: string
  normalized?: number[]
}

export function validateColumnWidths(widths: number[]): WidthValidationResult {
  if (widths.length === 0) {
    return { valid: false, notice: 'At least one column width is required' }
  }

  const sum = widths.reduce((acc, v) => acc + v, 0)
  const deviation = Math.abs(sum - 100)

  if (deviation > 0.01) {
    return {
      valid: false,
      notice: `Column widths sum to ${sum.toFixed(1)}%. They will be auto-normalized to total 100%.`,
      normalized: normalizeColumnWidths(widths),
    }
  }

  return { valid: true }
}

export function buildColumnsResponsiveStyle(
  count: number,
  gap: string,
  widths?: number[],
): Record<string, string> {
  if (widths && widths.length === count) {
    const templateColumns = widths.map((w) => `${w.toFixed(2)}%`).join(' ')
    return {
      display: 'grid',
      gridTemplateColumns: templateColumns,
      gap,
    }
  }

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${count}, 1fr)`,
    gap,
  }
}
