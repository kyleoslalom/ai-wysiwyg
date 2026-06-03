import { strToU8, zipSync } from 'fflate'
import type { RichProject } from '../../domain/schemas/projectSchema'
import { buildRenderModel } from '../editor/renderModel'
import type { RenderNode } from '../editor/renderModel'
import { buildStylesheet } from '../editor/style-engine'
import { emitAssets, base64ToUint8Array } from './assetEmitter'

export const RICH_EXPORT_ENTRIES = [
  { path: 'index.html', type: 'text/html' },
  { path: 'assets/styles.css', type: 'text/css' },
  { path: 'manifest.json', type: 'application/json' },
] as const

export interface RichExportManifest {
  formatVersion: string
  projectId: string
  generatedAt: string
  entries: Array<{ path: string; type: string }>
}

export interface RichExportArtifact {
  manifest: RichExportManifest
  html: string
  css: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderRichNode(node: RenderNode): string {
  if (!node.visible) return ''

  const idAttr = ` data-node-id="${escapeHtml(node.id)}"`
  const styleAttr = buildNodeStyleAttr(node)

  if (node.type === 'section') {
    const children = node.children.map(renderRichNode).join('')
    return `<section${idAttr}${styleAttr}>${children}</section>`
  }

  if (node.type === 'header') {
    const p = node.props as { level: string; text: string }
    const level = p.level ?? 'h2'
    const text = escapeHtml(p.text ?? '')
    return `<${level}${idAttr}${styleAttr}>${text}</${level}>`
  }

  if (node.type === 'text') {
    const p = node.props as { content: string; href?: string; linkTarget?: string }
    const content = escapeHtml(p.content ?? '')
    if (p.href) {
      const target = p.linkTarget ? ` target="${escapeHtml(p.linkTarget)}"` : ''
      return `<p${idAttr}${styleAttr}><a href="${escapeHtml(p.href)}"${target}>${content}</a></p>`
    }
    return `<p${idAttr}${styleAttr}>${content}</p>`
  }

  if (node.type === 'columns') {
    const p = node.props as { columnCount: number; gap: string; widths: number[] }
    const gridStyle = buildColumnsGridStyle(p)
    const mediaQuery = buildColumnsMediaQuery(node.id)
    const slots = Array.from({ length: p.columnCount }, (_, i) =>
      `<div class="col-slot" data-col="${i + 1}"></div>`,
    ).join('')
    return `${mediaQuery}<div${idAttr} class="columns-layout" style="${escapeHtml(gridStyle)}">${slots}</div>`
  }

  if (node.type === 'picture') {
    const p = node.props as { src: string; alt: string; caption?: string }
    const src = p.src.startsWith('data:') ? p.src : escapeHtml(p.src)
    const alt = escapeHtml(p.alt ?? '')
    const imgTag = `<img src="${src}" alt="${alt}" />`
    if (p.caption) {
      return `<figure${idAttr}${styleAttr}>${imgTag}<figcaption>${escapeHtml(p.caption)}</figcaption></figure>`
    }
    return `<figure${idAttr}${styleAttr}>${imgTag}</figure>`
  }

  return ''
}

function buildNodeStyleAttr(node: RenderNode): string {
  const parts: string[] = []
  const { spacing, alignment, background, textColor } = node.style

  if (textColor) parts.push(`color: ${textColor}`)
  if (spacing['padding']) parts.push(`padding: ${spacing['padding']}`)
  if (spacing['margin']) parts.push(`margin: ${spacing['margin']}`)
  if (background['backgroundColor']) parts.push(`background-color: ${background['backgroundColor']}`)

  return parts.length > 0 ? ` style="${escapeHtml(parts.join('; '))}"` : ''
}

function buildColumnsGridStyle(p: { gap: string; widths?: number[] }): string {
  const grid = p.widths && p.widths.length > 0
    ? p.widths.map((w) => `${w.toFixed(2)}%`).join(' ')
    : 'repeat(auto-fit, 1fr)'
  return `display: grid; grid-template-columns: ${grid}; gap: ${p.gap}`
}

function buildColumnsMediaQuery(nodeId: string): string {
  return `<style>@media (max-width: 768px) { [data-node-id="${nodeId}"].columns-layout { grid-template-columns: 1fr; } }</style>`
}

function buildRichHtml(project: RichProject, renderModel: ReturnType<typeof buildRenderModel>): string {
  const rootMarkup = renderRichNode(renderModel.tree)

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
    '  </body>',
    '</html>',
  ].join('\n')
}

export function buildRichExportArtifact(
  project: RichProject,
  options?: { generatedAt?: string },
): RichExportArtifact {
  const generatedAt = options?.generatedAt ?? new Date().toISOString()
  const renderModel = buildRenderModel(project)
  const html = buildRichHtml(project, renderModel)

  const assetEntries = emitAssets(project).map((a) => ({ path: a.path, type: a.mimeType }))
  const allEntries = [...RICH_EXPORT_ENTRIES.map((e) => ({ ...e })), ...assetEntries]

  const css = ''

  return {
    manifest: {
      formatVersion: '2.0.0',
      projectId: project.id,
      generatedAt,
      entries: allEntries,
    },
    html,
    css,
  }
}

export function exportRichProjectZip(
  project: RichProject,
  options?: { generatedAt?: string },
): Uint8Array {
  const artifact = buildRichExportArtifact(project, options)
  const assets = emitAssets(project)

  const files: Record<string, Uint8Array> = {
    'index.html': strToU8(artifact.html),
    'assets/styles.css': strToU8(artifact.css),
    'manifest.json': strToU8(JSON.stringify(artifact.manifest, null, 2)),
  }

  for (const asset of assets) {
    try {
      files[asset.path] = base64ToUint8Array(asset.bytes)
    } catch {
      files[asset.path] = strToU8(asset.bytes)
    }
  }

  return zipSync(files)
}
