<script>
  import RadialDashboard from './components/RadialDashboard.svelte';
  import ApexLeaguePanel from './components/ApexLeaguePanel.svelte';
  import CapsulorhexisTrainer from './components/sims/CapsulorhexisTrainer.svelte';
  import CornealTunnelFormation from './components/sims/CornealTunnelFormation.svelte';
  import CornealSuturePlacement from './components/sims/CornealSuturePlacement.svelte';
  import GasLiquidInjection from './components/sims/GasLiquidInjection.svelte';
  import ReflexFloatersReaction from './components/sims/ReflexFloatersReaction.svelte';
  import TissueGraspingTrainer from './components/sims/TissueGraspingTrainer.svelte';
  import NeedleAngleTrainer from './components/sims/NeedleAngleTrainer.svelte';
  import MicroTremorControl from './components/sims/MicroTremorControl.svelte';
  import CornealArcCutter from './components/sims/CornealArcCutter.svelte';
  import SutureTensionTrainer from './components/sims/SutureTensionTrainer.svelte';
  import HydrodissectionControl from './components/sims/HydrodissectionControl.svelte';
  
  // Core Games (Gamification)
  import CoreGamesHub from './components/games/CoreGamesHub.svelte';
  import TremorShield from './components/games/TremorShield.svelte';
  import VectorRace from './components/games/VectorRace.svelte';
  import NanoGripGauntlet from './components/games/NanoGripGauntlet.svelte';

  // OKAP Knowledge Games
  import { OKAPGamesHub } from './components/okap';
  import { 
    VergenceGame, VertexDistanceGame, PrenticeRuleGame, SphericalEquivalentGame, MagnificationGame,
    TriadGame, VisualPathwayGame, CN3Game, EOMGame, VFDefectGame,
    DrugMoAGame, SideEffectsGame, ContraindicationsGame, PupilEffectsGame,
    ISNTGame, GonioscopyGame, DRClassificationGame,
    VAConverterGame, ChemicalBurnGame
  } from './components/okap/games';

  // Authentication
  import AuthScreen from './components/AuthScreen.svelte';
  import UserPanel from './components/UserPanel.svelte';
  import { isLoggedIn, currentUser, displayName, updateUserStats } from './lib/authStore.js';

  // Analytics
  import AnalyticsDashboard from './components/analytics/AnalyticsDashboard.svelte';
  import { recordSession } from './lib/analyticsStore.js';

  // Rota Management
  import { RotaHub } from './modules/rota';

  let currentView = 'dashboard';
  let userPanelOpen = false;
  let selectedSim = null;
  let selectedGame = null;
  let selectedOkapGame = null;
  let apexPanelOpen = true;
  let activeModule = null; // Dynamic context for Apex League
  let showTraceLine = false;
  
  function handleModuleHover(e) {
    if (e.detail) {
      activeModule = e.detail;
      // Trigger trace line animation
      showTraceLine = true;
      setTimeout(() => showTraceLine = false, 300);
    }
  }
  
  function handleApexAllocate(e) {
    console.log('Duty allocated to:', e.detail.assigned);
  }

  const simComponents = {
    'capsulorhexis': CapsulorhexisTrainer,
    'corneal-tunnel': CornealTunnelFormation,
    'corneal-suture': CornealSuturePlacement,
    'gas-injection': GasLiquidInjection,
    'reflex-floaters': ReflexFloatersReaction,
    'tissue-grasping': TissueGraspingTrainer,
    'needle-angle': NeedleAngleTrainer,
    'micro-tremor': MicroTremorControl,
    'corneal-arc': CornealArcCutter,
    'suture-tension': SutureTensionTrainer,
    'hydrodissection': HydrodissectionControl
  };

  const gameComponents = {
    'tremor-shield': TremorShield,
    'vector-race': VectorRace,
    'nano-grip': NanoGripGauntlet
  };

  // OKAP Game Components mapping - ALL 20 GAMES
  const okapGameComponents = {
    // Optics (O1-O5)
    'O1': VergenceGame,
    'O2': VertexDistanceGame,
    'O3': PrenticeRuleGame,
    'O4': SphericalEquivalentGame,
    'O5': MagnificationGame,
    // Neuro (N1-N5)
    'N1': TriadGame,
    'N2': VisualPathwayGame,
    'N3': CN3Game,
    'N4': EOMGame,
    'N5': VFDefectGame,
    // Pharmacology (P1-P4)
    'P1': DrugMoAGame,
    'P2': SideEffectsGame,
    'P3': ContraindicationsGame,
    'P4': PupilEffectsGame,
    // Classifications (C1-C4)
    'C1': ISNTGame,
    'C2': ISNTGame, // T-thinnest uses same mechanic
    'C3': GonioscopyGame,
    'C4': DRClassificationGame,
    // Emergency (E1-E2)
    'E1': VAConverterGame,
    'E2': ChemicalBurnGame
  };

  function handleSelect(e) {
    selectedSim = e.detail;
    currentView = 'sim';
  }

  function handleCoreGames() {
    currentView = 'core-games';
  }

  function handleOkapGames() {
    currentView = 'okap-hub';
  }

  function handleRota() {
    currentView = 'rota';
  }

  function handleSelectOkapGame(game) {
    selectedOkapGame = game;
    currentView = 'okap-game';
  }

  function handleOkapGameComplete(result) {
    console.log('OKAP Game complete:', result);
    const score = result?.score || 0;
    const duration = result?.avgTimeMs ? (result.avgTimeMs * result.total / 1000) : 60;
    
    if (selectedOkapGame) {
      updateUserStats(score, `okap-${selectedOkapGame.id}`);
      recordSession(`okap-${selectedOkapGame.id}`, score, duration, {
        accuracy: result?.accuracy,
        correct: result?.correct,
        total: result?.total,
        grade: result?.grade
      });
    }
  }

  function handleSelectGame(e) {
    selectedGame = e.detail || e;
    currentView = 'game';
  }

  function handleBack() {
    if (currentView === 'game') {
      currentView = 'core-games';
      selectedGame = null;
    } else {
      currentView = 'dashboard';
      selectedSim = null;
      selectedGame = null;
    }
  }

  function handleBackToDashboard() {
    currentView = 'dashboard';
    selectedSim = null;
    selectedGame = null;
    selectedOkapGame = null;
  }

  function handleBackFromOkapGame() {
    currentView = 'okap-hub';
    selectedOkapGame = null;
  }

  function handleComplete(result) {
    console.log('Simulation complete:', result);
    const score = result?.score || result || 0;
    const duration = result?.duration || 60;
    
    // Update user stats
    if (selectedSim) {
      updateUserStats(score, selectedSim.id);
      // Record in analytics
      recordSession(selectedSim.id, score, duration, {
        accuracy: result?.accuracy,
        speed: result?.speed,
        consistency: result?.consistency
      });
    }
  }

  function handleGameComplete(result) {
    console.log('Game complete:', result);
    const score = result?.score || result || 0;
    const duration = result?.duration || 60;
    
    // Update user stats for games
    if (selectedGame) {
      updateUserStats(score, `game-${selectedGame.id}`);
      // Record in analytics
      recordSession(`game-${selectedGame.id}`, score, duration, {
        accuracy: result?.accuracy,
        speed: result?.speed
      });
    }
  }

  function handleOpenAnalytics() {
    currentView = 'analytics';
  }

  function handleAuthenticated(e) {
    console.log('User authenticated:', e.detail?.fullName || e.detail);
  }
