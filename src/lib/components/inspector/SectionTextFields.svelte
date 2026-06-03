<script lang="ts">
  import type { TextProps, SectionProps } from '../../domain/schemas/layerNodeSchema'

  export let type: 'text' | 'section'
  export let props: TextProps | SectionProps
  export let onChange: (updated: Partial<TextProps | SectionProps>) => void

  $: textProps = props as TextProps
  $: sectionProps = props as SectionProps
</script>

<div class="inspector-section" aria-label="{type} inspector fields">
  {#if type === 'text'}
    <label class="field-label">
      Text Content
      <textarea
        value={textProps.content ?? ''}
        oninput={(e) => onChange({ content: (e.currentTarget as HTMLTextAreaElement).value })}
        placeholder="Enter text content..."
        rows="4"
        aria-label="Text content"
      ></textarea>
    </label>

    <label class="field-label">
      Link URL
      <input
        type="url"
        value={textProps.link?.href ?? ''}
        oninput={(e) => {
          const href = (e.currentTarget as HTMLInputElement).value
          onChange({ link: href ? { href, target: textProps.link?.target } : null })
        }}
        placeholder="https://example.com"
        aria-label="Link URL"
      />
      <span class="help-text">Leave blank for no link</span>
    </label>
  {:else}
    <label class="field-label">
      Padding
      <input
        type="text"
        value={(sectionProps as Record<string, unknown>)['padding'] as string ?? ''}
        oninput={(e) => onChange({ padding: (e.currentTarget as HTMLInputElement).value })}
        placeholder="1rem"
        aria-label="Section padding"
      />
      <span class="help-text">CSS padding value (e.g. 1rem, 16px)</span>
    </label>
  {/if}
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

  input, textarea {
    border: 1px solid #d1d5db;
    border-radius: 0.4rem;
    padding: 0.45rem 0.6rem;
    font-size: 0.85rem;
    background: #fff;
    color: #111827;
    resize: vertical;
    font-family: inherit;
  }

  input:focus, textarea:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .help-text {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 400;
  }
</style>
