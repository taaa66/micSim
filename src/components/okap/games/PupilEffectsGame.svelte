<script lang="ts">
  /**
   * P4: Miosis or Mydriasis?
   * Classify drugs by pupil effect
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import GameEngine from '../GameEngine.svelte';
  import { PUPIL_EFFECT_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('P4')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(PUPIL_EFFECT_QUESTIONS);
  let gameEngine: GameEngine;

  function handleComplete(result: any) {
    if (onComplete) onComplete(result);
    dispatch('complete', result);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function selectEffect(effect: string, question: any, submitAnswer: (correct: boolean) => void, disabled: boolean) {
    if (disabled) return;
    const isCorrect = effect === question.effect;
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
    <div class="pupil-game" in:fly={{ y: 20, duration: 300 }}>
      <h3 class="instruction">What is the pupil effect?</h3>
      
      <div class="drug-card" in:scale={{ duration: 300, delay: 100 }}>
        <span class="drug-icon">💊</span>
        <p class="drug-name">{question.drug}</p>
        <p class="mechanism">{question.mechanism}</p>
      </div>

      <div class="effects-row">
        <button
          class="effect-btn miosis"
          on:click={() => selectEffect('miosis', question, submitAnswer, disabled)}
          {disabled}
        >
          <div class="pupil small">
            <div class="iris">
              <div class="pupil-center"></div>
            </div>
          </div>
          <span class="effect-label">Miosis</span>
          <span class="effect-desc">Constriction</span>
        </button>

        <button
          class="effect-btn no-change"
          on:click={() => selectEffect('no_change', question, submitAnswer, disabled)}
          {disabled}
        >
          <div class="pupil medium">
            <div class="iris">
              <div class="pupil-center"></div>
            </div>
          </div>
          <span class="effect-label">No Change</span>
          <span class="effect-desc">Neutral</span>
        </button>

        <button
          class="effect-btn mydriasis"
          on:click={() => selectEffect('mydriasis', question, submitAnswer, disabled)}
          {disabled}
        >
          <div class="pupil large">
            <div class="iris">
              <div class="pupil-center"></div>
            </div>
          </div>
          <span class="effect-label">Mydriasis</span>
          <span class="effect-desc">Dilation</span>
        </button>
      </div>
    </div>
  </svelte:fragment>
</GameEngine>

<style>
  .pupil-game {
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

  .drug-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2));
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .drug-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .drug-name {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .mechanism {
    margin: 0;
    font-size: 0.85rem;
    color: #7aa8a0;
    font-style: italic;
  }

  .effects-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .effect-btn {
    flex: 1;
    max-width: 140px;
    padding: 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .effect-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .effect-btn.miosis:hover:not(:disabled) {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  .effect-btn.no-change:hover:not(:disabled) {
    border-color: #6b7280;
    background: rgba(107, 114, 128, 0.1);
  }

  .effect-btn.mydriasis:hover:not(:disabled) {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }

  .effect-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pupil {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .iris {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, #4a3728 0%, #2d1f14 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #1a1a1a;
  }

  .pupil-center {
    border-radius: 50%;
    background: #000;
  }

  .small .pupil-center {
    width: 30%;
    height: 30%;
  }

  .medium .pupil-center {
    width: 50%;
    height: 50%;
  }

  .large .pupil-center {
    width: 75%;
    height: 75%;
  }

  .effect-label {
    font-size: 1rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .effect-desc {
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  @media (max-width: 480px) {
    .effects-row {
      flex-direction: column;
      align-items: center;
    }

    .effect-btn {
      max-width: 200px;
      width: 100%;
    }
  }
</style>
