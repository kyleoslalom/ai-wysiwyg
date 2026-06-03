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

export function selectTheme(themeId: string): void {
  const theme = getThemeById(themeId)
  if (!theme) return
  activeThemeStore.set(theme)
  persistThemeId(themeId)
}

export function applyThemeToDom(tokens: Record<string, string>): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--color-${key}`, value)
  }
}
