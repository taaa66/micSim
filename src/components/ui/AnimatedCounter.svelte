<!--
  =============================================================================
  ANIMATED COUNTER COMPONENT
  =============================================================================
  Smooth counting animation for numbers
  =============================================================================
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  
  export let value: number = 0;
  export let duration: number = 1000;
  export let format: 'number' | 'percent' | 'currency' | 'compact' = 'number';
  export let decimals: number = 0;
  export let prefix: string = '';
  export let suffix: string = '';
  export let delay: number = 0;
  
  const displayValue = tweened(0, {
    duration,
    easing: cubicOut
  });
  
  $: {
    if (delay > 0) {
      setTimeout(() => displayValue.set(value), delay);
    } else {
      displayValue.set(value);
    }
  }
  
  function formatValue(val: number): string {
    switch (format) {
      case 'percent':
        return `${val.toFixed(decimals)}%`;
      case 'currency':
        return `₪${val.toLocaleString('he-IL', { minimumFractionDigits: decimals })}`;
      case 'compact':
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toFixed(decimals);
      default:
        return val.toLocaleString('he-IL', { 
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals 
        });
    }
  }
</script>

<span class="counter">
  {prefix}{formatValue($displayValue)}{suffix}
</span>

<style>
  .counter {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
  }
</style>
