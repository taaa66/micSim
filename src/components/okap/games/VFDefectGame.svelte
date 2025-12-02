<script lang="ts">
  /**
   * N5: VF Defect Diagnosis
   * Match visual field pattern to diagnosis
   */
  import { createEventDispatcher } from 'svelte';
  import GameEngine from '../GameEngine.svelte';
  import MultiChoice from '../mechanics/MultiChoice.svelte';
  import { VF_DEFECT_QUESTIONS } from '../okapQuestionBank3';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('N5')!;

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const questions = shuffleArray(VF_DEFECT_QUESTIONS).map(q => ({
    ...q,
    question: `Pattern: ${q.pattern}\n${q.description}`,
    correctAnswer: q.diagnosis,
    options: shuffleArray(q.options)
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
    <MultiChoice
      {question}
      {disabled}
      onSubmit={submitAnswer}
    />
  </svelte:fragment>
</GameEngine>
