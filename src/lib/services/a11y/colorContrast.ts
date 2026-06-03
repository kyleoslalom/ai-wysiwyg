import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'

extend([a11yPlugin])

export interface ContrastResult {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
  passesAALarge: boolean
}

export function parseColor(input: string): string | null {
  try {
    const color = colord(input)
    if (!color.isValid()) return null
    return color.toHex()
  } catch {
    return null
  }
}

export function isValidColor(input: string): boolean {
  try {
    return colord(input).isValid()
  } catch {
    return false
  }
}

export function toHex(input: string): string | null {
  try {
    const color = colord(input)
    if (!color.isValid()) return null
    return color.toHex()
  } catch {
    return null
  }
}

export function checkContrast(foreground: string, background: string): ContrastResult {
  const fg = colord(foreground)
  const bg = colord(background)

  const ratio = fg.contrast(bg)

  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
    passesAALarge: ratio >= 3,
  }
}

export function lighten(input: string, amount: number): string | null {
  try {
    const color = colord(input)
    if (!color.isValid()) return null
    return color.lighten(amount).toHex()
  } catch {
    return null
  }
}

export function darken(input: string, amount: number): string | null {
  try {
    const color = colord(input)
    if (!color.isValid()) return null
    return color.darken(amount).toHex()
  } catch {
    return null
  }
}
