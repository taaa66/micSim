<script lang="ts">
  /**
   * =============================================================================
   * OKAP RAPID-FIRE GAMES HUB
   * =============================================================================
   * Main navigation hub for all 20 OKAP knowledge games
   * Organized by 5 modules with visual progress tracking
   * =============================================================================
   */
  import { createEventDispatcher } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';
  import { OKAP_MODULES, OKAP_GAMES, getGamesByModule, type OKAPGame, type OKAPModule } from './okapConstants';

  export let onBack: (() => void) | null = null;
  export let onSelectGame: ((game: OKAPGame) => void) | null = null;

  const dispatch = createEventDispatcher();

  let selectedModule: string | null = null;
  let showModuleGames = false;

  // Get all modules as array
  const modules = Object.values(OKAP_MODULES);

  function selectModule(moduleId: string) {
    selectedModule = moduleId;
    showModuleGames = true;
  }

  function closeModuleGames() {
    showModuleGames = false;
    setTimeout(() => selectedModule = null, 300);
  }

  function selectGame(game: OKAPGame) {
    if (onSelectGame) onSelectGame(game);
    dispatch('selectGame', game);
  }

  function handleBack() {
    if (onBack) onBack();
    dispatch('back');
  }

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return '#34d399';
      case 'Medium': return '#fbbf24';
      case 'Hard': return '#f97316';
      case 'Expert': return '#ef4444';
      default: return '#94a3b8';
    }
  }

  // Calculate module progress (placeholder - will be connected to user data)
  function getModuleProgress(moduleId: string): number {
    // TODO: Connect to actual user progress
    return Math.floor(Math.random() * 100);
  }
</script>

