export interface InteractionBorderConfig {
  style: 'outline'
  width: string
  color: string
  offset: number
}

export const DEFAULT_INTERACTION_BORDER: InteractionBorderConfig = {
  style: 'outline',
  width: '2px',
  color: 'var(--color-accent)',
  offset: 2,
}

export function getInteractionBorderCss(config?: Partial<InteractionBorderConfig>): string {
  const resolved: InteractionBorderConfig = { ...DEFAULT_INTERACTION_BORDER, ...config }
  return `${resolved.style}: ${resolved.width} solid ${resolved.color}`
}