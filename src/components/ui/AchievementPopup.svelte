<!--
  =============================================================================
  ACHIEVEMENT POPUP COMPONENT
  =============================================================================
  Celebratory popup for unlocked achievements
  =============================================================================
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import { achievementUnlocked } from '../../lib/confetti';
  
  export let title: string = 'הישג חדש!';
  export let description: string = '';
  export let icon: string = '🏆';
  export let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  export let xp: number = 0;
  export let onClose: (() => void) | null = null;
  export let autoClose: boolean = true;
  export let duration: number = 5000;
  
  let visible = true;
  let progress = 100;
  let progressInterval: ReturnType<typeof setInterval>;
  
  const rarityColors = {
    common: { bg: 'from-gray-600 to-gray-800', glow: 'rgba(156, 163, 175, 0.3)' },
    rare: { bg: 'from-blue-600 to-blue-800', glow: 'rgba(59, 130, 246, 0.4)' },
    epic: { bg: 'from-purple-600 to-purple-800', glow: 'rgba(147, 51, 234, 0.5)' },
    legendary: { bg: 'from-yellow-500 to-orange-600', glow: 'rgba(245, 158, 11, 0.6)' }
  };
  
  const rarityLabels = {
    common: 'נפוץ',
    rare: 'נדיר',
    epic: 'אפי',
    legendary: 'אגדי'
  };
  
  onMount(() => {
    // Fire confetti for rare+ achievements
    if (rarity !== 'common') {
      achievementUnlocked();
    }
    
    // Auto-close timer
    if (autoClose) {
      const step = 100 / (duration / 50);
      progressInterval = setInterval(() => {
        progress -= step;
        if (progress <= 0) {
          close();
        }
      }, 50);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  });
  
  function close() {
    visible = false;
    if (progressInterval) clearInterval(progressInterval);
    setTimeout(() => onClose?.(), 300);
  }
</script>

{#if visible}
  <div 
    class="achievement-overlay"
    in:fly={{ y: -100, duration: 600, easing: elasticOut }}
    out:fly={{ y: -50, duration: 300 }}
  >
    <div 
      class="achievement-card rarity-{rarity}"
      style="--glow-color: {rarityColors[rarity].glow}"
    >
      <!-- Shine effect -->
      <div class="shine"></div>
      
      <!-- Icon -->
      <div class="icon-container" in:scale={{ delay: 200, duration: 400, easing: elasticOut }}>
        <span class="icon">{icon}</span>
        <div class="icon-ring"></div>
        <div class="icon-ring delay"></div>
      </div>
      
      <!-- Content -->
      <div class="content">
        <span class="rarity-badge">{rarityLabels[rarity]}</span>
        <h3 class="title">{title}</h3>
        {#if description}
          <p class="description">{description}</p>
        {/if}
        {#if xp > 0}
          <div class="xp-badge">+{xp} XP</div>
        {/if}
      </div>
      
      <!-- Close button -->
      <button class="close-btn" on:click={close}>✕</button>
      
      <!-- Progress bar -->
      {#if autoClose}
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .achievement-overlay {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10001;
  }
  
  .achievement-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.98));
    border-radius: 16px;
    box-shadow: 
      0 0 40px var(--glow-color),
      0 10px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
    min-width: 320px;
    max-width: 450px;
  }
  
  .shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shine 2s ease-in-out infinite;
  }
  
  @keyframes shine {
    0% { left: -100%; }
    50%, 100% { left: 100%; }
  }
  
  .icon-container {
    position: relative;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .icon {
    font-size: 36px;
    z-index: 1;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }
  
  .icon-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;
  }
  
  .icon-ring.delay {
    animation-delay: 0.5s;
  }
  
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  .content {
    flex: 1;
    min-width: 0;
  }
  
  .rarity-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    margin-bottom: 4px;
  }
  
  .rarity-common .rarity-badge {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
  }
  
  .rarity-rare .rarity-badge {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }
  
  .rarity-epic .rarity-badge {
    background: rgba(147, 51, 234, 0.2);
    color: #a78bfa;
  }
  
  .rarity-legendary .rarity-badge {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    animation: legendary-glow 1.5s ease-in-out infinite alternate;
  }
  
  @keyframes legendary-glow {
    from { text-shadow: 0 0 5px rgba(245, 158, 11, 0.5); }
    to { text-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
  }
  
  .title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  .description {
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .xp-badge {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 10px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }
  
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transition: width 0.05s linear;
  }
  
  /* Rarity-specific borders */
  .rarity-common { border: 1px solid rgba(156, 163, 175, 0.3); }
  .rarity-rare { border: 1px solid rgba(59, 130, 246, 0.4); }
  .rarity-epic { border: 1px solid rgba(147, 51, 234, 0.5); }
  .rarity-legendary { 
    border: 2px solid rgba(245, 158, 11, 0.6);
    animation: legendary-border 2s ease-in-out infinite;
  }
  
  @keyframes legendary-border {
    0%, 100% { border-color: rgba(245, 158, 11, 0.6); }
    50% { border-color: rgba(236, 72, 153, 0.6); }
  }
  
  @media (max-width: 480px) {
    .achievement-overlay {
      left: 10px;
      right: 10px;
      transform: none;
    }
    
    .achievement-card {
      min-width: auto;
      max-width: none;
    }
  }
</style>
