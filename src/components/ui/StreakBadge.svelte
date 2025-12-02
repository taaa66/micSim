<!--
  =============================================================================
  STREAK BADGE COMPONENT
  =============================================================================
  Displays current streak with fire animation
  =============================================================================
-->

<script lang="ts">
  import { currentStreak, weeklyActivity } from '../../stores/streak';
  
  export let showWeekly: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  
  $: isOnFire = $currentStreak >= 3;
  $: isLegendary = $currentStreak >= 30;
</script>

<div class="streak-badge size-{size}" class:on-fire={isOnFire} class:legendary={isLegendary}>
  <div class="streak-icon">
    {#if isLegendary}
      <span class="fire legendary">💎</span>
    {:else if isOnFire}
      <span class="fire">🔥</span>
    {:else}
      <span class="fire dim">🔥</span>
    {/if}
  </div>
  
  <div class="streak-content">
    <span class="streak-count">{$currentStreak}</span>
    <span class="streak-label">ימים ברצף</span>
  </div>
  
  {#if showWeekly}
    <div class="weekly-dots">
      {#each $weeklyActivity as active, i}
        <div class="day-dot" class:active title={dayNames[i]}>
          <span class="day-name">{dayNames[i]}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .streak-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    transition: all 0.3s;
  }
  
  .streak-badge:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .streak-badge.on-fire {
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
  }
  
  .streak-badge.legendary {
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.2);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
  }
  
  /* Sizes */
  .size-sm { padding: 10px 14px; }
  .size-md { padding: 16px 20px; }
  .size-lg { padding: 20px 28px; }
  
  .size-sm .streak-count { font-size: 1.5rem; }
  .size-md .streak-count { font-size: 2rem; }
  .size-lg .streak-count { font-size: 2.5rem; }
  
  .streak-icon {
    position: relative;
  }
  
  .fire {
    font-size: 2rem;
    display: block;
  }
  
  .fire.dim {
    opacity: 0.4;
    filter: grayscale(0.5);
  }
  
  .on-fire .fire {
    animation: flame 0.5s ease-in-out infinite alternate;
  }
  
  .legendary .fire {
    animation: sparkle 1s ease-in-out infinite;
  }
  
  @keyframes flame {
    from { transform: scale(1) rotate(-5deg); }
    to { transform: scale(1.1) rotate(5deg); }
  }
  
  @keyframes sparkle {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.15); filter: brightness(1.3); }
  }
  
  .streak-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  
  .streak-count {
    font-weight: 800;
    color: white;
    line-height: 1;
  }
  
  .on-fire .streak-count {
    color: #f59e0b;
    text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  }
  
  .legendary .streak-count {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .streak-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }
  
  .weekly-dots {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
  
  .day-dot {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .day-dot.active {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
  }
  
  .day-name {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
  }
  
  .day-dot.active .day-name {
    color: #10b981;
  }
</style>
