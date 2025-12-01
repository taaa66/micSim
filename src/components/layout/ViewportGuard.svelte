<script lang="ts">
  /**
   * ViewportGuard - Enforces Zero-Scroll Mandate (V10.0)
   * Monitors viewport and prevents scroll on 768x1024 target
   */
  import { onMount, onDestroy } from 'svelte';
  import { VIEWPORT, COLORS } from '../../core/constants';
  import { checkZeroScrollCompliance } from '../../core/utils/dom-utils';

  export let debug: boolean = false;

  let isCompliant = true;
  let viewportInfo = { width: 0, height: 0 };
  let observer: MutationObserver | null = null;

  function checkCompliance() {
    viewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    isCompliant = checkZeroScrollCompliance();
    
    if (!isCompliant && debug) {
      console.warn('[ViewportGuard] Zero-Scroll Mandate violation detected');
    }
  }

  function enforceNoScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  onMount(() => {
    checkCompliance();
    enforceNoScroll();

    window.addEventListener('resize', checkCompliance);
    window.addEventListener('scroll', enforceNoScroll);

    // Watch for DOM changes that might cause overflow
    observer = new MutationObserver(() => {
      checkCompliance();
      if (!isCompliant) {
        enforceNoScroll();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  });

  onDestroy(() => {
    window.removeEventListener('resize', checkCompliance);
    window.removeEventListener('scroll', enforceNoScroll);
    observer?.disconnect();
  });
</script>

<div class="viewport-guard">
  <slot />

  {#if debug}
    <div
      class="fixed bottom-4 left-4 z-50 p-2 rounded text-xs font-mono"
      style="background: {isCompliant ? COLORS.SUCCESS : COLORS.ERROR}20; color: {isCompliant ? COLORS.SUCCESS : COLORS.ERROR};"
    >
      <div>Viewport: {viewportInfo.width}x{viewportInfo.height}</div>
      <div>Target: {VIEWPORT.TARGET_WIDTH}x{VIEWPORT.TARGET_HEIGHT}</div>
      <div>Zero-Scroll: {isCompliant ? '✓ COMPLIANT' : '✗ VIOLATION'}</div>
    </div>
  {/if}
</div>

<style>
  .viewport-guard {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
