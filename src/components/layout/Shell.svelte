<script lang="ts">
  /**
   * Shell - Main application layout wrapper
   * Enforces Zero-Scroll Mandate (V10.0)
   */
  import { KINETIC } from '../../core/constants';
  import { apexPanelOpen } from '../../services/state/stores';
  import TopBar from './TopBar.svelte';
  import ViewportGuard from './ViewportGuard.svelte';

  export let showTopBar: boolean = true;
  export let showApexPanel: boolean = true;
</script>

<ViewportGuard>
  <div
    class="shell-container relative w-screen h-screen overflow-hidden bg-bg-dark"
    style="transform: translateZ(0);"
  >
    {#if showTopBar}
      <TopBar />
    {/if}

    <!-- Main Content Area -->
    <main
      class="
        absolute inset-0
        {showTopBar ? 'top-14' : 'top-0'}
        {showApexPanel && $apexPanelOpen ? 'right-80' : 'right-0'}
        overflow-hidden
        transition-all
      "
      style="transition-duration: {KINETIC.TRANSITION_NORMAL}ms;"
    >
      <slot />
    </main>

    <!-- Apex Panel Slot -->
    {#if showApexPanel}
      <slot name="apex" />
    {/if}
  </div>
</ViewportGuard>

<style>
  .shell-container {
    will-change: contents;
    /* Zero-Scroll Mandate: Prevent any scrolling */
    overflow: hidden !important;
  }

  :global(html), :global(body) {
    overflow: hidden !important;
    height: 100vh !important;
    width: 100vw !important;
  }
</style>
