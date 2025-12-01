<script>
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';

  export let onBack = null;
  export let onSelectGame = null;

  const dispatch = createEventDispatcher();

  // Core games data
  const coreGames = [
    {
      id: 'tremor-shield',
      name: 'THE TREMOR SHIELD',
      code: 'TRM-SHD',
      icon: '🛡️',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      description: 'Hold steady over the energy well. Minimize hand tremor to charge the shield.',
      targetSkill: 'Tremor Reduction',
      metric: 'RMS Deviation (μm)',
      difficulty: 'Medium',
      duration: '30s',
      transfers: ['Micro-Tremor Control', 'Capsulorhexis', 'Retinal Surgery'],
      bestScore: null,
      bestGrade: null
    },
    {
      id: 'vector-race',
      name: 'THE VECTOR RACE',
      code: 'VEC-RCE',
      icon: '🚀',
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      description: 'Navigate the energy channel by tilting. Match the track angle precisely.',
      targetSkill: 'Angle Precision',
      metric: 'Angle Deviation (°)',
      difficulty: 'Hard',
      duration: '~60s',
      transfers: ['Needle Angle', 'Corneal Tunnel', 'Suture Placement'],
      bestScore: null,
      bestGrade: null
    },
    {
      id: 'nano-grip',
      name: 'NANO-GRIP GAUNTLET',
      code: 'NAN-GRP',
      icon: '🤏',
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      description: 'Maintain optimal finger positions. Repel attacking viruses with pressure control.',
      targetSkill: 'Grip Optimization',
      metric: 'Grip Accuracy (%)',
      difficulty: 'Expert',
      duration: '45s',
      transfers: ['Tissue Grasping', 'Suture Tension', 'Instrument Control'],
      bestScore: null,
      bestGrade: null
    }
  ];

  // Apex Motor Control Rankings (simulated)
  const motorRankings = [
    { rank: 1, name: 'Dr. A. Patel', tremor: 98, vector: 95, grip: 97, total: 290 },
    { rank: 2, name: 'Dr. K. Chen', tremor: 94, vector: 98, grip: 92, total: 284 },
    { rank: 3, name: 'Dr. E. Davies', tremor: 92, vector: 90, grip: 95, total: 277 },
    { rank: 4, name: 'Dr. J. Smith', tremor: 88, vector: 85, grip: 90, total: 263 },
    { rank: 5, name: 'Dr. B. Schmidt', tremor: 82, vector: 88, grip: 85, total: 255 }
  ];

  let selectedGame = null;
  let showRankings = false;

  function selectGame(game) {
    selectedGame = game;
    if (onSelectGame) onSelectGame(game);
    dispatch('selectGame', game);
  }

  function getGradeColor(grade) {
    switch (grade) {
      case 'S': return '#E5E4E2';
      case 'A': return '#fbbf24';
      case 'B': return '#34d399';
      case 'C': return '#60a5fa';
      default: return '#f87171';
    }
  }
</script>

