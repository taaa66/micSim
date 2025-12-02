<script lang="ts">
  /**
   * O3: Prentice's Rule Roulette
   * Calculate prism and identify base direction
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { PRENTICE_RULE_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('O3')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(PRENTICE_RULE_QUESTIONS);
  let gameEngine: GameEngine;
  let selectedDirection: string = '';

  function handleComplete(result: any) {
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function selectDirection(direction: string, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    selectedDirection = direction;
    const isCorrect = direction === question.baseDirection;
    submitAnswer(isCorrect);
  }
</script>

<GameEngine
  bind:this={gameEngine}
  {game}
  {questions}
  onBack={handleBack}
  onComplete={handleComplete}
>
  <svelte:fragment slot="question" let:question let:submitAnswer let:disabled>
    <div class="prentice-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Prentice's Rule: P = F × d</h3>
      
      <div class="scenario-card" in:scale={{ duration: 300, delay: 100 }}>
        <p class="scenario">{question.scenario}</p>
        <div class="values">
          <span class="value">Power: {question.power > 0 ? '+' : ''}{question.power} D</span>
          <span class="value">Decentration: {question.decentration * 10} mm</span>
        </div>
        <p class="calculated">Prism = {question.correctPrism} Δ</p>
      </div>

      <p class="question-text">What is the base direction?</p>

      <div class="direction-grid">
        {#each ['up', 'down', 'in', 'out'] as direction}
          <button
            class="direction-btn"
            class:selected={selectedDirection === direction}
            on:click={() => selectDirection(direction, question, submitAnswer, disabled)}
            {disabled}
          >
            <span class="direction-icon">
              {#if direction === 'up'}↑
              {:else if direction === 'down'}↓
              {:else if direction === 'in'}→←
              {:else}←→
              {/if}
            </span>
            <span class="direction-label">Base {direction.toUpperCase()}</span>
          </button>
        {/each}
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .prentice-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .instruction {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
    color: #7aa8a0;
    font-family: monospace;
  }

  .scenario-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .scenario {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: #e0f5f0;
  }

  .values {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .value {
    font-size: 1rem;
    color: #0fb89f;
    font-weight: 600;
  }

  .calculated {
    margin: 0;
    font-size: 1.3rem;
    color: #fbbf24;
    font-weight: 700;
  }

  .question-text {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: #e0f5f0;
  }

  .direction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .direction-btn {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .direction-btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .direction-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .direction-btn.selected {
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.2);
  }

  .direction-icon {
    font-size: 2rem;
    color: #e0f5f0;
  }

  .direction-label {
    font-size: 0.9rem;
    color: #7aa8a0;
    font-weight: 600;
  }
</style>
