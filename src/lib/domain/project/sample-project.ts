import type { Project } from '../types'

export function createSampleProject(overrides?: Partial<Project>): Project {
  const now = new Date().toISOString()

  const project: Project = {
    id: 'project-1',
    name: 'ai-wysiwyg',
    createdAt: now,
    updatedAt: now,
    rootNodeId: 'root',
    version: 1,
    interactions: [
      {
        id: 'interaction-1',
        elementId: 'button-1',
        eventType: 'click',
        presetKey: 'toggle-class',
        config: { className: 'is-active' },
      },
    ],
    styles: {
      headingStyle: {
        id: 'headingStyle',
        selector: '[data-node-id="heading-1"]',
        declarations: {
          fontSize: '1.4rem',
          fontWeight: '700',
          color: '#111827',
        },
        order: 1,
      },
      textStyle: {
        id: 'textStyle',
        selector: '[data-node-id="text-1"]',
        declarations: {
          lineHeight: '1.6',
          color: '#334155',
        },
        order: 2,
      },
    },
    nodes: {
      root: {
        id: 'root',
        type: 'container',
        parentId: null,
        children: ['heading-1', 'text-1', 'button-1'],
        content: {},
        classList: ['page-root'],
      },
      'heading-1': {
        id: 'heading-1',
        type: 'heading',
        parentId: 'root',
        children: [],
        content: { text: 'Welcome to ai-wysiwyg' },
        classList: ['hero-heading'],
      },
      'text-1': {
        id: 'text-1',
        type: 'text',
        parentId: 'root',
        children: [],
        content: { text: 'Edit this copy and export a static page.' },
        classList: ['hero-copy'],
      },
      'button-1': {
        id: 'button-1',
        type: 'button',
        parentId: 'root',
        children: [],
        content: { text: 'Primary Action' },
        classList: ['hero-cta'],
      },
    },
  }

  return {
    ...project,
    ...overrides,
  }
}
