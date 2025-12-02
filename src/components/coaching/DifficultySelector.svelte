<script lang="ts">
  /**
   * =============================================================================
   * DIFFICULTY SELECTOR - Adaptive Difficulty Control
   * =============================================================================
   * Allows manual difficulty selection with visual feedback
   * and adaptive difficulty toggle.
   * =============================================================================
   */
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { aiCoach, DIFFICULTY_LEVELS, type IDifficultyLevel } from '../../services/ai/AICoachingService';
  
  export let language: 'en' | 'he' = 'he';
  export let showAdaptiveToggle: boolean = true;
  export let compact: boolean = false;
  
  const dispatch = createEventDispatcher();
  
  let currentDifficulty: IDifficultyLevel = DIFFICULTY_LEVELS[2];
  let adaptiveEnabled: boolean = true;
  let isExpanded: boolean = false;
  let unsubDifficulty: () => void;
  
  onMount(() => {
    unsubDifficulty = aiCoach.difficulty$.subscribe(d => currentDifficulty = d);
  });
  
  onDestroy(() => {
    unsubDifficulty?.();
  });
  
  function selectDifficulty(level: number) {
    aiCoach.setDifficulty(level);
    dispatch('change', { level, difficulty: DIFFICULTY_LEVELS[level - 1] });
    if (compact) isExpanded = false;
  }
  
  function toggleAdaptive() {
    adaptiveEnabled = !adaptiveEnabled;
    dispatch('adaptiveChange', { enabled: adaptiveEnabled });
  }
  
  function getDifficultyColor(level: number): string {
    const hue = 120 - (level - 1) * 12; // Green to red
    return `hsl(${hue}, 70%, 50%)`;
  }
  
  function getDifficultyBgColor(level: number): string {
    const hue = 120 - (level - 1) * 12;
    return `hsla(${hue}, 70%, 50%, 0.15)`;
  }
</script>

<div 
  class="difficulty-selector"
  class:compact
  dir={language === 'he' ? 'rtl' : 'ltr'}
