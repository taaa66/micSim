<script>
  import { fly } from 'svelte/transition';
  
  export let insights = [];
  export let stats = {};
  
  const typeStyles = {
    info: { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa' },
    improve: { bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24' },
    success: { bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399' },
    streak: { bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c' },
    strength: { bg: 'rgba(167, 139, 250, 0.15)', border: '#a78bfa' }
  };
</script>

<div class="insights-panel">
  <!-- Stats Summary -->
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-icon">🎯</span>
      <span class="stat-value">{stats.totalSessions || 0}</span>
      <span class="stat-label">אימונים</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">📊</span>
      <span class="stat-value">{stats.averageScore || 0}%</span>
      <span class="stat-label">ממוצע</span>
    </div>
    <div class="stat-card highlight">
      <span class="stat-icon">🔥</span>
      <span class="stat-value">{stats.streak || 0}</span>
      <span class="stat-label">ימים רצופים</span>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🗺️</span>
      <span class="stat-value">{stats.uniqueModules || 0}</span>
      <span class="stat-label">מודולים</span>
    </div>
  </div>
  
  <!-- Insights -->
  <div class="insights-list">
    <h3 class="section-title">
      <span class="title-icon">💡</span>
      תובנות אישיות
    </h3>
    
    {#each insights as insight, i}
      {@const style = typeStyles[insight.type] || typeStyles.info}
      <div 
        class="insight-card"
        style="
          --insight-bg: {style.bg};
          --insight-border: {style.border};
        "
        in:fly={{ y: 10, duration: 300, delay: i * 100 }}
      >
        <span class="insight-icon">{insight.icon}</span>
        <p class="insight-message">{insight.message}</p>
      </div>
    {/each}
    
    {#if insights.length === 0}
      <div class="empty-state">
        <span>👋</span>
        <p>התחל לתרגל כדי לקבל תובנות אישיות</p>
      </div>
    {/if}
  </div>
  
  <!-- Quick Tips -->
  <div class="tips-section">
    <h3 class="section-title">
      <span class="title-icon">📚</span>
      טיפים מהירים
    </h3>
    
    <div class="tips-list">
      <div class="tip">
        <span class="tip-num">1</span>
        <span>תרגול יומי קצר עדיף על אימון ארוך פעם בשבוע</span>
      </div>
      <div class="tip">
        <span class="tip-num">2</span>
        <span>התחל מהמודולים הבסיסיים והתקדם בהדרגה</span>
      </div>
      <div class="tip">
        <span class="tip-num">3</span>
        <span>שים לב לתחומים החלשים יותר ותרגל אותם</span>
      </div>
    </div>
  </div>
</div>

<style>
  .insights-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px 12px;
    background: rgba(10, 26, 31, 0.6);
    border: 1px solid rgba(15, 184, 159, 0.15);
    border-radius: 12px;
    text-align: center;
    transition: all 0.2s ease;
  }
  
  .stat-card:hover {
    border-color: rgba(15, 184, 159, 0.3);
    transform: translateY(-2px);
  }
  
  .stat-card.highlight {
    background: rgba(251, 146, 60, 0.1);
    border-color: rgba(251, 146, 60, 0.3);
  }
  
  .stat-icon {
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 800;
    color: #34d399;
    line-height: 1;
  }
  
  .stat-card.highlight .stat-value {
    color: #fb923c;
  }
  
  .stat-label {
    font-size: 10px;
    color: rgba(122, 168, 160, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #e0f5f0;
    margin: 0 0 12px;
  }
  
  .title-icon {
    font-size: 18px;
  }
  
  .insights-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .insight-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--insight-bg);
    border: 1px solid var(--insight-border);
    border-radius: 10px;
    transition: transform 0.2s ease;
  }
  
  .insight-card:hover {
    transform: translateX(-4px);
  }
  
  .insight-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  
  .insight-message {
    font-size: 13px;
    color: #e0f5f0;
    margin: 0;
    line-height: 1.4;
  }
  
  .empty-state {
    text-align: center;
    padding: 24px;
    color: rgba(122, 168, 160, 0.6);
  }
  
  .empty-state span {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
  }
  
  .empty-state p {
    margin: 0;
    font-size: 13px;
  }
  
  .tips-section {
    background: rgba(10, 26, 31, 0.4);
    border-radius: 12px;
    padding: 16px;
  }
  
  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .tip {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12px;
    color: rgba(122, 168, 160, 0.8);
  }
  
  .tip-num {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 184, 159, 0.2);
    color: #34d399;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  @media (max-width: 600px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
