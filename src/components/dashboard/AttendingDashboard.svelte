<script lang="ts">
  /**
   * =============================================================================
   * ATTENDING DASHBOARD
   * =============================================================================
   * Program director view for monitoring resident progress
   * =============================================================================
   */
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export let onBack: (() => void) | null = null;

  const dispatch = createEventDispatcher();

  // Mock resident data - in production, this would come from Firebase
  interface ResidentProgress {
    id: string;
    name: string;
    pgyLevel: number;
    lastActive: Date;
    totalSessions: number;
    totalTime: number; // minutes
    okapProgress: {
      gamesCompleted: number;
      totalGames: number;
      averageScore: number;
      averageAccuracy: number;
    };
    motorSkills: {
      tremorReduction: number; // percentage improvement
      reactionTime: number; // ms
      precision: number; // percentage
    };
    weeklyStreak: number;
    rank: number;
  }

  let residents: ResidentProgress[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      pgyLevel: 2,
      lastActive: new Date(Date.now() - 3600000),
      totalSessions: 47,
      totalTime: 820,
      okapProgress: { gamesCompleted: 15, totalGames: 20, averageScore: 8450, averageAccuracy: 82 },
      motorSkills: { tremorReduction: 34, reactionTime: 245, precision: 88 },
      weeklyStreak: 12,
      rank: 1
    },
    {
      id: '2',
      name: 'Dr. Michael Torres',
      pgyLevel: 3,
      lastActive: new Date(Date.now() - 86400000),
      totalSessions: 38,
      totalTime: 650,
      okapProgress: { gamesCompleted: 12, totalGames: 20, averageScore: 7200, averageAccuracy: 76 },
      motorSkills: { tremorReduction: 28, reactionTime: 268, precision: 82 },
      weeklyStreak: 5,
      rank: 2
    },
    {
      id: '3',
      name: 'Dr. Emily Watson',
      pgyLevel: 2,
      lastActive: new Date(Date.now() - 172800000),
      totalSessions: 29,
      totalTime: 480,
      okapProgress: { gamesCompleted: 8, totalGames: 20, averageScore: 6100, averageAccuracy: 68 },
      motorSkills: { tremorReduction: 22, reactionTime: 295, precision: 75 },
      weeklyStreak: 0,
      rank: 3
    },
    {
      id: '4',
      name: 'Dr. James Park',
      pgyLevel: 4,
      lastActive: new Date(Date.now() - 7200000),
      totalSessions: 52,
      totalTime: 920,
      okapProgress: { gamesCompleted: 18, totalGames: 20, averageScore: 9200, averageAccuracy: 89 },
      motorSkills: { tremorReduction: 41, reactionTime: 228, precision: 92 },
      weeklyStreak: 21,
      rank: 1
    }
  ];

  let selectedResident: ResidentProgress | null = null;
  let sortBy: 'rank' | 'name' | 'activity' | 'progress' = 'rank';
  let filterPGY: number | null = null;

  // Summary statistics
  $: totalResidents = residents.length;
  $: activeThisWeek = residents.filter(r => 
    (Date.now() - r.lastActive.getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length;
  $: averageAccuracy = Math.round(
    residents.reduce((sum, r) => sum + r.okapProgress.averageAccuracy, 0) / residents.length
  );
  $: totalTrainingHours = Math.round(
    residents.reduce((sum, r) => sum + r.totalTime, 0) / 60
  );

  // Sorted and filtered residents
  $: displayedResidents = residents
    .filter(r => filterPGY === null || r.pgyLevel === filterPGY)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rank': return a.rank - b.rank;
        case 'name': return a.name.localeCompare(b.name);
        case 'activity': return b.lastActive.getTime() - a.lastActive.getTime();
        case 'progress': return b.okapProgress.gamesCompleted - a.okapProgress.gamesCompleted;
        default: return 0;
      }
    });

  function formatTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#fbbf24';
    if (percentage >= 40) return '#f97316';
    return '#ef4444';
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }
</script>

