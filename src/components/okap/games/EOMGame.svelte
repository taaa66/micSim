<script lang="ts">
  /**
   * N4: Who Moves Whom?
   * Multiple choice questions about EOM innervation
   */
  import { createEventDispatcher } from 'svelte';
  import GameEngine from '../GameEngine.svelte';
  import { MultiChoice } from '../mechanics';
  import { EOM_QUESTIONS } from '../okapQuestionBank';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('N4')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(EOM_QUESTIONS).slice(0, game.questionCount);

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
    <MultiChoice
      {question}
      {disabled}
      onSubmit={submitAnswer}
    />
  </svelte:fragment>
</GameEngine>
