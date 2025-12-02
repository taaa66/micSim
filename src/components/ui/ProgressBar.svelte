<!--
  =============================================================================
  PROGRESS BAR COMPONENT
  =============================================================================
  Animated progress indicator with multiple variants
  =============================================================================
-->

<script lang="ts">
  export let value: number = 0;
  export let max: number = 100;
  export let variant: 'default' | 'success' | 'warning' | 'error' | 'gradient' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showLabel: boolean = false;
  export let label: string = '';
  export let animated: boolean = true;
  export let striped: boolean = false;
  
  $: percentage = Math.min(100, Math.max(0, (value / max) * 100));
  $: displayLabel = label || `${Math.round(percentage)}%`;
</script>

<div class="progress-container" class:has-label={showLabel}>
  {#if showLabel}
    <div class="progress-label">
      <span class="label-text">{displayLabel}</span>
      <span class="label-value">{value}/{max}</span>
    </div>
  {/if}
  
  <div 
    class="progress-track progress-{size}"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-label={displayLabel}
  >
    <div 
      class="progress-fill progress-{variant}"
      class:animated
      class:striped
      style="width: {percentage}%"
    ></div>
  </div>
</div>

<style>
  .progress-container {
    width: 100%;
  }
  
  .progress-container.has-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .label-text {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }
  
  .label-value {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .progress-track {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    overflow: hidden;
  }
  
  .progress-sm { height: 4px; }
  .progress-md { height: 8px; }
  .progress-lg { height: 12px; }
  
  .progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }
  
  .progress-fill.animated {
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .progress-fill.striped {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    animation: stripes 1s linear infinite;
  }
  
  @keyframes stripes {
    from { background-position: 1rem 0; }
    to { background-position: 0 0; }
  }
  
  /* Variants */
  .progress-default {
    background: #3b82f6;
  }
  
  .progress-success {
    background: #10b981;
  }
  
  .progress-warning {
    background: #f59e0b;
  }
  
  .progress-error {
    background: #ef4444;
  }
  
  .progress-gradient {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  }
</style>
