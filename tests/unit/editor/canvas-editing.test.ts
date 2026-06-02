import { describe, expect, it } from 'vitest'
import type { Project } from '../../../src/lib/domain/types'
import {
  createCanvasElement,
  reorderChild,
  updateElementInlineStyle,
} from '../../../src/lib/domain/project/canvas-element'

function buildProject(): Project {
  const now = '2026-06-02T00:00:00.000Z'

  return {
    id: 'project-test',
    name: 'Canvas Editing Test',
    createdAt: now,
    updatedAt: now,
    rootNodeId: 'root',
    version: 1,
    interactions: [],
    styles: {},
    nodes: {
      root: {
        id: 'root',
        type: 'container',
        parentId: null,
        children: ['a', 'b', 'c'],
        content: {},
        classList: [],
      },
      a: {
        id: 'a',
        type: 'text',
        parentId: 'root',
        children: [],
        content: { text: 'A' },
        classList: [],
      },
      b: {
        id: 'b',
        type: 'text',
        parentId: 'root',
        children: [],
        content: { text: 'B' },
        classList: [],
      },
      c: {
        id: 'c',
        type: 'text',
        parentId: 'root',
        children: [],
        content: { text: 'C' },
        classList: [],
      },
    },
  }
}

describe('canvas editing domain helpers', () => {
  it('creates a canvas element with defaults', () => {
    const element = createCanvasElement({
      id: 'node-1',
      type: 'text',
      parentId: 'root',
      content: { text: 'hello' },
    })

    expect(element.id).toBe('node-1')
    expect(element.type).toBe('text')
    expect(element.children).toEqual([])
    expect(element.content).toEqual({ text: 'hello' })
  })

  it('reorders children deterministically', () => {
    const project = buildProject()
    const nextProject = reorderChild(project, 'root', 0, 2)

    expect(nextProject.nodes.root.children).toEqual(['b', 'c', 'a'])
    expect(nextProject.version).toBe(project.version + 1)
  })

  it('updates inline style for an element', () => {
    const project = buildProject()
    const nextProject = updateElementInlineStyle(project, 'a', { color: '#ff0000' })

    expect(nextProject.nodes.a.inlineStyle).toEqual({ color: '#ff0000' })
    expect(nextProject.version).toBe(project.version + 1)
  })
})
