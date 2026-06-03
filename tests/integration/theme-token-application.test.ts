import { describe, it, expect } from 'vitest'
import { THEME_PRESETS, getThemeById, validateThemeTokens, buildThemeStyleTag } from '../../src/lib/domain/project/themeTokens'
import { compileExportStylesheet } from '../../src/lib/services/export/styleCompiler'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeProject(themeId: string): RichProject {
  return {
    id: 'theme-test',
    name: 'Theme Test',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    rootNodeId: 'root',
    theme: { id: themeId, label: themeId },
    assets: {},
    version: 2,
    nodes: {
      root: {
        id: 'root',
        type: 'section',
        parentId: null,
        children: [],
        name: 'Root',
        visible: true,
        style: defaultStyle,
        props: {},
      },
    },
  }
}

describe('Theme token application', () => {
  it('all theme presets are available', () => {
    expect(THEME_PRESETS.length).toBeGreaterThan(0)
    const ids = THEME_PRESETS.map((t) => t.id)
    expect(ids).toContain('default')
    expect(ids).toContain('dark')
  })

  it('each preset has required tokens', () => {
    const required = ['surface', 'panel', 'accent', 'muted', 'success', 'warning']
    for (const theme of THEME_PRESETS) {
      const result = validateThemeTokens(theme)
      expect(result.valid).toBe(true)
      if (!result.valid) {
        console.error(`Theme ${theme.id} missing: ${result.missing.join(', ')}`)
      }
    }
  })

  it('buildThemeStyleTag produces CSS custom properties', () => {
    const theme = getThemeById('default')!
    const styleTag = buildThemeStyleTag(theme.tokens)
    expect(styleTag).toContain(':root')
    expect(styleTag).toContain('--color-surface')
    expect(styleTag).toContain('--color-accent')
  })

  it('dark theme has different surface color from default', () => {
    const defaultTheme = getThemeById('default')!
    const darkTheme = getThemeById('dark')!
    expect(defaultTheme.tokens['surface']).not.toBe(darkTheme.tokens['surface'])
  })

  it('compileExportStylesheet includes theme variables for default theme', () => {
    const project = makeProject('default')
    const css = compileExportStylesheet(project)
    expect(css).toContain(':root')
    expect(css).toContain('--color-surface')
    expect(css).toContain('--color-accent')
  })

  it('compileExportStylesheet uses correct theme for dark preset', () => {
    const project = makeProject('dark')
    const css = compileExportStylesheet(project)
    const darkTheme = getThemeById('dark')!
    expect(css).toContain(darkTheme.tokens['surface'])
  })

  it('compileExportStylesheet includes base CSS reset', () => {
    const project = makeProject('default')
    const css = compileExportStylesheet(project)
    expect(css).toContain('box-sizing: border-box')
    expect(css).toContain('max-width: 100%')
  })

  it('getThemeById returns undefined for unknown id', () => {
    expect(getThemeById('nonexistent-theme')).toBeUndefined()
  })
})
