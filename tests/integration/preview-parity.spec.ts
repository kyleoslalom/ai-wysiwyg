import { fireEvent, render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import EditorShell from '../../src/lib/components/shell/EditorShell.svelte'

describe('live preview parity', () => {
  it('updates preview text when inspector edits content', async () => {
    render(EditorShell)

    // Select the text node to make type-specific inspector fields appear
    const textNode = await screen.findByTestId('canvas-node-text-summary')
    await fireEvent.click(textNode)

    const textInput = await screen.findByLabelText('Text content')
    await fireEvent.input(textInput, { target: { value: 'Parity copy updated' } })

    const canvasNode = await screen.findByTestId('canvas-node-text-summary')
    expect(canvasNode.textContent).toContain('Parity copy updated')
  })
})
