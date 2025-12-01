<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { KINETIC } from '../../core/constants';

  export let open: boolean = false;
  export let title: string = '';
  export let size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  export let closeOnBackdrop: boolean = true;
  export let showClose: boolean = true;

  const dispatch = createEventDispatcher();

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-[90vw] max-h-[90vh]'
  };

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick() {
    if (closeOnBackdrop) {
      handleClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      handleClose();
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    transition:fade={{ duration: KINETIC.TRANSITION_FAST }}
  >
    <!-- Overlay -->
    <div
      class="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
      on:click={handleBackdropClick}
      on:keydown={(e) => e.key === 'Enter' && handleBackdropClick()}
      role="button"
      tabindex="0"
    />

    <!-- Modal Content -->
    <div
      class="
        relative z-10 {sizes[size]} w-full
        bg-bg-medium border border-primary/20 rounded-lg
        shadow-xl shadow-primary/10
        overflow-hidden
      "
      style="transform: translateZ(0);"
      transition:scale={{ duration: KINETIC.TRANSITION_NORMAL, start: 0.95 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <!-- Header -->
      {#if title || showClose}
        <div class="flex items-center justify-between px-4 py-3 border-b border-primary/10">
          {#if title}
            <h2 id="modal-title" class="text-lg font-semibold text-text-primary">
              {title}
            </h2>
          {:else}
            <div />
          {/if}
          
          {#if showClose}
            <button
              class="text-text-muted hover:text-text-primary transition-colors p-1"
              on:click={handleClose}
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <!-- Body -->
      <div class="p-4">
        <slot />
      </div>

      <!-- Footer (if provided) -->
      {#if $$slots.footer}
        <div class="px-4 py-3 border-t border-primary/10 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  div[role="dialog"] {
    will-change: transform, opacity;
  }
</style>
