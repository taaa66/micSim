<script>
  import { scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  export let achievement;
  export let earned = true;
  export let progress = 0; // 0-100 for unearned
  export let index = 0;
  
  const tierColors = {
    bronze: { bg: 'rgba(205, 127, 50, 0.2)', border: '#cd7f32', glow: 'rgba(205, 127, 50, 0.3)' },
    silver: { bg: 'rgba(192, 192, 192, 0.2)', border: '#c0c0c0', glow: 'rgba(192, 192, 192, 0.3)' },
    gold: { bg: 'rgba(255, 215, 0, 0.2)', border: '#ffd700', glow: 'rgba(255, 215, 0, 0.3)' },
    platinum: { bg: 'rgba(229, 228, 226, 0.2)', border: '#e5e4e2', glow: 'rgba(229, 228, 226, 0.4)' }
  };
  
  $: colors = tierColors[achievement.tier] || tierColors.bronze;
</script>

<div 
  class="achievement-card"
  class:earned
  class:locked={!earned}
  style="
    --tier-bg: {colors.bg};
    --tier-border: {colors.border};
    --tier-glow: {colors.glow};
  "
  in:scale={{ duration: 400, delay: index * 100, easing: elasticOut }}
>
  <div class="icon-wrapper">
    <span class="icon">{achievement.icon}</span>
    {#if earned}
      <div class="sparkle sparkle-1">✨</div>
      <div class="sparkle sparkle-2">✨</div>
    {/if}
  </div>
  
  <div class="info">
    <h4 class="name">{achievement.name}</h4>
    <p class="desc">{achievement.desc}</p>
    
    {#if !earned && progress > 0}
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
        <span class="progress-label">{progress}%</span>
      </div>
    {/if}
  </div>
  
  {#if earned}
    <div class="check">✓</div>
  {:else}
    <div class="lock">🔒</div>
  {/if}
</div>

<style>
  .achievement-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: var(--tier-bg);
    border: 1px solid var(--tier-border);
    border-radius: 14px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .achievement-card.earned {
    box-shadow: 0 0 20px var(--tier-glow);
  }
  
  .achievement-card.locked {
    opacity: 0.6;
    filter: grayscale(0.5);
  }
  
  .achievement-card:hover {
    transform: translateY(-2px);
  }
  
  .icon-wrapper {
    position: relative;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    flex-shrink: 0;
  }
  
  .icon {
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  .sparkle {
    position: absolute;
    font-size: 12px;
    animation: sparkleFloat 2s ease-in-out infinite;
  }
  
  .sparkle-1 {
    top: -5px;
    right: -5px;
    animation-delay: 0s;
  }
  
  .sparkle-2 {
    bottom: -5px;
    left: -5px;
    animation-delay: 1s;
  }
  
  @keyframes sparkleFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-3px) scale(1.2); opacity: 0.7; }
  }
  
  .info {
    flex: 1;
    min-width: 0;
  }
  
  .name {
    font-size: 14px;
    font-weight: 700;
    color: #e0f5f0;
    margin: 0 0 4px;
  }
  
  .desc {
    font-size: 11px;
    color: rgba(122, 168, 160, 0.8);
    margin: 0;
  }
  
  .progress-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }
  
  .progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--tier-border);
    border-radius: 2px;
    transition: width 0.5s ease;
  }
  
  .progress-label {
    font-size: 10px;
    color: rgba(122, 168, 160, 0.6);
    font-weight: 600;
  }
  
  .check {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(52, 211, 153, 0.3);
    border: 2px solid #34d399;
    border-radius: 50%;
    color: #34d399;
    font-weight: bold;
    font-size: 14px;
  }
  
  .lock {
    font-size: 20px;
    opacity: 0.5;
  }
</style>
