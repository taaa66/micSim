<script lang="ts">
  /**
   * O4: Spherical Equivalent
   * Match prescriptions to their spherical equivalent
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { SPHERICAL_EQUIVALENT_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('O4')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate answer options for each question
  const questions = shuffleArray(SPHERICAL_EQUIVALENT_QUESTIONS).map(q => {
    const wrongAnswers = [
      q.correctSE + 0.50,
      q.correctSE - 0.50,
      q.correctSE + 1.00,
      q.correctSE - 1.00,
      q.sphere // Common mistake: just the sphere
    ].filter(v => v !== q.correctSE);
    
    const options = shuffleArray([
      q.correctSE,
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
    const isCorrect = Math.abs(selected - question.correctSE) < 0.01;
    submitAnswer(isCorrect);
  }

  function formatDiopter(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)} D`;
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
    <div class="se-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">SE = Sphere + ½ Cylinder</h3>
      
      <div class="prescription-card" in:scale={{ duration: 300, delay: 100 }}>
        <p class="label">Prescription:</p>
        <p class="prescription">{question.prescription}</p>
      </div>

      <p class="question-text">What is the Spherical Equivalent?</p>

      <div class="options-grid">
        {#each question.options as option}
          <button
            class="option-btn"
            on:click={() => selectAnswer(option, question, submitAnswer, disabled)}
            {disabled}
          >
            {formatDiopter(option)}
          </button>
        {/each}
      </div>

      <div class="formula-hint">
        <span class="hint">Sphere: {question.sphere >= 0 ? '+' : ''}{question.sphere.toFixed(2)}</span>
        <span class="hint">Cylinder: {question.cylinder.toFixed(2)}</span>
        <span class="hint">½ Cyl: {(question.cylinder / 2).toFixed(2)}</span>
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .se-game {
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

  .prescription-card {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .label {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .prescription {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #e0f5f0;
    font-family: monospace;
  }

  .question-text {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: #e0f5f0;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto 1.5rem;
  }

  .option-btn {
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1.2rem;
    font-weight: 600;
    color: #e0f5f0;
    font-family: monospace;
  }

  .option-btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .formula-hint {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .hint {
    font-size: 0.85rem;
    color: #5a7a80;
    font-family: monospace;
  }
</style>
