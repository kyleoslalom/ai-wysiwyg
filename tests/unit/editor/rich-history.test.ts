import { beforeEach, describe, expect, it } from 'vitest'
import { createRichSampleProject } from '../../../src/lib/domain/project/rich-sample-project'
import { clearActionHistory, recordProjectSnapshot, redo, undo } from '../../../src/lib/stores/editor-actions'

describe('rich editor action history', () => {
  beforeEach(() => {
    clearActionHistory()
  })

  it('undo restores the previous rich snapshot', () => {
    const initial = createRichSampleProject()
    const edited = {
      ...initial,
      nodes: {
        ...initial.nodes,
        'header-welcome': {
          ...initial.nodes['header-welcome']!,
          name: 'Edited heading',
        },
      },
    }

    recordProjectSnapshot(initial)
    const previous = undo(edited)

    expect(previous).not.toBeNull()
    expect(previous?.nodes['header-welcome']?.name).toBe('Welcome Heading')
  })

  it('redo reapplies a reverted rich snapshot', () => {
    const initial = createRichSampleProject()
    const edited = {
      ...initial,
      nodes: {
        ...initial.nodes,
        'header-welcome': {
          ...initial.nodes['header-welcome']!,
          name: 'Edited heading',
        },
      },
    }

    recordProjectSnapshot(initial)
    const previous = undo(edited)
    const restored = redo(previous ?? initial)

    expect(restored).not.toBeNull()
    expect(restored?.nodes['header-welcome']?.name).toBe('Edited heading')
  })
})