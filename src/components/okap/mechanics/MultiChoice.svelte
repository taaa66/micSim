<script lang="ts">
  /**
   * Multiple Choice Mechanic (N4: EOM, General questions)
   * Select one answer from multiple options
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';

  export let question: {
    question: string;
    questionHe: string;
    options: string[];
    answer: string;
  };
  export let disabled = false;
  export let onSubmit: (isCorrect: boolean) => void;

  const dispatch = createEventDispatcher();

  function selectOption(option: string) {
    if (disabled) return;
    
    const isCorrect = option === question.answer;
    onSubmit(isCorrect);
    dispatch('submit', { selected: option, correct: isCorrect });
  }

  // Shuffle options for variety
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  $: shuffledOptions = shuffleArray(question.options);
</script>

<div class="mc-game" in:fly={{ y: 20, duration: 300 }}>
  <div class="question-card">
    <p class="question-he">{question.questionHe}</p>
    <p class="question-en">{question.question}</p>
  </div>

  <div class="options-grid">
    {#each shuffledOptions as option, i}
      <button
        class="option-btn"
        on:click={() => selectOption(option)}
        {disabled}
        in:fly={{ x: -20, delay: i * 50, duration: 200 }}
      >
        <span class="option-letter">{String.fromCharCode(65 + i)}</span>
        <span class="option-text">{option}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .mc-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
  }

  .question-card {
    text-align: center;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .question-he {
    margin: 0 0 0.5rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: #e0f5f0;
    line-height: 1.4;
  }

  .question-en {
    margin: 0;
    font-size: 0.95rem;
    color: #7aa8a0;
    direction: ltr;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: right;
  }

  .option-btn:hover:not(:disabled) {
    background: rgba(15, 184, 159, 0.1);
    border-color: #0fb89f;
    transform: translateX(-4px);
  }

  .option-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(15, 184, 159, 0.2);
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    color: #0fb89f;
    flex-shrink: 0;
  }

  .option-text {
    font-size: 1rem;
    color: #e0f5f0;
    flex: 1;
  }

  @media (max-width: 480px) {
    .options-grid {
      grid-template-columns: 1fr;
    }

    .option-btn {
      padding: 0.875rem 1rem;
    }
  }
</style>