<div class="okap-hub">
  <!-- Header -->
  <header class="hub-header">
    <button class="back-btn" on:click={handleBack}>
      ← Dashboard
    </button>
    <div class="hub-title">
      <h1>📚 OKAP RAPID-FIRE</h1>
      <p>20 Knowledge Games • 5 Modules • Speed & Accuracy</p>
    </div>
    <div class="hub-stats">
      <span class="stat">🎯 0/20 Completed</span>
    </div>
  </header>

  <!-- Main Content -->
  <div class="hub-content">
    <!-- Module Cards Grid -->
    <div class="modules-grid">
      {#each modules as module, i}
        <button
          class="module-card"
          style="--accent: {module.color}; --gradient: {module.gradient};"
          on:click={() => selectModule(module.id)}
          in:fly={{ y: 30, delay: i * 80, duration: 400, easing: cubicOut }}
        >
          <div class="card-glow"></div>
          
          <div class="module-icon">{module.icon}</div>
          
          <h2 class="module-name">{module.name}</h2>
          <p class="module-name-sub">{module.description}</p>
          
          <div class="module-meta">
            <span class="game-count">{module.gameCount} Games</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {getModuleProgress(module.id)}%"></div>
            </div>
          </div>
          
          <div class="play-prompt">
            <span>▶ Select Module</span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Info Panel -->
    <div class="info-panel" in:fly={{ y: 20, delay: 500, duration: 300 }}>
      <h3>⚡ Speed & Knowledge</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-icon">⏱️</span>
          <span class="info-text">15 sec per question</span>
        </div>
        <div class="info-item">
          <span class="info-icon">🎯</span>
          <span class="info-text">Speed Bonus</span>
        </div>
        <div class="info-item">
          <span class="info-icon">🔥</span>
          <span class="info-text">Answer Streaks</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📊</span>
          <span class="info-text">Progress Tracking</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Module Games Overlay -->
  {#if showModuleGames && selectedModule}
    <div 
      class="games-overlay"
      on:click={closeModuleGames}
      on:keydown={(e) => e.key === 'Escape' && closeModuleGames()}
      role="button"
      tabindex="0"
      transition:fade={{ duration: 200 }}
    >
      <div 
        class="games-panel"
        on:click|stopPropagation
        on:keydown|stopPropagation
        role="dialog"
        tabindex="-1"
        style="--accent: {OKAP_MODULES[selectedModule.toUpperCase()]?.color || '#0fb89f'};"
        in:scale={{ duration: 300, easing: elasticOut }}
      >
        <button class="close-btn" on:click={closeModuleGames}>×</button>
        
        <div class="panel-header">
          <span class="panel-icon">{OKAP_MODULES[selectedModule.toUpperCase()]?.icon}</span>
          <h2>{OKAP_MODULES[selectedModule.toUpperCase()]?.name}</h2>
          <p>{OKAP_MODULES[selectedModule.toUpperCase()]?.description}</p>
        </div>

        <div class="games-list">
          {#each getGamesByModule(selectedModule) as game, i}
            <button
              class="game-item"
              on:click={() => selectGame(game)}
              in:fly={{ x: -20, delay: i * 50, duration: 300 }}
            >
              <div class="game-icon">{game.icon}</div>
              <div class="game-info">
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <span class="game-code">{game.code}</span>
              </div>
              <div class="game-meta">
                <span 
                  class="difficulty"
                  style="background: {getDifficultyColor(game.difficulty)}20; color: {getDifficultyColor(game.difficulty)};"
                >
                  {game.difficulty}
                </span>
                <span class="questions">{game.questionCount} questions</span>
              </div>
              <div class="play-arrow">▶</div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .okap-hub {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0a1015 0%, #151f28 100%);
    direction: ltr;
  }

  .hub-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    flex-wrap: wrap;
  }

  .back-btn {
    padding: 0.5rem 1rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #8ab0a8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    direction: ltr;
  }

  .back-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #e0f5f0;
  }

  .hub-title {
    flex: 1;
    text-align: center;
  }

  .hub-title h1 {
    margin: 0;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hub-title p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .hub-stats {
    padding: 0.5rem 1rem;
    background: rgba(15, 184, 159, 0.1);
    border: 1px solid rgba(15, 184, 159, 0.2);
    border-radius: 8px;
  }

  .stat {
    color: #34d399;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .hub-content {
    max-width: 1400px;
    margin: 0 auto;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .module-card {
    position: relative;
    background: rgba(15, 25, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
    overflow: hidden;
  }

  .module-card:hover {
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

  .module-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .module-name {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #e0f5f0;
  }

  .module-name-sub {
    margin: 0.25rem 0 0.75rem;
    font-size: 0.8rem;
    color: #7aa8a0;
    line-height: 1.4;
  }

  .module-meta {
    margin-bottom: 1rem;
  }

  .game-count {
    display: block;
    font-size: 0.75rem;
    color: #5a7a80;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--gradient);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .play-prompt {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
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

  /* Info Panel */
  .info-panel {
    background: rgba(15, 184, 159, 0.05);
    border: 1px solid rgba(15, 184, 159, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
  }

  .info-panel h3 {
    margin: 0 0 1rem;
    color: #0fb89f;
    font-size: 1.1rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .info-icon {
    font-size: 1.2rem;
  }

  .info-text {
    font-size: 0.85rem;
    color: #e0f5f0;
  }

  /* Games Overlay */
  .games-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .games-panel {
    background: linear-gradient(145deg, rgba(15, 25, 30, 0.98) 0%, rgba(20, 35, 45, 0.98) 100%);
    border: 1px solid var(--accent);
    border-radius: 20px;
    padding: 2rem;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: none;
    border: none;
    color: #7aa8a0;
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #e0f5f0;
  }

  .panel-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .panel-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #e0f5f0;
  }

  .panel-header p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: var(--accent);
    direction: ltr;
  }

  .games-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .game-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: right;
  }

  .game-item:hover {
    background: rgba(var(--accent), 0.1);
    border-color: var(--accent);
    transform: translateX(-4px);
  }

  .game-icon {
    font-size: 1.5rem;
  }

  .game-info h3 {
    margin: 0;
    font-size: 1rem;
    color: #e0f5f0;
  }

  .game-info p {
    margin: 0.2rem 0;
    font-size: 0.8rem;
    color: #7aa8a0;
    direction: ltr;
    text-align: right;
  }

  .game-code {
    font-size: 0.7rem;
    color: var(--accent);
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .game-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .difficulty {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .questions {
    font-size: 0.7rem;
    color: #5a7a80;
  }

  .play-arrow {
    font-size: 1.2rem;
    color: var(--accent);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .game-item:hover .play-arrow {
    opacity: 1;
  }

  @media (max-width: 768px) {
    .modules-grid {
      grid-template-columns: 1fr;
    }

    .hub-header {
      flex-direction: column;
      text-align: center;
    }

    .game-item {
      grid-template-columns: auto 1fr auto;
    }

    .play-arrow {
      display: none;
    }
  }
</style>
