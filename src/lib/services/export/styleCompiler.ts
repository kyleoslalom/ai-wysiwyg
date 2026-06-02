import type { RichProject } from '../../domain/schemas/projectSchema'
import { getThemeById, getDefaultTheme, buildThemeStyleTag } from '../../domain/project/themeTokens'

const BASE_CSS = `
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; }
section { width: 100%; }
.columns-layout { display: grid; }
img { max-width: 100%; height: auto; }
figure { margin: 0; }
figcaption { font-size: 0.875rem; color: var(--color-textMuted, #6b7280); margin-top: 0.25rem; }
h1, h2, h3, h4, h5, h6 { margin: 0 0 0.5rem; }
p { margin: 0 0 1rem; }
`.trim()

export function compileExportStylesheet(project: RichProject): string {
  const themeId = project.theme?.id ?? 'default'
  const theme = getThemeById(themeId) ?? getDefaultTheme()
  const themeVars = buildThemeStyleTag(theme.tokens)

  return [themeVars, '', BASE_CSS].join('\n')
}
