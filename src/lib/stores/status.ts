import { writable } from 'svelte/store'
import type { OperationStatus } from '../domain/types'

const initial: Record<OperationStatus['key'], OperationStatus> = {
  autosave: { key: 'autosave', state: 'idle', updatedAt: new Date().toISOString() },
  restore: { key: 'restore', state: 'idle', updatedAt: new Date().toISOString() },
  snapshot: { key: 'snapshot', state: 'idle', updatedAt: new Date().toISOString() },
  reset: { key: 'reset', state: 'idle', updatedAt: new Date().toISOString() },
  export: { key: 'export', state: 'idle', updatedAt: new Date().toISOString() },
  validation: { key: 'validation', state: 'idle', updatedAt: new Date().toISOString() },
}

export const operationStatusStore = writable(initial)

export function setOperationStatus(
  key: OperationStatus['key'],
  state: OperationStatus['state'],
  message?: string,
): void {
  operationStatusStore.update((current) => ({
    ...current,
    [key]: {
      key,
      state,
      message,
      updatedAt: new Date().toISOString(),
    },
  }))
}
