<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let current = 'dashboard';
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'reports', label: 'Reports', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];
  function navTo(id){ dispatch('navigate', { id }); }
</script>

<nav class="global-nav" role="navigation" aria-label="Global">
  {#each items as it}
    <button class="nav-btn" class:active={current===it.id} on:click={() => navTo(it.id)}>
      <span class="ic">{it.icon}</span>
      <span class="tx">{it.label}</span>
    </button>
  {/each}
</nav>

<style>
  .global-nav {
    position: fixed;
    left: 0; right: 0; bottom: env(safe-area-inset-bottom);
    height: 56px; padding: 6px env(safe-area-inset-right) 6px env(safe-area-inset-left);
    background: rgba(5, 14, 17, 0.9);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(52,211,153,0.2);
    display: flex; justify-content: space-around; align-items: center;
    z-index: 1000;
  }
  .nav-btn { 
    min-width: 48px; min-height: 44px; border: none; background: none; color: #aee; 
    display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;
    font-size: 11px; letter-spacing: .3px;
  }
  .nav-btn .ic { font-size: 16px; }
  .nav-btn.active { color: #34d399; }
  .nav-btn.active .ic { filter: drop-shadow(0 0 6px rgba(52,211,153,.6)); }

  @media (min-width: 1024px) {
    .global-nav { top: 0; bottom: auto; width: 64px; height: 100vh; border-top: none; border-right: 1px solid rgba(52,211,153,0.2); display: flex; flex-direction: column; gap: 8px; }
  }
</style>
