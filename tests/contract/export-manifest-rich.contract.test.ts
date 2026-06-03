import { describe, it, expect } from 'vitest'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'
import { getAllAssets } from '../../src/lib/services/editor/assetLibrary'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeRichProject(): RichProject {
  return {
    id: 'manifest-test',
    name: 'Manifest Test',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    rootNodeId: 'root',
    theme: { id: 'default', label: 'Default' },
    assets: {
      'img-a': {
        assetId: 'img-a',
        kind: 'image',
        mimeType: 'image/jpeg',
        originalName: 'alpha.jpg',
        canonicalPath: 'assets/images/img-a.jpg',
        bytes: 'base64abc',
        hash: 'sha256-a',
      },
      'img-b': {
        assetId: 'img-b',
        kind: 'image',
        mimeType: 'image/png',
        originalName: 'beta.png',
        canonicalPath: 'assets/images/img-b.png',
        bytes: 'base64xyz',
        hash: 'sha256-b',
      },
    },
    version: 2,
    nodes: {
      root: {
        id: 'root',
        type: 'section',
        parentId: null,
        children: ['sec-1'],
        name: 'Root',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'sec-1': {
        id: 'sec-1',
        type: 'section',
        parentId: 'root',
        children: ['pic-1', 'pic-2'],
        name: 'Section',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'pic-1': {
        id: 'pic-1',
        type: 'picture',
        parentId: 'sec-1',
        children: [],
        name: 'Image A',
        visible: true,
        style: defaultStyle,
        props: { assetRef: 'assets/images/img-a.jpg', alt: 'Alpha image' },
      },
      'pic-2': {
        id: 'pic-2',
        type: 'picture',
        parentId: 'sec-1',
        children: [],
        name: 'Image B',
        visible: true,
        style: defaultStyle,
        props: { assetRef: 'assets/images/img-b.png', alt: 'Beta image' },
      },
    },
  }
}

describe('Export manifest with embedded assets', () => {
  it('getAllAssets returns deterministic sorted order', () => {
    const project = makeRichProject()
    const assets = getAllAssets(project)
    expect(assets.length).toBe(2)
    expect(assets[0]!.assetId).toBe('img-a')
    expect(assets[1]!.assetId).toBe('img-b')
  })

  it('all asset canonical paths start with assets/images/', () => {
    const project = makeRichProject()
    const assets = getAllAssets(project)
    for (const asset of assets) {
      expect(asset.canonicalPath).toMatch(/^assets\/images\//)
    }
  })

  it('each asset has required fields', () => {
    const project = makeRichProject()
    const assets = getAllAssets(project)
    for (const asset of assets) {
      expect(asset.assetId).toBeTruthy()
      expect(asset.kind).toBe('image')
      expect(asset.mimeType).toBeTruthy()
      expect(asset.originalName).toBeTruthy()
      expect(asset.canonicalPath).toBeTruthy()
      expect(asset.bytes).toBeTruthy()
      expect(asset.hash).toBeTruthy()
    }
  })

  it('canonical paths are unique within a project', () => {
    const project = makeRichProject()
    const assets = getAllAssets(project)
    const paths = assets.map((a) => a.canonicalPath)
    const unique = new Set(paths)
    expect(unique.size).toBe(paths.length)
  })

  it('picture nodes reference valid asset canonical paths', () => {
    const project = makeRichProject()
    const allCanonicalPaths = Object.values(project.assets).map((a) => a.canonicalPath)
    const pictureNodes = Object.values(project.nodes).filter((n) => n.type === 'picture')
    for (const node of pictureNodes) {
      const props = node.props as { assetRef?: string }
      if (props.assetRef) {
        expect(allCanonicalPaths).toContain(props.assetRef)
      }
    }
  })

  it('mime types conform to allowed image types', () => {
    const ALLOWED = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    const project = makeRichProject()
    const assets = getAllAssets(project)
    for (const asset of assets) {
      expect(ALLOWED).toContain(asset.mimeType)
    }
  })
})
