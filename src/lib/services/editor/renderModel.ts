import type { LayerNode, LayerStyle } from '../../domain/schemas/layerNodeSchema'
import type { RichProject } from '../../domain/schemas/projectSchema'

export type RenderNodeType =
  | 'section'
  | 'header'
  | 'text'
  | 'columns'
  | 'picture'

export interface RenderStyle {
  spacing: Record<string, string>
  alignment: Record<string, string>
  background: Record<string, string>
  textColor?: string | null
}

export interface HeaderRenderProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text: string
}

export interface TextRenderProps {
  content: string
  href?: string
  linkTarget?: string
}

export interface ColumnsRenderProps {
  columnCount: number
  gap: string
  collapseBreakpointPx: number
  widths: number[]
}

export interface PictureRenderProps {
  src: string
  alt: string
  caption?: string
}

export interface SectionRenderProps {
  [key: string]: unknown
}

export type RenderNodeProps =
  | HeaderRenderProps
  | TextRenderProps
  | ColumnsRenderProps
  | PictureRenderProps
  | SectionRenderProps

export interface RenderNode {
  id: string
  type: RenderNodeType
  visible: boolean
  style: RenderStyle
  props: RenderNodeProps
  children: RenderNode[]
}

export interface RenderModel {
  projectId: string
  rootId: string
  tree: RenderNode
}

function styleToRender(style: LayerStyle): RenderStyle {
  return {
    spacing: { ...style.spacing },
    alignment: { ...style.alignment },
    background: { ...style.background },
    textColor: style.textColor,
  }
}

function nodeToRenderNode(
  node: LayerNode,
  nodes: Record<string, LayerNode>,
  assets: RichProject['assets'],
  visited: Set<string>,
): RenderNode {
  if (visited.has(node.id)) {
    return {
      id: node.id,
      type: node.type as RenderNodeType,
      visible: node.visible,
      style: styleToRender(node.style),
      props: {},
      children: [],
    }
  }
  visited.add(node.id)

  const children = node.children
    .map((childId) => {
      const child = nodes[childId]
      if (!child) return null
      return nodeToRenderNode(child, nodes, assets, visited)
    })
    .filter((c): c is RenderNode => c !== null)

  let props: RenderNodeProps = {}

  if (node.type === 'header') {
    const p = node.props as { headerLevel?: string; text?: string }
    props = {
      level: (p.headerLevel as HeaderRenderProps['level']) ?? 'h2',
      text: p.text ?? '',
    } satisfies HeaderRenderProps
  } else if (node.type === 'text') {
    const p = node.props as { content?: string; link?: { href?: string; target?: string } | null }
    props = {
      content: p.content ?? '',
      href: p.link?.href,
      linkTarget: p.link?.target,
    } satisfies TextRenderProps
  } else if (node.type === 'columns') {
    const p = node.props as {
      columnCount?: number
      gap?: string
      collapseBreakpointPx?: number
      normalizedWidths?: number[] | null
      manualWidths?: number[] | null
    }
    const count = p.columnCount ?? 1
    const widths = p.normalizedWidths ?? p.manualWidths ?? Array<number>(count).fill(100 / count)
    props = {
      columnCount: count,
      gap: p.gap ?? '1rem',
      collapseBreakpointPx: p.collapseBreakpointPx ?? 768,
      widths,
    } satisfies ColumnsRenderProps
  } else if (node.type === 'picture') {
    const p = node.props as { assetRef?: string; alt?: string; caption?: string }
    const assetRef = p.assetRef ?? ''
    const assetEntry = Object.values(assets).find((a) => a.canonicalPath === assetRef)
    props = {
      src: assetEntry ? `data:${assetEntry.mimeType};base64,${assetEntry.bytes}` : assetRef,
      alt: p.alt ?? '',
      caption: p.caption,
    } satisfies PictureRenderProps
  } else if (node.type === 'section') {
    props = { ...node.props }
  }

  return {
    id: node.id,
    type: node.type as RenderNodeType,
    visible: node.visible,
    style: styleToRender(node.style),
    props,
    children,
  }
}

export function buildRenderModel(project: RichProject): RenderModel {
  const rootNode = project.nodes[project.rootNodeId]
  if (!rootNode) {
    throw new Error(`Root node "${project.rootNodeId}" not found in project`)
  }

  const tree = nodeToRenderNode(rootNode, project.nodes, project.assets, new Set<string>())

  return {
    projectId: project.id,
    rootId: project.rootNodeId,
    tree,
  }
}
