export interface ShortcutHandlers {
  undo: () => void
  redo: () => void
  exportZip: () => void
  focusNextPanel: () => void
}

function isMacLike(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

function wantsPrimaryModifier(event: KeyboardEvent): boolean {
  return isMacLike() ? event.metaKey : event.ctrlKey
}

export function handleShortcutEvent(event: KeyboardEvent, handlers: ShortcutHandlers): boolean {
  const key = event.key.toLowerCase()

  if (wantsPrimaryModifier(event) && key === 'z' && !event.shiftKey) {
    handlers.undo()
    return true
  }

  if (
    (wantsPrimaryModifier(event) && key === 'z' && event.shiftKey) ||
    (wantsPrimaryModifier(event) && key === 'y')
  ) {
    handlers.redo()
    return true
  }

  if (wantsPrimaryModifier(event) && key === 'e') {
    handlers.exportZip()
    return true
  }

  if (event.altKey && key === 'arrowright') {
    handlers.focusNextPanel()
    return true
  }

  return false
}

export function registerGlobalShortcuts(handlers: ShortcutHandlers): () => void {
  const listener = (event: KeyboardEvent): void => {
    const handled = handleShortcutEvent(event, handlers)
    if (!handled) return
    event.preventDefault()
  }

  window.addEventListener('keydown', listener)
  return () => window.removeEventListener('keydown', listener)
}
