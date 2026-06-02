import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import EditorShell from '../../src/lib/components/shell/EditorShell.svelte'

describe('live preview parity', () => {
  it('updates preview text when inspector edits content', async () => {
    render(EditorShell)

    const textInput = screen.getByLabelText('Text content')
    await fireEvent.input(textInput, { target: { value: 'Parity copy updated' } })

    const canvasNode = await screen.findByTestId('canvas-node-text-1')
    expect(canvasNode.textContent).toContain('Parity copy updated')
  })
})
