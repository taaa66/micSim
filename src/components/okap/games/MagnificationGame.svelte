<script lang="ts">
  /**
   * O5: Spectacle Zoom
   * Calculate spectacle magnification percentage
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { MAGNIFICATION_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('O5')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(MAGNIFICATION_QUESTIONS).map(q => {
    const wrongAnswers = [
      q.correctMagnification + 4,
      q.correctMagnification - 4,
      q.correctMagnification * 2,
      Math.abs(q.correctMagnification) * (q.correctMagnification > 0 ? -1 : 1)
    ].filter(v => v !== q.correctMagnification);
    
    const options = shuffleArray([
      q.correctMagnification,
      ...wrongAnswers.slice(0, 3)
    ]);
    
    return { ...q, options };
  });

  let gameEngine: GameEngine;

  function handleComplete(result: any) {
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function selectAnswer(selected: number, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    const isCorrect = selected === question.correctMagnification;
    submitAnswer(isCorrect);
  }

  function formatMagnification(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
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
    <div class="mag-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Rule: ~2% magnification per diopter</h3>
      
      <div class="lens-card" in:scale={{ duration: 300, delay: 100 }}>
        <div class="lens-icon">
          {#if question.power > 0}
            🔍
          {:else}
            🔎
          {/if}
        </div>
        <p class="power">{question.power > 0 ? '+' : ''}{question.power} D</p>
        <p class="scenario">{question.scenario}</p>
      </div>

      <p class="question-text">
        {question.power > 0 ? 'Magnification' : 'Minification'} = ?
      </p>

      <div class="options-grid">
        {#each question.options as option}
          <button
            class="option-btn"
            class:positive={option > 0}
            class:negative={option < 0}
            on:click={() => selectAnswer(option, question, submitAnswer, disabled)}
            {disabled}
          >
            {formatMagnification(option)}
          </button>
        {/each}
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .mag-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .instruction {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    color: #7aa8a0;
  }

  .lens-card {
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.2), rgba(52, 211, 153, 0.2));
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .lens-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .power {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    font-weight: 700;
    color: #e0f5f0;
    font-family: monospace;
  }

  .scenario {
    margin: 0;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .question-text {
    margin: 0 0 1rem;
    font-size: 1.2rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .option-btn {
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.3rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .option-btn.positive {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .option-btn.negative {
    border-color: rgba(239, 68, 68, 0.3);
  }

  .option-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .option-btn.positive:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
  }

  .option-btn.negative:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
  }

  .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
