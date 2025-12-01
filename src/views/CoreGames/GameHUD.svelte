<script lang="ts">
  /**
   * GameHUD - Heads-up display for core games
   */
  import { createEventDispatcher } from 'svelte';
  import { KINETIC, COLORS } from '../../core/constants';

  export let gameName: string = '';
  export let gameCode: string = '';
  export let score: number = 0;
  export let time: number = 0;
  export let combo: number = 0;

  const dispatch = createEventDispatcher();

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getComboColor(value: number): string {
    if (value >= 100) return COLORS.GRADE_S;
    if (value >= 60) return COLORS.GRADE_A;
    if (value >= 30) return COLORS.GRADE_B;
    return COLORS.TEXT_MUTED;
  }
</script>

<header
  class="absolute top-0 left-0 right-0 h-16 z-30 bg-bg-dark/90 backdrop-blur-sm border-b border-primary/20"
  style="transform: translateZ(0);"
>
  <div class="h-full px-4 flex items-center justify-between">
    <!-- Game Info -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 text-text-muted hover:text-text-primary transition-colors"
        on:click={() => dispatch('exit')}
        aria-label="Exit game"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h2 class="text-sm font-bold text-primary">{gameName}</h2>
        <span class="text-xs text-text-dim">{gameCode}</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-6">
      <!-- Time -->
      <div class="text-center">
        <span class="text-xs text-text-muted block">TIME</span>
        <span class="text-lg font-mono font-bold text-text-primary">{formatTime(time)}</span>
      </div>

      <!-- Score -->
      <div class="text-center">
        <span class="text-xs text-text-muted block">SCORE</span>
        <span class="text-lg font-mono font-bold text-primary">{score.toLocaleString()}</span>
      </div>

      <!-- Combo -->
      <div class="text-center">
        <span class="text-xs text-text-muted block">COMBO</span>
        <span
          class="text-lg font-mono font-bold"
          style="color: {getComboColor(combo)};"
        >
          {combo}x
        </span>
      </div>
    </div>
  </div>
</header>

<style>
  header {
    will-change: transform;
  }
</style>
