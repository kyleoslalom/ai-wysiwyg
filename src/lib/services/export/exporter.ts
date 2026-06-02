import { strToU8, zipSync } from 'fflate'
import type { CanvasElement, Project } from '../../domain/types'
import { buildStylesheet, buildInlineStyleText } from '../editor/style-engine'
import { getInteractionPreset } from '../../presets/interactions'

export const EXPORT_ENTRIES = [
  { path: 'index.html', type: 'text/html' },
  { path: 'assets/styles.css', type: 'text/css' },
  { path: 'assets/app.js', type: 'text/javascript' },
  { path: 'manifest.json', type: 'application/json' },
] as const

export interface ExportManifest {
  formatVersion: string
  projectId: string
  generatedAt: string
  entries: Array<{ path: string; type: string }>
}

export interface ExportArtifact {
  manifest: ExportManifest
  html: string
  css: string
  js: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function className(element: CanvasElement): string {
  return element.classList.join(' ')
}

function renderElement(project: Project, nodeId: string): string {
  const node = project.nodes[nodeId]
  if (!node) return ''

  const styles = buildInlineStyleText(node.inlineStyle)
  const styleAttr = styles.length > 0 ? ` style="${escapeHtml(styles)}"` : ''
  const classAttr = node.classList.length > 0 ? ` class="${escapeHtml(className(node))}"` : ''
  const idAttr = ` data-node-id="${escapeHtml(node.id)}"`
  const children = node.children.map((childId) => renderElement(project, childId)).join('')

  if (node.type === 'heading') {
    const text = escapeHtml(String(node.content.text ?? 'Heading'))
    return `<h2${idAttr}${classAttr}${styleAttr}>${text}</h2>`
  }

  if (node.type === 'text') {
    const text = escapeHtml(String(node.content.text ?? ''))
    return `<p${idAttr}${classAttr}${styleAttr}>${text}</p>`
  }

  if (node.type === 'button') {
    const text = escapeHtml(String(node.content.text ?? 'Button'))
    return `<button type="button"${idAttr}${classAttr}${styleAttr}>${text}</button>`
  }

  if (node.type === 'image') {
    const src = escapeHtml(String(node.content.src ?? ''))
    const alt = escapeHtml(String(node.content.alt ?? ''))
    return `<img${idAttr}${classAttr}${styleAttr} src="${src}" alt="${alt}" />`
  }

  return `<section${idAttr}${classAttr}${styleAttr}>${children}</section>`
}

function renderRuntimeScript(project: Project): string {
  const runtimeLines = project.interactions
    .map((binding) => {
      const preset = getInteractionPreset(binding.presetKey)
      if (!preset) return ''

      const selector = `[data-node-id="${binding.elementId}"]`
      const nodeLookup = `document.querySelector(${JSON.stringify(selector)})`
      const actionCode = preset.toRuntime(binding)
      return `(() => { const node = ${nodeLookup}; if (!node) return; node.addEventListener(${JSON.stringify(binding.eventType)}, () => { ${actionCode}; }); })();`
    })
    .filter((line) => line.length > 0)

  return runtimeLines.join('\n')
}

function renderHtml(project: Project): string {
  const rootMarkup = renderElement(project, project.rootNodeId)

  return [
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${escapeHtml(project.name)}</title>`,
    '    <link rel="stylesheet" href="assets/styles.css" />',
    '  </head>',
    '  <body>',
    `    ${rootMarkup}`,
    '    <script src="assets/app.js"></script>',
    '  </body>',
    '</html>',
  ].join('\n')
}

export function buildExportArtifact(
  project: Project,
  options?: { generatedAt?: string },
): ExportArtifact {
  const generatedAt = options?.generatedAt ?? new Date().toISOString()
  const css = buildStylesheet(project)
  const js = renderRuntimeScript(project)
  const html = renderHtml(project)

  return {
    manifest: {
      formatVersion: '1.0.0',
      projectId: project.id,
      generatedAt,
      entries: EXPORT_ENTRIES.map((entry) => ({ ...entry })),
    },
    html,
    css,
    js,
  }
}

export function exportProjectZip(
  project: Project,
  options?: { generatedAt?: string },
): Uint8Array {
  const artifact = buildExportArtifact(project, options)

  const archive = zipSync({
    'index.html': strToU8(artifact.html),
    'assets/styles.css': strToU8(artifact.css),
    'assets/app.js': strToU8(artifact.js),
    'manifest.json': strToU8(JSON.stringify(artifact.manifest, null, 2)),
  })

  return archive
}
