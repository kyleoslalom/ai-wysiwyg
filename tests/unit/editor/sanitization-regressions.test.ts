import { describe, it, expect } from 'vitest'
import {
  sanitizeRichText,
  sanitizePlainText,
  sanitizeUrl,
  sanitizeAltText,
  sanitizeLayerName,
  sanitizeCssValue,
} from '../../../src/lib/services/validator/inputSanitizer'

describe('Sanitization security regressions', () => {
  it('sanitizeRichText strips script tags', () => {
    const input = 'Hello <script>alert("xss")</script> world'
    const result = sanitizeRichText(input)
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('Hello')
  })

  it('sanitizePlainText strips control characters', () => {
    const input = 'Hello\x00World\x1F'
    const result = sanitizePlainText(input)
    expect(result).not.toContain('\x00')
    expect(result).not.toContain('\x1F')
    expect(result).toBe('HelloWorld')
  })

  it('sanitizeUrl blocks javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('')
  })

  it('sanitizeUrl blocks data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
  })

  it('sanitizeUrl allows legitimate URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
    expect(sanitizeUrl('/relative/path')).toBe('/relative/path')
    expect(sanitizeUrl('#anchor')).toBe('#anchor')
  })

  it('sanitizeAltText removes null bytes', () => {
    const result = sanitizeAltText('alt text\x00extra')
    expect(result).not.toContain('\x00')
    expect(result).toContain('alt text')
  })

  it('sanitizeLayerName truncates to 120 chars', () => {
    const long = 'a'.repeat(200)
    const result = sanitizeLayerName(long)
    expect(result.length).toBeLessThanOrEqual(120)
  })

  it('sanitizeLayerName strips control characters', () => {
    const result = sanitizeLayerName('Layer\x00Name\x1F')
    expect(result).toBe('LayerName')
  })

  it('sanitizeCssValue blocks expression() attacks', () => {
    expect(sanitizeCssValue('expression(alert(1))')).toBe('')
    expect(sanitizeCssValue('EXPRESSION(evil)')).toBe('')
  })

  it('sanitizeCssValue blocks javascript: in CSS', () => {
    expect(sanitizeCssValue('url(javascript:evil)')).toBe('')
  })

  it('sanitizeCssValue allows legitimate CSS values', () => {
    expect(sanitizeCssValue('1rem')).toBe('1rem')
    expect(sanitizeCssValue('#ff0000')).toBe('#ff0000')
    expect(sanitizeCssValue('16px 24px')).toBe('16px 24px')
  })

  it('sanitizeRichText handles empty input', () => {
    expect(sanitizeRichText('')).toBe('')
  })

  it('sanitizePlainText trims whitespace', () => {
    expect(sanitizePlainText('  hello  ')).toBe('hello')
  })
})
