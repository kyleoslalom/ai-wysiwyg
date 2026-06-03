export interface EditorLayoutConfig {
  canvasMinWidthFraction: number
  panelDefaultWidthPx: number
  panelCollapsedWidthPx: number
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  activePanelSide: 'left' | 'right' | null
}

export const DEFAULT_EDITOR_LAYOUT: EditorLayoutConfig = {
  canvasMinWidthFraction: 0.7,
  panelDefaultWidthPx: 280,
  panelCollapsedWidthPx: 48,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  activePanelSide: null,
}

export function isCanvasDominant(layout: EditorLayoutConfig): boolean {
  return layout.canvasMinWidthFraction >= 0.5 && layout.canvasMinWidthFraction <= 1.0
}