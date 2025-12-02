<!--
  =============================================================================
  BADGE COMPONENT
  =============================================================================
  Status badges and labels
  =============================================================================
-->

<script lang="ts">
  export let variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let rounded: boolean = false;
  export let dot: boolean = false;
  export let pulse: boolean = false;
</script>

<span class="badge badge-{variant} badge-{size}" class:rounded class:dot class:pulse>
  {#if dot}
    <span class="dot-indicator"></span>
  {/if}
  <slot></slot>
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
  }
  
  .badge.rounded {
    border-radius: 999px;
  }
  
  /* Sizes */
  .badge-sm {
    padding: 2px 8px;
    font-size: 0.7rem;
  }
  
  .badge-md {
    padding: 4px 10px;
    font-size: 0.8rem;
  }
  
  .badge-lg {
    padding: 6px 14px;
    font-size: 0.9rem;
  }
  
  /* Variants */
  .badge-default {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }
  
  .badge-success {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  }
  
  .badge-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }
  
  .badge-error {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }
  
  .badge-info {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }
  
  .badge-premium {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2));
    color: #fbbf24;
  }
  
  /* Dot indicator */
  .dot-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  
  .badge.pulse .dot-indicator {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }
  
  /* Dot-only badge */
  .badge.dot:empty {
    padding: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  .badge.dot:empty .dot-indicator {
    display: none;
  }
  
  .badge-sm.dot:empty { width: 6px; height: 6px; }
  .badge-lg.dot:empty { width: 10px; height: 10px; }
</style>
