<!--
  =============================================================================
  GLOW BUTTON COMPONENT
  =============================================================================
  Animated button with glow effects
  =============================================================================
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'premium' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let icon: string = '';
  export let fullWidth: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  function handleClick(e: MouseEvent) {
    if (!disabled && !loading) {
      dispatch('click', e);
    }
  }
</script>

<button
  class="glow-btn glow-{variant} size-{size}"
  class:disabled
  class:loading
  class:full-width={fullWidth}
  on:click={handleClick}
  {disabled}
>
  <span class="glow-effect"></span>
  <span class="btn-content">
    {#if loading}
      <span class="spinner"></span>
    {:else if icon}
      <span class="icon">{icon}</span>
    {/if}
    <slot></slot>
  </span>
</button>

<style>
  .glow-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .full-width {
    width: 100%;
  }
  
  /* Sizes */
  .size-sm {
    padding: 8px 16px;
    font-size: 0.85rem;
  }
  
  .size-md {
    padding: 12px 24px;
    font-size: 0.95rem;
  }
  
  .size-lg {
    padding: 16px 32px;
    font-size: 1.1rem;
  }
  
  /* Variants */
  .glow-primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  }
  
  .glow-primary:hover:not(.disabled) {
    box-shadow: 0 6px 25px rgba(59, 130, 246, 0.6);
    transform: translateY(-2px);
  }
  
  .glow-secondary {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .glow-secondary:hover:not(.disabled) {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
  
  .glow-success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }
  
  .glow-success:hover:not(.disabled) {
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.6);
    transform: translateY(-2px);
  }
  
  .glow-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  }
  
  .glow-danger:hover:not(.disabled) {
    box-shadow: 0 6px 25px rgba(239, 68, 68, 0.6);
    transform: translateY(-2px);
  }
  
  .glow-premium {
    background: linear-gradient(135deg, #f59e0b, #d97706, #f59e0b);
    background-size: 200% 200%;
    color: white;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
    animation: shimmer 3s ease infinite;
  }
  
  .glow-premium:hover:not(.disabled) {
    box-shadow: 0 6px 30px rgba(245, 158, 11, 0.7);
    transform: translateY(-2px);
  }
  
  @keyframes shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  /* Glow effect */
  .glow-effect {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  .glow-btn:hover:not(.disabled) .glow-effect {
    transform: translateX(100%);
  }
  
  .btn-content {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1;
  }
  
  .icon {
    font-size: 1.1em;
  }
  
  /* Loading state */
  .loading {
    pointer-events: none;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Disabled state */
  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  /* Active state */
  .glow-btn:active:not(.disabled) {
    transform: translateY(0) scale(0.98);
  }
</style>
