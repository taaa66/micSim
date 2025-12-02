<script lang="ts">
  /**
   * Equation Completion Mechanic (O1: Vergence)
   * Fill in the missing variable in U + D = V
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';

  export let question: {
    u?: number;
    d?: number;
    v?: number;
    missing: 'u' | 'd' | 'v';
    answer: number;
  };
  export let disabled = false;
  export let onSubmit: (isCorrect: boolean) => void;

  const dispatch = createEventDispatcher();

  let userAnswer = '';
  let inputElement: HTMLInputElement;

  $: displayU = question.missing === 'u' ? '?' : question.u;
  $: displayD = question.missing === 'd' ? '?' : question.d;
  $: displayV = question.missing === 'v' ? '?' : question.v;

  function handleSubmit() {
    if (disabled || !userAnswer.trim()) return;
    
    const numAnswer = parseFloat(userAnswer);
    const isCorrect = Math.abs(numAnswer - question.answer) < 0.01;
    
    onSubmit(isCorrect);
    dispatch('submit', { answer: numAnswer, correct: isCorrect });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  // Focus input on mount
  $: if (inputElement && !disabled) {
    inputElement.focus();
    userAnswer = '';
  }
</script>

<div class="equation-game" in:fly={{ y: 20, duration: 300 }}>
  <h3 class="instruction">Complete the Equation</h3>
  
  <div class="equation-display">
    <div class="term" class:missing={question.missing === 'u'}>
      <span class="label">U</span>
      <span class="value">{displayU}</span>
    </div>
    
    <span class="operator">+</span>
    
    <div class="term" class:missing={question.missing === 'd'}>
      <span class="label">D</span>
      <span class="value">{displayD}</span>
    </div>
    
    <span class="operator">=</span>
    
    <div class="term" class:missing={question.missing === 'v'}>
      <span class="label">V</span>
      <span class="value">{displayV}</span>
    </div>
  </div>

  <div class="formula-hint">
    <span>U + D = V</span>
    <span class="hint-text">(Object Vergence + Lens Power = Image Vergence)</span>
  </div>

  <div class="answer-section">
    <p class="answer-label">
      What is the value of <strong>{question.missing.toUpperCase()}</strong>?
    </p>
    
    <div class="input-row">
      <input
        type="number"
        step="0.1"
        bind:value={userAnswer}
        bind:this={inputElement}
        on:keydown={handleKeydown}
        {disabled}
        placeholder="Enter answer..."
        class="answer-input"
        aria-label="Enter the missing value"
      />
      <span class="unit">D</span>
    </div>
    
    <button 
      class="submit-btn" 
      on:click={handleSubmit}
      disabled={disabled || !userAnswer.trim()}
    >
      Submit Answer
    </button>
  </div>
</div>

<style>
  .equation-game {
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

  .equation-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .term {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    min-width: 80px;
  }

  .term.missing {
    background: rgba(15, 184, 159, 0.2);
    border: 2px dashed #0fb89f;
  }

  .label {
    font-size: 0.8rem;
    color: #7aa8a0;
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .term.missing .value {
    color: #0fb89f;
  }

  .operator {
    font-size: 2rem;
    font-weight: 700;
    color: #7aa8a0;
  }

  .formula-hint {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 2rem;
    padding: 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
  }

  .formula-hint span:first-child {
    font-family: 'Times New Roman', serif;
    font-style: italic;
    font-size: 1.1rem;
    color: #60a5fa;
  }

  .hint-text {
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  .answer-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .answer-label {
    font-size: 1rem;
    color: #e0f5f0;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .answer-input {
    width: 150px;
    padding: 0.75rem 1rem;
    font-size: 1.5rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #e0f5f0;
    outline: none;
    transition: all 0.2s;
  }

  .answer-input:focus {
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .answer-input:disabled {
    opacity: 0.5;
  }

  .unit {
    font-size: 1.2rem;
    color: #7aa8a0;
  }

  .submit-btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    background: linear-gradient(135deg, #0fb89f, #34d399);
    color: #0a1015;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .equation-display {
      gap: 0.5rem;
    }

    .term {
      padding: 0.75rem 1rem;
      min-width: 60px;
    }

    .value {
      font-size: 1.5rem;
    }

    .operator {
      font-size: 1.5rem;
    }
  }
</style>
