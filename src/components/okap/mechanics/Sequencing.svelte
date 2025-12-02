<script lang="ts">
  /**
   * Sequencing Mechanic (C1: ISNT, E2: Chemical Burn Protocol)
   * Drag and drop items into correct order
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  export let question: {
    items: { id: string | number; text: string; textHe: string }[];
    correctOrder: (string | number)[];
  };
  export let disabled = false;
  export let onSubmit: (isCorrect: boolean) => void;

  const dispatch = createEventDispatcher();

  // Shuffle items initially
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  let orderedItems = shuffleArray([...question.items]);
  let draggedIndex: number | null = null;

  function handleDragStart(index: number) {
    if (disabled) return;
    draggedIndex = index;
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    
    // Reorder items
    const items = [...orderedItems];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    orderedItems = items;
    draggedIndex = index;
  }

  function handleDragEnd() {
    draggedIndex = null;
  }

  function moveItem(fromIndex: number, direction: 'up' | 'down') {
    if (disabled) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= orderedItems.length) return;
    
    const items = [...orderedItems];
    [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]];
    orderedItems = items;
  }

  function submitOrder() {
    if (disabled) return;
    
    const currentOrder = orderedItems.map(item => item.id);
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(question.correctOrder);
    
    onSubmit(isCorrect);
    dispatch('submit', { order: currentOrder, correct: isCorrect });
  }
</script>

<div class="seq-game" in:fly={{ y: 20, duration: 300 }}>
  <h3 class="instruction">Arrange items in the correct order</h3>
  <p class="sub-instruction">Drag or use arrows to reorder</p>

  <div class="items-list">
    {#each orderedItems as item, index (item.id)}
      <div
        class="item-row"
        class:dragging={draggedIndex === index}
        draggable={!disabled}
        on:dragstart={() => handleDragStart(index)}
        on:dragover={(e) => handleDragOver(e, index)}
        on:dragend={handleDragEnd}
        animate:flip={{ duration: 200 }}
        role="listitem"
      >
        <span class="item-number">{index + 1}</span>
        
        <div class="item-content">
          <span class="item-text">{item.text}</span>
        </div>

        <div class="item-controls">
          <button
            class="move-btn"
            on:click={() => moveItem(index, 'up')}
            disabled={disabled || index === 0}
            aria-label="Move up"
          >
            ▲
          </button>
          <button
            class="move-btn"
            on:click={() => moveItem(index, 'down')}
            disabled={disabled || index === orderedItems.length - 1}
            aria-label="Move down"
          >
            ▼
          </button>
        </div>

        <span class="drag-handle">⋮⋮</span>
      </div>
    {/each}
  </div>

  <button 
    class="submit-btn" 
    on:click={submitOrder}
    {disabled}
  >
    Confirm Order
  </button>
</div>

<style>
  .seq-game {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .instruction {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    color: #e0f5f0;
  }

  .sub-instruction {
    margin: 0 0 1.5rem;
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: grab;
    transition: all 0.2s;
  }

  .item-row:hover {
    border-color: rgba(15, 184, 159, 0.3);
    background: rgba(15, 184, 159, 0.05);
  }

  .item-row.dragging {
    opacity: 0.5;
    border-color: #0fb89f;
    cursor: grabbing;
  }

  .item-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #0fb89f, #34d399);
    border-radius: 50%;
    font-size: 0.9rem;
    font-weight: 700;
    color: #0a1015;
    flex-shrink: 0;
  }

  .item-content {
    flex: 1;
    text-align: left;
  }

  .item-text {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #e0f5f0;
  }

  .item-controls {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .move-btn {
    width: 28px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    color: #7aa8a0;
    font-size: 0.6rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .move-btn:hover:not(:disabled) {
    background: rgba(15, 184, 159, 0.3);
    color: #0fb89f;
  }

  .move-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .drag-handle {
    color: #5a7a80;
    font-size: 1rem;
    cursor: grab;
  }

  .submit-btn {
    padding: 0.875rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: linear-gradient(135deg, #0fb89f, #34d399);
    color: #0a1015;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(15, 184, 159, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .item-row {
      padding: 0.75rem;
      gap: 0.75rem;
    }

    .item-controls {
      display: none;
    }
  }
</style>
