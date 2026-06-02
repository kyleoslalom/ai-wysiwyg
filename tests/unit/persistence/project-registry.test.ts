import { beforeEach, describe, expect, it } from 'vitest'
import {
  createRegistry,
  registerProjectMetadata,
  removeProjectMetadata,
  setActiveProjectInRegistry,
} from '../../../src/lib/stores/projects'
import type { ProjectMetadata } from '../../../src/lib/domain/types'

function metadata(id: string): ProjectMetadata {
  return {
    id,
    name: `Project ${id}`,
    createdAt: '2026-06-02T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
    version: 1,
  }
}

describe('project registry CRUD + active pointer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds metadata and sets active project', () => {
    const initial = createRegistry()
    const withProject = registerProjectMetadata(initial, metadata('a'))
    const activated = setActiveProjectInRegistry(withProject, 'a')

    expect(activated.projects.a.id).toBe('a')
    expect(activated.activeProjectId).toBe('a')
  })

  it('does not set active project for unknown id', () => {
    const initial = createRegistry()
    const activated = setActiveProjectInRegistry(initial, 'missing')

    expect(activated.activeProjectId).toBeNull()
  })

  it('removes project metadata and clears active pointer if removed', () => {
    const initial = createRegistry()
    const withA = registerProjectMetadata(initial, metadata('a'))
    const activated = setActiveProjectInRegistry(withA, 'a')
    const removed = removeProjectMetadata(activated, 'a')

    expect(removed.projects.a).toBeUndefined()
    expect(removed.activeProjectId).toBeNull()
  })
})
