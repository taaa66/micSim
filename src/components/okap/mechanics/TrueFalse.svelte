<script lang="ts">
  /**
   * True/False Mechanic (N3: CN III)
   * Rapid true/false questions
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';

  export let question: {
    statement: string;
    statementHe: string;
    answer: boolean;
    explanation?: string;
  };
  export let disabled = false;
  export let onSubmit: (isCorrect: boolean) => void;

  const dispatch = createEventDispatcher();

  function selectAnswer(answer: boolean) {
    if (disabled) return;
    
    const isCorrect = answer === question.answer;
    onSubmit(isCorrect);
    dispatch('submit', { selected: answer, correct: isCorrect });
  }
</script>

<div class="tf-game" in:fly={{ y: 20, duration: 300 }}>
  <h3 class="instruction">True or False?</h3>
  
  <div class="statement-card" in:scale={{ duration: 300, delay: 100 }}>
    <p class="statement-text">{question.statement}</p>
  </div>

  <div class="answer-buttons">
    <button
      class="answer-btn true"
      on:click={() => selectAnswer(true)}
      {disabled}
    >
      <span class="btn-icon">✓</span>
      <span class="btn-text">TRUE</span>
    </button>

    <button
      class="answer-btn false"
      on:click={() => selectAnswer(false)}
      {disabled}
    >
      <span class="btn-icon">✗</span>
      <span class="btn-text">FALSE</span>
    </button>
  </div>
</div>

<style>
  .tf-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .instruction {
    margin: 0 0 1.5rem;
    font-size: 1.2rem;
    color: #e0f5f0;
  }

  .statement-card {
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .statement-text {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #e0f5f0;
    line-height: 1.5;
  }

  .answer-buttons {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .answer-btn {
    flex: 1;
    min-width: 140px;
    max-width: 180px;
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

  .answer-btn.true {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .answer-btn.false {
    border-color: rgba(239, 68, 68, 0.3);
  }

  .answer-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .answer-btn.true:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }

  .answer-btn.false:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }

  .answer-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 2.5rem;
  }

  .answer-btn.true .btn-icon {
    color: #10b981;
  }

  .answer-btn.false .btn-icon {
    color: #ef4444;
  }

  .btn-text {
    font-size: 1.2rem;
    font-weight: 700;
    color: #e0f5f0;
  }


  @media (max-width: 480px) {
    .answer-buttons {
      flex-direction: row;
    }

    .answer-btn {
      min-width: 120px;
      padding: 1rem;
    }

    .btn-icon {
      font-size: 2rem;
    }
  }
</style>
