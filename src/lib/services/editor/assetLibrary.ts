import type { EmbeddedAsset, RichProject } from '../../domain/schemas/projectSchema'
import { sanitizePlainText, sanitizeAltText } from '../validator/inputSanitizer'

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB

export interface AssetIngestResult {
  project: RichProject
  assetId?: string
  error?: string
}

async function computeHash(bytes: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return 'sha256-' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  return 'sha256-' + Array.from(new Uint8Array(bytes.slice(0, 8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function buildCanonicalPath(assetId: string, mimeType: string): string {
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg').replace('svg+xml', 'svg') ?? 'bin'
  return `assets/images/${assetId}.${ext}`
}

export async function ingestImageAsset(
  project: RichProject,
  file: File,
): Promise<AssetIngestResult> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { project, error: `Unsupported image type: ${file.type}` }
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { project, error: `Image exceeds maximum size of 10 MB` }
  }

  const arrayBuffer = await file.arrayBuffer()
  const hash = await computeHash(arrayBuffer)

  // Check for duplicate by hash
  const existing = Object.values(project.assets).find((a) => a.hash === hash)
  if (existing) {
    return { project, assetId: existing.assetId }
  }

  const assetId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const canonicalPath = buildCanonicalPath(assetId, file.type)
  const bytes = arrayBufferToBase64(arrayBuffer)
  const originalName = sanitizePlainText(file.name)

  const asset: EmbeddedAsset = {
    assetId,
    kind: 'image',
    mimeType: file.type,
    originalName,
    canonicalPath,
    bytes,
    hash,
  }

  return {
    project: {
      ...project,
      assets: { ...project.assets, [assetId]: asset },
      updatedAt: new Date().toISOString(),
    },
    assetId,
  }
}

export function getAssetCanonicalPath(project: RichProject, assetId: string): string | null {
  return project.assets[assetId]?.canonicalPath ?? null
}

export function getAllAssets(project: RichProject): EmbeddedAsset[] {
  return Object.values(project.assets).sort((a, b) => a.assetId.localeCompare(b.assetId))
}

export function removeAsset(project: RichProject, assetId: string): RichProject {
  const newAssets = { ...project.assets }
  delete newAssets[assetId]
  return { ...project, assets: newAssets, updatedAt: new Date().toISOString() }
}

export function assignAssetToNode(
  project: RichProject,
  nodeId: string,
  assetId: string,
  alt?: string,
): RichProject {
  const node = project.nodes[nodeId]
  if (!node || node.type !== 'picture') return project

  const asset = project.assets[assetId]
  if (!asset) return project

  return {
    ...project,
    nodes: {
      ...project.nodes,
      [nodeId]: {
        ...node,
        props: {
          ...node.props as object,
          assetRef: asset.canonicalPath,
          alt: alt !== undefined ? sanitizeAltText(alt) : (node.props as { alt?: string }).alt ?? '',
        },
      },
    },
    updatedAt: new Date().toISOString(),
  }
}
