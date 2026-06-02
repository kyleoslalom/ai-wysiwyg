export function getEditorPanels(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-editor-panel]'))
}

export function moveFocusToNextPanel(): void {
  const panels = getEditorPanels()
  if (panels.length === 0) return

  const active = document.activeElement as HTMLElement | null
  const index = active ? panels.findIndex((panel) => panel === active) : -1
  const nextIndex = index < 0 ? 0 : (index + 1) % panels.length
  panels[nextIndex]?.focus()
}
