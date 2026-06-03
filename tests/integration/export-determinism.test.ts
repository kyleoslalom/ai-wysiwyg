import { describe, it, expect } from 'vitest'
import { buildRichExportArtifact } from '../../src/lib/services/export/richExporter'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeProject(): RichProject {
  return {
    id: 'det-export-test',
    name: 'Determinism Test',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    rootNodeId: 'root',
    theme: { id: 'default', label: 'Default' },
    assets: {
      'img-1': {
        assetId: 'img-1',
        kind: 'image',
        mimeType: 'image/png',
        originalName: 'test.png',
        canonicalPath: 'assets/images/img-1.png',
        bytes: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        hash: 'sha256-test',
      },
    },
    version: 2,
    nodes: {
      root: {
        id: 'root',
        type: 'section',
        parentId: null,
        children: ['section-1'],
        name: 'Root',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'section-1': {
        id: 'section-1',
        type: 'section',
        parentId: 'root',
        children: ['header-1', 'text-1', 'pic-1'],
        name: 'Section',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'header-1': {
        id: 'header-1',
        type: 'header',
        parentId: 'section-1',
        children: [],
        name: 'Header',
        visible: true,
        style: defaultStyle,
        props: { headerLevel: 'h1', text: 'Title' },
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        parentId: 'section-1',
        children: [],
        name: 'Text',
        visible: true,
        style: defaultStyle,
        props: { content: 'Hello', link: null },
      },
      'pic-1': {
        id: 'pic-1',
        type: 'picture',
        parentId: 'section-1',
        children: [],
        name: 'Image',
        visible: true,
        style: defaultStyle,
        props: { assetRef: 'assets/images/img-1.png', alt: 'Test image' },
      },
    },
  }
}

describe('Deterministic repeat export', () => {
  it('produces identical HTML across multiple export runs with same timestamp', () => {
    const project = makeProject()
    const fixedTime = '2026-01-01T00:00:00.000Z'

    const artifact1 = buildRichExportArtifact(project, { generatedAt: fixedTime })
    const artifact2 = buildRichExportArtifact(project, { generatedAt: fixedTime })

    expect(artifact1.html).toBe(artifact2.html)
  })

  it('produces identical manifest entries across runs', () => {
    const project = makeProject()
    const fixedTime = '2026-01-01T00:00:00.000Z'

    const a1 = buildRichExportArtifact(project, { generatedAt: fixedTime })
    const a2 = buildRichExportArtifact(project, { generatedAt: fixedTime })

    expect(JSON.stringify(a1.manifest)).toBe(JSON.stringify(a2.manifest))
  })

  it('HTML contains all node types', () => {
    const project = makeProject()
    const artifact = buildRichExportArtifact(project)

    expect(artifact.html).toContain('<h1')
    expect(artifact.html).toContain('<p')
    expect(artifact.html).toContain('<figure')
    expect(artifact.html).toContain('<img')
    expect(artifact.html).toContain('data-node-id')
  })

  it('manifest includes asset entries', () => {
    const project = makeProject()
    const artifact = buildRichExportArtifact(project)
    const assetEntry = artifact.manifest.entries.find((e) => e.path.startsWith('assets/images/'))
    expect(assetEntry).toBeDefined()
    expect(assetEntry?.path).toBe('assets/images/img-1.png')
  })

  it('manifest format version is 2.0.0', () => {
    const artifact = buildRichExportArtifact(makeProject())
    expect(artifact.manifest.formatVersion).toBe('2.0.0')
  })

  it('invisible nodes are excluded from HTML output', () => {
    const project = makeProject()
    const modifiedNodes = { ...project.nodes, 'header-1': { ...project.nodes['header-1']!, visible: false } }
    const artifact = buildRichExportArtifact({ ...project, nodes: modifiedNodes })

    const headerCount = (artifact.html.match(/<h1/g) ?? []).length
    expect(headerCount).toBe(0)
  })
})
