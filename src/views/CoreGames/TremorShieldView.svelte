<script lang="ts">
  /**
   * TremorShieldView - The Tremor Shield game container
   */
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { KINETIC, COLORS, CORE_GAMES } from '../../core/constants';
  import { Button } from '../../components/common';
  import { ProgressRing } from '../../components/kinetic';
  import GameHUD from './GameHUD.svelte';

  const dispatch = createEventDispatcher();

  let gameState: 'ready' | 'playing' | 'complete' = 'ready';
  let score = 0;
  let time = CORE_GAMES.TREMOR_SHIELD.DURATION_MS / 1000;
  let combo = 0;
  let shieldIntegrity = 100;
  let tremorValue = 0;

  function startGame() {
    gameState = 'playing';
    score = 0;
    time = CORE_GAMES.TREMOR_SHIELD.DURATION_MS / 1000;
    combo = 0;
    shieldIntegrity = 100;
  }

  function endGame() {
    gameState = 'complete';
    dispatch('complete', { score, shieldIntegrity });
  }

  function exitGame() {
    dispatch('exit');
  }
</script>

<div
  class="tremor-shield-view relative w-full h-full overflow-hidden bg-bg-dark"
  style="transform: translateZ(0);"
  transition:fade={{ duration: KINETIC.TRANSITION_NORMAL }}
>
  <!-- Game HUD -->
  <GameHUD
    gameName={CORE_GAMES.TREMOR_SHIELD.NAME}
    gameCode={CORE_GAMES.TREMOR_SHIELD.CODE}
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
          {CORE_GAMES.TREMOR_SHIELD.NAME}
        </h2>
        <p class="text-text-muted mb-8 max-w-md">
          Hold your pointer perfectly still to maintain shield integrity.
          Keep tremor below {CORE_GAMES.TREMOR_SHIELD.TREMOR_THRESHOLD_MICRON}μm to achieve Platinum Lock.
        </p>
        <Button variant="primary" size="lg" on:click={startGame}>
          ACTIVATE SHIELD
        </Button>
      </div>
    {:else if gameState === 'playing'}
      <!-- Shield visualization -->
      <div class="relative">
        <ProgressRing
          progress={shieldIntegrity}
          size={250}
          strokeWidth={15}
          color={shieldIntegrity > 50 ? COLORS.PRIMARY : COLORS.WARNING}
          showLabel={false}
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-5xl font-bold text-primary">{tremorValue}μm</span>
          <span class="text-sm text-text-muted">TREMOR</span>
        </div>
      </div>
      
      <!-- Demo controls -->
      <div class="absolute bottom-20 left-1/2 -translate-x-1/2">
        <Button variant="secondary" on:click={endGame}>End Demo</Button>
      </div>
    {:else}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-text-primary mb-2">SHIELD DEACTIVATED</h2>
        <p class="text-4xl font-bold text-primary mb-2">{score}</p>
        <p class="text-text-muted mb-6">Shield Integrity: {shieldIntegrity}%</p>
        <div class="flex gap-4 justify-center">
          <Button variant="primary" on:click={startGame}>RETRY</Button>
          <Button variant="secondary" on:click={exitGame}>EXIT</Button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .tremor-shield-view {
    will-change: contents;
  }
</style>
