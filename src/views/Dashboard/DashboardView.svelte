<script lang="ts">
  /**
   * DashboardView - Main simulator dashboard container
   * Implements Zero-Scroll Mandate (V10.0)
   */
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { KINETIC } from '../../core/constants';
  import { allModules, currentModuleContext, overallMastery } from '../../services/state/stores';
  import type { IModuleData } from '../../core/models';
  
  import DashboardHeader from './DashboardHeader.svelte';
  import { ModuleCircle } from '../../components/modules';
  import { ProgressRing, KineticBackground } from '../../components/kinetic';

  export let modules: IModuleData[] = [];

  let selectedModule: IModuleData | null = null;

  function handleModuleSelect(e: CustomEvent<IModuleData>) {
    selectedModule = e.detail;
    currentModuleContext.set(e.detail);
  }

  function getModuleAngle(index: number, total: number): number {
    return (360 / total) * index - 90;
  }

  onMount(() => {
    if ($allModules.length > 0) {
      modules = $allModules;
    }
  });

  $: if ($allModules.length > 0) {
    modules = $allModules;
  }
</script>

<div
  class="dashboard-view relative w-full h-full overflow-hidden"
  style="transform: translateZ(0);"
  transition:fade={{ duration: KINETIC.TRANSITION_NORMAL }}
>
  <!-- Kinetic Background -->
  <KineticBackground particleCount={15} opacity={0.05} />

  <!-- Header -->
  <DashboardHeader mastery={$overallMastery} />

  <!-- Radial Module Layout -->
  <div class="absolute inset-0 flex items-center justify-center">
    <!-- Center Hub -->
    <div class="relative z-10">
      <ProgressRing
        progress={$overallMastery}
        size={120}
        strokeWidth={10}
        showLabel={true}
        label={`${$overallMastery}%`}
      />
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-xs text-text-muted mt-10">OVERALL</span>
      </div>
    </div>

    <!-- Module Circles -->
    {#each modules as module, i (module.id)}
      <ModuleCircle
        {module}
        angle={getModuleAngle(i, modules.length)}
        radius={30}
        size={10}
        selected={selectedModule?.id === module.id}
        on:select={handleModuleSelect}
      />
    {/each}
  </div>

  <!-- Selected Module Info -->
  {#if selectedModule}
    <div
      class="absolute bottom-6 left-6 right-6 p-4 bg-bg-medium/90 backdrop-blur rounded-lg border border-primary/20"
      transition:fade={{ duration: KINETIC.TRANSITION_FAST }}
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-text-primary">
            {selectedModule.name}
          </h3>
          <p class="text-sm text-text-muted">{selectedModule.goal}</p>
        </div>
        <button
          class="px-4 py-2 bg-primary text-bg-dark font-medium rounded-lg hover:bg-primary-bright transition-colors"
          on:click={() => { /* Launch simulation */ }}
        >
          START
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard-view {
    will-change: contents;
  }
</style>
