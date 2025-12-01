<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { IModuleData } from '../../core/models';
  import ModuleCard from './ModuleCard.svelte';

  export let modules: IModuleData[] = [];
  export let selectedId: string | null = null;
  export let compact: boolean = false;
  export let columns: number = 3;

  const dispatch = createEventDispatcher();

  function handleSelect(e: CustomEvent<IModuleData>) {
    dispatch('select', e.detail);
  }
</script>

<div
  class="module-list grid gap-4"
  style="
    grid-template-columns: repeat({columns}, minmax(0, 1fr));
    transform: translateZ(0);
  "
>
  {#each modules as module (module.id)}
    <ModuleCard
      {module}
      {compact}
      selected={selectedId === module.id}
      on:select={handleSelect}
    />
  {/each}
</div>

<style>
  .module-list {
    will-change: contents;
  }
</style>
