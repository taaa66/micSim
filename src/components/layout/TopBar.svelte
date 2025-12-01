<script lang="ts">
  import { KINETIC, COLORS } from '../../core/constants';
  import { currentView, systemStatus, networkLatency, apexPanelOpen } from '../../services/state/stores';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◉' },
    { id: 'core-games', label: 'Core Games', icon: '◈' },
    { id: 'reports', label: 'Reports', icon: '◊' }
  ];

  function navigate(view: string) {
    currentView.set(view as 'dashboard' | 'core-games' | 'reports');
  }

  function toggleApexPanel() {
    apexPanelOpen.update(v => !v);
  }
</script>

<header
  class="
    fixed top-0 left-0 right-0 h-14 z-50
    bg-bg-medium/95 backdrop-blur-sm
    border-b border-primary/20
    flex items-center justify-between px-4
  "
  style="transform: translateZ(0);"
>
  <!-- Logo -->
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
      <span class="text-primary font-bold">OS</span>
    </div>
    <span class="text-sm font-bold text-text-primary uppercase tracking-wider hidden sm:block">
      Ophthalmic Simulator
    </span>
  </div>

  <!-- Navigation -->
  <nav class="flex items-center gap-1">
    {#each navItems as item}
      <button
        class="
          px-3 py-1.5 rounded-md text-sm font-medium
          transition-all
          {$currentView === item.id 
            ? 'bg-primary/20 text-primary' 
            : 'text-text-muted hover:text-text-primary hover:bg-bg-light'}
        "
        style="transition-duration: {KINETIC.TRANSITION_FAST}ms;"
        on:click={() => navigate(item.id)}
      >
        <span class="mr-1">{item.icon}</span>
        {item.label}
      </button>
    {/each}
  </nav>

  <!-- Status & Controls -->
  <div class="flex items-center gap-4">
    <!-- System Status -->
    <div class="flex items-center gap-2 text-xs">
      <div
        class="w-2 h-2 rounded-full"
        style="background: {$systemStatus === 'NOMINAL' ? COLORS.SUCCESS : COLORS.ERROR};"
      ></div>
      <span class="text-text-muted hidden sm:block">{$systemStatus}</span>
      <span class="text-text-dim">|</span>
      <span class="text-text-muted">{$networkLatency}ms</span>
    </div>

    <!-- Apex Toggle -->
    <button
      class="
        p-2 rounded-lg
        transition-all
        {$apexPanelOpen ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-primary'}
      "
      style="transition-duration: {KINETIC.TRANSITION_FAST}ms;"
      on:click={toggleApexPanel}
      aria-label="Toggle Apex Panel"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
      </svg>
    </button>
  </div>
</header>

<style>
  header {
    will-change: transform;
  }
</style>
