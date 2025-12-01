<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { KINETIC, COLORS } from '../../core/constants';

  export let progress: number = 0;
  export let size: number = 100;
  export let strokeWidth: number = 8;
  export let color: string = COLORS.PRIMARY;
  export let trackColor: string = COLORS.BG_LIGHT;
  export let animated: boolean = true;
  export let showLabel: boolean = true;
  export let label: string = '';

  const tweenedProgress = tweened(0, {
    duration: animated ? KINETIC.TRANSITION_NORMAL : 0,
    easing: cubicOut
  });

  $: tweenedProgress.set(progress);

  $: radius = (size - strokeWidth) / 2;
  $: circumference = 2 * Math.PI * radius;
  $: dashOffset = circumference - ($tweenedProgress / 100) * circumference;
  $: center = size / 2;
</script>

<div
  class="progress-ring relative inline-flex items-center justify-center"
  style="width: {size}px; height: {size}px; transform: translateZ(0);"
>
  <svg
    width={size}
    height={size}
    class="transform -rotate-90"
  >
    <!-- Track -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={trackColor}
      stroke-width={strokeWidth}
    />
    
    <!-- Progress -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      class="transition-all"
      style="transition-duration: {KINETIC.TRANSITION_NORMAL}ms;"
    />
  </svg>

  {#if showLabel}
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-text-primary font-bold" style="font-size: {size / 4}px;">
        {label || `${Math.round($tweenedProgress)}%`}
      </span>
    </div>
  {/if}
</div>

<style>
  .progress-ring {
    will-change: transform;
  }
  
  circle {
    will-change: stroke-dashoffset;
  }
</style>
