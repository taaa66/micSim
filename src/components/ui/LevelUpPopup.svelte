<!--
  =============================================================================
  LEVEL UP POPUP COMPONENT
  =============================================================================
  Celebratory popup when user levels up
  =============================================================================
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, backOut } from 'svelte/easing';
  import { confettiRain, emojiCelebration } from '../../lib/confetti';
  
  export let level: number = 1;
  export let title: string = '';
  export let onClose: (() => void) | null = null;
  
  let visible = true;
  let showDetails = false;
  
  const levelColors = [
    '#9ca3af', // 1 - gray
    '#60a5fa', // 2 - blue
    '#34d399', // 3 - green
    '#a78bfa', // 4 - purple
    '#f472b6', // 5 - pink
    '#fbbf24', // 6 - yellow
    '#fb923c', // 7 - orange
    '#f87171', // 8 - red
    '#c084fc', // 9 - violet
    '#fcd34d', // 10 - gold
    '#e879f9', // 11 - fuchsia
    '#facc15'  // 12 - bright gold
  ];
  
  $: color = levelColors[Math.min(level - 1, levelColors.length - 1)];
  
  onMount(() => {
    confettiRain();
    emojiCelebration('⭐');
    
    setTimeout(() => {
      showDetails = true;
    }, 500);
    
    // Auto close after 6 seconds
    setTimeout(() => {
      close();
    }, 6000);
  });
  
  function close() {
    visible = false;
    setTimeout(() => onClose?.(), 400);
  }
</script>

{#if visible}
  <div class="levelup-overlay" transition:fly={{ y: -50, duration: 400 }}>
    <div class="levelup-card" style="--level-color: {color}">
      <!-- Background effects -->
      <div class="bg-glow"></div>
      <div class="bg-rays"></div>
      <div class="bg-particles"></div>
      
      <!-- Level badge -->
      <div class="level-badge" in:scale={{ duration: 600, easing: elasticOut, delay: 200 }}>
        <div class="badge-ring"></div>
        <div class="badge-ring delay"></div>
        <span class="badge-number">{level}</span>
      </div>
      
      <!-- Content -->
      <div class="content">
        <h2 class="title" in:fly={{ y: 20, duration: 400, delay: 300 }}>
          עלית לרמה!
        </h2>
        
        {#if showDetails}
          <div class="level-title" in:scale={{ duration: 400, easing: backOut }}>
            {title}
          </div>
          
          <div class="rewards" in:fly={{ y: 20, duration: 400, delay: 600 }}>
            <span class="reward-item">🎁 יכולות חדשות נפתחו</span>
          </div>
        {/if}
      </div>
      
      <!-- Close button -->
      <button class="close-btn" on:click={close}>המשך</button>
    </div>
  </div>
{/if}

<style>
  .levelup-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    z-index: 10002;
  }
  
  .levelup-card {
    position: relative;
    width: 90%;
    max-width: 400px;
    padding: 40px 30px;
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 40, 0.98));
    border: 2px solid var(--level-color);
    border-radius: 24px;
    text-align: center;
    overflow: hidden;
    box-shadow: 
      0 0 60px color-mix(in srgb, var(--level-color) 40%, transparent),
      0 20px 60px rgba(0, 0, 0, 0.5);
  }
  
  .bg-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center, var(--level-color), transparent 50%);
    opacity: 0.15;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  @keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 0.15; }
    50% { transform: scale(1.1); opacity: 0.25; }
  }
  
  .bg-rays {
    position: absolute;
    inset: 0;
    background: conic-gradient(
      from 0deg,
      transparent,
      var(--level-color) 10%,
      transparent 20%
    );
    opacity: 0.1;
    animation: rotate-rays 10s linear infinite;
  }
  
  @keyframes rotate-rays {
    to { transform: rotate(360deg); }
  }
  
  .bg-particles {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(2px 2px at 20% 30%, var(--level-color), transparent),
      radial-gradient(2px 2px at 40% 70%, var(--level-color), transparent),
      radial-gradient(2px 2px at 60% 40%, var(--level-color), transparent),
      radial-gradient(2px 2px at 80% 60%, var(--level-color), transparent);
    animation: twinkle 3s ease-in-out infinite;
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
  
  .level-badge {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--level-color), color-mix(in srgb, var(--level-color) 70%, black));
    border-radius: 50%;
    box-shadow: 
      0 0 40px var(--level-color),
      inset 0 2px 10px rgba(255, 255, 255, 0.3);
  }
  
  .badge-ring {
    position: absolute;
    inset: -10px;
    border: 3px solid var(--level-color);
    border-radius: 50%;
    animation: ring-pulse 2s ease-out infinite;
  }
  
  .badge-ring.delay {
    animation-delay: 0.5s;
  }
  
  @keyframes ring-pulse {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  .badge-number {
    font-size: 3rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .content {
    position: relative;
    z-index: 1;
  }
  
  .title {
    margin: 0 0 8px;
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .level-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--level-color);
    margin-bottom: 20px;
    text-shadow: 0 0 20px var(--level-color);
  }
  
  .rewards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
  }
  
  .reward-item {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }
  
  .close-btn {
    position: relative;
    padding: 14px 40px;
    background: linear-gradient(135deg, var(--level-color), color-mix(in srgb, var(--level-color) 70%, black));
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 20px color-mix(in srgb, var(--level-color) 50%, transparent);
  }
  
  .close-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px color-mix(in srgb, var(--level-color) 60%, transparent);
  }
</style>