<div class="attending-dashboard" in:fly={{ y: 20, duration: 400, easing: cubicOut }}>
  <!-- Header -->
  <header class="dashboard-header">
    <button class="back-btn" on:click={handleBack}>← Back</button>
    <div class="header-content">
      <h1>📊 Program Dashboard</h1>
      <p>Resident Progress Overview</p>
    </div>
    <div class="header-actions">
      <button class="export-btn">📥 Export Report</button>
    </div>
  </header>

  <!-- Summary Cards -->
  <div class="summary-grid">
    <div class="summary-card" in:scale={{ duration: 300, delay: 100 }}>
      <span class="summary-icon">👥</span>
      <div class="summary-content">
        <span class="summary-value">{totalResidents}</span>
        <span class="summary-label">Total Residents</span>
      </div>
    </div>
    
    <div class="summary-card" in:scale={{ duration: 300, delay: 150 }}>
      <span class="summary-icon">🟢</span>
      <div class="summary-content">
        <span class="summary-value">{activeThisWeek}</span>
        <span class="summary-label">Active This Week</span>
      </div>
    </div>
    
    <div class="summary-card" in:scale={{ duration: 300, delay: 200 }}>
      <span class="summary-icon">🎯</span>
      <div class="summary-content">
        <span class="summary-value">{averageAccuracy}%</span>
        <span class="summary-label">Avg. OKAP Accuracy</span>
      </div>
    </div>
    
    <div class="summary-card" in:scale={{ duration: 300, delay: 250 }}>
      <span class="summary-icon">⏱️</span>
      <div class="summary-content">
        <span class="summary-value">{totalTrainingHours}h</span>
        <span class="summary-label">Total Training Time</span>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters-bar">
    <div class="filter-group">
      <label>Sort by:</label>
      <select bind:value={sortBy}>
        <option value="rank">Rank</option>
        <option value="name">Name</option>
        <option value="activity">Recent Activity</option>
        <option value="progress">OKAP Progress</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label>PGY Level:</label>
      <select bind:value={filterPGY}>
        <option value={null}>All</option>
        <option value={1}>PGY-1</option>
        <option value={2}>PGY-2</option>
        <option value={3}>PGY-3</option>
        <option value={4}>PGY-4</option>
      </select>
    </div>
  </div>

  <!-- Residents Table -->
  <div class="residents-table">
    <div class="table-header">
      <span class="col-rank">#</span>
      <span class="col-name">Resident</span>
      <span class="col-pgy">PGY</span>
      <span class="col-okap">OKAP Progress</span>
      <span class="col-accuracy">Accuracy</span>
      <span class="col-motor">Motor Skills</span>
      <span class="col-streak">Streak</span>
      <span class="col-activity">Last Active</span>
    </div>
    
    {#each displayedResidents as resident, i}
      <button
        class="table-row"
        class:selected={selectedResident?.id === resident.id}
        on:click={() => selectedResident = resident}
        in:fly={{ x: -20, delay: i * 50, duration: 300 }}
      >
        <span class="col-rank">
          {#if resident.rank === 1}🥇
          {:else if resident.rank === 2}🥈
          {:else if resident.rank === 3}🥉
          {:else}{resident.rank}
          {/if}
        </span>
        
        <span class="col-name">
          <span class="resident-name">{resident.name}</span>
          <span class="resident-sessions">{resident.totalSessions} sessions</span>
        </span>
        
        <span class="col-pgy">
          <span class="pgy-badge">PGY-{resident.pgyLevel}</span>
        </span>
        
        <span class="col-okap">
          <div class="progress-bar-container">
            <div 
              class="progress-bar-fill"
              style="width: {(resident.okapProgress.gamesCompleted / resident.okapProgress.totalGames) * 100}%; background: {getProgressColor((resident.okapProgress.gamesCompleted / resident.okapProgress.totalGames) * 100)}"
            ></div>
          </div>
          <span class="progress-text">{resident.okapProgress.gamesCompleted}/{resident.okapProgress.totalGames}</span>
        </span>
        
        <span class="col-accuracy" style="color: {getProgressColor(resident.okapProgress.averageAccuracy)}">
          {resident.okapProgress.averageAccuracy}%
        </span>
        
        <span class="col-motor">
          <span class="motor-stat">↓{resident.motorSkills.tremorReduction}%</span>
          <span class="motor-stat">{resident.motorSkills.reactionTime}ms</span>
        </span>
        
        <span class="col-streak">
          {#if resident.weeklyStreak > 0}
            🔥 {resident.weeklyStreak}
          {:else}
            <span class="inactive">—</span>
          {/if}
        </span>
        
        <span class="col-activity" class:recent={Date.now() - resident.lastActive.getTime() < 86400000}>
          {formatTimeAgo(resident.lastActive)}
        </span>
      </button>
    {/each}
  </div>

  <!-- Resident Detail Panel -->
  {#if selectedResident}
    <div class="detail-panel" in:fly={{ x: 20, duration: 300 }}>
      <button class="close-detail" on:click={() => selectedResident = null}>×</button>
      
      <div class="detail-header">
        <h2>{selectedResident.name}</h2>
        <span class="pgy-badge large">PGY-{selectedResident.pgyLevel}</span>
      </div>
      
      <div class="detail-stats">
        <div class="detail-stat">
          <span class="stat-label">Total Sessions</span>
          <span class="stat-value">{selectedResident.totalSessions}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">Training Time</span>
          <span class="stat-value">{Math.round(selectedResident.totalTime / 60)}h {selectedResident.totalTime % 60}m</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">Average Score</span>
          <span class="stat-value">{selectedResident.okapProgress.averageScore.toLocaleString()}</span>
        </div>
        <div class="detail-stat">
          <span class="stat-label">Current Streak</span>
          <span class="stat-value">{selectedResident.weeklyStreak} days</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Motor Skill Improvements</h3>
        <div class="motor-details">
          <div class="motor-item">
            <span class="motor-label">Tremor Reduction</span>
            <div class="motor-bar">
              <div class="motor-fill" style="width: {selectedResident.motorSkills.tremorReduction}%"></div>
            </div>
            <span class="motor-value">{selectedResident.motorSkills.tremorReduction}%</span>
          </div>
          <div class="motor-item">
            <span class="motor-label">Precision</span>
            <div class="motor-bar">
              <div class="motor-fill" style="width: {selectedResident.motorSkills.precision}%"></div>
            </div>
            <span class="motor-value">{selectedResident.motorSkills.precision}%</span>
          </div>
        </div>
      </div>
      
      <div class="detail-actions">
        <button class="action-btn">📧 Send Feedback</button>
        <button class="action-btn">📊 Full Report</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .attending-dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1015 0%, #151f28 100%);
    padding: 1.5rem;
    color: #e0f5f0;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .back-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #7aa8a0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e0f5f0;
  }

  .header-content {
    flex: 1;
  }

  .header-content h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #e0f5f0;
  }

  .header-content p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .export-btn {
    padding: 0.5rem 1rem;
    background: rgba(15, 184, 159, 0.2);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 8px;
    color: #0fb89f;
    cursor: pointer;
    transition: all 0.2s;
  }

  .export-btn:hover {
    background: rgba(15, 184, 159, 0.3);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .summary-icon {
    font-size: 2rem;
  }

  .summary-content {
    display: flex;
    flex-direction: column;
  }

  .summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .summary-label {
    font-size: 0.8rem;
    color: #7aa8a0;
  }

  .filters-bar {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .filter-group select {
    padding: 0.4rem 0.8rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #e0f5f0;
    cursor: pointer;
  }

  .residents-table {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 50px 2fr 80px 1.5fr 100px 1fr 80px 120px;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    font-size: 0.8rem;
    color: #7aa8a0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 50px 2fr 80px 1.5fr 100px 1fr 80px 120px;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: none;
    background: transparent;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .table-row:hover {
    background: rgba(15, 184, 159, 0.05);
  }

  .table-row.selected {
    background: rgba(15, 184, 159, 0.1);
    border-color: rgba(15, 184, 159, 0.3);
  }

  .col-rank {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .col-name {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .resident-name {
    font-weight: 600;
    color: #e0f5f0;
  }

  .resident-sessions {
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  .pgy-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 4px;
    font-size: 0.75rem;
    color: #60a5fa;
  }

  .pgy-badge.large {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .col-okap {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .progress-bar-container {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }

  .progress-text {
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  .col-accuracy {
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .col-motor {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .motor-stat {
    font-size: 0.8rem;
    color: #0fb89f;
  }

  .col-streak {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #f59e0b;
  }

  .col-activity {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .col-activity.recent {
    color: #10b981;
  }

  .inactive {
    color: #5a7a80;
  }

  .detail-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: linear-gradient(135deg, #151f28 0%, #1a2530 100%);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem;
    overflow-y: auto;
    z-index: 100;
  }

  .close-detail {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: #7aa8a0;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-detail:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .detail-header h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #e0f5f0;
  }

  .detail-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .detail-stat {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: #7aa8a0;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .detail-section {
    margin-bottom: 2rem;
  }

  .detail-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #7aa8a0;
  }

  .motor-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .motor-item {
    display: grid;
    grid-template-columns: 120px 1fr 50px;
    align-items: center;
    gap: 1rem;
  }

  .motor-label {
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .motor-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .motor-fill {
    height: 100%;
    background: linear-gradient(90deg, #0fb89f, #34d399);
    border-radius: 4px;
  }

  .motor-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0fb89f;
    text-align: right;
  }

  .detail-actions {
    display: flex;
    gap: 1rem;
  }

  .action-btn {
    flex: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0f5f0;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
  }

  .action-btn:hover {
    background: rgba(15, 184, 159, 0.1);
    border-color: rgba(15, 184, 159, 0.3);
  }

  @media (max-width: 1200px) {
    .table-header,
    .table-row {
      grid-template-columns: 40px 1.5fr 60px 1fr 80px 100px 60px;
    }

    .col-activity {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .detail-panel {
      width: 100%;
    }

    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
