const ALLOWED_STYLE_PROPS = new Set([
  'color',
  'backgroundColor',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'margin',
  'padding',
  'display',
  'width',
  'height',
  'textAlign',
])

export function sanitizeText(input: string): string {
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim()
}

export function sanitizeClassList(classes: string[]): string[] {
  return classes
    .map((name) => name.trim())
    .filter((name) => /^[a-zA-Z0-9_-]+$/.test(name))
}

export function sanitizeStyle(style: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(style)) {
    if (ALLOWED_STYLE_PROPS.has(key) && typeof value === 'string') {
      out[key] = value.trim()
    }
  }
  return out
}