>
  {#if compact}
    <!-- Compact Mode -->
    <button 
      class="compact-trigger flex items-center gap-2 px-3 py-2 bg-bg-dark/90 backdrop-blur-sm rounded-lg border border-primary/30 hover:border-primary/50 transition-all"
      on:click={() => isExpanded = !isExpanded}
    >
      <div 
        class="level-badge w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
        style="background: {getDifficultyBgColor(currentDifficulty.level)}; color: {getDifficultyColor(currentDifficulty.level)}"
      >
        {currentDifficulty.level}
      </div>
      <span class="text-sm font-medium text-text-primary">
        {language === 'he' ? currentDifficulty.nameHe : currentDifficulty.name}
      </span>
      <span class="text-text-muted transform transition-transform {isExpanded ? 'rotate-180' : ''}">▼</span>
    </button>
    
    {#if isExpanded}
      <div 
        class="compact-dropdown absolute top-full mt-2 left-0 right-0 bg-bg-dark/95 backdrop-blur-sm rounded-lg border border-primary/30 p-3 z-50"
        transition:scale={{ duration: 200, start: 0.95 }}
      >
        <div class="grid grid-cols-5 gap-2">
          {#each DIFFICULTY_LEVELS as diff (diff.level)}
            <button 
              class="level-btn flex flex-col items-center p-2 rounded-lg transition-all"
              class:active={currentDifficulty.level === diff.level}
              style="background: {currentDifficulty.level === diff.level ? getDifficultyBgColor(diff.level) : 'transparent'}"
              on:click={() => selectDifficulty(diff.level)}
            >
              <span 
                class="text-lg font-bold"
                style="color: {getDifficultyColor(diff.level)}"
              >
                {diff.level}
              </span>
              <span class="text-[10px] text-text-muted truncate w-full text-center">
                {language === 'he' ? diff.nameHe : diff.name}
              </span>
            </button>
          {/each}
        </div>
        
        {#if showAdaptiveToggle}
          <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span class="text-xs text-text-muted">
              {language === 'he' ? 'התאמה אוטומטית' : 'Auto-adjust'}
            </span>
            <button 
              class="toggle-btn w-10 h-5 rounded-full transition-colors relative"
              class:active={adaptiveEnabled}
              on:click={toggleAdaptive}
              aria-label={language === 'he' ? 'התאמה אוטומטית' : 'Toggle auto-adjust'}
            >
              <span 
                class="toggle-knob absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                class:active={adaptiveEnabled}
              ></span>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <!-- Full Mode -->
    <div class="full-selector bg-bg-dark/90 backdrop-blur-sm rounded-xl border border-primary/30 p-4">
      <div class="header flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-text-primary">
          {language === 'he' ? 'רמת קושי' : 'Difficulty Level'}
        </h3>
        
        {#if showAdaptiveToggle}
          <div class="flex items-center gap-2">
            <span class="text-xs text-text-muted">
              {language === 'he' ? 'התאמה אוטומטית' : 'Auto'}
            </span>
            <button 
              class="toggle-btn w-10 h-5 rounded-full transition-colors relative"
              class:active={adaptiveEnabled}
              on:click={toggleAdaptive}
              aria-label={language === 'he' ? 'התאמה אוטומטית' : 'Toggle auto-adjust'}
            >
              <span 
                class="toggle-knob absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                class:active={adaptiveEnabled}
              ></span>
            </button>
          </div>
        {/if}
      </div>
      
      <!-- Current Level Display -->
      <div class="current-level flex items-center gap-4 mb-4 p-3 rounded-lg" style="background: {getDifficultyBgColor(currentDifficulty.level)}">
        <div 
          class="level-number w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
          style="background: {getDifficultyColor(currentDifficulty.level)}; color: white"
        >
          {currentDifficulty.level}
        </div>
        <div class="flex-1">
          <h4 class="text-lg font-bold text-text-primary">
            {language === 'he' ? currentDifficulty.nameHe : currentDifficulty.name}
          </h4>
          <div class="text-xs text-text-muted mt-1 space-y-0.5">
            <div>{language === 'he' ? 'סטיית מסלול:' : 'Path deviation:'} ±{currentDifficulty.tolerances.pathDeviation}px</div>
            <div>{language === 'he' ? 'סף רעד:' : 'Tremor threshold:'} {currentDifficulty.tolerances.tremorThreshold}</div>
          </div>
        </div>
      </div>
      
      <!-- Level Slider -->
      <div class="level-slider relative mb-4">
        <div class="slider-track h-2 bg-bg-medium rounded-full overflow-hidden">
          <div 
            class="slider-fill h-full rounded-full transition-all duration-300"
            style="width: {currentDifficulty.level * 10}%; background: linear-gradient(to right, #22c55e, #eab308, #ef4444)"
          ></div>
        </div>
        
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={currentDifficulty.level}
          on:input={(e) => selectDifficulty(parseInt(e.currentTarget.value))}
          class="slider-input absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <!-- Level markers -->
        <div class="markers flex justify-between mt-1">
          {#each DIFFICULTY_LEVELS as diff (diff.level)}
            <button 
              class="marker w-6 h-6 rounded-full text-xs font-medium transition-all"
              class:active={currentDifficulty.level === diff.level}
              style="background: {currentDifficulty.level === diff.level ? getDifficultyColor(diff.level) : 'transparent'}; 
                     color: {currentDifficulty.level === diff.level ? 'white' : getDifficultyColor(diff.level)};
                     border: 1px solid {getDifficultyColor(diff.level)}"
              on:click={() => selectDifficulty(diff.level)}
            >
              {diff.level}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Tolerances Display -->
      <div class="tolerances grid grid-cols-2 gap-2 text-xs">
        <div class="tolerance-item p-2 bg-bg-medium/50 rounded">
          <span class="text-text-muted">{language === 'he' ? 'טווח מהירות' : 'Speed range'}</span>
          <span class="block font-medium text-text-primary">
            {currentDifficulty.tolerances.speedRange[0].toFixed(2)} - {currentDifficulty.tolerances.speedRange[1].toFixed(2)}
          </span>
        </div>
        <div class="tolerance-item p-2 bg-bg-medium/50 rounded">
          <span class="text-text-muted">{language === 'he' ? 'טווח לחץ' : 'Pressure range'}</span>
          <span class="block font-medium text-text-primary">
            {currentDifficulty.tolerances.pressureRange[0].toFixed(2)} - {currentDifficulty.tolerances.pressureRange[1].toFixed(2)}
          </span>
        </div>
        <div class="tolerance-item p-2 bg-bg-medium/50 rounded col-span-2">
          <span class="text-text-muted">{language === 'he' ? 'מגבלת זמן' : 'Time limit'}</span>
          <span class="block font-medium text-text-primary">
            {Math.round(currentDifficulty.tolerances.timeLimit / 1000)} {language === 'he' ? 'שניות' : 'seconds'}
          </span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .difficulty-selector {
    position: relative;
  }
  
  .toggle-btn {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .toggle-btn.active {
    background: var(--color-primary, #00ff88);
  }
  
  .toggle-knob {
    left: 2px;
  }
  
  .toggle-knob.active {
    left: calc(100% - 18px);
  }
  
  .level-btn:hover {
    transform: scale(1.05);
  }
  
  .level-btn.active {
    transform: scale(1.1);
  }
  
  .marker:hover {
    transform: scale(1.2);
  }
  
  .marker.active {
    transform: scale(1.3);
    box-shadow: 0 0 10px currentColor;
  }
  
  .slider-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }
</style>
