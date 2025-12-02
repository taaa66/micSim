<!--
  =============================================================================
  TOAST NOTIFICATION COMPONENT
  =============================================================================
  Displays temporary notification messages
  =============================================================================
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  
  // Props
  export let message: string = '';
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let duration: number = 3000;
  export let position: 'top' | 'bottom' | 'top-right' | 'bottom-right' = 'top-right';
  export let dismissible: boolean = true;
  export let onClose: (() => void) | null = null;
  
  // State
  let visible = true;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  // Icons per type
  const icons: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  function close() {
    visible = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (onClose) {
      onClose();
    }
  }
  
  onMount(() => {
    if (duration > 0) {
      timeoutId = setTimeout(close, duration);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
  
  // Position classes
  $: positionClass = {
    'top': 'toast-top',
    'bottom': 'toast-bottom',
    'top-right': 'toast-top-right',
    'bottom-right': 'toast-bottom-right'
  }[position];
</script>

{#if visible}
  <div 
    class="toast toast-{type} {positionClass}"
    role="alert"
    aria-live="polite"
    in:fly={{ y: position.includes('top') ? -20 : 20, duration: 300 }}
    out:fade={{ duration: 200 }}
  >
    <span class="toast-icon">{icons[type]}</span>
    <span class="toast-message">{message}</span>
    {#if dismissible}
      <button class="toast-close" on:click={close} aria-label="סגור">
        ✕
      </button>
    {/if}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-radius: 10px;
    background: rgba(30, 30, 40, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    max-width: 400px;
    min-width: 280px;
  }
  
  .toast-top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .toast-bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .toast-top-right {
    top: 20px;
    right: 20px;
  }
  
  .toast-bottom-right {
    bottom: 20px;
    right: 20px;
  }
  
  .toast-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .toast-success .toast-icon {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }
  
  .toast-error .toast-icon {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
  
  .toast-warning .toast-icon {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }
  
  .toast-info .toast-icon {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }
  
  .toast-message {
    flex: 1;
    color: white;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .toast-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 4px;
    font-size: 14px;
    transition: color 0.2s;
    flex-shrink: 0;
  }
  
  .toast-close:hover {
    color: white;
  }
  
  /* Border accents */
  .toast-success {
    border-left: 3px solid #10b981;
  }
  
  .toast-error {
    border-left: 3px solid #ef4444;
  }
  
  .toast-warning {
    border-left: 3px solid #f59e0b;
  }
  
  .toast-info {
    border-left: 3px solid #3b82f6;
  }
  
  @media (max-width: 480px) {
    .toast {
      left: 10px;
      right: 10px;
      max-width: none;
      min-width: auto;
      transform: none;
    }
    
    .toast-top-right,
    .toast-bottom-right {
      left: 10px;
      right: 10px;
    }
  }
</style>
