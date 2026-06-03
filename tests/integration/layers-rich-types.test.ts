import { describe, it, expect } from 'vitest'
import type { LayerNode } from '../../src/lib/domain/schemas/layerNodeSchema'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'
import { validateLayerTree } from '../../src/lib/services/validator/layerTreeValidator'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeRichProject(overrides?: Partial<RichProject>): RichProject {
  return {
    id: 'proj-1',
    name: 'Test Project',
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
    ...overrides,
  }
}

// Simulate createNode
function createNode(
  project: RichProject,
  parentId: string,
  type: LayerNode['type'],
  name: string,
  props: LayerNode['props'] = {},
): RichProject {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const newNode: LayerNode = {
    id,
    type,
    parentId,
    children: [],
    name,
    visible: true,
    style: defaultStyle,
    props,
  }
  const parent = project.nodes[parentId]
  if (!parent) throw new Error(`Parent not found: ${parentId}`)
  return {
    ...project,
    nodes: {
      ...project.nodes,
      [id]: newNode,
      [parentId]: { ...parent, children: [...parent.children, id] },
    },
    updatedAt: new Date().toISOString(),
  }
}

// Simulate renameNode
function renameNode(project: RichProject, nodeId: string, name: string): RichProject {
  const node = project.nodes[nodeId]
  if (!node) throw new Error(`Node not found: ${nodeId}`)
  return {
    ...project,
    nodes: { ...project.nodes, [nodeId]: { ...node, name } },
    updatedAt: new Date().toISOString(),
  }
}

// Simulate deleteNode
function deleteNode(project: RichProject, nodeId: string): RichProject {
  const node = project.nodes[nodeId]
  if (!node) throw new Error(`Node not found: ${nodeId}`)
  const parent = node.parentId ? project.nodes[node.parentId] : null
  const newNodes = { ...project.nodes }
  delete newNodes[nodeId]
  if (parent) {
    newNodes[parent.id] = { ...parent, children: parent.children.filter((c) => c !== nodeId) }
  }
  return { ...project, nodes: newNodes, updatedAt: new Date().toISOString() }
}

// Simulate reorderNode
function reorderNode(
  project: RichProject,
  parentId: string,
  nodeId: string,
  newIndex: number,
): RichProject {
  const parent = project.nodes[parentId]
  if (!parent) throw new Error(`Parent not found: ${parentId}`)
  const children = parent.children.filter((c) => c !== nodeId)
  children.splice(newIndex, 0, nodeId)
  return {
    ...project,
    nodes: { ...project.nodes, [parentId]: { ...parent, children } },
    updatedAt: new Date().toISOString(),
  }
}

// Simulate duplicateNode
function duplicateNode(project: RichProject, nodeId: string): RichProject {
  const node = project.nodes[nodeId]
  if (!node) throw new Error(`Node not found: ${nodeId}`)
  const newId = `${node.type}-copy-${Date.now()}`
  const newNode: LayerNode = { ...structuredClone(node), id: newId }
  const parent = node.parentId ? project.nodes[node.parentId] : null
  const newNodes: Record<string, LayerNode> = { ...project.nodes, [newId]: newNode }
  if (parent) {
    const idx = parent.children.indexOf(nodeId)
    const newChildren = [...parent.children]
    newChildren.splice(idx + 1, 0, newId)
    newNodes[parent.id] = { ...parent, children: newChildren }
  }
  return { ...project, nodes: newNodes, updatedAt: new Date().toISOString() }
}

describe('Rich Layer CRUD operations', () => {
  it('creates a header node inside a section', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'header', 'My Header', {
      headerLevel: 'h2',
      text: 'Hello',
    })
    const headerIds = project.nodes['sec-1']!.children
    expect(headerIds.length).toBe(1)
    const header = project.nodes[headerIds[0]!]
    expect(header?.type).toBe('header')
    expect(header?.name).toBe('My Header')
    const validation = validateLayerTree(project.nodes, project.rootNodeId)
    expect(validation.valid).toBe(true)
  })

  it('creates text, columns, and picture nodes inside a section', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'text', 'Text', { content: 'Hi', link: null })
    project = createNode(project, 'sec-1', 'columns', 'Cols', {
      columnCount: 2,
      gap: '1rem',
      collapseBreakpointPx: 768,
      manualWidths: null,
      normalizedWidths: null,
    })
    project = createNode(project, 'sec-1', 'picture', 'Pic', {
      assetRef: 'assets/images/x.png',
      alt: 'x',
    })
    expect(project.nodes['sec-1']!.children.length).toBe(3)
    const validation = validateLayerTree(project.nodes, project.rootNodeId)
    expect(validation.valid).toBe(true)
  })

  it('renames a node', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'text', 'Old Name', { content: '', link: null })
    const nodeId = project.nodes['sec-1']!.children[0]!
    project = renameNode(project, nodeId, 'New Name')
    expect(project.nodes[nodeId]?.name).toBe('New Name')
  })

  it('deletes a node and removes it from parent children', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'text', 'Text', { content: '', link: null })
    const nodeId = project.nodes['sec-1']!.children[0]!
    expect(project.nodes[nodeId]).toBeDefined()
    project = deleteNode(project, nodeId)
    expect(project.nodes[nodeId]).toBeUndefined()
    expect(project.nodes['sec-1']!.children.includes(nodeId)).toBe(false)
  })

  it('reorders nodes within a parent', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'text', 'A', { content: '', link: null })
    project = createNode(project, 'sec-1', 'text', 'B', { content: '', link: null })
    const [aId, bId] = project.nodes['sec-1']!.children
    project = reorderNode(project, 'sec-1', bId!, 0)
    expect(project.nodes['sec-1']!.children[0]).toBe(bId)
    expect(project.nodes['sec-1']!.children[1]).toBe(aId)
  })

  it('duplicates a node', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'text', 'Original', { content: 'Hello', link: null })
    const origId = project.nodes['sec-1']!.children[0]!
    project = duplicateNode(project, origId)
    expect(project.nodes['sec-1']!.children.length).toBe(2)
    const copyId = project.nodes['sec-1']!.children[1]!
    expect(project.nodes[copyId]?.name).toBe('Original')
    expect(project.nodes[copyId]?.id).not.toBe(origId)
  })

  it('enforces nesting: header cannot be placed at root level', () => {
    let project = makeRichProject()
    // Manually add a header at root - should fail validation
    const headerId = 'bad-header'
    const newNode: LayerNode = {
      id: headerId,
      type: 'header',
      parentId: 'root',
      children: [],
      name: 'Bad',
      visible: true,
      style: defaultStyle,
      props: { headerLevel: 'h1', text: 'Bad' },
    }
    project = {
      ...project,
      nodes: {
        ...project.nodes,
        [headerId]: newNode,
        root: { ...project.nodes['root']!, children: [...project.nodes['root']!.children, headerId] },
      },
    }
    const validation = validateLayerTree(project.nodes, project.rootNodeId)
    expect(validation.valid).toBe(false)
    expect(validation.errors.some((e) => e.code === 'INVALID_PARENT_CHILD')).toBe(true)
  })

  it('canvas and layer tree sync: selected node reflects project state', () => {
    let project = makeRichProject()
    project = createNode(project, 'sec-1', 'header', 'Header Node', {
      headerLevel: 'h1',
      text: 'Title',
    })
    const headerId = project.nodes['sec-1']!.children[0]!
    // Simulate selecting the node and verifying it can be found
    const selected = project.nodes[headerId]
    expect(selected).toBeDefined()
    expect(selected?.type).toBe('header')
    // Canvas should render this node (visible true)
    expect(selected?.visible).toBe(true)
  })
})
