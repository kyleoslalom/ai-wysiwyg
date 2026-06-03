<script lang="ts">
  import type { LayerNode } from '../../domain/schemas/layerNodeSchema'
  import type { HeaderProps, TextProps, ColumnsProps, PictureProps, SectionProps } from '../../domain/schemas/layerNodeSchema'
  import { getInspectorSchema } from '../../domain/project/inspectorSchemas'
  import { validateNodeProps } from '../../services/validator/inspectorValidator'
  import HeaderFields from './HeaderFields.svelte'
  import SectionTextFields from './SectionTextFields.svelte'
  import ColumnsPictureFields from './ColumnsPictureFields.svelte'

  export let selectedNode: LayerNode | null
  export let onNodeChange: (updated: LayerNode) => void

  $: schema = selectedNode ? getInspectorSchema(selectedNode) : null
  $: validation = selectedNode ? validateNodeProps(selectedNode) : { valid: true, errors: [] }

  function getFieldError(key: string): string | null {
    if (!validation) return null
    const err = validation.errors.find((e) => e.field === key)
    return err?.message ?? null
  }

  function handleNameChange(name: string): void {
    if (!selectedNode) return
    onNodeChange({ ...selectedNode, name })
  }

  function handleVisibilityChange(visible: boolean): void {
    if (!selectedNode) return
    onNodeChange({ ...selectedNode, visible })
  }

  function handleTextColorChange(textColor: string): void {
    if (!selectedNode) return
    onNodeChange({ ...selectedNode, style: { ...selectedNode.style, textColor } })
  }

  function handlePropsChange(updated: Record<string, unknown>): void {
    if (!selectedNode) return
    onNodeChange({ ...selectedNode, props: { ...selectedNode.props as object, ...updated } })
  }
</script>

<aside class="inspector-panel" aria-label="Properties inspector">
  <h2>Inspector</h2>

  {#if selectedNode && schema}
    <!-- Common fields -->
    <div class="inspector-group">
      <div class="group-label">Common</div>

      <label class="field-label">
        Name
        <input
          type="text"
          value={selectedNode.name}
          oninput={(e) => handleNameChange((e.currentTarget as HTMLInputElement).value)}
          placeholder="Layer name"
          aria-label="Layer name"
        />
        {#if getFieldError('name')}
          <span class="field-error" role="alert">{getFieldError('name')}</span>
        {/if}
      </label>

      <label class="field-label toggle-field">
        <span>Visible</span>
        <input
          type="checkbox"
          checked={selectedNode.visible}
          onchange={(e) => handleVisibilityChange((e.currentTarget as HTMLInputElement).checked)}
          aria-label="Layer visible"
        />
      </label>

      {#if ['header', 'text'].includes(selectedNode.type)}
        <label class="field-label">
          Text Color
          <input
            type="color"
            value={selectedNode.style.textColor ?? '#111827'}
            oninput={(e) => handleTextColorChange((e.currentTarget as HTMLInputElement).value)}
            aria-label="Text color"
          />
        </label>
      {/if}
    </div>

    <!-- Type-specific fields -->
    <div class="inspector-group">
      <div class="group-label">{selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}</div>

      {#if selectedNode.type === 'header'}
        <HeaderFields
          props={selectedNode.props as HeaderProps}
          onChange={(p) => handlePropsChange(p as Record<string, unknown>)}
        />
      {:else if selectedNode.type === 'text' || selectedNode.type === 'section'}
        <SectionTextFields
          type={selectedNode.type as 'text' | 'section'}
          props={selectedNode.props as TextProps | SectionProps}
          onChange={(p) => handlePropsChange(p as Record<string, unknown>)}
        />
      {:else if selectedNode.type === 'columns' || selectedNode.type === 'picture'}
        <ColumnsPictureFields
          type={selectedNode.type as 'columns' | 'picture'}
          props={selectedNode.props as ColumnsProps | PictureProps}
          onChange={(p) => handlePropsChange(p as Record<string, unknown>)}
        />
      {/if}
    </div>

    <!-- Validation feedback -->
    {#if !validation.valid && validation.errors.length > 0}
      <div class="validation-summary" role="alert" aria-live="polite">
        <div class="validation-title">⚠️ Validation issues</div>
        <ul class="validation-errors">
          {#each validation.errors as err}
            <li>{err.message}</li>
          {/each}
        </ul>
      </div>
    {/if}
  {:else}
    <p class="empty-state">Select a layer to edit its properties.</p>
  {/if}
</aside>

<style>
  .inspector-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    max-height: 100%;
  }

  .inspector-group {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 0.6rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #f9fafb;
  }

  .group-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: #374151;
  }

  .toggle-field {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  input[type='text'],
  input[type='color'] {
    border: 1px solid #d1d5db;
    border-radius: 0.4rem;
    padding: 0.45rem 0.6rem;
    font-size: 0.85rem;
    background: #fff;
    color: #111827;
  }

  input:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  input[type='color'] {
    padding: 0.1rem 0.4rem;
    height: 2rem;
    cursor: pointer;
  }

  .field-error {
    color: #dc2626;
    font-size: 0.78rem;
    font-weight: 400;
  }

  .empty-state {
    color: #9ca3af;
    text-align: center;
    font-size: 0.9rem;
  }

  .validation-summary {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.82rem;
    color: #7f1d1d;
  }

  .validation-title {
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  .validation-errors {
    margin: 0;
    padding-left: 1rem;
  }

  .validation-errors li {
    margin: 0.1rem 0;
  }
</style>
