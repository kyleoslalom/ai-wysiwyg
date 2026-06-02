import { describe, expect, it, vi } from 'vitest'
import { handleShortcutEvent } from '../../../src/lib/services/editor/shortcuts'

describe('shortcut mappings', () => {
  it('triggers undo on Ctrl/Cmd+Z', () => {
    const handlers = {
      undo: vi.fn(),
      redo: vi.fn(),
      exportZip: vi.fn(),
      focusNextPanel: vi.fn(),
    }

    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })
    const handled = handleShortcutEvent(event, handlers)

    expect(handled).toBe(true)
    expect(handlers.undo).toHaveBeenCalledTimes(1)
  })

  it('triggers redo on Ctrl/Cmd+Shift+Z', () => {
    const handlers = {
      undo: vi.fn(),
      redo: vi.fn(),
      exportZip: vi.fn(),
      focusNextPanel: vi.fn(),
    }

    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true })
    const handled = handleShortcutEvent(event, handlers)

    expect(handled).toBe(true)
    expect(handlers.redo).toHaveBeenCalledTimes(1)
  })
})
