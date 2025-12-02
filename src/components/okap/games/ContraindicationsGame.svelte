<script lang="ts">
  /**
   * P3: Systemic Risk Equation
   * Identify contraindicated drug for patient profile
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { CONTRAINDICATION_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('P3')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(CONTRAINDICATION_QUESTIONS).map(q => ({
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

  function selectDrug(drug: string, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    const isCorrect = drug === question.contraindicatedDrug;
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
    <div class="contraindication-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Which drug is CONTRAINDICATED?</h3>
      
      <div class="patient-card" in:scale={{ duration: 300, delay: 100 }}>
        <span class="patient-icon">🏥</span>
        <p class="patient-profile">{question.patientProfile}</p>
      </div>

      <div class="warning-banner">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">Select the drug that should NOT be used</span>
      </div>

      <div class="drugs-grid">
        {#each question.shuffledOptions as drug}
          <button
            class="drug-btn"
            on:click={() => selectDrug(drug, question, submitAnswer, disabled)}
            {disabled}
          >
            <span class="drug-icon">💊</span>
            <span class="drug-name">{drug}</span>
          </button>
        {/each}
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .contraindication-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .instruction {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
    color: #ef4444;
    font-weight: 600;
  }

  .patient-card {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.2));
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .patient-icon {
    font-size: 2.5rem;
  }

  .patient-profile {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #e0f5f0;
  }

  .warning-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .warning-icon {
    font-size: 1.2rem;
  }

  .warning-text {
    font-size: 0.9rem;
    color: #ef4444;
  }

  .drugs-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .drug-btn {
    padding: 1.2rem;
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

  .drug-btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .drug-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .drug-icon {
    font-size: 1.5rem;
  }

  .drug-name {
    font-size: 0.9rem;
    color: #e0f5f0;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    .drugs-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