<div class="hub-container">
  <header class="hub-header">
    <button class="back-btn" on:click={onBack}>← Dashboard</button>
    <div class="hub-title">
      <h1>🎮 SURGICAL CORE GAMES</h1>
      <p>Fine Motor Training • Guitar Hero for Surgeons</p>
    </div>
    <button class="rankings-btn" on:click={() => showRankings = !showRankings}>
      🏆 Rankings
    </button>
  </header>

  <div class="hub-content">
    <!-- Game Cards -->
    <div class="games-grid">
      {#each coreGames as game, i}
        <button 
          class="game-card"
          style="--accent: {game.color}; --gradient: {game.gradient};"
          on:click={() => selectGame(game)}
          in:fly={{ y: 30, delay: i * 100, duration: 400, easing: cubicOut }}
        >
          <div class="card-glow"></div>
          
          <div class="card-header">
            <span class="game-icon">{game.icon}</span>
            <span class="game-code">{game.code}</span>
          </div>
          
          <h2 class="game-name">{game.name}</h2>
          <p class="game-desc">{game.description}</p>
          
          <div class="game-meta">
            <div class="meta-item">
              <span class="meta-label">TARGET</span>
              <span class="meta-value">{game.targetSkill}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">METRIC</span>
              <span class="meta-value">{game.metric}</span>
            </div>
          </div>
          
          <div class="game-info">
            <span class="difficulty difficulty-{game.difficulty.toLowerCase()}">{game.difficulty}</span>
            <span class="duration">⏱ {game.duration}</span>
          </div>
          
          <div class="transfers">
            <span class="transfers-label">SKILL TRANSFER →</span>
            <div class="transfer-tags">
              {#each game.transfers as transfer}
                <span class="transfer-tag">{transfer}</span>
              {/each}
            </div>
          </div>
          
          {#if game.bestGrade}
            <div class="best-score">
              <span class="best-grade" style="color: {getGradeColor(game.bestGrade)}">{game.bestGrade}</span>
              <span class="best-points">{game.bestScore} pts</span>
            </div>
          {:else}
            <div class="play-prompt">
              <span>▶ TAP TO PLAY</span>
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Skill Transfer Visualization -->
    <div class="skill-transfer-panel" in:fly={{ y: 20, delay: 400, duration: 300 }}>
      <h3>🔗 SKILL TRANSFER SYSTEM</h3>
      <p>Core game scores directly influence surgical module performance</p>
      
      <div class="transfer-diagram">
        <div class="transfer-source">
          <span class="source-icon">🎮</span>
          <span class="source-label">Core Games</span>
        </div>
        <div class="transfer-arrow">
          <svg viewBox="0 0 100 20" class="arrow-svg">
            <defs>
              <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0fb89f" stop-opacity="0.3"/>
                <stop offset="50%" stop-color="#0fb89f"/>
                <stop offset="100%" stop-color="#0fb89f" stop-opacity="0.3"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="10" x2="85" y2="10" stroke="url(#arrowGrad)" stroke-width="2"/>
            <polygon points="85,5 95,10 85,15" fill="#0fb89f"/>
          </svg>
          <span class="transfer-boost">+15% BOOST</span>
        </div>
        <div class="transfer-target">
          <span class="target-icon">🔬</span>
          <span class="target-label">Surgical Modules</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Rankings Panel -->
  {#if showRankings}
    <div class="rankings-overlay" on:click={() => showRankings = false} on:keydown={(e) => e.key === 'Escape' && (showRankings = false)} role="button" tabindex="0">
      <div class="rankings-panel" on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1" in:scale={{ duration: 300, easing: elasticOut }}>
        <button class="close-rankings" on:click={() => showRankings = false}>×</button>
        
        <h2>🏆 APEX MOTOR CONTROL RANKINGS</h2>
        <p class="rankings-subtitle">Combined scores from all Core Games</p>
        
        <div class="rankings-table">
          <div class="rankings-header">
            <span class="col-rank">RNK</span>
            <span class="col-name">SURGEON</span>
            <span class="col-tremor">🛡️</span>
            <span class="col-vector">🚀</span>
            <span class="col-grip">🤏</span>
            <span class="col-total">TOTAL</span>
          </div>
          
          {#each motorRankings as entry}
            <div 
              class="rankings-row"
              class:gold={entry.rank === 1}
              class:silver={entry.rank === 2}
              class:bronze={entry.rank === 3}
              class:self={entry.name === 'Dr. J. Smith'}
            >
              <span class="col-rank">
                {#if entry.rank === 1}🥇
                {:else if entry.rank === 2}🥈
                {:else if entry.rank === 3}🥉
                {:else}{entry.rank}
                {/if}
              </span>
              <span class="col-name">{entry.name}</span>
              <span class="col-tremor">{entry.tremor}</span>
              <span class="col-vector">{entry.vector}</span>
              <span class="col-grip">{entry.grip}</span>
              <span class="col-total">{entry.total}</span>
            </div>
          {/each}
        </div>
        
        <div class="rankings-footer">
          <span>Rankings update after each game completion</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .hub-container {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0a1015 0%, #151f28 100%);
  }

  .hub-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    flex-wrap: wrap;
  }

  .back-btn, .rankings-btn {
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #8ab0a8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .back-btn:hover, .rankings-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #e0f5f0;
  }

  .rankings-btn {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.3);
    color: #d4af37;
  }

  .hub-title {
    flex: 1;
    text-align: center;
  }

  .hub-title h1 {
    margin: 0;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #34d399 0%, #0fb89f 50%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hub-title p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .hub-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .game-card {
    position: relative;
    background: rgba(15, 25, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: left;
    overflow: hidden;
  }

  .game-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: var(--accent);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px color-mix(in srgb, var(--accent) 30%, transparent);
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient);
    opacity: 0.8;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .game-icon {
    font-size: 2.5rem;
  }

  .game-code {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
  }

  .game-name {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .game-desc {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    color: #7aa8a0;
    line-height: 1.4;
  }

  .game-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .meta-item {
    flex: 1;
  }

  .meta-label {
    display: block;
    font-size: 0.65rem;
    color: #5a7a80;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .meta-value {
    font-size: 0.8rem;
    color: #e0f5f0;
    font-weight: 500;
  }

  .game-info {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .difficulty {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .difficulty-medium {
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
  }

  .difficulty-hard {
    background: rgba(96, 165, 250, 0.15);
    color: #60a5fa;
  }

  .difficulty-expert {
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7;
  }

  .duration {
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  .transfers {
    margin-bottom: 1rem;
  }

  .transfers-label {
    display: block;
    font-size: 0.65rem;
    color: #0fb89f;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
  }

  .transfer-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .transfer-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: rgba(15, 184, 159, 0.1);
    border: 1px solid rgba(15, 184, 159, 0.2);
    border-radius: 4px;
    color: #34d399;
  }

  .best-score {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .best-grade {
    font-size: 2rem;
    font-weight: 800;
  }

  .best-points {
    font-size: 1rem;
    color: #e0f5f0;
  }

  .play-prompt {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    text-align: center;
  }

  .play-prompt span {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 1px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  /* Skill Transfer Panel */
  .skill-transfer-panel {
    background: rgba(15, 184, 159, 0.05);
    border: 1px solid rgba(15, 184, 159, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
  }

  .skill-transfer-panel h3 {
    margin: 0 0 0.5rem;
    color: #0fb89f;
    font-size: 1rem;
    letter-spacing: 1px;
  }

  .skill-transfer-panel p {
    margin: 0 0 1.5rem;
    color: #7aa8a0;
    font-size: 0.85rem;
  }

  .transfer-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .transfer-source, .transfer-target {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .source-icon, .target-icon {
    font-size: 2rem;
  }

  .source-label, .target-label {
    font-size: 0.8rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .transfer-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .arrow-svg {
    width: 100px;
    height: 20px;
  }

  .transfer-boost {
    font-size: 0.7rem;
    font-weight: 700;
    color: #34d399;
    background: rgba(52, 211, 153, 0.15);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  /* Rankings Overlay */
  .rankings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .rankings-panel {
    background: linear-gradient(145deg, rgba(15, 25, 30, 0.98) 0%, rgba(20, 35, 45, 0.98) 100%);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
    position: relative;
  }

  .close-rankings {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #7aa8a0;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
  }

  .rankings-panel h2 {
    margin: 0 0 0.25rem;
    font-size: 1.2rem;
    color: #d4af37;
    text-align: center;
  }

  .rankings-subtitle {
    margin: 0 0 1.5rem;
    font-size: 0.8rem;
    color: #7aa8a0;
    text-align: center;
  }

  .rankings-table {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
  }

  .rankings-header {
    display: grid;
    grid-template-columns: 50px 1fr 50px 50px 50px 60px;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(212, 175, 55, 0.1);
    font-size: 0.7rem;
    font-weight: 700;
    color: #d4af37;
    letter-spacing: 0.5px;
  }

  .rankings-row {
    display: grid;
    grid-template-columns: 50px 1fr 50px 50px 50px 60px;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    color: #e0f5f0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.2s;
  }

  .rankings-row:last-child {
    border-bottom: none;
  }

  .rankings-row.gold {
    background: rgba(212, 175, 55, 0.1);
  }

  .rankings-row.silver {
    background: rgba(192, 192, 192, 0.05);
  }

  .rankings-row.bronze {
    background: rgba(184, 115, 51, 0.05);
  }

  .rankings-row.self {
    background: rgba(139, 92, 246, 0.1);
    border-left: 3px solid #a78bfa;
  }

  .col-rank {
    font-weight: 700;
  }

  .col-total {
    font-weight: 700;
    color: #d4af37;
  }

  .rankings-footer {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.75rem;
    color: #5a7a80;
  }

  @media (max-width: 768px) {
    .games-grid {
      grid-template-columns: 1fr;
    }

    .rankings-header,
    .rankings-row {
      grid-template-columns: 40px 1fr 40px 40px 40px 50px;
      font-size: 0.75rem;
    }
  }
</style>
