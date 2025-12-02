<script lang="ts">
  /**
   * Two Column Sort Mechanic (P1: Drug MoA, O2: Vertex Distance)
   * Sort items into two categories
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  export let question: {
    item: string;
    correctColumn: 'left' | 'right';
  };
  export let leftColumn: { title: string };
  export let rightColumn: { title: string };
  export let disabled = false;
  export let onSubmit: (isCorrect: boolean) => void;

  const dispatch = createEventDispatcher();

  function selectColumn(column: 'left' | 'right') {
    if (disabled) return;
    
    const isCorrect = column === question.correctColumn;
    onSubmit(isCorrect);
    dispatch('submit', { selected: column, correct: isCorrect });
  }
</script>

<div class="sort-game" in:fly={{ y: 20, duration: 300 }}>
  <h3 class="instruction">Which category does this belong to?</h3>
  
  <div class="item-card" in:scale={{ duration: 300, delay: 100 }}>
    <span class="item-text">{question.item}</span>
  </div>

  <div class="columns">
    <button
      class="column-btn left"
      on:click={() => selectColumn('left')}
      {disabled}
    >
      <span class="column-icon">⬇️</span>
      <span class="column-title">{leftColumn.title}</span>
    </button>

    <div class="or-divider">OR</div>

    <button
      class="column-btn right"
      on:click={() => selectColumn('right')}
      {disabled}
    >
      <span class="column-icon">⬆️</span>
      <span class="column-title">{rightColumn.title}</span>
    </button>
  </div>
</div>

<style>
  .sort-game {
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

  .item-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.2), rgba(52, 211, 153, 0.1));
    border: 2px solid #0fb89f;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .item-text {
    font-size: 1.3rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .columns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .column-btn {
    flex: 1;
    min-width: 150px;
    max-width: 200px;
    padding: 1.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .column-btn:hover:not(:disabled) {
    transform: scale(1.05);
    border-color: #0fb89f;
    background: rgba(15, 184, 159, 0.1);
  }

  .column-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .column-btn.left:hover:not(:disabled) {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .column-btn.right:hover:not(:disabled) {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }

  .column-icon {
    font-size: 2rem;
  }

  .column-title {
    font-size: 1rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .or-divider {
    font-size: 1rem;
    color: #5a7a80;
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .columns {
      flex-direction: column;
    }

    .column-btn {
      max-width: 100%;
    }

    .or-divider {
      margin: 0.5rem 0;
    }
  }
</style>
