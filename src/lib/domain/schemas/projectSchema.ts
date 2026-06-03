import type { LayerNode } from './layerNodeSchema'

export interface EmbeddedAsset {
  assetId: string
  kind: 'image'
  mimeType: string
  originalName: string
  canonicalPath: string
  bytes: string
  hash: string
}

export interface ThemeSelection {
  id: string
  label: string
}

export interface RichProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  rootNodeId: string
  nodes: Record<string, LayerNode>
  theme: ThemeSelection
  assets: Record<string, EmbeddedAsset>
  version: number
}

export function isRichProject(value: unknown): value is RichProject {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p['id'] === 'string' &&
    typeof p['name'] === 'string' &&
    typeof p['rootNodeId'] === 'string' &&
    typeof p['nodes'] === 'object' &&
    p['nodes'] !== null &&
    typeof p['theme'] === 'object' &&
    p['theme'] !== null &&
    typeof p['assets'] === 'object' &&
    p['assets'] !== null &&
    typeof p['version'] === 'number'
  )
}

export const DEFAULT_THEME: ThemeSelection = {
  id: 'default',
  label: 'Default',
}
