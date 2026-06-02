import { describe, it, expect } from 'vitest'
import { parseColor, isValidColor, toHex, checkContrast } from '../../../src/lib/services/a11y/colorContrast'
import { THEME_PRESETS } from '../../../src/lib/domain/project/themeTokens'

describe('Color parsing and contrast', () => {
  it('parses valid hex color', () => {
    expect(parseColor('#1f2937')).toBe('#1f2937')
  })

  it('parses rgb color to hex', () => {
    const result = parseColor('rgb(31, 41, 55)')
    expect(result).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('returns null for invalid color', () => {
    expect(parseColor('not-a-color')).toBeNull()
    expect(parseColor('')).toBeNull()
  })

  it('isValidColor returns true for valid colors', () => {
    expect(isValidColor('#ffffff')).toBe(true)
    expect(isValidColor('#000000')).toBe(true)
    expect(isValidColor('rgb(0, 0, 0)')).toBe(true)
    expect(isValidColor('hsl(0, 0%, 0%)')).toBe(true)
  })

  it('isValidColor returns false for invalid colors', () => {
    expect(isValidColor('not-valid')).toBe(false)
    expect(isValidColor('')).toBe(false)
  })

  it('toHex converts rgb to hex', () => {
    const hex = toHex('rgb(255, 255, 255)')
    expect(hex).toBe('#ffffff')
  })

  it('checkContrast returns ratio for black/white', () => {
    const result = checkContrast('#000000', '#ffffff')
    expect(result.ratio).toBeGreaterThanOrEqual(21)
    expect(result.passesAA).toBe(true)
    expect(result.passesAAA).toBe(true)
    expect(result.passesAALarge).toBe(true)
  })

  it('checkContrast identifies low contrast pairs', () => {
    const result = checkContrast('#cccccc', '#ffffff')
    expect(result.ratio).toBeLessThan(4.5)
    expect(result.passesAA).toBe(false)
  })

  it('default theme accent passes AA large text contrast on surface', () => {
    const defaultTheme = THEME_PRESETS.find((t) => t.id === 'default')!
    const result = checkContrast(defaultTheme.tokens['accent']!, defaultTheme.tokens['surface']!)
    expect(result.passesAALarge).toBe(true)
  })

  it('dark theme text passes AA contrast on dark surface', () => {
    const darkTheme = THEME_PRESETS.find((t) => t.id === 'dark')!
    const result = checkContrast(darkTheme.tokens['text']!, darkTheme.tokens['surface']!)
    expect(result.ratio).toBeGreaterThan(4)
  })
})
