<!--
  =============================================================================
  STAT CARD COMPONENT
  =============================================================================
  Animated statistics display card
  =============================================================================
-->

<script lang="ts">
  import AnimatedCounter from './AnimatedCounter.svelte';
  
  export let title: string = '';
  export let value: number = 0;
  export let previousValue: number | null = null;
  export let format: 'number' | 'percent' | 'currency' | 'compact' = 'number';
  export let icon: string = '';
  export let trend: 'up' | 'down' | 'neutral' | null = null;
  export let color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' = 'blue';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  
  $: change = previousValue !== null ? value - previousValue : null;
  $: changePercent = previousValue !== null && previousValue !== 0 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : null;
  $: computedTrend = trend || (change !== null ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : null);
  
  const colorClasses = {
    blue: 'stat-blue',
    green: 'stat-green',
    purple: 'stat-purple',
    orange: 'stat-orange',
    pink: 'stat-pink'
  };
</script>

<div class="stat-card {colorClasses[color]} size-{size}">
  <div class="stat-glow"></div>
  
  <div class="stat-header">
    {#if icon}
      <span class="stat-icon">{icon}</span>
    {/if}
    <span class="stat-title">{title}</span>
  </div>
  
  <div class="stat-value">
    <AnimatedCounter {value} {format} duration={1200} />
  </div>
  
  {#if computedTrend && changePercent !== null}
    <div class="stat-trend trend-{computedTrend}">
      <span class="trend-icon">
        {#if computedTrend === 'up'}↑{:else if computedTrend === 'down'}↓{:else}→{/if}
      </span>
      <span class="trend-value">{Math.abs(Number(changePercent))}%</span>
      <span class="trend-label">מהקודם</span>
    </div>
  {/if}
  
  <slot></slot>
</div>

<style>
  .stat-card {
    position: relative;
    padding: 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }
  
  .stat-glow {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0.1;
    transition: opacity 0.3s;
  }
  
  .stat-card:hover .stat-glow {
    opacity: 0.15;
  }
  
  /* Colors */
  .stat-blue .stat-glow { background: radial-gradient(circle, #3b82f6, transparent 70%); }
  .stat-green .stat-glow { background: radial-gradient(circle, #10b981, transparent 70%); }
  .stat-purple .stat-glow { background: radial-gradient(circle, #8b5cf6, transparent 70%); }
  .stat-orange .stat-glow { background: radial-gradient(circle, #f59e0b, transparent 70%); }
  .stat-pink .stat-glow { background: radial-gradient(circle, #ec4899, transparent 70%); }
  
  .stat-blue .stat-icon { color: #3b82f6; }
  .stat-green .stat-icon { color: #10b981; }
  .stat-purple .stat-icon { color: #8b5cf6; }
  .stat-orange .stat-icon { color: #f59e0b; }
  .stat-pink .stat-icon { color: #ec4899; }
  
  /* Sizes */
  .size-sm { padding: 14px; }
  .size-md { padding: 20px; }
  .size-lg { padding: 28px; }
  
  .size-sm .stat-value { font-size: 1.5rem; }
  .size-md .stat-value { font-size: 2rem; }
  .size-lg .stat-value { font-size: 2.5rem; }
  
  .stat-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .stat-icon {
    font-size: 1.2rem;
  }
  
  .stat-title {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }
  
  .stat-value {
    font-weight: 700;
    color: white;
    line-height: 1.2;
  }
  
  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 0.8rem;
  }
  
  .trend-up {
    color: #10b981;
  }
  
  .trend-down {
    color: #ef4444;
  }
  
  .trend-neutral {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .trend-icon {
    font-weight: bold;
  }
  
  .trend-value {
    font-weight: 600;
  }
  
  .trend-label {
    color: rgba(255, 255, 255, 0.4);
  }
</style>
