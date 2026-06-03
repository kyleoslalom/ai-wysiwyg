<script lang="ts">
  import { dragStateStore } from '../../stores/dragState'

  let visible = false
  let top = 0
  let left = 0
  let width = 0

  dragStateStore.subscribe(($state) => {
    if ($state.phase === 'DRAGGING' && $state.currentDropIndex !== null && $state.isValidTarget) {
      visible = true
    } else {
      visible = false
    }
  })

  export function updatePosition(element: Element, index: number): void {
    const rect = element.getBoundingClientRect()
    top = rect.top
    left = rect.left
    width = rect.width
  }
</script>

{#if visible}
  <div
    class="drop-indicator"
    class:visible
    style="top: {top}px; left: {left}px; width: {width}px;"
    aria-hidden="true"
  ></div>
{/if}

<style>
  .drop-indicator {
    position: absolute;
    height: 3px;
    background: var(--color-accent, #2563eb);
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
    transform: translateY(-1.5px);
    transition: top 0.05s ease, left 0.05s ease;
  }
</style>