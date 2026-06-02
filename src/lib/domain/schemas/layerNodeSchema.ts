import type { LayerType } from '../project/layerTypeDefinitions'

export interface LayerStyle {
  spacing: Record<string, string>
  alignment: Record<string, string>
  background: Record<string, string>
  textColor?: string | null
}

export interface HeaderProps {
  headerLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  text: string
}

export interface TextProps {
  content: string
  link: { href: string; target?: string } | null
}

export interface ColumnsProps {
  columnCount: number
  gap: string
  collapseBreakpointPx: number
  manualWidths: number[] | null
  normalizedWidths: number[] | null
}

export interface PictureProps {
  assetRef: string
  alt: string
  caption?: string
}

export interface SectionProps {
  [key: string]: unknown
}

export type LayerNodeProps = HeaderProps | TextProps | ColumnsProps | PictureProps | SectionProps

export interface LayerNode {
  id: string
  type: LayerType
  parentId: string | null
  children: string[]
  name: string
  visible: boolean
  style: LayerStyle
  props: LayerNodeProps
}

export function isHeaderNode(node: LayerNode): node is LayerNode & { props: HeaderProps } {
  return node.type === 'header'
}

export function isTextNode(node: LayerNode): node is LayerNode & { props: TextProps } {
  return node.type === 'text'
}

export function isColumnsNode(node: LayerNode): node is LayerNode & { props: ColumnsProps } {
  return node.type === 'columns'
}

export function isPictureNode(node: LayerNode): node is LayerNode & { props: PictureProps } {
  return node.type === 'picture'
}

export function isSectionNode(node: LayerNode): node is LayerNode & { props: SectionProps } {
  return node.type === 'section'
}

export function createDefaultLayerStyle(): LayerStyle {
  return {
    spacing: {},
    alignment: {},
    background: {},
  }
}
