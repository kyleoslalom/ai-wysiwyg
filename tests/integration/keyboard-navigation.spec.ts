import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import EditorShell from '../../src/lib/components/shell/EditorShell.svelte'

describe('keyboard navigation in shell', () => {
  it('cycles focus between editor panels using Alt+ArrowRight', async () => {
    render(EditorShell)

    const firstPanel = screen.getByTestId('panel-layers')
    firstPanel.focus()

    await fireEvent.keyDown(window, { key: 'ArrowRight', altKey: true })

    const secondPanel = screen.getByTestId('panel-canvas')
    expect(document.activeElement).toBe(secondPanel)
  })
})
