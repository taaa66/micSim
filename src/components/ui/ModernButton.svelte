<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  import { spring } from 'svelte/motion';

  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let icon: string | null = null;
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;

  const dispatch = createEventDispatcher();

  // Physics-based scale animation for hover/click
  const buttonScale = spring(1, {
    stiffness: 0.15,
    damping: 0.4
  });

  function handleMouseEnter() {
    if (!disabled && !loading) buttonScale.set(1.02);
  }

  function handleMouseLeave() {
    if (!disabled && !loading) buttonScale.set(1);
  }

  function handleMouseDown() {
    if (!disabled && !loading) buttonScale.set(0.95);
  }

  function handleMouseUp() {
    if (!disabled && !loading) buttonScale.set(1.02);
  }

  function handleClick(e: MouseEvent) {
    if (!disabled && !loading) dispatch('click', e);
  }
</script>

<button
  class="modern-btn variant-{variant} size-{size}"
  class:full-width={fullWidth}
  class:loading
  disabled={disabled || loading}
  style="transform: scale({$buttonScale})"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:click={handleClick}
  on:focus
  on:blur
  aria-busy={loading}
>
  {#if loading}
    <span class="loader" transition:scale={{ duration: 200, start: 0.5 }}></span>
  {:else if icon}
    <span class="icon">{icon}</span>
  {/if}
  
  <span class="label">
    <slot />
  </span>

  {#if !loading && variant === 'primary'}
    <div class="glow-effect"></div>
  {/if}
</button>

<style>
  .modern-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2, 0.5rem);
    border: none;
    border-radius: 12px;
    font-family: var(--font-display, sans-serif);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .modern-btn:focus-visible {
    outline: 2px solid var(--color-teal-400, #2dd4bf);
    outline-offset: 2px;
  }

  .modern-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
  }

  /* SIZES */
  .size-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  .size-md {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
  .size-lg {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
  .full-width {
    width: 100%;
  }

  /* VARIANTS */
  .variant-primary {
    background: var(--color-teal-500, #14b8a6);
    color: white;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
  }
  .variant-primary:hover:not(:disabled) {
    background: var(--color-teal-400, #2dd4bf);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  }

  .variant-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-teal-100, #ccfbf1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
  .variant-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--color-teal-500, #14b8a6);
  }

  .variant-ghost {
    background: transparent;
    color: var(--color-teal-400, #2dd4bf);
  }
  .variant-ghost:hover:not(:disabled) {
    background: rgba(20, 184, 166, 0.1);
  }

  /* GLOW EFFECT */
  .glow-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: skewX(-20deg);
    animation: shimmer 3s infinite;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    20% { left: 200%; }
    100% { left: 200%; }
  }

  /* LOADER */
  .loader {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
