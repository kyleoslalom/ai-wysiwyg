import { beforeEach, describe, expect, it } from 'vitest'
import { bootstrapRichRestore } from '../../src/lib/services/persistence/restore'
import { saveToLocalStorage } from '../../src/lib/services/persistence/local-storage'
import type { ProjectRegistry } from '../../src/lib/domain/types'
import { createRichSampleProject } from '../../src/lib/domain/project/rich-sample-project'

describe('restore-on-reload flow', () => {
  beforeEach(() => {
    localStorage.clear()
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
