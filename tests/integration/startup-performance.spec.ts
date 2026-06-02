import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import EditorShell from '../../src/lib/components/shell/EditorShell.svelte'

describe('startup performance smoke test', () => {
  it('renders editor shell under budget on test hardware baseline', () => {
    const start = performance.now()
    render(EditorShell)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(2000)
  })
})
