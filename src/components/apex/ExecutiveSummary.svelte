<script lang="ts">
  import { KINETIC, COLORS } from '../../core/constants';
  import type { ISurgeonStats, IApexRanking } from '../../core/models';
  import ProgressRing from '../kinetic/ProgressRing.svelte';

  export let userRank: IApexRanking | null = null;
  export let stats: ISurgeonStats | null = null;

  const statItems = [
    { key: 'totalScore', label: 'Total Score', format: (v: number) => v.toLocaleString() },
    { key: 'accuracyRate', label: 'Accuracy', format: (v: number) => `${v.toFixed(1)}%` },
    { key: 'sessionsCompleted', label: 'Sessions', format: (v: number) => v.toString() },
    { key: 'streak', label: 'Streak', format: (v: number) => `${v} days` }
  ];
</script>

<div
  class="executive-summary p-4 bg-bg-dark/50 rounded-lg border border-primary/20"
  style="transform: translateZ(0);"
>
  <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
    YOUR APEX STATUS
  </h3>

  {#if userRank && stats}
    <!-- Rank Display -->
    <div class="flex items-center justify-center mb-6">
      <div class="relative">
        <ProgressRing
          progress={Math.min(100, (100 - userRank.rank) + 10)}
          size={100}
          strokeWidth={8}
          color={COLORS.PRIMARY}
          showLabel={false}
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold text-primary">#{userRank.rank}</span>
          <span class="text-xs text-text-muted">OD Rank</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3">
      {#each statItems as item}
        <div class="text-center p-2 bg-bg-medium rounded">
          <p class="text-lg font-bold text-text-primary">
            {item.format(stats[item.key as keyof ISurgeonStats] as number)}
          </p>
          <p class="text-xs text-text-muted">{item.label}</p>
        </div>
      {/each}
    </div>

    <!-- Badges -->
    {#if stats.badges.length > 0}
      <div class="mt-4">
        <p class="text-xs text-text-muted mb-2">Recent Badges</p>
        <div class="flex flex-wrap gap-2">
          {#each stats.badges.slice(0, 4) as badge}
            <div
              class="px-2 py-1 rounded-full text-xs font-medium"
              style="background: {COLORS.GOLD}20; color: {COLORS.GOLD};"
              title={badge.description}
            >
              {badge.name}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <p class="text-center text-text-muted py-8">
      Loading your stats...
    </p>
  {/if}
</div>

<style>
  .executive-summary {
    will-change: contents;
  }
</style>
