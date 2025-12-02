<script lang="ts">
  /**
   * E1: Olympic VA Converter
   * Match VA values across different notation systems
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { VA_CONVERSION_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('E1')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate wrong answers for each question
  const questions = shuffleArray(VA_CONVERSION_QUESTIONS).map(q => {
    const wrongAnswers = VA_CONVERSION_QUESTIONS
      .filter(other => other.id !== q.id)
      .map(other => {
        if (q.targetFormat === 'snellen') return other.allValues.snellen;
        if (q.targetFormat === 'decimal') return other.allValues.decimal;
        return other.allValues.logMAR;
      })
      .slice(0, 3);
    
    const options = shuffleArray([q.correctAnswer, ...wrongAnswers]);
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

  function selectAnswer(answer: string, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    const isCorrect = answer === question.correctAnswer;
    submitAnswer(isCorrect);
  }

  function formatLabel(format: string): string {
    switch (format) {
      case 'snellen': return 'Snellen';
      case 'decimal': return 'Decimal';
      case 'logMAR': return 'LogMAR';
      default: return format;
    }
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
    <div class="va-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Convert Visual Acuity</h3>
      
      <div class="va-card" in:scale={{ duration: 300, delay: 100 }}>
        <div class="given-section">
          <p class="format-label">{formatLabel(question.givenFormat)}</p>
          <p class="va-value">{question.givenValue}</p>
        </div>
        
        <div class="arrow-section">
          <span class="convert-arrow">→</span>
        </div>
        
        <div class="target-section">
          <p class="format-label">{formatLabel(question.targetFormat)}</p>
          <p class="va-placeholder">?</p>
        </div>
      </div>

      <div class="options-grid">
        {#each question.options as option}
          <button
            class="option-btn"
            on:click={() => selectAnswer(option, question, submitAnswer, disabled)}
            {disabled}
          >
            {option}
          </button>
        {/each}
      </div>

      <div class="reference-box">
        <p class="ref-title">📊 Quick Reference:</p>
        <div class="ref-grid">
          <span>20/20 = 1.0 = 0.0</span>
          <span>20/40 = 0.5 = 0.3</span>
          <span>20/200 = 0.1 = 1.0</span>
        </div>
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .va-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .instruction {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
    color: #7aa8a0;
  }

  .va-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.2));
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .given-section, .target-section {
    flex: 1;
    max-width: 150px;
  }

  .format-label {
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    color: #7aa8a0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .va-value {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #e0f5f0;
    font-family: monospace;
  }

  .va-placeholder {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #60a5fa;
  }

  .arrow-section {
    padding: 0 1rem;
  }

  .convert-arrow {
    font-size: 2rem;
    color: #0fb89f;
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
    font-size: 1.3rem;
    font-weight: 600;
    color: #e0f5f0;
    font-family: monospace;
  }

  .option-btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reference-box {
    background: rgba(15, 184, 159, 0.1);
    border: 1px solid rgba(15, 184, 159, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .ref-title {
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    color: #0fb89f;
    font-weight: 600;
  }

  .ref-grid {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .ref-grid span {
    font-size: 0.8rem;
    color: #7aa8a0;
    font-family: monospace;
  }

  @media (max-width: 480px) {
    .va-card {
      flex-direction: column;
      gap: 1rem;
    }

    .arrow-section {
      transform: rotate(90deg);
    }
  }
</style>
