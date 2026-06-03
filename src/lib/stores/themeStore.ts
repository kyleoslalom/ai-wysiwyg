import { writable, derived } from 'svelte/store'
import { THEME_PRESETS, getThemeById, getDefaultTheme } from '../domain/project/themeTokens'
import type { ThemeTokenSet } from '../domain/project/themeTokens'

const THEME_STORAGE_KEY = 'ai-wysiwyg-theme'

function loadPersistedThemeId(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistThemeId(id: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id)
  } catch {
    // Ignore storage errors
  }
}

const defaultTheme = getDefaultTheme()
const persistedId = loadPersistedThemeId()
const initialTheme = persistedId ? (getThemeById(persistedId) ?? defaultTheme) : defaultTheme

export const activeThemeStore = writable<ThemeTokenSet>(initialTheme)

export const activeThemeTokensStore = derived(activeThemeStore, ($theme) => $theme.tokens)

export const availableThemesStore = writable<ThemeTokenSet[]>(THEME_PRESETS)

const CANVAS_TOKEN_KEYS = ['canvas-bg', 'canvas-text', 'surface', 'panel', 'muted', 'accent', 'text', 'textMuted', 'border', 'focus'] as const

const SAFE_FALLBACKS: Record<string, string> = {
  'canvas-bg': '#ffffff',
  'canvas-text': '#1f2937',
  surface: '#ffffff',
  panel: '#f9fafb',
  muted: '#9ca3af',
  accent: '#2563eb',
  text: '#1f2937',
  border: '#d1d5db',
  focus: '#3b82f6',
}

export function selectTheme(themeId: string): void {
  const theme = getThemeById(themeId)
  if (!theme) return
  activeThemeStore.set(theme)
  persistThemeId(themeId)
}

export function applyThemeToDom(tokens: Record<string, string>): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // Apply all defined tokens
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--color-${key}`, value)
  }
  // Apply fallbacks for any missing canvas-relevant tokens
  for (const key of CANVAS_TOKEN_KEYS) {
    const cssVar = `--color-${key}`
    if (!root.style.getPropertyValue(cssVar) && SAFE_FALLBACKS[key]) {
      root.style.setProperty(cssVar, SAFE_FALLBACKS[key])
      console.warn(`[themeStore] Token "${key}" missing in active theme; using fallback "${SAFE_FALLBACKS[key]}"`)
    }
  }
}
