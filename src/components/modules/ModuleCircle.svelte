<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { KINETIC, COLORS, MODULE_CONFIG } from '../../core/constants';
  import type { IModuleData } from '../../core/models';

  export let module: IModuleData;
  export let angle: number = 0;
  export let radius: number = 35; // vw
  export let selected: boolean = false;
  export let size: number = 12; // vw

  const dispatch = createEventDispatcher();

  function getMasteryColor(mastery: number): string {
    if (mastery >= MODULE_CONFIG.MASTERY_PLATINUM) return COLORS.GRADE_S;
    if (mastery >= MODULE_CONFIG.MASTERY_GOLD) return COLORS.GRADE_A;
    if (mastery >= MODULE_CONFIG.MASTERY_SILVER) return COLORS.GRADE_B;
    if (mastery >= MODULE_CONFIG.MASTERY_BRONZE) return COLORS.GRADE_C;
    return COLORS.PRIMARY;
  }

  function handleClick() {
    dispatch('select', module);
  }

  $: radians = (angle - 90) * (Math.PI / 180);
  $: x = Math.cos(radians) * radius;
  $: y = Math.sin(radians) * radius;
  $: masteryColor = getMasteryColor(module.mastery);
  $: circumference = 2 * Math.PI * 45;
  $: dashOffset = circumference - (module.mastery / 100) * circumference;
</script>

<button
  class="
    module-circle absolute flex flex-col items-center justify-center
    rounded-full bg-bg-medium border-2
    transition-all cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-primary/50
    {selected ? 'border-primary scale-110 shadow-lg shadow-primary/30' : 'border-primary/30 hover:border-primary/50'}
  "
  style="
    width: {size}vw;
    height: {size}vw;
    left: calc(50% + {x}vw - {size/2}vw);
    top: calc(50% + {y}vw - {size/2}vw);
    transform: translateZ(0);
    transition-duration: {KINETIC.TRANSITION_NORMAL}ms;
  "
  on:click={handleClick}
>
  <!-- Progress SVG -->
  <svg
    class="absolute inset-0 w-full h-full transform -rotate-90"
    viewBox="0 0 100 100"
  >
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      stroke={COLORS.BG_LIGHT}
      stroke-width="4"
    />
    <circle
      cx="50"
      cy="50"
      r="45"
      fill="none"
      stroke={masteryColor}
      stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      class="transition-all"
      style="transition-duration: {KINETIC.TRANSITION_NORMAL}ms;"
    />
  </svg>

  <!-- Content -->
  <div class="relative z-10 text-center">
    <span class="text-lg font-bold text-text-primary">{module.num}</span>
    <span class="block text-xs text-text-muted">{module.code}</span>
  </div>
</button>

<style>
  .module-circle {
    will-change: transform, box-shadow;
  }
</style>
