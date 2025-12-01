<script lang="ts">
  /**
   * VectorRaceView - The Vector Race game container
   */
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { KINETIC, COLORS, CORE_GAMES } from '../../core/constants';
  import { Button } from '../../components/common';
  import GameHUD from './GameHUD.svelte';

  const dispatch = createEventDispatcher();

  let gameState: 'ready' | 'playing' | 'complete' = 'ready';
  let score = 0;
  let time = 0;
  let combo = 0;

  function startGame() {
    gameState = 'playing';
    score = 0;
    time = 0;
    combo = 0;
  }

  function endGame() {
    gameState = 'complete';
    dispatch('complete', { score, time });
  }

  function exitGame() {
    dispatch('exit');
  }
</script>

<div
  class="vector-race-view relative w-full h-full overflow-hidden bg-bg-dark"
  style="transform: translateZ(0);"
  transition:fade={{ duration: KINETIC.TRANSITION_NORMAL }}
>
  <!-- Game HUD -->
  <GameHUD
    gameName={CORE_GAMES.VECTOR_RACE.NAME}
    gameCode={CORE_GAMES.VECTOR_RACE.CODE}
    {score}
    {time}
    {combo}
    on:exit={exitGame}
  />

  <!-- Game Area -->
  <div class="absolute inset-0 top-16 flex items-center justify-center">
    {#if gameState === 'ready'}
      <div class="text-center">
        <h2 class="text-3xl font-bold text-primary mb-4">
          {CORE_GAMES.VECTOR_RACE.NAME}
        </h2>
        <p class="text-text-muted mb-8 max-w-md">
          Navigate through the precision track by matching the ideal angle vector.
          Stay within tolerance to build your combo multiplier.
        </p>
        <Button variant="primary" size="lg" on:click={startGame}>
          START RACE
        </Button>
      </div>
    {:else if gameState === 'playing'}
      <!-- Game canvas would go here -->
      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center">
          <p class="text-text-muted">[Vector Race Game Canvas]</p>
          <Button variant="secondary" on:click={endGame}>End Demo</Button>
        </div>
      </div>
    {:else}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-text-primary mb-2">RACE COMPLETE</h2>
        <p class="text-4xl font-bold text-primary mb-6">{score}</p>
        <div class="flex gap-4 justify-center">
          <Button variant="primary" on:click={startGame}>RETRY</Button>
          <Button variant="secondary" on:click={exitGame}>EXIT</Button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .vector-race-view {
    will-change: contents;
  }
</style>
