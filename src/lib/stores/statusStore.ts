import { writable } from 'svelte/store'

export interface ParityException {
  nodeId: string
  message: string
  kind: 'dom-structure' | 'visual-diff' | 'missing-node'
  timestamp: string
}

export interface StatusState {
  message: string | null
  kind: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}

export const parityExceptionsStore = writable<ParityException[]>([])
export const parityStatusStore = writable<StatusState | null>(null)

export function reportParityException(exception: Omit<ParityException, 'timestamp'>): void {
  const entry: ParityException = { ...exception, timestamp: new Date().toISOString() }
  parityExceptionsStore.update((list) => [...list, entry])
  parityStatusStore.set({
    message: `Parity issue: ${exception.message}`,
    kind: 'warning',
    timestamp: entry.timestamp,
  })
}

export function clearParityExceptions(): void {
  parityExceptionsStore.set([])
  parityStatusStore.set(null)
}

export function reportParitySuccess(): void {
  parityStatusStore.set({
    message: 'Canvas/export parity verified',
    kind: 'success',
    timestamp: new Date().toISOString(),
  })
}
