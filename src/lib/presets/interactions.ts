import type { InteractionBinding } from '../domain/types'

export interface InteractionPreset {
  key: string
  label: string
  toRuntime(binding: InteractionBinding): string
}

function toNodeLookup(elementId: string): string {
  return `document.querySelector('[data-node-id="${elementId}"]')`
}

export const interactionPresets: InteractionPreset[] = [
  {
    key: 'toggle-class',
    label: 'Toggle Class',
    toRuntime(binding) {
      const className = String(binding.config.className ?? 'is-active')
      return `${toNodeLookup(binding.elementId)}?.classList.toggle('${className}')`
    },
  },
  {
    key: 'show-hide',
    label: 'Show / Hide',
    toRuntime(binding) {
      return `(() => { const el = ${toNodeLookup(binding.elementId)}; if (!el) return; el.hidden = !el.hidden })()`
    },
  },
  {
    key: 'scroll-to',
    label: 'Scroll To Element',
    toRuntime(binding) {
      const target = String(binding.config.targetId ?? binding.elementId)
      return `document.querySelector('[data-node-id="${target}"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`
    },
  },
]

export function getInteractionPreset(key: string): InteractionPreset | undefined {
  return interactionPresets.find((preset) => preset.key === key)
}
