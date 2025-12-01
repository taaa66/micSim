<script>
  import { fly } from 'svelte/transition';
  
  export let session;
  export let index = 0;
  
  // Score color based on performance
  $: scoreColor = session.score >= 90 ? '#34d399' : 
                  session.score >= 70 ? '#fbbf24' : 
                  '#f87171';
  
  $: scoreLabel = session.score >= 90 ? 'מצוין' :
                  session.score >= 70 ? 'טוב' :
                  'צריך שיפור';
</script>

<div 
  class="session-card" 
  in:fly={{ x: -20, duration: 300, delay: index * 50 }}
>
  <div class="session-icon">
    {#if session.score >= 90}
      ⭐
    {:else if session.score >= 70}
      ✓
    {:else}
      📈
    {/if}
  </div>
  
  <div class="session-info">
    <div class="session-header">
      <span class="module-name">{session.moduleName}</span>
      <span class="category">{session.category}</span>
    </div>
    <div class="session-meta">
      <span class="time-ago">{session.timeAgo}</span>
      {#if session.duration}
        <span class="duration">• {Math.round(session.duration / 60)}דק׳</span>
      {/if}
    </div>
  </div>
  
  <div class="session-score" style="--score-color: {scoreColor}">
    <span class="score-value">{session.score}</span>
    <span class="score-label">{scoreLabel}</span>
  </div>
  
  <!-- Progress bar -->
  <div class="progress-bar">
    <div 
      class="progress-fill" 
      style="width: {session.score}%; background: {scoreColor}"
    ></div>
  </div>
</div>

<style>
  .session-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(10, 26, 31, 0.6);
    border: 1px solid rgba(15, 184, 159, 0.15);
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .session-card:hover {
    border-color: rgba(15, 184, 159, 0.3);
    background: rgba(10, 26, 31, 0.8);
  }
  
  .session-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    flex-shrink: 0;
  }
  
  .session-info {
    flex: 1;
    min-width: 0;
  }
  
  .session-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  .module-name {
    font-size: 14px;
    font-weight: 600;
    color: #e0f5f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .category {
    font-size: 10px;
    padding: 2px 6px;
    background: rgba(15, 184, 159, 0.2);
    color: #7aa8a0;
    border-radius: 4px;
    flex-shrink: 0;
  }
  
  .session-meta {
    font-size: 11px;
    color: rgba(122, 168, 160, 0.6);
  }
  
  .session-score {
    text-align: center;
    flex-shrink: 0;
  }
  
  .score-value {
    display: block;
    font-size: 24px;
    font-weight: 800;
    color: var(--score-color);
    line-height: 1;
  }
  
  .score-label {
    font-size: 9px;
    color: rgba(122, 168, 160, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.3);
  }
  
  .progress-fill {
    height: 100%;
    transition: width 0.5s ease;
  }
</style>
