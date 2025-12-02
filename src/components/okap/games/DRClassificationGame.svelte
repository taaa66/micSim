<script lang="ts">
  /**
   * C4: DR Classification
   * Match clinical findings to DR severity
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { DR_CLASSIFICATION_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('C4')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(DR_CLASSIFICATION_QUESTIONS).map(q => ({
    ...q,
    shuffledOptions: shuffleArray(q.options)
  }));

  let gameEngine: GameEngine;

  function handleComplete(result: any) {
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function selectClassification(classification: string, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    const isCorrect = classification === question.correctClassification;
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
    <div class="dr-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Classify the Diabetic Retinopathy</h3>
      
      <div class="findings-card" in:scale={{ duration: 300, delay: 100 }}>
        <p class="findings-label">Clinical Findings:</p>
        <ul class="findings-list">
          {#each question.findings as finding}
            <li>{finding}</li>
          {/each}
        </ul>
        <p class="rule-hint">📋 {question.rule}</p>
      </div>

      <div class="classification-grid">
        {#each question.shuffledOptions as option}
          <button
            class="classification-btn"
            class:mild={option.includes('Mild')}
            class:moderate={option.includes('Moderate')}
            class:severe={option.includes('Severe')}
            class:pdr={option.includes('PDR')}
            on:click={() => selectClassification(option, question, submitAnswer, disabled)}
            {disabled}
          >
            {option}
          </button>
        {/each}
      </div>

      <div class="rule-box">
        <p class="rule-title">4-2-1 Rule for Severe NPDR:</p>
        <p class="rule-text">Hemorrhages in 4 quadrants OR Venous beading in 2 OR IRMA in 1</p>
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .dr-game {
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

  .findings-card {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.15));
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .findings-label {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .findings-list {
    margin: 0 0 1rem;
    padding-left: 1.5rem;
    list-style-type: disc;
  }

  .findings-list li {
    color: #e0f5f0;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .rule-hint {
    margin: 0;
    font-size: 0.85rem;
    color: #fbbf24;
    font-style: italic;
  }

  .classification-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    max-width: 450px;
    margin: 0 auto 1.5rem;
  }

  .classification-btn {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.95rem;
    font-weight: 600;
    color: #e0f5f0;
  }

  .classification-btn:hover:not(:disabled) {
    transform: scale(1.03);
  }

  .classification-btn.mild:hover:not(:disabled) {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .classification-btn.moderate:hover:not(:disabled) {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .classification-btn.severe:hover:not(:disabled) {
    border-color: #f97316;
    background: rgba(249, 115, 22, 0.1);
  }

  .classification-btn.pdr:hover:not(:disabled) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .classification-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .rule-box {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
    text-align: left;
  }

  .rule-title {
    margin: 0 0 0.25rem;
    font-size: 0.85rem;
    color: #60a5fa;
    font-weight: 600;
  }

  .rule-text {
    margin: 0;
    font-size: 0.8rem;
    color: #7aa8a0;
  }

  @media (max-width: 480px) {
    .classification-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
