import { describe, it, expect } from 'vitest'
import { buildRenderModel } from '../../../src/lib/services/editor/renderModel'
import type { RichProject } from '../../../src/lib/domain/schemas/projectSchema'
import type { LayerNode } from '../../../src/lib/domain/schemas/layerNodeSchema'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeFullProject(): RichProject {
  return {
    id: 'parity-test',
    name: 'Parity Test',
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
        bytes: 'abc123base64',
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
        children: ['header-1', 'text-1', 'cols-1', 'pic-1'],
        name: 'Main Section',
        visible: true,
        style: { spacing: { padding: '1rem' }, alignment: {}, background: {} },
        props: {},
      },
      'header-1': {
        id: 'header-1',
        type: 'header',
        parentId: 'section-1',
        children: [],
        name: 'Main Header',
        visible: true,
        style: { ...defaultStyle, textColor: '#1f2937' },
        props: { headerLevel: 'h1', text: 'Page Title' },
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        parentId: 'section-1',
        children: [],
        name: 'Body Text',
        visible: true,
        style: { ...defaultStyle, textColor: '#374151' },
        props: { content: 'Hello world', link: null },
      },
      'cols-1': {
        id: 'cols-1',
        type: 'columns',
        parentId: 'section-1',
        children: [],
        name: 'Two Columns',
        visible: true,
        style: defaultStyle,
        props: {
          columnCount: 2,
          gap: '1rem',
          collapseBreakpointPx: 768,
          manualWidths: [60, 40],
          normalizedWidths: [60, 40],
        },
      },
      'pic-1': {
        id: 'pic-1',
        type: 'picture',
        parentId: 'section-1',
        children: [],
        name: 'Sample Image',
        visible: true,
        style: defaultStyle,
        props: {
          assetRef: 'assets/images/img-1.png',
          alt: 'A test image',
          caption: 'Figure 1',
        },
      },
    },
  }
}

describe('Render model parity mapping', () => {
  it('produces same render model structure when called twice (deterministic)', () => {
    const project = makeFullProject()
    const model1 = buildRenderModel(project)
    const model2 = buildRenderModel(project)

    expect(JSON.stringify(model1)).toBe(JSON.stringify(model2))
  })

  it('header render node matches source data', () => {
    const model = buildRenderModel(makeFullProject())
    const section = model.tree.children[0]!
    const header = section.children.find((c) => c.id === 'header-1')!
    const props = header.props as { level: string; text: string }
    expect(props.level).toBe('h1')
    expect(props.text).toBe('Page Title')
    expect(header.style.textColor).toBe('#1f2937')
  })

  it('text render node maps content correctly', () => {
    const model = buildRenderModel(makeFullProject())
    const section = model.tree.children[0]!
    const text = section.children.find((c) => c.id === 'text-1')!
    const props = text.props as { content: string }
    expect(props.content).toBe('Hello world')
    expect(text.style.textColor).toBe('#374151')
  })

  it('columns render node computes widths from normalizedWidths', () => {
    const model = buildRenderModel(makeFullProject())
    const section = model.tree.children[0]!
    const cols = section.children.find((c) => c.id === 'cols-1')!
    const props = cols.props as { columnCount: number; widths: number[]; gap: string }
    expect(props.columnCount).toBe(2)
    expect(props.widths).toEqual([60, 40])
    expect(props.gap).toBe('1rem')
  })

  it('picture render node resolves embedded asset to data: URL', () => {
    const model = buildRenderModel(makeFullProject())
    const section = model.tree.children[0]!
    const pic = section.children.find((c) => c.id === 'pic-1')!
    const props = pic.props as { src: string; alt: string; caption?: string }
    expect(props.src).toMatch(/^data:image\/png;base64,/)
    expect(props.alt).toBe('A test image')
    expect(props.caption).toBe('Figure 1')
  })

  it('picture render node falls back to assetRef if no matching asset', () => {
    const project = makeFullProject()
    // Remove the asset
    const { 'img-1': _, ...assets } = project.assets
    const modified = { ...project, assets }
    const model = buildRenderModel(modified)
    const section = model.tree.children[0]!
    const pic = section.children.find((c) => c.id === 'pic-1')!
    const props = pic.props as { src: string }
    expect(props.src).toBe('assets/images/img-1.png')
  })

  it('invisible nodes are preserved in render model with visible=false', () => {
    const project = makeFullProject()
    const modifiedNodes: Record<string, LayerNode> = {
      ...project.nodes,
      'text-1': { ...project.nodes['text-1']!, visible: false },
    }
    const model = buildRenderModel({ ...project, nodes: modifiedNodes })
    const section = model.tree.children[0]!
    const text = section.children.find((c) => c.id === 'text-1')
    expect(text?.visible).toBe(false)
  })

  it('render model section preserves padding from style.spacing', () => {
    const model = buildRenderModel(makeFullProject())
    const section = model.tree.children[0]!
    expect(section.style.spacing['padding']).toBe('1rem')
  })
})
