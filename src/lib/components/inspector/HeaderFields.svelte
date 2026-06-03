<script lang="ts">
  import type { HeaderProps } from '../../domain/schemas/layerNodeSchema'

  export let props: HeaderProps
  export let onChange: (updated: Partial<HeaderProps>) => void

  const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
</script>

<div class="inspector-section" aria-label="Header inspector fields">
  <label class="field-label">
    Heading Level
    <select
      value={props.headerLevel}
      onchange={(e) => onChange({ headerLevel: (e.currentTarget as HTMLSelectElement).value as HeaderProps['headerLevel'] })}
      aria-label="Heading level"
    >
      {#each levels as level}
        <option value={level}>{level.toUpperCase()}</option>
      {/each}
    </select>
  </label>

  <label class="field-label">
    Heading Text
    <input
      type="text"
      value={props.text}
      oninput={(e) => onChange({ text: (e.currentTarget as HTMLInputElement).value })}
      placeholder="Enter heading text..."
      aria-label="Heading text"
    />
  </label>
</div>

<style>
  .inspector-section {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .field-label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: #374151;
  }

  select, input {
    border: 1px solid #d1d5db;
    border-radius: 0.4rem;
    padding: 0.45rem 0.6rem;
    font-size: 0.85rem;
    background: #fff;
    color: #111827;
  }

  select:focus, input:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }
</style>
