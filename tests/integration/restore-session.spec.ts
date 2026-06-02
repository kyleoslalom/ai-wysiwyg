import { beforeEach, describe, expect, it } from 'vitest'
import { bootstrapRestore } from '../../src/lib/services/persistence/restore'
import { saveToLocalStorage } from '../../src/lib/services/persistence/local-storage'
import type { Project, ProjectRegistry } from '../../src/lib/domain/types'

describe('restore-on-reload flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('restores existing active project from localStorage', () => {
    const project: Project = {
      id: 'restored',
      name: 'Restored Project',
      createdAt: '2026-06-02T00:00:00.000Z',
      updatedAt: '2026-06-02T00:00:00.000Z',
      rootNodeId: 'root',
      nodes: {
        root: {
          id: 'root',
          type: 'container',
          parentId: null,
          children: [],
          content: {},
          classList: [],
        },
      },
      styles: {},
      interactions: [],
      version: 1,
    }

    const registry: ProjectRegistry = {
      activeProjectId: 'restored',
      projects: {
        restored: {
          id: 'restored',
          name: 'Restored Project',
          createdAt: '2026-06-02T00:00:00.000Z',
          updatedAt: '2026-06-02T00:00:00.000Z',
          version: 1,
        },
      },
      schemaVersion: 1,
    }

    saveToLocalStorage('ai-wysiwyg:project-registry', registry)
    saveToLocalStorage('ai-wysiwyg:project:restored', project)

    const result = bootstrapRestore()
    expect(result.restored).toBe(true)
    expect(result.project.id).toBe('restored')
  })
})
