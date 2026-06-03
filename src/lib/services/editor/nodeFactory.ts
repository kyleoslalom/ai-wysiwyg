import type { LayerNode, LayerStyle } from '../../domain/schemas/layerNodeSchema'
import type { LayerType } from '../../domain/project/layerTypeDefinitions'
import { getLayerTypeDefinition } from '../../domain/project/layerTypeDefinitions'
import { createDefaultLayerStyle } from '../../domain/schemas/layerNodeSchema'

let nodeCounter = 0

export function generateNodeId(type: LayerType): string {
  nodeCounter++
  const timestamp = Date.now()
  return `${type}-${timestamp}-${nodeCounter}`
}

export function createDefaultNode(
  type: LayerType,
  parentId: string | null,
  overrides?: { name?: string; style?: Partial<LayerStyle> },
): LayerNode {
  const def = getLayerTypeDefinition(type)
  const style: LayerStyle = {
    ...createDefaultLayerStyle(),
    ...(overrides?.style ?? {}),
  }

  return {
    id: generateNodeId(type),
    type,
    parentId,
    children: [],
    name: overrides?.name ?? def.defaultName,
    visible: true,
    style,
    props: structuredClone(def.defaultProps) as LayerNode['props'],
  }
}

export function createHeaderNode(
  parentId: string,
  overrides?: { name?: string; level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; text?: string },
): LayerNode {
  return createDefaultNode('header', parentId, { name: overrides?.name ?? 'Header' })
}

export function createTextNode(parentId: string, overrides?: { name?: string; content?: string }): LayerNode {
  const node = createDefaultNode('text', parentId, { name: overrides?.name ?? 'Text' })
  if (overrides?.content !== undefined) {
    return {
      ...node,
      props: { ...node.props as object, content: overrides.content },
    }
  }
  return node
}

export function createColumnsNode(
  parentId: string,
  overrides?: { name?: string; columnCount?: number },
): LayerNode {
  const node = createDefaultNode('columns', parentId, { name: overrides?.name ?? 'Columns' })
  if (overrides?.columnCount !== undefined) {
    return {
      ...node,
      props: { ...node.props as object, columnCount: overrides.columnCount },
    }
  }
  return node
}

export function createPictureNode(
  parentId: string,
  overrides?: { name?: string; assetRef?: string; alt?: string },
): LayerNode {
  const node = createDefaultNode('picture', parentId, { name: overrides?.name ?? 'Picture' })
  const props = { ...node.props as object }
  if (overrides?.assetRef !== undefined) {
    Object.assign(props, { assetRef: overrides.assetRef })
  }
  if (overrides?.alt !== undefined) {
    Object.assign(props, { alt: overrides.alt })
  }
  return { ...node, props: props as LayerNode['props'] }
}

export function createSectionNode(parentId: string | null, overrides?: { name?: string }): LayerNode {
  return createDefaultNode('section', parentId, { name: overrides?.name ?? 'Section' })
}
