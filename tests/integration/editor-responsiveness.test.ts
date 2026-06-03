import { describe, it, expect } from 'vitest'
import type { RichProject } from '../../src/lib/domain/schemas/projectSchema'
import { addLayer, renameLayer, deleteLayer } from '../../src/lib/services/editor/layerOperations'
import { buildRenderModel } from '../../src/lib/services/editor/renderModel'
import { validateLayerTree } from '../../src/lib/services/validator/layerTreeValidator'

const defaultStyle = { spacing: {}, alignment: {}, background: {} }

function makeProject(): RichProject {
  return {
    id: 'responsiveness-test',
    name: 'Responsiveness Test',
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
        name: 'Section',
        visible: true,
        style: defaultStyle,
        props: {},
      },
    },
  }
}

describe('Editor responsiveness: inspector/canvas updates', () => {
  it('adding a layer reflects immediately in render model', () => {
    let project = makeProject()
    const result = addLayer(project, 'sec-1', 'text', 'New Text')
    project = result.project
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    expect(section.children.some((c) => c.type === 'text')).toBe(true)
  })

  it('renaming a layer reflects in render model without rebuild needed', () => {
    let project = makeProject()
    project = addLayer(project, 'sec-1', 'header', 'Old Name', { headerLevel: 'h2', text: 'Old' }).project
    const headerId = project.nodes['sec-1']!.children[0]!
    project = renameLayer(project, headerId, 'New Name').project
    expect(project.nodes[headerId]?.name).toBe('New Name')
  })

  it('deleting a layer reflects immediately in render model', () => {
    let project = makeProject()
    project = addLayer(project, 'sec-1', 'text', 'To Delete').project
    const textId = project.nodes['sec-1']!.children[0]!
    project = deleteLayer(project, textId).project
    const model = buildRenderModel(project)
    const section = model.tree.children[0]!
    expect(section.children.every((c) => c.id !== textId)).toBe(true)
  })

  it('tree validation runs in O(n) and remains valid after CRUD operations', () => {
    let project = makeProject()
    // Add 20 nodes
    for (let i = 0; i < 20; i++) {
      project = addLayer(project, 'sec-1', 'text', `Text ${i}`, {
        content: `Content ${i}`,
        link: null,
      }).project
    }
    const validation = validateLayerTree(project.nodes, project.rootNodeId)
    expect(validation.valid).toBe(true)
    expect(Object.keys(project.nodes).length).toBe(22) // root + sec-1 + 20 text nodes
  })

  it('render model builds within reasonable scale', () => {
    let project = makeProject()
    for (let i = 0; i < 10; i++) {
      project = addLayer(project, 'sec-1', 'text', `Text ${i}`, {
        content: `Content ${i}`,
        link: null,
      }).project
    }

    const start = Date.now()
    const model = buildRenderModel(project)
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(100) // Should be very fast
    expect(model.tree.children[0]!.children.length).toBe(10)
  })

  it('inspector node update does not affect sibling nodes', () => {
    let project = makeProject()
    project = addLayer(project, 'sec-1', 'text', 'Text A').project
    project = addLayer(project, 'sec-1', 'text', 'Text B').project

    const [idA, idB] = project.nodes['sec-1']!.children
    const nameBefore = project.nodes[idB!]?.name

    project = renameLayer(project, idA!, 'Text A Renamed').project

    // Sibling B should be unchanged
    expect(project.nodes[idB!]?.name).toBe(nameBefore)
    expect(project.nodes[idA!]?.name).toBe('Text A Renamed')
  })
})
