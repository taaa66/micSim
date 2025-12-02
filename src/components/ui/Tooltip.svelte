<!--
  =============================================================================
  TOOLTIP COMPONENT
  =============================================================================
  Hover tooltip for additional information
  =============================================================================
-->

<script lang="ts">
  export let text: string = '';
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let delay: number = 200;
  
  let visible = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  function show() {
    timeoutId = setTimeout(() => {
      visible = true;
    }, delay);
  }
  
  function hide() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    visible = false;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="tooltip-wrapper"
  on:mouseenter={show}
  on:mouseleave={hide}
  on:focus={show}
  on:blur={hide}
>
  <slot></slot>
  
  {#if visible && text}
    <div class="tooltip tooltip-{position}" role="tooltip">
      {text}
      <span class="tooltip-arrow"></span>
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-flex;
  }
  
  .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 10000;
    pointer-events: none;
    animation: fadeIn 0.15s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: rgba(0, 0, 0, 0.9);
    transform: rotate(45deg);
  }
  
  /* Positions */
  .tooltip-top {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tooltip-top .tooltip-arrow {
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
  }
  
  .tooltip-bottom {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tooltip-bottom .tooltip-arrow {
    top: -4px;
    left: 50%;
    margin-left: -4px;
  }
  
  .tooltip-left {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
  
  .tooltip-left .tooltip-arrow {
    right: -4px;
    top: 50%;
    margin-top: -4px;
  }
  
  .tooltip-right {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
  
  .tooltip-right .tooltip-arrow {
    left: -4px;
    top: 50%;
    margin-top: -4px;
  }
</style>
