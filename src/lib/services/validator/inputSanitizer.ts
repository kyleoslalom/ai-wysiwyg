import DOMPurify from 'dompurify'

function stripAllHtml(input: string): string {
  // Remove all HTML by iterating until no more tags remain (handles malformed/nested tags)
  let result = input
  let prev = ''
  while (result !== prev) {
    prev = result
    result = result.replace(/<[^>]*>/g, '')
  }
  // Remove any stray angle brackets that could be used to reconstruct tags
  return result.replace(/[<>]/g, '').trim()
}

export function sanitizeRichText(input: string): string {
  if (typeof window === 'undefined') {
    return stripAllHtml(input)
  }
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}

export function sanitizePlainText(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}

export function sanitizeUrl(href: string): string {
  const trimmed = href.trim()
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) {
    return ''
  }
  return trimmed
}

export function sanitizeAltText(input: string): string {
  return sanitizePlainText(input)
}

export function sanitizeCaption(input: string): string {
  if (typeof window === 'undefined') {
    return stripAllHtml(input)
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  }).trim()
}

export function sanitizeLayerName(input: string): string {
  return input.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 120).trim()
}

export function sanitizeCssValue(value: string): string {
  if (/expression\s*\(/i.test(value) || /javascript:/i.test(value)) {
    return ''
  }
  return value.trim()
}
