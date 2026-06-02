import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'
import { assignAssetToNode, getAllAssets, removeAsset } from '../../src/lib/services/editor/assetLibrary'
import { addLayer } from '../../src/lib/services/editor/layerOperations'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeProject(): RichProject {
  return {
    id: 'test-asset-proj',
    name: 'Asset Project',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    rootNodeId: 'root',
    theme: { id: 'default', label: 'Default' },
    assets: {},
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
        children: [],
        name: 'Section 1',
        visible: true,
        style: defaultStyle,
        props: {},
      },
    },
  }
}

describe('Picture asset layering workflow', () => {
  it('assigns an embedded asset to a picture node', () => {
    let project = makeProject()

    // Add a picture node
    const result = addLayer(project, 'sec-1', 'picture', 'My Image')
    expect(result.error).toBeUndefined()
    project = result.project
    const pictureId = result.newNodeId!

    // Add a fake asset directly
    project = {
      ...project,
      assets: {
        'img-001': {
          assetId: 'img-001',
          kind: 'image',
          mimeType: 'image/png',
          originalName: 'photo.png',
          canonicalPath: 'assets/images/img-001.png',
          bytes: 'base64data',
          hash: 'sha256-abc123',
        },
      },
    }

    // Assign asset to picture node
    project = assignAssetToNode(project, pictureId, 'img-001', 'A sample photo')

    const pictureNode = project.nodes[pictureId]!
    const props = pictureNode.props as { assetRef: string; alt: string }
    expect(props.assetRef).toBe('assets/images/img-001.png')
    expect(props.alt).toBe('A sample photo')
  })

  it('canonical asset path starts with assets/images/', () => {
    const project: RichProject = {
      ...makeProject(),
      assets: {
        'img-test': {
          assetId: 'img-test',
          kind: 'image',
          mimeType: 'image/jpeg',
          originalName: 'test.jpg',
          canonicalPath: 'assets/images/img-test.jpg',
          bytes: 'base64',
          hash: 'sha256-xyz',
        },
      },
    }

    const assets = getAllAssets(project)
    expect(assets.length).toBe(1)
    expect(assets[0]!.canonicalPath).toMatch(/^assets\/images\//)
  })

  it('removes an asset from the project', () => {
    let project: RichProject = {
      ...makeProject(),
      assets: {
        'img-del': {
          assetId: 'img-del',
          kind: 'image',
          mimeType: 'image/png',
          originalName: 'delete-me.png',
          canonicalPath: 'assets/images/img-del.png',
          bytes: 'base64',
          hash: 'sha256-del',
        },
      },
    }

    expect(Object.keys(project.assets).length).toBe(1)
    project = removeAsset(project, 'img-del')
    expect(Object.keys(project.assets).length).toBe(0)
  })

  it('does not assign asset to non-picture node', () => {
    let project = makeProject()
    const result = addLayer(project, 'sec-1', 'text', 'Text')
    project = result.project
    const textId = result.newNodeId!

    project = {
      ...project,
      assets: {
        'img-noop': {
          assetId: 'img-noop',
          kind: 'image',
          mimeType: 'image/png',
          originalName: 'noop.png',
          canonicalPath: 'assets/images/img-noop.png',
          bytes: 'base64',
          hash: 'sha256-noop',
        },
      },
    }

    // Should not throw, but also not set assetRef on text node
    const before = project.nodes[textId]!.props
    const after = assignAssetToNode(project, textId, 'img-noop').nodes[textId]!.props
    expect(after).toEqual(before)
  })

  it('returns stable asset ordering (sorted by assetId)', () => {
    const project: RichProject = {
      ...makeProject(),
      assets: {
        'img-z': {
          assetId: 'img-z',
          kind: 'image',
          mimeType: 'image/png',
          originalName: 'z.png',
          canonicalPath: 'assets/images/img-z.png',
          bytes: '',
          hash: 'sha256-z',
        },
        'img-a': {
          assetId: 'img-a',
          kind: 'image',
          mimeType: 'image/png',
          originalName: 'a.png',
          canonicalPath: 'assets/images/img-a.png',
          bytes: '',
          hash: 'sha256-a',
        },
      },
    }

    const assets = getAllAssets(project)
    expect(assets[0]!.assetId).toBe('img-a')
    expect(assets[1]!.assetId).toBe('img-z')
  })
})
