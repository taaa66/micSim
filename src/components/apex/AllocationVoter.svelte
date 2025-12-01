<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { KINETIC, COLORS } from '../../core/constants';
  import type { IAllocationData, IAllocationVote } from '../../core/models';
  import Button from '../common/Button.svelte';

  export let allocation: IAllocationData | null = null;
  export let hasVoted: boolean = false;
  export let selectedVote: string | null = null;

  const dispatch = createEventDispatcher();

  function handleVote(vote: IAllocationVote) {
    if (hasVoted) return;
    selectedVote = vote.odId;
    dispatch('vote', vote);
  }

  function getTimeRemaining(deadline: Date): string {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Voting closed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  }
</script>

{#if allocation}
  <div
    class="allocation-voter p-4 bg-bg-dark/50 rounded-lg border border-primary/20"
    style="transform: translateZ(0);"
    transition:fly={{ y: 20, duration: KINETIC.TRANSITION_NORMAL }}
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider">
          OD ALLOCATION
        </h3>
        <p class="text-xs text-text-muted mt-1">
          {allocation.currentDuty}
        </p>
      </div>
      <span class="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
        {allocation.status}
      </span>
    </div>

    <!-- Deadline -->
    <div class="mb-4 text-xs text-text-muted">
      {getTimeRemaining(allocation.deadline)}
    </div>

    <!-- Vote Options -->
    <div class="space-y-2">
      {#each allocation.votes as vote (vote.odId)}
        <button
          class="
            w-full flex items-center justify-between p-3 rounded-lg
            transition-all border
            {selectedVote === vote.odId
              ? 'bg-primary/20 border-primary'
              : 'bg-bg-medium border-primary/10 hover:border-primary/30'}
            {hasVoted && selectedVote !== vote.odId ? 'opacity-50' : ''}
          "
          style="transition-duration: {KINETIC.TRANSITION_FAST}ms;"
          disabled={hasVoted}
          on:click={() => handleVote(vote)}
        >
          <span class="font-medium text-text-primary">{vote.odName}</span>
          
          <div class="flex items-center gap-2">
            <!-- Vote count bar -->
            <div class="w-20 h-2 bg-bg-dark rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all"
                style="
                  width: {vote.percentage}%;
                  transition-duration: {KINETIC.TRANSITION_NORMAL}ms;
                "
              ></div>
            </div>
            
            <span class="text-sm text-text-muted w-12 text-right">
              {vote.votes} ({vote.percentage.toFixed(0)}%)
            </span>
          </div>
        </button>
      {/each}
    </div>

    {#if hasVoted}
      <p class="mt-4 text-center text-xs text-text-muted">
        Your vote has been recorded
      </p>
    {/if}
  </div>
{/if}

<style>
  .allocation-voter {
    will-change: transform, opacity;
  }
</style>
