<script lang="ts">
  import { availableThemesStore, activeThemeStore, selectTheme } from '../../stores/themeStore'

  $: themes = $availableThemesStore
  $: activeTheme = $activeThemeStore
</script>

<div class="toolbar" role="toolbar" aria-label="Editor toolbar">
  <div class="toolbar-group">
    <label class="theme-label" for="theme-selector">
      Theme:
    </label>
    <select
      id="theme-selector"
      value={activeTheme.id}
      onchange={(e) => selectTheme((e.currentTarget as HTMLSelectElement).value)}
      aria-label="Select color theme"
      class="theme-select"
    >
      {#each themes as theme}
        <option value={theme.id}>{theme.label}</option>
      {/each}
    </select>
  </div>

  <div class="theme-preview" aria-hidden="true">
    {#each Object.entries(activeTheme.tokens).slice(0, 6) as [key, value]}
      <span
        class="color-swatch"
        style="background: {value}"
        title="{key}: {value}"
      ></span>
    {/each}
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.4rem 1rem;
    background: var(--color-panel, #f9fafb);
    border-bottom: 1px solid var(--color-border, #d1d5db);
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .theme-label {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--color-textMuted, #6b7280);
    white-space: nowrap;
  }

  .theme-select {
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.35rem;
    padding: 0.3rem 0.6rem;
    font-size: 0.82rem;
    background: var(--color-surface, #fff);
    color: var(--color-text, #1f2937);
    cursor: pointer;
  }

  .theme-select:focus {
    outline: 2px solid var(--color-focus, #3b82f6);
    outline-offset: 1px;
  }

  .theme-preview {
    display: flex;
    gap: 0.3rem;
  }

  .color-swatch {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
    display: inline-block;
  }
</style>
