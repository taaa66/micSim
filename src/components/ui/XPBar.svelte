<!--
  =============================================================================
  XP BAR COMPONENT
  =============================================================================
  Shows level progress with animated XP bar
  =============================================================================
-->

<script lang="ts">
  import { levelData, xpProgress, xpToNextLevel } from '../../stores/streak';
  import AnimatedCounter from './AnimatedCounter.svelte';
  
  export let showLevel: boolean = true;
  export let showXP: boolean = true;
  export let compact: boolean = false;
</script>

<div class="xp-bar-container" class:compact>
  {#if showLevel}
    <div class="level-info">
      <div class="level-badge">
        <span class="level-number">{$levelData.level}</span>
      </div>
      <div class="level-text">
        <span class="level-title">{$levelData.titleHe}</span>
        {#if showXP && !compact}
          <span class="xp-text">
            <AnimatedCounter value={$levelData.currentXP} duration={800} /> / {$xpToNextLevel} XP
          </span>
        {/if}
      </div>
    </div>
  {/if}
  
  <div class="progress-track">
    <div 
      class="progress-fill"
      style="width: {$xpProgress}%"
    >
      <div class="progress-glow"></div>
    </div>
    <div class="progress-markers">
      {#each [25, 50, 75] as marker}
        <div class="marker" style="left: {marker}%"></div>
      {/each}
    </div>
  </div>
  
  {#if !compact}
    <div class="next-level">
      רמה {$levelData.level + 1}
    </div>
  {/if}
</div>

<style>
  .xp-bar-container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }
  
  .xp-bar-container.compact {
    padding: 8px 12px;
    gap: 8px;
  }
  
  .level-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  
  .level-badge {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
  }
  
  .compact .level-badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
  
  .level-number {
    font-size: 1.1rem;
    font-weight: 800;
    color: white;
  }
  
  .compact .level-number {
    font-size: 0.9rem;
  }
  
  .level-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .level-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: white;
  }
  
  .compact .level-title {
    font-size: 0.75rem;
  }
  
  .xp-text {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }
  
  .progress-track {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }
  
  .compact .progress-track {
    height: 6px;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6);
    border-radius: 4px;
    transition: width 0.5s ease;
    position: relative;
  }
  
  .progress-glow {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
    animation: glow-pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  .progress-markers {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  
  .marker {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .next-level {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
  }
</style>
