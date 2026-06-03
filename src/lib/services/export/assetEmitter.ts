import type { EmbeddedAsset } from '../../domain/schemas/projectSchema'
import { getAllAssets } from '../editor/assetLibrary'
import type { RichProject } from '../../domain/schemas/projectSchema'

export interface EmittedAsset {
  path: string
  mimeType: string
  bytes: string
}

/**
 * Emits project assets in deterministic order (sorted by assetId).
 * Each asset is emitted to its canonical path.
 */
export function emitAssets(project: RichProject): EmittedAsset[] {
  const assets = getAllAssets(project)
  return assets.map((asset) => ({
    path: asset.canonicalPath,
    mimeType: asset.mimeType,
    bytes: asset.bytes,
  }))
}

/**
 * Converts base64 bytes to Uint8Array for ZIP packing.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
