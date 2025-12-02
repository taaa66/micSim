<script lang="ts">
  /**
   * C3: Gonioscopy Contradiction
   * Match Shaffer vs Scheie grades
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { GONIOSCOPY_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('C3')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Create matching questions
  const questions = shuffleArray(GONIOSCOPY_QUESTIONS).map(q => ({
    ...q,
    questionType: Math.random() > 0.5 ? 'shaffer_to_scheie' : 'scheie_to_shaffer'
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

  function selectAnswer(answer: string | number, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    
    let isCorrect = false;
    if (question.questionType === 'shaffer_to_scheie') {
      isCorrect = answer === question.scheieGrade;
    } else {
      isCorrect = answer === question.shafferGrade;
    }
    submitAnswer(isCorrect);
  }

  const shafferOptions = [4, 3, 2, 1, 0];
  const scheieOptions = ['0', 'I', 'II', 'III', 'IV'];
</script>

<GameEngine
  bind:this={gameEngine}
  {game}
  {questions}
  onBack={handleBack}
  onComplete={handleComplete}
>
  <svelte:fragment slot="question" let:question let:submitAnswer let:disabled>
    <div class="gonio-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Match the Grading Systems</h3>
      
      <div class="grade-card" in:scale={{ duration: 300, delay: 100 }}>
        {#if question.questionType === 'shaffer_to_scheie'}
          <p class="system-label">Shaffer Grade:</p>
          <p class="grade-value">{question.shafferGrade}</p>
          <p class="description">{question.description}</p>
          <p class="angle-status">{question.angleStatus}</p>
        {:else}
          <p class="system-label">Scheie Grade:</p>
          <p class="grade-value">{question.scheieGrade}</p>
          <p class="description">{question.description}</p>
          <p class="angle-status">{question.angleStatus}</p>
        {/if}
      </div>

      <p class="question-text">
        {#if question.questionType === 'shaffer_to_scheie'}
          What is the equivalent Scheie grade?
        {:else}
          What is the equivalent Shaffer grade?
        {/if}
      </p>

      <div class="options-grid">
        {#if question.questionType === 'shaffer_to_scheie'}
          {#each scheieOptions as option}
            <button
              class="option-btn"
              on:click={() => selectAnswer(option, question, submitAnswer, disabled)}
              {disabled}
            >
              Scheie {option}
            </button>
          {/each}
        {:else}
          {#each shafferOptions as option}
            <button
              class="option-btn"
              on:click={() => selectAnswer(option, question, submitAnswer, disabled)}
              {disabled}
            >
              Shaffer {option}
            </button>
          {/each}
        {/if}
      </div>

      <div class="hint-box">
        <p class="hint">💡 Remember: Shaffer 4 = Open, Scheie IV = Closed (opposite!)</p>
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .gonio-game {
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

  .grade-card {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .system-label {
    margin: 0 0 0.25rem;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .grade-value {
    margin: 0 0 0.5rem;
    font-size: 2.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .description {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    color: #e0f5f0;
  }

  .angle-status {
    margin: 0;
    font-size: 0.85rem;
    color: #7aa8a0;
    font-style: italic;
  }

  .question-text {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .option-btn {
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    font-weight: 600;
    color: #e0f5f0;
  }

  .option-btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint-box {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: #fbbf24;
  }
</style>
