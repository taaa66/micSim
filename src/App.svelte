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

  let currentView = 'dashboard';
  let selectedSim = null;
  let selectedGame = null;
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

  function handleSelect(e) {
    selectedSim = e.detail;
    currentView = 'sim';
  }

  function handleCoreGames() {
    currentView = 'core-games';
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
  }

  function handleComplete(score) {
    console.log('Simulation complete:', score);
  }

  function handleGameComplete(score) {
    console.log('Game complete:', score);
    // TODO: Update Apex Motor Control Rankings
    // TODO: Trigger skill transfer visualization
  }
</script>

<div class="app">
  {#if currentView === 'dashboard'}
    <RadialDashboard 
      on:select={handleSelect} 
      on:moduleHover={handleModuleHover}
      on:coreGames={handleCoreGames}
    />
    
    <!-- Apex Panel -->
    <div class="apex-desktop">
      <ApexLeaguePanel 
        bind:isOpen={apexPanelOpen}
        currentUser="Dr. J. Smith"
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
  {/if}
</div>

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

  /* Apex Panel positioning */
  .apex-desktop {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    z-index: 100;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .apex-desktop {
      position: fixed;
      bottom: 0;
      top: auto;
      left: 0;
      right: 0;
      height: auto;
      max-height: 50vh;
    }
  }
</style>
