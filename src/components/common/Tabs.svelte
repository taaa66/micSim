<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { KINETIC } from '../../core/constants';

  export let tabs: Array<{ id: string; label: string; icon?: string }> = [];
  export let activeTab: string = '';
  export let variant: 'default' | 'pills' | 'underline' = 'default';

  const dispatch = createEventDispatcher();

  function selectTab(id: string) {
    activeTab = id;
    dispatch('change', id);
  }

  $: if (tabs.length > 0 && !activeTab) {
    activeTab = tabs[0].id;
  }
</script>

<div class="tabs-container">
  <div
    class="
      flex
      {variant === 'pills' ? 'gap-2' : ''}
      {variant === 'underline' ? 'border-b border-primary/20' : ''}
      {variant === 'default' ? 'bg-bg-dark rounded-lg p-1' : ''}
    "
    role="tablist"
  >
    {#each tabs as tab}
      <button
        class="
          px-4 py-2 text-sm font-medium
          transition-all duration-{KINETIC.TRANSITION_FAST}
          focus:outline-none focus:ring-2 focus:ring-primary/30
          {activeTab === tab.id
            ? variant === 'pills'
              ? 'bg-primary text-bg-dark rounded-full'
              : variant === 'underline'
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'bg-bg-light text-text-primary rounded-md'
            : 'text-text-muted hover:text-text-secondary'
          }
        "
        style="transform: translateZ(0);"
        role="tab"
        aria-selected={activeTab === tab.id}
        tabindex={activeTab === tab.id ? 0 : -1}
        on:click={() => selectTab(tab.id)}
      >
        {#if tab.icon}
          <span class="mr-1.5">{tab.icon}</span>
        {/if}
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="tab-content mt-4" role="tabpanel">
    <slot />
  </div>
</div>

<style>
  button {
    will-change: transform, background-color, color;
  }
</style>
