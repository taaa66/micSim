<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { audio } from '../lib/audio.js';
  /**
   * @typedef {Object} ModuleMeta
   * @property {string} id
   * @property {number} num
   * @property {string} name
   */
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = true;
  export let currentUser = 'Dr. J. Smith';
  /** @type {ModuleMeta|null} */
  export let activeModule = null; // V5.0: Dynamic context from RadialDashboard
  
  // Competition state
  let competitionActive = true;
  let timeRemaining = 4532;
  let timerInterval;
  let isRefreshing = false; // V5.0: Data refresh animation state
  let newDataLoaded = false; // V5.0: Highlight new rank 1
  
  // V5.0: Module-specific metric labels
  const metricLabels = {
    'micro-tremor': 'TREMOR (Hz)',
    'tissue-grasping': 'FORCE (gf)',
    'needle-angle': 'ANGLE ERR (°)',
    'corneal-tunnel': 'DEPTH VAR (µm)',
    'capsulorhexis': 'DEVIATION (mm)',
    'hydrodissection': 'FLOW RATE (ml/s)',
    'suture-tension': 'TENSION (N)',
    'corneal-suture': 'SYMMETRY (%)',
    'gas-injection': 'PRESSURE (mmHg)',
    'reflex-floaters': 'REACT TIME (ms)',
    'corneal-arc': 'ARC PREC (°)'
  };
  
  // V5.0: Module-specific leaderboard data
  const moduleLeaderboards = {
    'micro-tremor': [
      { rank: 1, name: 'Dr. A. Patel', score: 98.5, metric: '8.2 Hz', tag: 'WINNER' },
      { rank: 2, name: 'Dr. K. Chen', score: 96.1, metric: '8.5 Hz', tag: 'RUNNER-UP' },
      { rank: 3, name: 'Dr. E. Davies', score: 94.8, metric: '9.1 Hz', tag: 'BRONZE' },
      { rank: 4, name: 'Dr. J. Smith', score: 91.2, metric: '9.8 Hz', tag: 'YOU' },
      { rank: 5, name: 'Dr. B. Schmidt', score: 87.3, metric: '10.2 Hz', tag: '' }
    ],
    'capsulorhexis': [
      { rank: 1, name: 'Dr. K. Chen', score: 99.2, metric: '0.08 mm', tag: 'WINNER' },
      { rank: 2, name: 'Dr. A. Patel', score: 97.5, metric: '0.12 mm', tag: 'RUNNER-UP' },
      { rank: 3, name: 'Dr. J. Smith', score: 95.8, metric: '0.15 mm', tag: 'YOU' },
      { rank: 4, name: 'Dr. E. Davies', score: 92.1, metric: '0.22 mm', tag: 'BRONZE' },
      { rank: 5, name: 'Dr. B. Schmidt', score: 88.4, metric: '0.31 mm', tag: '' }
    ],
    'needle-angle': [
      { rank: 1, name: 'Dr. E. Davies', score: 98.9, metric: '0.5°', tag: 'WINNER' },
      { rank: 2, name: 'Dr. A. Patel', score: 96.7, metric: '1.2°', tag: 'RUNNER-UP' },
      { rank: 3, name: 'Dr. K. Chen', score: 94.2, metric: '1.8°', tag: 'BRONZE' },
      { rank: 4, name: 'Dr. J. Smith', score: 90.5, metric: '2.5°', tag: 'YOU' },
      { rank: 5, name: 'Dr. B. Schmidt', score: 85.1, metric: '3.2°', tag: '' }
    ],
    'default': [
      { rank: 1, name: 'Dr. A. Patel', score: 99.1, metric: '0.01s', tag: 'WINNER' },
      { rank: 2, name: 'Dr. K. Chen', score: 97.8, metric: '0.05s', tag: 'RUNNER-UP' },
      { rank: 3, name: 'Dr. E. Davies', score: 95.2, metric: '0.08s', tag: 'BRONZE' },
      { rank: 4, name: 'Dr. B. Schmidt', score: 92.4, metric: '0.12s', tag: '' },
      { rank: 5, name: 'Dr. J. Smith', score: 88.9, metric: '0.15s', tag: 'YOU' }
    ]
  };
  
  // V5.0: Dynamic challenge name and leaderboard based on activeModule
  $: currentChallenge = activeModule ? `${activeModule.name} Mastery` : 'Global Rankings';
  $: currentModuleLabel = activeModule ? `Module ${activeModule.num}` : 'All Modules';
  $: currentMetricLabel = activeModule ? (metricLabels[activeModule.id] || 'METRIC') : 'METRIC';
  $: leaderboardData = activeModule ? (moduleLeaderboards[activeModule.id] || moduleLeaderboards.default) : moduleLeaderboards.default;
  // V12.0: Uncertainty intensity based on distance from mean
  $: meanScore = leaderboardData.reduce((s, e) => s + e.score, 0) / (leaderboardData.length || 1);
  function getUnc(score) {
    const d = Math.abs(score - meanScore);
    return Math.min(1, d / 10); // normalize
  }
  
  // V5.0: Trigger refresh animation when module changes
  $: if (activeModule) {
    triggerRefresh();
  }

  // V11.0: QA guard – DCS payload must be immutable integer (moduleId)
  $: if (activeModule) {
    const moduleNum = /** @type {number} */ (activeModule.num);
    if (typeof moduleNum !== 'number' || Number.isNaN(moduleNum)) {
      console.warn('[QA][DCS] Payload is not an integer moduleId', activeModule);
    }
  }
  
  function triggerRefresh() {
    isRefreshing = true;
    newDataLoaded = false;
    setTimeout(() => {
      isRefreshing = false;
      newDataLoaded = true;
      try { audio.chime(); } catch (_) {}
      setTimeout(() => newDataLoaded = false, 1000);
    }, 150);
  }
  
  // V4.0: Sorting state
  let sortColumn = 'rank';
  let sortAsc = true;
  
  $: leaderboard = [...leaderboardData].sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (sortAsc) return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });
  
  function toggleSort(col) {
    if (sortColumn === col) sortAsc = !sortAsc;
    else { sortColumn = col; sortAsc = true; }
  }
  
  // V11.0: Mathematical Purity Test – always compute lowest score from base data
  function determineAllocation(data) {
    if (!data || !data.length) return '—';
    let min = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i].score < min.score) min = data[i];
    }
    return min.name;
  }
  $: dutyAssignment = determineAllocation(leaderboardData);
  
  // V4.0: Rationale modal
  let showRationale = false;
  
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  function togglePanel() {
    isOpen = !isOpen;
    dispatch('toggle', { isOpen });
  }
  
  function finalizeAllocation() {
    dispatch('allocate', { assigned: dutyAssignment });
    // Visual feedback
    allocationFinalized = true;
    setTimeout(() => allocationFinalized = false, 2000);
  }
  
  let allocationFinalized = false;
  let dataFlowActive = true;
  
  onMount(() => {
    timerInterval = setInterval(() => {
      if (timeRemaining > 0 && competitionActive) {
        timeRemaining--;
      }
    }, 1000);
    
    // Simulate data flow animation
    setInterval(() => {
      dataFlowActive = !dataFlowActive;
      setTimeout(() => dataFlowActive = true, 100);
    }, 3000);
  });
  
  onDestroy(() => {
    clearInterval(timerInterval);
  });
