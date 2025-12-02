<script lang="ts">
  /**
   * P1: MoA - Who's Against Whom?
   * Sort drug classes by mechanism (Production vs Outflow)
   */
  import { createEventDispatcher } from 'svelte';
  import GameEngine from '../GameEngine.svelte';
  import { TwoColumnSort } from '../mechanics';
  import { DRUG_MOA_QUESTIONS } from '../okapQuestionBank2';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('P1')!;

  const leftColumn = {
    title: 'Decrease Production'
  };

  const rightColumn = {
    title: 'Increase Outflow'
  };

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Transform questions for TwoColumnSort format
  const questions = shuffleArray(DRUG_MOA_QUESTIONS)
    .filter(q => q.mechanism !== 'both') // Exclude 'both' for simplicity
    .slice(0, game.questionCount)
    .map(q => ({
      item: q.drugClass,
      itemHe: q.drugClassHe,
      correctColumn: q.mechanism === 'decrease_production' ? 'left' as const : 'right' as const
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
</script>

<GameEngine
  bind:this={gameEngine}
  {game}
  {questions}
  onBack={handleBack}
  onComplete={handleComplete}
>
  <svelte:fragment slot="question" let:question let:submitAnswer let:disabled>
    <TwoColumnSort
      {question}
      {leftColumn}
      {rightColumn}
      {disabled}
      onSubmit={submitAnswer}
    />
  </svelte:fragment>
</GameEngine>
