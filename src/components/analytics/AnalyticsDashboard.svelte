<script>
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import SkillsRadar from './SkillsRadar.svelte';
  import ProgressChart from './ProgressChart.svelte';
  import SessionCard from './SessionCard.svelte';
  import AchievementCard from './AchievementCard.svelte';
  import InsightsPanel from './InsightsPanel.svelte';
  
  import { 
    skillScores, 
    progressData, 
    recentSessions, 
    earnedAchievements,
    nextAchievements,
    stats,
    insights,
    SKILLS
  } from '../../lib/analyticsStore.js';
  import { displayName, currentUser } from '../../lib/authStore.js';
  
  export let onBack = () => {};
  
  let activeTab = 'overview'; // overview, skills, history, achievements
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<div class="dashboard" in:fade={{ duration: 300 }}>
  <!-- Header -->
  <header class="header">
    <button class="back-btn" on:click={onBack}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      חזרה
    </button>
    
    <div class="header-content">
      <h1>📊 Analytics Dashboard</h1>
      <p class="subtitle">שלום, {$displayName}! הנה הסטטיסטיקות שלך</p>
    </div>
    
    <div class="header-stats">
      <div class="mini-stat">
        <span class="mini-value">{$stats.totalSessions}</span>
        <span class="mini-label">אימונים</span>
      </div>
      <div class="mini-stat highlight">
        <span class="mini-value">🔥 {$stats.streak}</span>
        <span class="mini-label">streak</span>
      </div>
    </div>
  </header>
  
  <!-- Navigation Tabs -->
  <nav class="tabs">
    <button 
      class="tab" 
      class:active={activeTab === 'overview'}
      on:click={() => activeTab = 'overview'}
    >
      <span class="tab-icon">📈</span>
      סקירה
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'skills'}
      on:click={() => activeTab = 'skills'}
    >
      <span class="tab-icon">🎯</span>
      מיומנויות
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'history'}
      on:click={() => activeTab = 'history'}
    >
      <span class="tab-icon">📋</span>
      היסטוריה
    </button>
    <button 
      class="tab"
      class:active={activeTab === 'achievements'}
      on:click={() => activeTab = 'achievements'}
    >
      <span class="tab-icon">🏆</span>
      הישגים
      {#if $earnedAchievements.length > 0}
        <span class="badge">{$earnedAchievements.length}</span>
      {/if}
    </button>
  </nav>
  
  <!-- Content -->
  <main class="content">
    {#if activeTab === 'overview'}
      <div class="overview-grid" in:fly={{ y: 20, duration: 300 }}>
        <!-- Skills Radar -->
        <section class="card radar-card">
          <h2 class="card-title">
            <span>🎯</span> מיומנויות
          </h2>
          <SkillsRadar skills={$skillScores} />
        </section>
        
        <!-- Insights -->
        <section class="card insights-card">
          <InsightsPanel insights={$insights} stats={$stats} />
        </section>
        
        <!-- Progress Chart -->
        <section class="card progress-card">
          <h2 class="card-title">
            <span>📈</span> התקדמות (30 יום אחרונים)
          </h2>
          <ProgressChart data={$progressData} />
        </section>
        
        <!-- Recent Sessions -->
        <section class="card sessions-card">
          <h2 class="card-title">
            <span>📋</span> אימונים אחרונים
          </h2>
          <div class="sessions-list">
            {#each $recentSessions.slice(0, 5) as session, i}
              <SessionCard {session} index={i} />
            {/each}
            {#if $recentSessions.length === 0}
              <div class="empty">
                <span>🎮</span>
                <p>עדיין אין אימונים. התחל לתרגל!</p>
              </div>
            {/if}
          </div>
        </section>
      </div>
      
    {:else if activeTab === 'skills'}
      <div class="skills-view" in:fly={{ y: 20, duration: 300 }}>
        <section class="card large-radar">
          <SkillsRadar skills={$skillScores} size={350} />
        </section>
        
        <section class="skills-breakdown">
          <h2 class="card-title"><span>📊</span> פירוט מיומנויות</h2>
          <div class="skills-list">
            {#each $skillScores as skill}
              <div class="skill-row">
                <div class="skill-info">
                  <span class="skill-icon">{skill.icon}</span>
                  <span class="skill-name">{skill.name}</span>
                </div>
                <div class="skill-bar-container">
                  <div 
                    class="skill-bar" 
                    style="width: {skill.score}%; background: {skill.color}"
                  ></div>
                </div>
                <span class="skill-score" style="color: {skill.color}">
                  {skill.score}%
                </span>
              </div>
            {/each}
          </div>
        </section>
      </div>
      
    {:else if activeTab === 'history'}
      <div class="history-view" in:fly={{ y: 20, duration: 300 }}>
        <section class="card">
          <h2 class="card-title"><span>📋</span> כל האימונים</h2>
          <div class="sessions-list full">
            {#each $recentSessions as session, i}
              <SessionCard {session} index={i} />
            {/each}
            {#if $recentSessions.length === 0}
              <div class="empty large">
                <span>📝</span>
                <p>אין עדיין היסטוריית אימונים</p>
                <button class="start-btn" on:click={onBack}>התחל לתרגל</button>
              </div>
            {/if}
          </div>
        </section>
      </div>
      
    {:else if activeTab === 'achievements'}
      <div class="achievements-view" in:fly={{ y: 20, duration: 300 }}>
        <!-- Earned -->
        <section class="card">
          <h2 class="card-title">
            <span>🏆</span> הישגים שהושגו
            <span class="count">({$earnedAchievements.length})</span>
          </h2>
          <div class="achievements-grid">
            {#each $earnedAchievements as achievement, i}
              <AchievementCard {achievement} earned={true} index={i} />
            {/each}
            {#if $earnedAchievements.length === 0}
              <div class="empty">
                <span>🎯</span>
                <p>עדיין אין הישגים. המשך לתרגל!</p>
              </div>
            {/if}
          </div>
        </section>
        
        <!-- Next to unlock -->
        <section class="card">
          <h2 class="card-title">
            <span>🔓</span> הבאים בתור
          </h2>
          <div class="achievements-grid">
            {#each $nextAchievements as achievement, i}
              <AchievementCard 
                {achievement} 
                earned={false} 
                progress={achievement.progress}
                index={i}
              />
            {/each}
          </div>
        </section>
      </div>
    {/if}
  </main>
</div>

<style>
  .dashboard {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #040d10 0%, #0a1a1f 100%);
    overflow-y: auto;
    overflow-x: hidden;
    direction: rtl;
  }
  
  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: rgba(10, 26, 31, 0.8);
    border-bottom: 1px solid rgba(15, 184, 159, 0.2);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(15, 184, 159, 0.1);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 8px;
    color: #34d399;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .back-btn:hover {
    background: rgba(15, 184, 159, 0.2);
  }
  
  .back-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .header-content {
    text-align: center;
  }
  
  .header-content h1 {
    font-size: 20px;
    font-weight: 800;
    color: #e0f5f0;
    margin: 0;
  }
  
  .subtitle {
    font-size: 12px;
    color: rgba(122, 168, 160, 0.7);
    margin: 4px 0 0;
  }
  
  .header-stats {
    display: flex;
    gap: 12px;
  }
  
  .mini-stat {
    text-align: center;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }
  
  .mini-stat.highlight {
    background: rgba(251, 146, 60, 0.15);
  }
  
  .mini-value {
    display: block;
    font-size: 18px;
    font-weight: 800;
    color: #34d399;
  }
  
  .mini-stat.highlight .mini-value {
    color: #fb923c;
  }
  
  .mini-label {
    font-size: 9px;
    color: rgba(122, 168, 160, 0.6);
    text-transform: uppercase;
  }
  
  /* Tabs */
  .tabs {
    display: flex;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(10, 26, 31, 0.5);
    overflow-x: auto;
  }
  
  .tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    background: transparent;
    border: 1px solid rgba(15, 184, 159, 0.2);
    border-radius: 10px;
    color: #7aa8a0;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  .tab:hover {
    background: rgba(15, 184, 159, 0.1);
  }
  
  .tab.active {
    background: rgba(15, 184, 159, 0.2);
    border-color: rgba(15, 184, 159, 0.5);
    color: #34d399;
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  .badge {
    padding: 2px 6px;
    background: #34d399;
    color: #040d10;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
  }
  
  /* Content */
  .content {
    padding: 20px 24px;
    min-height: calc(100% - 140px);
  }
  
  .card {
    background: rgba(10, 26, 31, 0.6);
    border: 1px solid rgba(15, 184, 159, 0.15);
    border-radius: 16px;
    padding: 20px;
  }
  
  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #e0f5f0;
    margin: 0 0 16px;
  }
  
  .card-title .count {
    font-size: 12px;
    color: rgba(122, 168, 160, 0.6);
    font-weight: 400;
  }
  
  /* Overview Grid */
  .overview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
  }
  
  .radar-card {
    grid-row: span 1;
  }
  
  .insights-card {
    grid-row: span 1;
  }
  
  .progress-card {
    grid-column: span 2;
  }
  
  .sessions-card {
    grid-column: span 2;
  }
  
  /* Skills View */
  .skills-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .large-radar {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }
  
  .skills-breakdown {
    background: rgba(10, 26, 31, 0.6);
    border: 1px solid rgba(15, 184, 159, 0.15);
    border-radius: 16px;
    padding: 20px;
  }
  
  .skills-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .skill-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .skill-info {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 120px;
  }
  
  .skill-icon {
    font-size: 20px;
  }
  
  .skill-name {
    font-size: 13px;
    color: #e0f5f0;
    font-weight: 600;
  }
  
  .skill-bar-container {
    flex: 1;
    height: 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .skill-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease;
  }
  
  .skill-score {
    font-size: 14px;
    font-weight: 700;
    width: 50px;
    text-align: left;
  }
  
  /* Sessions List */
  .sessions-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .sessions-list.full {
    max-height: none;
  }
  
  /* Achievements */
  .achievements-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
  
  /* Empty States */
  .empty {
    text-align: center;
    padding: 40px 20px;
    color: rgba(122, 168, 160, 0.6);
  }
  
  .empty.large {
    padding: 60px 20px;
  }
  
  .empty span {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
  }
  
  .empty p {
    margin: 0 0 16px;
    font-size: 14px;
  }
  
  .start-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #0fb89f, #34d399);
    border: none;
    border-radius: 10px;
    color: #040d10;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .start-btn:hover {
    transform: scale(1.05);
  }
  
  /* Responsive */
  @media (max-width: 900px) {
    .overview-grid {
      grid-template-columns: 1fr;
    }
    
    .radar-card, .insights-card, .progress-card, .sessions-card {
      grid-column: span 1;
    }
    
    .skills-view {
      grid-template-columns: 1fr;
    }
    
    .header {
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .header-content {
      order: -1;
      width: 100%;
    }
  }
  
  @media (max-width: 600px) {
    .header {
      padding: 12px 16px;
    }
    
    .content {
      padding: 16px;
    }
    
    .tabs {
      padding: 10px 16px;
    }
    
    .tab {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
</style>