</script>

<!-- Minimized Tab when closed -->
{#if !isOpen}
  <button class="apex-tab" on:click={togglePanel}>
    <span class="tab-icon">🏆</span>
    <span class="tab-text">APEX LEAGUE</span>
  </button>
{/if}

<!-- Main Panel -->
{#if isOpen}
  <div class="apex-panel" in:fly={{ x: 300, duration: 400 }} out:fly={{ x: 300, duration: 350 }} class:finalized={allocationFinalized}>
    <!-- Close/Minimize Button -->
    <button class="close-btn" on:click={togglePanel} aria-label="Minimize panel">
      <span>−</span>
    </button>
    
    <!-- SECTION I: Header & League Status -->
    <header class="panel-header">
      <div class="logo-container">
        <svg class="apex-logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shield with laurel wreath and eye -->
          <path d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z" 
                stroke="url(#goldGradient)" stroke-width="1.5" fill="none"/>
          <!-- Laurel left -->
          <path d="M12 18c2 1 3 4 3 7s-1 5-3 6" stroke="url(#goldGradient)" stroke-width="1" fill="none"/>
          <path d="M14 16c2 1 2 3 2 5" stroke="url(#goldGradient)" stroke-width="0.8" fill="none"/>
          <!-- Laurel right -->
          <path d="M36 18c-2 1-3 4-3 7s1 5 3 6" stroke="url(#goldGradient)" stroke-width="1" fill="none"/>
          <path d="M34 16c-2 1-2 3-2 5" stroke="url(#goldGradient)" stroke-width="0.8" fill="none"/>
          <!-- Abstract eye -->
          <ellipse cx="24" cy="24" rx="8" ry="5" stroke="url(#goldGradient)" stroke-width="1.2" fill="none"/>
          <circle cx="24" cy="24" r="2.5" fill="url(#goldGradient)"/>
          <!-- Suture knot detail -->
          <path d="M20 28c2 2 6 2 8 0" stroke="url(#goldGradient)" stroke-width="0.8" fill="none"/>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#D4AF37"/>
              <stop offset="50%" stop-color="#FFD700"/>
              <stop offset="100%" stop-color="#B8860B"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div class="header-content">
        <h1 class="league-title">THE INTRAOCULAR APEX LEAGUE</h1>
        <p class="league-subtitle">Internal Ranking & Competition Hub</p>
      </div>
      
      <div class="status-row">
        <div class="status-badge" class:active={competitionActive}>
          <span class="status-dot"></span>
          <span class="status-text">{competitionActive ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
        
        <div class="challenge-info">
          <span class="challenge-label">Challenge:</span>
          <span class="challenge-name" class:refreshing={isRefreshing}>{currentChallenge} ({currentModuleLabel})</span>
        </div>
        
        <div class="timer">
          <span class="timer-label">TIME:</span>
          <span class="timer-value">{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </header>
    
    <!-- SECTION II: Live Leaderboard (V4.0 Enhanced) -->
    <section class="leaderboard-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="live-indicator" class:pulsing={isRefreshing}></span>
          APEX RANKINGS: [TEAM ALPHA]
        </h2>
        <!-- V5.0: Context indicator -->
        <span class="context-badge">{currentModuleLabel}</span>
      </div>
      
      <div class="leaderboard-grid" class:refreshing={isRefreshing}>
        <!-- V5.0: Sortable Headers with Dynamic Metric Label -->
        <div class="grid-header">
          <button class="col-rank sort-btn" on:click={() => toggleSort('rank')}>
            RNK {sortColumn === 'rank' ? (sortAsc ? '↑' : '↓') : ''}
          </button>
          <button class="col-user sort-btn" on:click={() => toggleSort('name')}>
            USER {sortColumn === 'name' ? (sortAsc ? '↑' : '↓') : ''}
          </button>
          <button class="col-score sort-btn" on:click={() => toggleSort('score')}>
            SCORE {sortColumn === 'score' ? (sortAsc ? '↑' : '↓') : ''}
          </button>
          <span class="col-metric">{currentMetricLabel}</span>
          <span class="col-tag">STATUS</span>
        </div>
        
        {#each leaderboard as entry, index}
          <div 
            class="grid-row" 
            class:rank-gold={entry.rank === 1}
            class:rank-silver={entry.rank === 2}
            class:rank-bronze={entry.rank === 3}
            class:self-row={entry.name === currentUser}
            class:new-leader={entry.rank === 1 && newDataLoaded}
            class:new-data={newDataLoaded}
            style="animation-delay: {index * 0.05}s"
          >
            <span class="col-rank">
              {#if entry.rank === 1}<span class="medal gold">★</span>
              {:else if entry.rank === 2}<span class="medal silver">★</span>
              {:else if entry.rank === 3}<span class="medal bronze">★</span>{/if}
              {entry.rank}
            </span>
            
            <span class="col-user">
              <span class="user-icon">👤</span>
              {entry.name}
            </span>
            
            <span class="col-score"><span class="uncertain" style="--unc:{getUnc(entry.score)}">{entry.score.toFixed(2)}%</span></span>
            <span class="col-metric">{entry.metric}</span>
            
            <span class="col-tag" 
              class:winner={entry.tag === 'WINNER'} 
              class:runner={entry.tag === 'RUNNER-UP'} 
              class:bronze-tag={entry.tag === 'BRONZE'}
              class:you={entry.tag === 'YOU'}>
              {entry.tag}
            </span>
          </div>
        {/each}
      </div>
    </section>
    
    <!-- SECTION III: Decision-Making Interface (V4.0 Enhanced) -->
    <section class="allocation-section">
      <div class="alloc-header">
        <h3 class="section-title-small">INTERNAL ALLOCATION VOTER</h3>
        <!-- V4.0: Rationale Button -->
        <button class="rationale-btn" on:click={() => showRationale = !showRationale} title="View Rationale">?</button>
      </div>
      <p class="allocation-purpose">Current Ranks determine Allocation Priority for Duty Rotation.</p>
      
      <!-- V4.0: Rationale Modal -->
      {#if showRationale}
        <div class="rationale-modal">
          <p>Lowest Score (<strong>{dutyAssignment}</strong>) receives On-Call Duty per Team Alpha Bylaws §4.2</p>
          <button class="close-rationale" on:click={() => showRationale = false}>×</button>
        </div>
      {/if}
      
      <div class="allocation-display">
        <div class="duty-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#0d9488" stroke-width="1.5" fill="rgba(13,148,136,0.1)"/>
            <path d="M20 8v12l8 4" stroke="#0d9488" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="20" cy="20" r="2.5" fill="#0d9488"/>
          </svg>
          <span class="duty-label">ON-CALL DUTY</span>
        </div>
        
        <div class="assignment-result">
          <span class="assignment-label">ASSIGNMENT:</span>
          <span class="assignment-name" class:strobing={allocationFinalized}>{dutyAssignment.toUpperCase()}</span>
        </div>
      </div>
      
      <button 
        class="finalize-btn" 
        on:click={finalizeAllocation}
        class:finalized={allocationFinalized}
      >
        {allocationFinalized ? '✓ CONFIRMED' : 'FINALIZE ALLOCATION'}
      </button>
    </section>
    
    <!-- Panel glow effect -->
    <div class="panel-glow"></div>
  </div>
{/if}

<style>
  /* ===== MINIMIZED TAB ===== */
  .apex-tab {
    position: fixed;
    top: 80px;
    right: 0;
    background: linear-gradient(135deg, #0d1f23 0%, #1a2f35 100%);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-right: none;
    border-radius: 8px 0 0 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 
      0 0 20px rgba(212, 175, 55, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  .apex-tab:hover {
    padding-right: 24px;
    background: linear-gradient(135deg, #152a30 0%, #1f3a42 100%);
    box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
  }
  
  .tab-icon {
    font-size: 18px;
  }
  
  .tab-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #D4AF37, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* ===== MAIN PANEL (Futuristic) ===== */
  .apex-panel {
    position: fixed;
    top: max(12px, env(safe-area-inset-top));
    right: max(12px, env(safe-area-inset-right));
    bottom: max(12px, env(safe-area-inset-bottom));
    width: min(340px, 35vw); /* Slightly wider */
    max-height: calc(98vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    background: linear-gradient(145deg, 
      rgba(10, 14, 20, 0.98) 0%, 
      rgba(15, 20, 25, 0.98) 100%
    );
    border: 1px solid var(--border-cyan);
    border-radius: var(--radius-chamfer); /* Chamfered look via clip-path preferred, but radius ok for now */
    clip-path: polygon(
      20px 0, 100% 0, 
      100% calc(100% - 20px), 
      calc(100% - 20px) 100%, 
      0 100%, 0 20px
    );
    padding: 0;
    z-index: 100;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    box-shadow: 
      0 0 40px rgba(0, 0, 0, 0.8),
      0 0 20px rgba(0, 255, 255, 0.1);
    backdrop-filter: blur(20px);
  }
  
  .panel-header {
    padding: 20px 24px;
    background: linear-gradient(180deg, 
      rgba(0, 255, 255, 0.05) 0%, 
      transparent 100%
    );
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  }
  
  .league-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    margin: 0;
    color: var(--cyan-400);
    text-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    background: none;
    -webkit-text-fill-color: initial;
  }
  
  .status-badge {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid var(--cyan-600);
  }
  
  .status-badge.active .status-dot {
    background: var(--cyan-400);
    box-shadow: 0 0 8px var(--cyan-400);
  }
  
  .leaderboard-grid {
    background: rgba(10, 14, 20, 0.6);
    border: 1px solid rgba(0, 255, 255, 0.1);
  }
  
  .grid-header {
    background: rgba(0, 255, 255, 0.05);
    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
    color: var(--cyan-400);
  }
  
  .col-score {
    color: var(--cyan-400);
  }
  
  .col-tag.winner {
    background: rgba(0, 255, 255, 0.15);
    color: var(--cyan-400);
    border: 1px solid var(--cyan-600);
  }
  
  .apex-panel.finalized {
    animation: confirmPulse 0.5s ease;
  }
  
  @keyframes confirmPulse {
    0%, 100% { box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(212, 175, 55, 0.15); }
    50% { box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(52, 211, 153, 0.4); }
  }
  
  .panel-glow {
    position: absolute;
    inset: -1px;
    border-radius: 12px;
    pointer-events: none;
    background: linear-gradient(135deg, 
      rgba(212, 175, 55, 0.2) 0%, 
      transparent 30%,
      transparent 70%,
      rgba(212, 175, 55, 0.1) 100%
    );
    z-index: -1;
  }
  
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #7aa8a0;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  /* ===== HEADER SECTION ===== */
  .panel-header {
    padding: 16px 20px;
    background: linear-gradient(180deg, 
      rgba(212, 175, 55, 0.08) 0%, 
      transparent 100%
    );
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }
  
  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
  
  .apex-logo {
    width: 48px;
    height: 48px;
    filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));
  }
  
  .header-content {
    text-align: center;
    margin-bottom: 12px;
  }
  
  .league-title {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 2px;
    margin: 0;
    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
  }
  
  .league-subtitle {
    font-size: 10px;
    color: #7aa8a0;
    letter-spacing: 1px;
    margin: 4px 0 0 0;
    text-transform: uppercase;
  }
  
  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(100, 100, 100, 0.3);
  }
  
  .status-badge.active {
    border-color: rgba(52, 211, 153, 0.5);
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #666;
  }
  
  .status-badge.active .status-dot {
    background: #34d399;
    box-shadow: 0 0 8px #34d399;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .status-text {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #666;
  }
  
  .status-badge.active .status-text {
    color: #34d399;
  }
  
  .challenge-info {
    flex: 1;
    text-align: center;
  }
  
  .challenge-label {
    font-size: 9px;
    color: #5a7a80;
    margin-right: 4px;
  }
  
  .challenge-name {
    font-size: 10px;
    color: #e0f5f0;
    font-weight: 600;
  }
  
  .timer {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .timer-label {
    font-size: 9px;
    color: #5a7a80;
  }
  
  .timer-value {
    font-size: 13px;
    font-weight: 700;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #0fb89f;
    text-shadow: 0 0 10px rgba(15, 184, 159, 0.5);
  }
  
  /* ===== LEADERBOARD SECTION ===== */
  .leaderboard-section {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  }
  
  .section-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #e0f5f0;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .live-indicator {
    width: 8px;
    height: 8px;
    background: #f87171;
    border-radius: 50%;
    animation: livePulse 1s infinite;
  }
  
  @keyframes livePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.6); }
    50% { box-shadow: 0 0 0 4px rgba(248, 113, 113, 0); }
  }
  
  .leaderboard-grid {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .grid-header {
    display: grid;
    grid-template-columns: 50px 1fr 80px 90px 80px;
    gap: 4px;
    padding: 10px 12px;
    background: rgba(212, 175, 55, 0.08);
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #D4AF37;
  }
  
  .grid-row {
    display: grid;
    grid-template-columns: 50px 1fr 80px 90px 80px;
    gap: 4px;
    padding: 10px 12px;
    font-size: 11px;
    color: #e0f5f0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: all 0.3s ease;
    position: relative;
  }
  
  .grid-row:last-child {
    border-bottom: none;
  }
  
  /* V4.0: Gold/Silver/Bronze Hierarchy */
  .grid-row.rank-gold {
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, transparent 100%);
  }
  /* Slow downward gold shine sweep for rank 1 */
  .grid-row.rank-gold::after {
    content: '';
    position: absolute;
    left: 0; right: 0; top: -120%; bottom: -120%;
    background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,215,0,0.25) 30%, rgba(212,175,55,0.0) 60%);
    transform: translateY(-100%);
    animation: goldSweep 4s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes goldSweep {
    0% { transform: translateY(-110%); opacity: 0; }
    20% { opacity: 1; }
    60% { transform: translateY(40%); opacity: 0.9; }
    100% { transform: translateY(120%); opacity: 0; }
  }
  .grid-row.rank-silver {
    background: linear-gradient(90deg, rgba(192, 192, 192, 0.08) 0%, transparent 100%);
  }
  .grid-row.rank-bronze {
    background: linear-gradient(90deg, rgba(184, 115, 51, 0.08) 0%, transparent 100%);
  }
  
  /* V4.0: Purple/Violet User Row */
  .grid-row.self-row {
    background: rgba(139, 92, 246, 0.12);
    border-left: 3px solid #a78bfa;
  }
  
  .medal { font-size: 10px; margin-right: 2px; }
  .medal.gold { color: #d4a853; text-shadow: 0 0 6px rgba(212,168,83,0.5); }
  .medal.silver { color: #a8b5b3; }
  .medal.bronze { color: #b87333; }
  
  .col-rank {
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  /* V4.0: Sortable Headers */
  .sort-btn {
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .sort-btn:hover { color: #d4a853; }
  
  .col-user {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }
  
  .user-icon {
    font-size: 12px;
    opacity: 0.6;
  }
  
  .col-score {
    font-weight: 700;
    color: #0fb89f;
    text-align: center;
    font-family: 'SF Mono', monospace;
  }
  .uncertain {
    position: relative;
    display: inline-block;
    text-shadow: calc(var(--unc)*1px) 0 0 rgba(255,255,255,0.35), calc(var(--unc)*-1px) calc(var(--unc)*.5px) 0 rgba(255,255,255,0.2);
    animation: uncJit 0.2s steps(2) infinite;
  }
  @keyframes uncJit { 50% { text-shadow: calc(var(--unc)*-1px) 0 0 rgba(255,255,255,0.35), calc(var(--unc)*1px) calc(var(--unc)*-.5px) 0 rgba(255,255,255,0.2); } }
  /* Score flash on refresh */
  .leaderboard-grid.refreshing .col-score,
  .grid-row.new-data .col-score {
    animation: scoreFlash 0.15s ease;
  }
  @keyframes scoreFlash {
    0% { color: #0fb89f; text-shadow: none; }
    50% { color: #ffffff; text-shadow: 0 0 10px rgba(255,255,255,0.7); }
    100% { color: #0fb89f; text-shadow: none; }
  }
  
  .col-metric {
    font-size: 10px;
    color: #7aa8a0;
    text-align: center;
  }
  
  .col-tag {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-align: center;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
  }
  
  .col-tag.winner {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.2));
    color: #FFD700;
    border: 1px solid rgba(255, 215, 0, 0.3);
  }
  
  .col-tag.runner {
    background: rgba(192, 192, 192, 0.15);
    color: #C0C0C0;
    border: 1px solid rgba(192, 192, 192, 0.2);
  }
  
  .col-tag.you {
    background: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  .col-tag.bronze-tag {
    background: rgba(184, 115, 51, 0.15);
    color: #b87333;
    border: 1px solid rgba(184, 115, 51, 0.25);
  }
  
  /* V4.0: Section Header with Filter */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  /* V5.0: Context Badge */
  .context-badge {
    font-size: 8px;
    padding: 3px 10px;
    background: rgba(52,211,153,0.15);
    border: 1px solid rgba(52,211,153,0.4);
    border-radius: 12px;
    color: #34d399;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  
  /* V5.0: Refresh Animations */
  .leaderboard-grid.refreshing {
    opacity: 0.3;
    transition: opacity 0.1s ease;
  }
  .challenge-name.refreshing {
    animation: textFlash 0.15s ease;
  }
  @keyframes textFlash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .live-indicator.pulsing {
    animation: liveFlash 0.15s ease 3;
  }
  @keyframes liveFlash {
    0%, 100% { background: #34d399; }
    50% { background: #fff; }
  }
  .grid-row.new-leader {
    animation: leaderPulse 1s ease;
  }
  @keyframes leaderPulse {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 20px rgba(52,211,153,0.6), inset 0 0 10px rgba(52,211,153,0.2); }
  }
  
  /* ===== ALLOCATION SECTION ===== */
  .allocation-section {
    padding: 16px 20px;
  }
  
  /* V4.0: Allocation Header with Rationale */
  .alloc-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .rationale-btn {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(212,175,55,0.2);
    border: 1px solid #d4a853;
    color: #d4a853;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rationale-btn:hover { background: rgba(212,175,55,0.3); }
  
  .rationale-modal {
    background: rgba(212,175,55,0.1);
    border: 1px solid rgba(212,175,55,0.3);
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 12px;
    position: relative;
    font-size: 10px;
    color: #d4a853;
  }
  .rationale-modal p { margin: 0; }
  .rationale-modal strong { color: #fff; }
  .close-rationale {
    position: absolute;
    top: 4px;
    right: 6px;
    background: none;
    border: none;
    color: #d4a853;
    font-size: 14px;
    cursor: pointer;
  }
  
  .section-title-small {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #e0f5f0;
    margin: 0;
  }
  
  .allocation-purpose {
    font-size: 9px;
    color: #5a7a80;
    margin: 0 0 16px 0;
  }
  
  .allocation-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(248, 113, 113, 0.2);
  }
  
  .duty-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  
  .duty-icon svg {
    width: 40px;
    height: 40px;
  }
  
  .duty-label {
    font-size: 8px;
    color: #0fb89f;
    letter-spacing: 1px;
    font-weight: 600;
  }
  
  .assignment-result {
    text-align: right;
  }
  
  .assignment-label {
    font-size: 9px;
    color: #7aa8a0;
    display: block;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
  
  .assignment-name {
    font-size: 14px;
    font-weight: 800;
    color: #f87171;
    letter-spacing: 1px;
    text-shadow: 0 0 20px rgba(248, 113, 113, 0.4);
  }
  .assignment-name.strobing {
    animation: nameStrobe 0.12s ease-in-out 3;
  }
  @keyframes nameStrobe {
    0%, 100% { color: #f87171; text-shadow: 0 0 20px rgba(248, 113, 113, 0.4); }
    50% { color: #ff6b6b; text-shadow: 0 0 30px rgba(255, 107, 107, 0.7); }
  }
  
  .finalize-btn {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.1), rgba(15, 184, 159, 0.05));
    border: 1px solid rgba(15, 184, 159, 0.4);
    border-radius: 8px;
    color: #0fb89f;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .finalize-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(15, 184, 159, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  .finalize-btn:hover::before {
    transform: translateX(100%);
  }
  
  .finalize-btn:hover {
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.2), rgba(15, 184, 159, 0.1));
    box-shadow: 0 0 20px rgba(15, 184, 159, 0.3);
  }
  
  .finalize-btn.finalized {
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.3), rgba(52, 211, 153, 0.2));
    border-color: #34d399;
    color: #34d399;
    transform: scale(0.96);
  }
  
  /* ===== RESPONSIVE ===== */
  /* Tablet/iPad - panel takes right side */
  @media (max-width: 1024px) {
    .apex-panel {
      width: min(300px, 38vw);
      font-size: 0.9em;
    }
    
    .grid-header,
    .grid-row {
      grid-template-columns: 40px 1fr 65px 75px 65px;
      gap: 2px;
    }
    
    .league-title {
      font-size: 13px;
      letter-spacing: 1px;
    }
    
    .league-subtitle {
      font-size: 9px;
    }
  }
  
  /* Mobile - panel becomes bottom sheet */
  @media (max-width: 768px) {
    .apex-panel {
      top: auto;
      left: max(8px, env(safe-area-inset-left));
      right: max(8px, env(safe-area-inset-right));
      bottom: max(8px, env(safe-area-inset-bottom));
      width: auto;
      max-height: 50vh;
      border-radius: 12px 12px 10px 10px;
    }
    
    .panel-header {
      padding: 12px 16px;
    }
    
    .logo-container {
      display: none;
    }
    
    .league-title {
      font-size: 12px;
    }
    
    .status-row {
      flex-wrap: nowrap;
      overflow-x: auto;
      gap: 8px;
    }
    
    .grid-header,
    .grid-row {
      grid-template-columns: 35px 1fr 55px 65px 55px;
      font-size: 9px;
      padding: 8px 10px;
    }
    
    .leaderboard-section,
    .allocation-section {
      padding: 12px 16px;
    }
    
    .allocation-display {
      padding: 12px;
    }
    
    .finalize-btn {
      padding: 10px 16px;
    }
  }
  
  @media (max-width: 500px) {
    .grid-header,
    .grid-row {
      grid-template-columns: 30px 1fr 50px 60px 50px;
      font-size: 8px;
    }
    
    .col-metric {
      display: none;
    }
    
    .grid-header,
    .grid-row {
      grid-template-columns: 30px 1fr 55px 55px;
    }
  }
</style>
