<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { KINETIC } from '../../core/constants';
  import { apexRankings, allocationData, currentUserRank } from '../../services/state/stores';
  import type { ISurgeonStats } from '../../core/models';
  
  import Leaderboard from './Leaderboard.svelte';
  import AllocationVoter from './AllocationVoter.svelte';
  import ExecutiveSummary from './ExecutiveSummary.svelte';

  export let open: boolean = true;
  export let userId: string | null = null;
  export let userStats: ISurgeonStats | null = null;

  let hasVoted = false;

  function handleVote(e: CustomEvent) {
    hasVoted = true;
    // In real app, would dispatch to API
    console.log('Vote submitted:', e.detail);
  }
</script>

{#if open}
  <aside
    class="
      apex-shell fixed right-0 top-0 h-full w-80
      bg-bg-medium border-l border-primary/20
      overflow-y-auto
    "
    style="transform: translateZ(0);"
    transition:fly={{ x: 320, duration: KINETIC.TRANSITION_NORMAL }}
  >
    <div class="p-4 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-primary uppercase tracking-wider">
          APEX LEAGUE
        </h2>
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      <!-- Executive Summary -->
      <ExecutiveSummary
        userRank={$currentUserRank}
        stats={userStats}
      />

      <!-- Allocation Voter -->
      <AllocationVoter
        allocation={$allocationData}
        {hasVoted}
        on:vote={handleVote}
      />

      <!-- Leaderboard -->
      <Leaderboard
        rankings={$apexRankings}
        highlightUserId={userId}
      />
    </div>
  </aside>
{/if}

<style>
  .apex-shell {
    will-change: transform;
    z-index: 40;
  }

  .apex-shell::-webkit-scrollbar {
    width: 4px;
  }

  .apex-shell::-webkit-scrollbar-track {
    background: transparent;
  }

  .apex-shell::-webkit-scrollbar-thumb {
    background: rgba(15, 184, 159, 0.3);
    border-radius: 2px;
  }
</style>
