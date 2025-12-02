<script lang="ts">
  /**
   * C1: The ISNT Series
   * Sequence the neuroretinal rim thickness (I > S > N > T)
   */
  import { createEventDispatcher } from 'svelte';
  import GameEngine from '../GameEngine.svelte';
  import { Sequencing } from '../mechanics';
  import { ISNT_CORRECT_ORDER } from '../okapQuestionBank2';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('C1')!;

  // Create ISNT sequencing questions
  const isntItems = [
    { id: 'I', text: 'Inferior (I)' },
    { id: 'S', text: 'Superior (S)' },
    { id: 'N', text: 'Nasal (N)' },
    { id: 'T', text: 'Temporal (T)' }
  ];

  // Generate multiple variations of the question
  const questions = [
    {
      instruction: 'Order neuroretinal rim regions from thickest to thinnest',
      items: isntItems,
      correctOrder: ISNT_CORRECT_ORDER
    },
    {
      instruction: 'Arrange by rim thickness (ISNT Rule)',
      items: isntItems,
      correctOrder: ISNT_CORRECT_ORDER
    },
    {
      instruction: 'What is the correct order of the ISNT rule?',
      items: isntItems,
      correctOrder: ISNT_CORRECT_ORDER
    }
  ];

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
    <Sequencing
      {question}
      {disabled}
      onSubmit={submitAnswer}
    />
  </svelte:fragment>
</GameEngine>
