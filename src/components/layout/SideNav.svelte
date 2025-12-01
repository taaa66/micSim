<script lang="ts">
  import { fly } from 'svelte/transition';
  import { KINETIC, COLORS } from '../../core/constants';
  import { currentView } from '../../services/state/stores';

  export let open: boolean = true;
  export let collapsed: boolean = false;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◉' },
    { id: 'sim', label: 'Simulation', icon: '◎' },
    { id: 'core-games', label: 'Core Games', icon: '◈' },
    { id: 'reports', label: 'Reports', icon: '◊' }
  ];

  function navigate(view: string) {
    currentView.set(view as 'dashboard' | 'sim' | 'core-games' | 'reports');
  }
</script>

{#if open}
  <aside
    class="
      fixed left-0 top-0 h-full z-40
      bg-bg-medium border-r border-primary/20
      flex flex-col
      {collapsed ? 'w-16' : 'w-56'}
      transition-all
    "
    style="
      transform: translateZ(0);
      transition-duration: {KINETIC.TRANSITION_NORMAL}ms;
    "
    transition:fly={{ x: -224, duration: KINETIC.TRANSITION_NORMAL }}
  >
    <!-- Logo Area -->
    <div class="h-14 flex items-center justify-center border-b border-primary/10">
      <span class="text-xl font-bold text-primary">
        {collapsed ? 'OS' : 'OPHTHALMO-SIM'}
      </span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-2 space-y-1">
      {#each menuItems as item}
        <button
          class="
            w-full flex items-center gap-3 px-3 py-2 rounded-lg
            transition-all text-left
            {$currentView === item.id 
              ? 'bg-primary/20 text-primary' 
              : 'text-text-muted hover:text-text-primary hover:bg-bg-light'}
          "
          style="transition-duration: {KINETIC.TRANSITION_FAST}ms;"
          on:click={() => navigate(item.id)}
        >
          <span class="text-lg">{item.icon}</span>
          {#if !collapsed}
            <span class="text-sm font-medium">{item.label}</span>
          {/if}
        </button>
      {/each}
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-primary/10">
      <div class="text-xs text-text-dim text-center">
        {collapsed ? 'v14' : 'Version 14.0'}
      </div>
    </div>
  </aside>
{/if}

<style>
  aside {
    will-change: transform, width;
  }
</style>
