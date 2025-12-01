<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value: string = '';
  export let type: 'text' | 'number' | 'email' | 'password' | 'search' = 'text';
  export let placeholder: string = '';
  export let label: string = '';
  export let error: string = '';
  export let disabled: boolean = false;
  export let required: boolean = false;

  const dispatch = createEventDispatcher();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    dispatch('input', value);
  }
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label class="text-xs font-medium text-text-muted uppercase tracking-wider">
      {label}
      {#if required}
        <span class="text-red">*</span>
      {/if}
    </label>
  {/if}
  
  <input
    {type}
    {value}
    {placeholder}
    {disabled}
    {required}
    class="
      w-full px-3 py-2 rounded-md
      bg-bg-dark border border-primary/20
      text-text-primary placeholder:text-text-dim
      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-150
      {error ? 'border-red' : ''}
    "
    on:input={handleInput}
    on:focus
    on:blur
    on:keydown
  />

  {#if error}
    <span class="text-xs text-red">{error}</span>
  {/if}
</div>

<style>
  input {
    transform: translateZ(0);
  }
</style>
