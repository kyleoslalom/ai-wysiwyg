import { beforeEach, describe, expect, it } from 'vitest'
import { bootstrapRestore, bootstrapRichRestore } from '../../src/lib/services/persistence/restore'
import { saveToLocalStorage } from '../../src/lib/services/persistence/local-storage'
import type { Project, ProjectRegistry } from '../../src/lib/domain/types'
import { createRichSampleProject } from '../../src/lib/domain/project/rich-sample-project'

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

  it('restores existing active rich project from localStorage', () => {
    const richProject = createRichSampleProject()
    const registry: ProjectRegistry = {
      activeProjectId: richProject.id,
      projects: {
        [richProject.id]: {
          id: richProject.id,
          name: richProject.name,
          createdAt: richProject.createdAt,
          updatedAt: richProject.updatedAt,
          version: richProject.version,
        },
      },
      schemaVersion: 1,
      lastOpenedAt: richProject.updatedAt,
    }

    saveToLocalStorage('ai-wysiwyg:project-registry', registry)
    saveToLocalStorage(`ai-wysiwyg:project:${richProject.id}`, richProject)

    const result = bootstrapRichRestore()
    expect(result.restored).toBe(true)
    expect(result.project.id).toBe(richProject.id)
    expect(result.project.rootNodeId).toBe('root')
  })
})
