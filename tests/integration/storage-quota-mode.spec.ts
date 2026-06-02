import { describe, expect, it, vi } from 'vitest'
import { createAutosaveCoordinator } from '../../src/lib/services/persistence/autosave'
import type { Project } from '../../src/lib/domain/types'

function project(): Project {
  return {
    id: 'quota-test',
    name: 'Quota Test',
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
}

describe('storage-full degraded mode', () => {
  it('handles localStorage quota errors without throwing', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })

    const coordinator = createAutosaveCoordinator(0)
    expect(() => coordinator.flush(project())).not.toThrow()

    setItemSpy.mockRestore()
  })
})
