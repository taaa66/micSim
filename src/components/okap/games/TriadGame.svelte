<script lang="ts">
  /**
   * N1: Triad Identification
   * Select 3 symptoms that define a syndrome
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { TRIAD_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('N1')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(TRIAD_QUESTIONS).map(q => ({
    ...q,
    shuffledOptions: shuffleArray(q.allOptions)
  }));

  let gameEngine: GameEngine;
  let selectedSymptoms: string[] = [];

  function handleComplete(result: any) {
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function toggleSymptom(symptom: string, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    
    if (selectedSymptoms.includes(symptom)) {
      selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    } else if (selectedSymptoms.length < 3) {
      selectedSymptoms = [...selectedSymptoms, symptom];
      
      // Auto-submit when 3 selected
      if (selectedSymptoms.length === 3) {
        const correct = question.correctSymptoms.every((s: string) => selectedSymptoms.includes(s));
        setTimeout(() => {
          submitAnswer(correct);
          selectedSymptoms = [];
        }, 300);
      }
    }
  }

  function resetSelection() {
    selectedSymptoms = [];
  }

  // Reset selection when question changes
  $: if (questions) {
    selectedSymptoms = [];
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
    <div class="triad-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Select the 3 defining symptoms</h3>
      
      <div class="syndrome-card" in:scale={{ duration: 300, delay: 100 }}>
        <span class="syndrome-icon">🎭</span>
        <p class="syndrome-name">{question.syndrome}</p>
      </div>

      <div class="selection-status">
        <span class="count">{selectedSymptoms.length}/3 selected</span>
        {#if selectedSymptoms.length > 0}
          <button class="reset-btn" on:click={resetSelection} {disabled}>Reset</button>
        {/if}
      </div>

      <div class="symptoms-grid">
        {#each question.shuffledOptions as symptom}
          <button
            class="symptom-btn"
            class:selected={selectedSymptoms.includes(symptom)}
            on:click={() => toggleSymptom(symptom, question, submitAnswer, disabled)}
            disabled={disabled || (selectedSymptoms.length >= 3 && !selectedSymptoms.includes(symptom))}
          >
            <span class="checkbox">
              {selectedSymptoms.includes(symptom) ? '✓' : ''}
            </span>
            <span class="symptom-text">{symptom}</span>
          </button>
        {/each}
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .triad-game {
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

  .syndrome-card {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2));
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .syndrome-icon {
    font-size: 2rem;
  }

  .syndrome-name {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .selection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .count {
    font-size: 1rem;
    color: #0fb89f;
    font-weight: 600;
  }

  .reset-btn {
    padding: 0.3rem 0.8rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #ef4444;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
  }

  .symptoms-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .symptom-btn {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
  }

  .symptom-btn:hover:not(:disabled) {
    border-color: rgba(168, 85, 247, 0.5);
    background: rgba(168, 85, 247, 0.1);
  }

  .symptom-btn.selected {
    border-color: #a855f7;
    background: rgba(168, 85, 247, 0.2);
  }

  .symptom-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: #a855f7;
    flex-shrink: 0;
  }

  .symptom-btn.selected .checkbox {
    background: #a855f7;
    border-color: #a855f7;
    color: white;
  }

  .symptom-text {
    font-size: 0.9rem;
    color: #e0f5f0;
  }

  @media (max-width: 480px) {
    .symptoms-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
