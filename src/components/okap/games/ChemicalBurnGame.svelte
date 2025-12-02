<script lang="ts">
  /**
   * E2: Chemical Burn Protocol
   * Sequence the emergency steps correctly
   */
  import { createEventDispatcher } from 'svelte';
  import GameEngine from '../GameEngine.svelte';
  import { Sequencing } from '../mechanics';
  import { CHEMICAL_BURN_STEPS } from '../okapConstants';
  import { getGameById } from '../okapConstants';

  export let onBack: (() => void) | null = null;
  export let onComplete: ((result: any) => void) | null = null;

  const dispatch = createEventDispatcher();
  const game = getGameById('E2')!;

  // Transform steps for sequencing
  const burnItems = CHEMICAL_BURN_STEPS.map(step => ({
    id: step.id,
    text: step.step
  }));

  const correctOrder = CHEMICAL_BURN_STEPS.map(s => s.id);

  // Generate questions
  const questions = [
    {
      instruction: 'Order the chemical burn treatment steps',
      items: burnItems,
      correctOrder
    },
    {
      instruction: 'What is the correct order for chemical burn emergency?',
      items: burnItems,
      correctOrder
    },
    {
      instruction: 'Chemical Burn Protocol - Correct Sequence',
      items: burnItems,
      correctOrder
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
