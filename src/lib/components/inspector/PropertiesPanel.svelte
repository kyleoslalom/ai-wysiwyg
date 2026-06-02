<script lang="ts">
  import type { CanvasElement } from '../../domain/types'

  export let selectedElement: CanvasElement | null
  export let onContentChange: (value: string) => void
  export let onColorChange: (value: string) => void

  $: textValue = selectedElement ? String(selectedElement.content.text ?? '') : ''
  $: colorValue = selectedElement?.inlineStyle?.color ?? '#111827'
</script>

<aside class="properties-panel" aria-label="Properties inspector">
  <h2>Inspector</h2>

  {#if selectedElement}
    <label>
      Text content
      <input
        aria-label="Text content"
        type="text"
        value={textValue}
        oninput={(event) => onContentChange((event.currentTarget as HTMLInputElement).value)}
      />
    </label>

    <label>
      Text color
      <input
        aria-label="Text color"
        type="color"
        value={colorValue}
        oninput={(event) => onColorChange((event.currentTarget as HTMLInputElement).value)}
      />
    </label>
  {:else}
    <p>Select an element to edit.</p>
  {/if}
</aside>

<style>
  .properties-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.9rem;
  }

  input {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.5rem;
    background: #fff;
  }
</style>
