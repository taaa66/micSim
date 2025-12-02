<script lang="ts">
  /**
   * O2: Vertex Distance Race
   * Sort lens movements by their effect on effective power
   */
  import { createEventDispatcher } from 'svelte';
  import GameEngine from '../GameEngine.svelte';
  import TwoColumnSort from '../mechanics/TwoColumnSort.svelte';
  import { VERTEX_DISTANCE_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('O2')!;

  const leftColumn = { title: 'Increases Power' };
  const rightColumn = { title: 'Decreases Power' };

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(VERTEX_DISTANCE_QUESTIONS).map(q => ({
    ...q,
    item: q.scenario,
    correctColumn: q.correctEffect === 'increase' ? 'left' as const : 'right' as const
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
