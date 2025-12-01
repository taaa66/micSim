<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  import { KINETIC, COLORS, MODULE_CONFIG } from '../../core/constants';
  import type { IModuleData } from '../../core/models';
  import ProgressRing from '../kinetic/ProgressRing.svelte';

  export let module: IModuleData;
  export let selected: boolean = false;
  export let compact: boolean = false;

  const dispatch = createEventDispatcher();

  function getMasteryColor(mastery: number): string {
    if (mastery >= MODULE_CONFIG.MASTERY_PLATINUM) return COLORS.GRADE_S;
    if (mastery >= MODULE_CONFIG.MASTERY_GOLD) return COLORS.GRADE_A;
    if (mastery >= MODULE_CONFIG.MASTERY_SILVER) return COLORS.GRADE_B;
    if (mastery >= MODULE_CONFIG.MASTERY_BRONZE) return COLORS.GRADE_C;
    return COLORS.TEXT_MUTED;
  }

  function handleClick() {
    dispatch('select', module);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  $: masteryColor = getMasteryColor(module.mastery);
</script>

<button
  class="
    module-card relative flex flex-col items-center justify-center
    bg-bg-medium border rounded-lg
    transition-all cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-primary/50
    {selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-primary/20 hover:border-primary/40'}
    {compact ? 'p-3' : 'p-4'}
  "
  style="
    transform: translateZ(0);
    transition-duration: {KINETIC.TRANSITION_FAST}ms;
  "
  on:click={handleClick}
  on:keydown={handleKeydown}
  transition:scale={{ duration: KINETIC.TRANSITION_FAST }}
>
  <!-- Module Number Badge -->
  <div
    class="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-bg-dark border border-primary/30 flex items-center justify-center"
  >
    <span class="text-xs font-bold text-primary">{module.num}</span>
  </div>

  <!-- Progress Ring -->
  <ProgressRing
    progress={module.mastery}
    size={compact ? 50 : 70}
    strokeWidth={compact ? 4 : 6}
    color={masteryColor}
    showLabel={!compact}
  />

  <!-- Module Info -->
  <div class="mt-2 text-center">
    <h3 class="text-sm font-semibold text-text-primary truncate max-w-full">
      {module.code}
    </h3>
    {#if !compact}
      <p class="text-xs text-text-muted mt-1 line-clamp-2">
        {module.name}
      </p>
    {/if}
  </div>

  <!-- Completed Badge -->
  {#if module.completed}
    <div class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </div>
  {/if}

  <!-- Core Module Indicator -->
  {#if module.core}
    <div class="absolute bottom-1 right-1 text-xs text-gold font-bold">
      CORE
    </div>
  {/if}
</button>

<style>
  .module-card {
    will-change: transform, box-shadow;
  }
</style>
