import { describe, it, expect } from 'vitest'
import {
  normalizeColumnWidths,
  applyColumnCount,
  getColumnsBreakpointDefault,
  validateColumnWidths,
} from '../../../src/lib/services/editor/columnsLayout'

describe('Column width normalization', () => {
  it('normalizes widths that do not sum to 100', () => {
    const input = [30, 40, 20] // sum = 90
    const normalized = normalizeColumnWidths(input)
    const sum = normalized.reduce((acc, v) => acc + v, 0)
    expect(Math.abs(sum - 100)).toBeLessThan(0.01)
  })

  it('preserves widths that already sum to 100', () => {
    const input = [25, 25, 25, 25]
    const normalized = normalizeColumnWidths(input)
    const sum = normalized.reduce((acc, v) => acc + v, 0)
    expect(Math.abs(sum - 100)).toBeLessThan(0.01)
    expect(normalized.length).toBe(4)
  })

  it('handles single-column normalization', () => {
    const normalized = normalizeColumnWidths([80])
    expect(Math.abs(normalized[0]! - 100)).toBeLessThan(0.01)
  })

  it('generates equal widths for new column count', () => {
    const widths = applyColumnCount(3)
    expect(widths.length).toBe(3)
    widths.forEach((w) => expect(Math.abs(w - 33.333)).toBeLessThan(0.01))
  })

  it('adjusts existing widths when column count changes', () => {
    const result = applyColumnCount(4, [50, 50])
    expect(result.length).toBe(4)
    const sum = result.reduce((acc, v) => acc + v, 0)
    expect(Math.abs(sum - 100)).toBeLessThan(0.01)
  })

  it('default collapse breakpoint is 768', () => {
    expect(getColumnsBreakpointDefault()).toBe(768)
  })

  it('validateColumnWidths returns no error when sum is 100', () => {
    const result = validateColumnWidths([50, 50])
    expect(result.valid).toBe(true)
    expect(result.notice).toBeUndefined()
  })

  it('validateColumnWidths returns notice when sum is not 100', () => {
    const result = validateColumnWidths([40, 40])
    expect(result.valid).toBe(false)
    expect(result.notice).toBeDefined()
    expect(result.notice).toContain('100')
  })

  it('rejects column count below 1 or above 6', () => {
    expect(() => applyColumnCount(0)).toThrow()
    expect(() => applyColumnCount(7)).toThrow()
  })
})
