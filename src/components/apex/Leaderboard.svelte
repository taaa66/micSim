<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { KINETIC, COLORS, APEX_CONFIG } from '../../core/constants';
  import type { IApexRanking } from '../../core/models';

  export let rankings: IApexRanking[] = [];
  export let highlightUserId: string | null = null;
  export let compact: boolean = false;

  function getTierColor(rank: number): string {
    for (const [, tier] of Object.entries(APEX_CONFIG.TIERS)) {
      if (rank >= tier.min && rank <= tier.max) {
        return tier.color;
      }
    }
    return COLORS.TEXT_MUTED;
  }

  function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '−';
    }
  }

  function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return COLORS.SUCCESS;
      case 'down': return COLORS.ERROR;
      default: return COLORS.TEXT_MUTED;
    }
  }
</script>

<div class="leaderboard" style="transform: translateZ(0);">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider">
      APEX RANKINGS
    </h3>
    <span class="text-xs text-text-muted">
      {rankings.length} surgeons
    </span>
  </div>

  <div class="space-y-2">
    {#each rankings as ranking (ranking.surgeon.id)}
      <div
        class="
          flex items-center gap-3 p-2 rounded-lg
          transition-all
          {highlightUserId === ranking.surgeon.id 
            ? 'bg-primary/10 border border-primary/30' 
            : 'bg-bg-dark/50 hover:bg-bg-light/50'}
        "
        style="transition-duration: {KINETIC.TRANSITION_FAST}ms;"
        animate:flip={{ duration: KINETIC.TRANSITION_NORMAL }}
        in:fade={{ duration: KINETIC.TRANSITION_FAST }}
      >
        <!-- Rank -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
          style="background: {getTierColor(ranking.rank)}20; color: {getTierColor(ranking.rank)};"
        >
          {ranking.rank}
        </div>

        <!-- Avatar & Name -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-primary truncate">
            {ranking.surgeon.name}
          </p>
          {#if !compact}
            <p class="text-xs text-text-muted truncate">
              {ranking.surgeon.specialty}
            </p>
          {/if}
        </div>

        <!-- Score -->
        <div class="text-right">
          <p class="text-sm font-bold text-text-primary">
            {ranking.stats.totalScore.toLocaleString()}
          </p>
          <div class="flex items-center justify-end gap-1">
            <span
              class="text-xs font-medium"
              style="color: {getTrendColor(ranking.trend)};"
            >
              {getTrendIcon(ranking.trend)}
            </span>
            {#if ranking.previousRank !== ranking.rank}
              <span class="text-xs text-text-dim">
                {Math.abs(ranking.previousRank - ranking.rank)}
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .leaderboard {
    will-change: contents;
  }
</style>