</script>

<!-- Auth Screen - shown when not logged in -->
{#if !$isLoggedIn}
  <AuthScreen on:authenticated={handleAuthenticated} />
{:else}
  <!-- User Panel (always visible when logged in) -->
  <UserPanel bind:isOpen={userPanelOpen} on:openAnalytics={handleOpenAnalytics} />
  
  <div class="app">
    {#if currentView === 'dashboard'}
      <RadialDashboard 
        on:select={handleSelect} 
        on:moduleHover={handleModuleHover}
        on:coreGames={handleCoreGames}
        on:okapGames={handleOkapGames}
        on:rota={handleRota}
      />
      
      <!-- Apex Panel - overlay on mobile/tablet -->
      <div class="apex-panel-wrapper" class:open={apexPanelOpen}>
        <ApexLeaguePanel 
          bind:isOpen={apexPanelOpen}
          currentUser={$displayName}
          {activeModule}
          on:allocate={handleApexAllocate}
        />
      </div>
    {:else if currentView === 'core-games'}
    <CoreGamesHub 
      onBack={handleBackToDashboard}
      onSelectGame={handleSelectGame}
    />
  {:else if currentView === 'game' && selectedGame}
    <svelte:component
      this={gameComponents[selectedGame.id]}
      onComplete={handleGameComplete}
      onBack={handleBack}
    />
  {:else if currentView === 'sim' && selectedSim}
    <svelte:component
      this={simComponents[selectedSim.id]}
      onComplete={handleComplete}
      onBack={handleBackToDashboard}
    />
  {:else if currentView === 'analytics'}
    <AnalyticsDashboard onBack={handleBackToDashboard} />
  {:else if currentView === 'okap-hub'}
    <OKAPGamesHub 
      onBack={handleBackToDashboard}
      onSelectGame={handleSelectOkapGame}
    />
  {:else if currentView === 'okap-game' && selectedOkapGame}
    <svelte:component
      this={okapGameComponents[selectedOkapGame.id]}
      onComplete={handleOkapGameComplete}
      onBack={handleBackFromOkapGame}
    />
  {:else if currentView === 'rota'}
    <RotaHub 
      onBack={handleBackToDashboard}
      userId={$currentUser?.id || 'user-1'}
    />
  {/if}
  </div>
{/if}

<style>
  /* App container - full viewport */
  .app {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /* GPU acceleration */
    transform: translateZ(0);
  }

  /* Apex Panel wrapper - slide in from right */
  .apex-panel-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 100;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .apex-panel-wrapper.open {
    transform: translateX(0);
  }

  /* Desktop/Landscape - always show */
  @media (min-width: 1024px) {
    .apex-panel-wrapper {
      transform: translateX(0);
    }
  }

  /* Tablet Portrait - slide in */
  @media (max-width: 1023px) {
    .apex-panel-wrapper {
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
    }
  }

  /* Mobile - bottom sheet style */
  @media (max-width: 767px) {
    .apex-panel-wrapper {
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      height: auto;
      max-height: 60vh;
      transform: translateY(100%);
      border-radius: 20px 20px 0 0;
    }
    
    .apex-panel-wrapper.open {
      transform: translateY(0);
    }
  }
</style>
