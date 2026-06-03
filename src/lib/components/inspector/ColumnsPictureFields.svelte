<script lang="ts">
  import type { ColumnsProps, PictureProps } from '../../domain/schemas/layerNodeSchema'
  import { validateColumnWidths, normalizeColumnWidths, applyColumnCount } from '../../services/editor/columnsLayout'

  export let type: 'columns' | 'picture'
  export let props: ColumnsProps | PictureProps
  export let onChange: (updated: Partial<ColumnsProps | PictureProps>) => void

  $: cp = props as ColumnsProps
  $: pp = props as PictureProps

  $: widthsNotice = (() => {
    if (type !== 'columns' || !cp.manualWidths) return null
    const result = validateColumnWidths(cp.manualWidths)
    return result.valid ? null : result.notice
  })()

  function handleColumnCountChange(count: number): void {
    const newWidths = applyColumnCount(count, (props as ColumnsProps).manualWidths ?? undefined)
    onChange({ columnCount: count, normalizedWidths: newWidths } as Partial<ColumnsProps>)
  }

  function handleManualWidthsInput(raw: string): void {
    const parts = raw.split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n))
    if (parts.length === 0) {
      onChange({ manualWidths: null, normalizedWidths: null } as Partial<ColumnsProps>)
      return
    }
    const normalized = normalizeColumnWidths(parts)
    onChange({ manualWidths: parts, normalizedWidths: normalized } as Partial<ColumnsProps>)
  }
</script>

<div class="inspector-section" aria-label="{type} inspector fields">
  {#if type === 'columns'}
    <label class="field-label">
      Column Count
      <input
        type="number"
        min="1"
        max="6"
        value={cp.columnCount}
        oninput={(e) => {
          const v = parseInt((e.currentTarget as HTMLInputElement).value, 10)
          if (v >= 1 && v <= 6) handleColumnCountChange(v)
        }}
        aria-label="Column count"
      />
    </label>

    <label class="field-label">
      Gap
      <input
        type="text"
        value={cp.gap ?? '1rem'}
        oninput={(e) => onChange({ gap: (e.currentTarget as HTMLInputElement).value } as Partial<ColumnsProps>)}
        placeholder="1rem"
        aria-label="Column gap"
      />
    </label>

    <label class="field-label">
      Collapse Breakpoint (px)
      <input
        type="number"
        min="0"
        max="2560"
        value={cp.collapseBreakpointPx ?? 768}
        oninput={(e) =>
          onChange({ collapseBreakpointPx: parseInt((e.currentTarget as HTMLInputElement).value, 10) } as Partial<ColumnsProps>)}
        aria-label="Collapse breakpoint"
      />
      <span class="help-text">Columns collapse to single column below this width. Default: 768px.</span>
    </label>

    <label class="field-label">
      Column Widths (%)
      <input
        type="text"
        value={cp.manualWidths ? cp.manualWidths.join(', ') : ''}
        oninput={(e) => handleManualWidthsInput((e.currentTarget as HTMLInputElement).value)}
        placeholder="50, 50"
        aria-label="Manual column widths"
      />
      <span class="help-text">Comma-separated percentages. Must total 100%.</span>
    </label>

    {#if widthsNotice}
      <div class="notice" role="status" aria-live="polite">{widthsNotice}</div>
    {/if}

  {:else}
    <label class="field-label">
      Alt Text
      <input
        type="text"
        value={pp.alt ?? ''}
        oninput={(e) => onChange({ alt: (e.currentTarget as HTMLInputElement).value } as Partial<PictureProps>)}
        placeholder="Describe the image for accessibility"
        aria-label="Image alt text"
      />
    </label>

    <label class="field-label">
      Caption
      <input
        type="text"
        value={pp.caption ?? ''}
        oninput={(e) => onChange({ caption: (e.currentTarget as HTMLInputElement).value } as Partial<PictureProps>)}
        placeholder="Optional figure caption"
        aria-label="Image caption"
      />
    </label>

    <div class="asset-info">
      {#if pp.assetRef}
        <span class="asset-path" title={pp.assetRef}>{pp.assetRef}</span>
      {:else}
        <span class="asset-placeholder">No image selected</span>
      {/if}
    </div>
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

  input {
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

  .help-text {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 400;
  }

  .notice {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 0.4rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    color: #92400e;
  }

  .asset-path {
    font-size: 0.75rem;
    color: #374151;
    font-family: monospace;
    word-break: break-all;
  }

  .asset-placeholder {
    font-size: 0.8rem;
    color: #9ca3af;
    font-style: italic;
  }
</style>
