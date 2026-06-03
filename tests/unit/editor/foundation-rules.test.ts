import { describe, it, expect } from 'vitest'
import { validateLayerTree, canAddChildOfType } from '../../../src/lib/services/validator/layerTreeValidator'
import { buildRenderModel } from '../../../src/lib/services/editor/renderModel'
import type { LayerNode } from '../../../src/lib/domain/schemas/layerNodeSchema'
import type { RichProject } from '../../../src/lib/domain/schemas/projectSchema'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeProject(overrides?: Partial<RichProject>): RichProject {
  return {
    id: 'test-project',
    name: 'Test',
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
        children: ['header-1', 'text-1'],
        name: 'Section 1',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'header-1': {
        id: 'header-1',
        type: 'header',
        parentId: 'section-1',
        children: [],
        name: 'Header 1',
        visible: true,
        style: defaultStyle,
        props: { headerLevel: 'h1', text: 'Hello' },
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        parentId: 'section-1',
        children: [],
        name: 'Text 1',
        visible: true,
        style: defaultStyle,
        props: { content: 'Sample text', link: null },
      },
    },
    ...overrides,
  }
}

describe('layerTreeValidator', () => {
  it('validates a valid tree', () => {
    const project = makeProject()
    const result = validateLayerTree(project.nodes, project.rootNodeId)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects root node not found', () => {
    const project = makeProject({ rootNodeId: 'missing' })
    const result = validateLayerTree(project.nodes, 'missing')
    expect(result.valid).toBe(false)
    expect(result.errors[0].code).toBe('ROOT_NOT_FOUND')
  })

  it('rejects root node that is not section type', () => {
    const project = makeProject()
    const wrongRoot: Record<string, LayerNode> = {
      ...project.nodes,
      root: { ...project.nodes['root']!, type: 'header', props: { headerLevel: 'h1', text: 'x' } },
    }
    const result = validateLayerTree(wrongRoot, 'root')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'INVALID_ROOT_TYPE')).toBe(true)
  })

  it('rejects header directly under root', () => {
    const nodes: Record<string, LayerNode> = {
      root: {
        id: 'root',
        type: 'section',
        parentId: null,
        children: ['header-orphan'],
        name: 'Root',
        visible: true,
        style: defaultStyle,
        props: {},
      },
      'header-orphan': {
        id: 'header-orphan',
        type: 'header',
        parentId: 'root',
        children: [],
        name: 'Orphan Header',
        visible: true,
        style: defaultStyle,
        props: { headerLevel: 'h1', text: 'Bad' },
      },
    }
    const result = validateLayerTree(nodes, 'root')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.code === 'INVALID_PARENT_CHILD')).toBe(true)
  })

  it('allows section children at root', () => {
    const project = makeProject()
    expect(canAddChildOfType(project.nodes, 'root', 'section')).toBe(true)
    expect(canAddChildOfType(project.nodes, 'root', 'header')).toBe(false)
    expect(canAddChildOfType(project.nodes, 'root', 'text')).toBe(false)
  })

  it('allows header inside section', () => {
    const project = makeProject()
    expect(canAddChildOfType(project.nodes, 'section-1', 'header')).toBe(true)
    expect(canAddChildOfType(project.nodes, 'section-1', 'text')).toBe(true)
    expect(canAddChildOfType(project.nodes, 'section-1', 'columns')).toBe(true)
    expect(canAddChildOfType(project.nodes, 'section-1', 'picture')).toBe(true)
  })
})

describe('buildRenderModel', () => {
  it('builds a render model from a valid project', () => {
    const project = makeProject()
    const model = buildRenderModel(project)
    expect(model.projectId).toBe('test-project')
    expect(model.rootId).toBe('root')
    expect(model.tree.type).toBe('section')
    expect(model.tree.children).toHaveLength(1)
    const section = model.tree.children[0]!
    expect(section.type).toBe('section')
    expect(section.children).toHaveLength(2)
  })

  it('maps header nodes correctly', () => {
    const project = makeProject()
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    const header = section.children.find((c) => c.type === 'header')
    expect(header).toBeDefined()
    const props = header!.props as { level: string; text: string }
    expect(props.level).toBe('h1')
    expect(props.text).toBe('Hello')
  })

  it('maps text nodes correctly', () => {
    const project = makeProject()
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    const text = section.children.find((c) => c.type === 'text')
    expect(text).toBeDefined()
    const props = text!.props as { content: string }
    expect(props.content).toBe('Sample text')
  })

  it('maps columns nodes with defaults', () => {
    const project = makeProject()
    const nodes: Record<string, LayerNode> = {
      ...project.nodes,
      'section-1': {
        ...project.nodes['section-1']!,
        children: ['columns-1'],
      },
      'columns-1': {
        id: 'columns-1',
        type: 'columns',
        parentId: 'section-1',
        children: [],
        name: 'Columns',
        visible: true,
        style: defaultStyle,
        props: {
          columnCount: 3,
          gap: '1rem',
          collapseBreakpointPx: 768,
          manualWidths: null,
          normalizedWidths: null,
        },
      },
    }
    const p = { ...project, nodes }
    const model = buildRenderModel(p)
    const section = model.tree.children[0]!
    const cols = section.children.find((c) => c.type === 'columns')
    expect(cols).toBeDefined()
    const props = cols!.props as { columnCount: number; widths: number[] }
    expect(props.columnCount).toBe(3)
    expect(props.widths).toHaveLength(3)
  })

  it('throws if root node is missing', () => {
    const project = makeProject({ rootNodeId: 'missing-root' })
    expect(() => buildRenderModel(project)).toThrow()
  })

  it('handles invisible nodes (preserves visibility flag)', () => {
    const project = makeProject()
    const nodes: Record<string, LayerNode> = {
      ...project.nodes,
      'header-1': { ...project.nodes['header-1']!, visible: false },
    }
    const model = buildRenderModel({ ...project, nodes })
    const section = model.tree.children[0]!
    const header = section.children.find((c) => c.id === 'header-1')
    expect(header?.visible).toBe(false)
  })
})
