<script lang="ts">
  /**
   * N2: Visual Pathway Puzzle
   * Match lesion location to VF defect and RAPD status
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { VISUAL_PATHWAY_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('N2')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(VISUAL_PATHWAY_QUESTIONS);
  let gameEngine: GameEngine;

  function handleComplete(result: any) {
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function selectRAPD(hasRAPD: boolean, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    const isCorrect = hasRAPD === question.hasRAPD;
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
    <div class="pathway-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">Visual Pathway Lesion Analysis</h3>
      
      <div class="lesion-card" in:scale={{ duration: 300, delay: 100 }}>
        <div class="pathway-diagram">
          <span class="eye">👁️</span>
          <span class="arrow">→</span>
          <span class="structure">🧠</span>
        </div>
        <p class="lesion-location">{question.lesionLocation}</p>
        <p class="vf-defect">{question.visualFieldDefect}</p>
      </div>

      <p class="question-text">Will there be a RAPD?</p>

      <div class="rapd-buttons">
        <button
          class="rapd-btn yes"
          on:click={() => selectRAPD(true, question, submitAnswer, disabled)}
          {disabled}
        >
          <span class="rapd-icon">⊕</span>
          <span class="rapd-label">RAPD Present</span>
          <span class="rapd-hint">Afferent defect</span>
        </button>

        <button
          class="rapd-btn no"
          on:click={() => selectRAPD(false, question, submitAnswer, disabled)}
          {disabled}
        >
          <span class="rapd-icon">⊖</span>
          <span class="rapd-label">No RAPD</span>
          <span class="rapd-hint">Symmetric or post-LGN</span>
        </button>
      </div>

      <div class="hint-box">
        <p class="hint-title">💡 Remember:</p>
        <p class="hint-text">RAPD requires asymmetric afferent input (pre-LGN)</p>
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .pathway-game {
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

  .lesion-card {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(168, 85, 247, 0.2));
    border: 1px solid rgba(124, 58, 237, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .pathway-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  .arrow {
    color: #7aa8a0;
  }

  .lesion-location {
    margin: 0 0 0.5rem;
    font-size: 1.3rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .vf-defect {
    margin: 0;
    font-size: 1rem;
    color: #fbbf24;
    font-style: italic;
  }

  .question-text {
    margin: 0 0 1rem;
    font-size: 1.2rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .rapd-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .rapd-btn {
    flex: 1;
    max-width: 200px;
    padding: 1.5rem 1rem;
    border: 2px solid;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
  }

  .rapd-btn.yes {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .rapd-btn.no {
    border-color: rgba(239, 68, 68, 0.3);
  }

  .rapd-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .rapd-btn.yes:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
  }

  .rapd-btn.no:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
  }

  .rapd-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .rapd-icon {
    font-size: 2rem;
  }

  .rapd-btn.yes .rapd-icon {
    color: #10b981;
  }

  .rapd-btn.no .rapd-icon {
    color: #ef4444;
  }

  .rapd-label {
    font-size: 1rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .rapd-hint {
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  .hint-box {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .hint-title {
    margin: 0 0 0.25rem;
    font-size: 0.85rem;
    color: #fbbf24;
    font-weight: 600;
  }

  .hint-text {
    margin: 0;
    font-size: 0.8rem;
    color: #7aa8a0;
  }
</style>
