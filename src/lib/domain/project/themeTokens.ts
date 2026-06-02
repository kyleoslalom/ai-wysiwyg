export interface ThemeTokenSet {
  id: string
  label: string
  tokens: Record<string, string>
  contrastReport?: Record<string, unknown>
}

const REQUIRED_TOKENS = ['surface', 'panel', 'accent', 'muted', 'success', 'warning'] as const
type RequiredToken = (typeof REQUIRED_TOKENS)[number]

export const THEME_PRESETS: ThemeTokenSet[] = [
  {
    id: 'default',
    label: 'Default',
    tokens: {
      surface: '#ffffff',
      panel: '#f9fafb',
      accent: '#2563eb',
      muted: '#6b7280',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      text: '#1f2937',
      textMuted: '#6b7280',
      border: '#d1d5db',
      focus: '#3b82f6',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    tokens: {
      surface: '#1f2937',
      panel: '#111827',
      accent: '#3b82f6',
      muted: '#9ca3af',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      text: '#f9fafb',
      textMuted: '#9ca3af',
      border: '#374151',
      focus: '#60a5fa',
    },
  },
  {
    id: 'warm',
    label: 'Warm',
    tokens: {
      surface: '#fffbf5',
      panel: '#fef3e2',
      accent: '#ea580c',
      muted: '#92400e',
      success: '#16a34a',
      warning: '#b45309',
      error: '#dc2626',
      text: '#1c1917',
      textMuted: '#78716c',
      border: '#d6d3d1',
      focus: '#f97316',
    },
  },
  {
    id: 'cool',
    label: 'Cool',
    tokens: {
      surface: '#f0f9ff',
      panel: '#e0f2fe',
      accent: '#0284c7',
      muted: '#475569',
      success: '#15803d',
      warning: '#b45309',
      error: '#be123c',
      text: '#0c4a6e',
      textMuted: '#64748b',
      border: '#bae6fd',
      focus: '#0ea5e9',
    },
  },
]

export function getThemeById(id: string): ThemeTokenSet | undefined {
  return THEME_PRESETS.find((t) => t.id === id)
}

export function getDefaultTheme(): ThemeTokenSet {
  return THEME_PRESETS[0]!
}

export function validateThemeTokens(theme: ThemeTokenSet): { valid: boolean; missing: string[] } {
  const missing = REQUIRED_TOKENS.filter((key) => !theme.tokens[key as RequiredToken])
  return { valid: missing.length === 0, missing }
}

export function buildCssVariables(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n  ')
}

export function buildThemeStyleTag(tokens: Record<string, string>): string {
  const vars = buildCssVariables(tokens)
  return `:root {\n  ${vars}\n}`
}
