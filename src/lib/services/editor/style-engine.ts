import type { Project, StyleRule } from '../../domain/types'

function toKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
}

export function buildInlineStyleText(style?: Record<string, string>): string {
  if (!style) return ''
  return Object.entries(style)
    .map(([key, value]) => `${toKebabCase(key)}: ${value}`)
    .join('; ')
}

export function styleRuleToCss(rule: StyleRule): string {
  const declarations = Object.entries(rule.declarations)
    .map(([key, value]) => `  ${toKebabCase(key)}: ${value};`)
    .join('\n')

  return `${rule.selector} {\n${declarations}\n}`
}

export function buildStylesheet(project: Project): string {
  return Object.values(project.styles)
    .sort((a, b) => a.order - b.order)
    .map((rule) => styleRuleToCss(rule))
    .join('\n\n')
}
