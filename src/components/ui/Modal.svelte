<!--
  =============================================================================
  MODAL COMPONENT
  =============================================================================
  Reusable modal dialog with backdrop
  =============================================================================
-->

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  
  // Props
  export let open: boolean = false;
  export let title: string = '';
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  export let closable: boolean = true;
  export let closeOnBackdrop: boolean = true;
  export let closeOnEscape: boolean = true;
  export let showHeader: boolean = true;
  export let showFooter: boolean = false;
  
  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
  }>();
  
  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape && closable) {
      close();
    }
  }
  
  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && closeOnBackdrop && closable) {
      close();
    }
  }
  
  function close() {
    open = false;
    dispatch('close');
  }
  
  // Lock body scroll when modal is open
  $: if (typeof document !== 'undefined') {
    if (open) {
      document.body.style.overflow = 'hidden';
      dispatch('open');
    } else {
      document.body.style.overflow = '';
    }
  }
  
  onMount(() => {
    if (closeOnEscape) {
      window.addEventListener('keydown', handleKeydown);
    }
  });
  
  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    if (closeOnEscape) {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
  
  // Size classes
  const sizeClasses: Record<string, string> = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    full: 'modal-full'
  };
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="modal-backdrop"
    on:click={handleBackdropClick}
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="modal {sizeClasses[size]}"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      {#if showHeader}
        <header class="modal-header">
          {#if title}
            <h2 id="modal-title" class="modal-title">{title}</h2>
          {:else}
            <slot name="header"></slot>
          {/if}
          {#if closable}
            <button 
              class="modal-close" 
              on:click={close}
              aria-label="סגור"
            >
              ✕
            </button>
          {/if}
        </header>
      {/if}
      
      <div class="modal-body">
        <slot></slot>
      </div>
      
      {#if showFooter}
        <footer class="modal-footer">
          <slot name="footer">
            <button class="btn-secondary" on:click={close}>סגור</button>
          </slot>
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9000;
    padding: 20px;
  }
  
  .modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .modal-sm { width: 100%; max-width: 400px; }
  .modal-md { width: 100%; max-width: 560px; }
  .modal-lg { width: 100%; max-width: 800px; }
  .modal-xl { width: 100%; max-width: 1140px; }
  .modal-full { width: calc(100% - 40px); height: calc(100vh - 40px); max-width: none; }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
  }
  
  .modal-close {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.6);
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s;
  }
  
  .modal-close:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
  
  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .btn-secondary {
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 640px) {
    .modal-backdrop {
      padding: 10px;
    }
    
    .modal {
      max-height: calc(100vh - 20px);
    }
    
    .modal-sm,
    .modal-md,
    .modal-lg,
    .modal-xl {
      max-width: none;
      width: 100%;
    }
    
    .modal-header {
      padding: 16px 20px;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .modal-footer {
      padding: 12px 20px;
    }
  }
</style>
