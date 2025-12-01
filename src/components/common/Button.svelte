<script lang="ts">
  import { KINETIC } from '../../core/constants';

  export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let fullWidth: boolean = false;

  const variants = {
    primary: 'bg-primary hover:bg-primary-bright text-bg-dark',
    secondary: 'bg-bg-light hover:bg-bg-medium text-text-primary border border-primary/30',
    ghost: 'bg-transparent hover:bg-bg-light text-text-secondary',
    danger: 'bg-red-dark hover:bg-red text-white'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
</script>

<button
  class="
    {variants[variant]}
    {sizes[size]}
    {fullWidth ? 'w-full' : ''}
    rounded-md font-medium
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  "
  style="transform: translateZ(0);"
  {disabled}
  on:click
  on:keydown
>
  {#if loading}
    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  {/if}
  <slot />
</button>

<style>
  button {
    will-change: transform, opacity;
  }
</style>
