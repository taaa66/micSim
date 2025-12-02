<script lang="ts">
  /**
   * =============================================================================
   * AI COACHING OVERLAY - Real-time Feedback Display
   * =============================================================================
   * Displays AI coaching feedback, recommendations, and predictions
   * during simulation practice sessions.
   * =============================================================================
   */
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { aiCoach, type ICoachingFeedback, type IRecommendation, type IErrorPrediction, DIFFICULTY_LEVELS } from '../../services/ai/AICoachingService';
  
  export let isActive: boolean = true;
  export let showDifficulty: boolean = true;
  export let showPredictions: boolean = true;
  export let language: 'en' | 'he' = 'he';
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  
  // Subscriptions
  let feedback: ICoachingFeedback[] = [];
  let recommendations: IRecommendation[] = [];
  let predictions: IErrorPrediction[] = [];
  let currentDifficulty = DIFFICULTY_LEVELS[2];
  let analytics: any = null;
  
  // UI state
  let showRecommendationsPanel = false;
  let expandedFeedback: string | null = null;
  
  // Unsubscribe functions
  let unsubFeedback: () => void;
  let unsubRecommendations: () => void;
  let unsubPredictions: () => void;
  let unsubDifficulty: () => void;
  let unsubAnalytics: () => void;
  
  onMount(() => {
    unsubFeedback = aiCoach.feedback$.subscribe(f => feedback = f);
    unsubRecommendations = aiCoach.recommendations$.subscribe(r => recommendations = r);
    unsubPredictions = aiCoach.predictions$.subscribe(p => predictions = p);
    unsubDifficulty = aiCoach.difficulty$.subscribe(d => currentDifficulty = d);
    unsubAnalytics = aiCoach.analytics$.subscribe(a => analytics = a);
  });
  
  onDestroy(() => {
    unsubFeedback?.();
    unsubRecommendations?.();
    unsubPredictions?.();
    unsubDifficulty?.();
    unsubAnalytics?.();
  });
  
  function dismissFeedback(id: string) {
    aiCoach.dismissFeedback(id);
  }
  
  function getFeedbackIcon(type: ICoachingFeedback['type']): string {
    switch (type) {
      case 'tip': return '💡';
      case 'warning': return '⚠️';
      case 'encouragement': return '🌟';
      case 'correction': return '🎯';
      default: return '📝';
    }
  }
  
  function getFeedbackColor(priority: ICoachingFeedback['priority']): string {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-500/20';
      case 'high': return 'border-orange-500 bg-orange-500/20';
      case 'medium': return 'border-yellow-500 bg-yellow-500/20';
      case 'low': return 'border-green-500 bg-green-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  }
  
  function getPredictionColor(probability: number): string {
    if (probability > 0.7) return 'text-red-400';
    if (probability > 0.4) return 'text-orange-400';
    return 'text-yellow-400';
  }
  
  function getDifficultyColor(level: number): string {
    if (level <= 3) return 'text-green-400';
    if (level <= 6) return 'text-yellow-400';
    if (level <= 8) return 'text-orange-400';
    return 'text-red-400';
  }
  
  function getPositionClasses(): string {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      default: return 'top-4 right-4';
    }
  }
  
  $: activeFeedback = feedback.filter(f => !f.dismissed);
  $: highPriorityPredictions = predictions.filter(p => p.probability > 0.5);
</script>

{#if isActive}
  <div 
    class="ai-coaching-overlay fixed z-50 flex flex-col gap-3 max-w-sm {getPositionClasses()}"
    dir={language === 'he' ? 'rtl' : 'ltr'}
  >
    <!-- Difficulty Badge -->
    {#if showDifficulty}
      <div 
        class="difficulty-badge flex items-center gap-2 px-3 py-2 bg-bg-dark/90 backdrop-blur-sm rounded-lg border border-primary/30"
        transition:fade={{ duration: 200 }}
      >
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-muted">
            {language === 'he' ? 'רמה' : 'Level'}
          </span>
          <span class="text-lg font-bold {getDifficultyColor(currentDifficulty.level)}">
            {currentDifficulty.level}
          </span>
        </div>
        <div class="h-4 w-px bg-primary/30"></div>
        <span class="text-sm font-medium text-text-primary">
          {language === 'he' ? currentDifficulty.nameHe : currentDifficulty.name}
        </span>
        
        <!-- Difficulty progress bar -->
        <div class="flex-1 h-1.5 bg-bg-medium rounded-full overflow-hidden ml-2">
          <div 
            class="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
            style="width: {currentDifficulty.level * 10}%"
          ></div>
        </div>
      </div>
    {/if}
    
    <!-- Error Predictions -->
    {#if showPredictions && highPriorityPredictions.length > 0}
      <div 
        class="predictions-panel bg-bg-dark/90 backdrop-blur-sm rounded-lg border border-orange-500/50 p-3"
        transition:fly={{ y: -20, duration: 300 }}
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-orange-400">⚡</span>
          <span class="text-xs font-semibold text-orange-400 uppercase tracking-wide">
            {language === 'he' ? 'חיזוי שגיאות' : 'Error Prediction'}
          </span>
        </div>
        
        {#each highPriorityPredictions as prediction (prediction.type)}
          <div 
            class="prediction-item flex items-start gap-2 py-1.5 border-t border-orange-500/20 first:border-0"
            transition:fade={{ duration: 150 }}
          >
            <div class="flex-shrink-0 w-10 text-center">
              <span class="text-lg font-bold {getPredictionColor(prediction.probability)}">
                {Math.round(prediction.probability * 100)}%
              </span>
            </div>
            <div class="flex-1">
              <p class="text-xs text-text-primary">
                {language === 'he' ? prediction.preventionTipHe : prediction.preventionTip}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
    <!-- Active Feedback Messages -->
    {#each activeFeedback as fb (fb.id)}
      <div 
        class="feedback-card relative bg-bg-dark/90 backdrop-blur-sm rounded-lg border-l-4 {getFeedbackColor(fb.priority)} p-3 cursor-pointer"
        transition:fly={{ x: position.includes('right') ? 50 : -50, duration: 300 }}
        on:click={() => expandedFeedback = expandedFeedback === fb.id ? null : fb.id}
        on:keypress={(e) => e.key === 'Enter' && (expandedFeedback = expandedFeedback === fb.id ? null : fb.id)}
        role="button"
        tabindex="0"
      >
        <!-- Dismiss button -->
        <button 
          class="absolute top-1 {language === 'he' ? 'left-1' : 'right-1'} w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          on:click|stopPropagation={() => dismissFeedback(fb.id)}
        >
          ×
        </button>
        
        <div class="flex items-start gap-2">
          <span class="text-lg flex-shrink-0">{getFeedbackIcon(fb.type)}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-text-primary leading-snug">
              {language === 'he' ? fb.messageHe : fb.message}
            </p>
            
            {#if expandedFeedback === fb.id}
              <div 
                class="mt-2 pt-2 border-t border-white/10"
                transition:fade={{ duration: 150 }}
              >
                <span class="text-xs text-text-muted">
                  {language === 'he' ? 'קטגוריה:' : 'Category:'} {fb.category}
                </span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
    
    <!-- Recommendations Toggle -->
    {#if recommendations.length > 0}
      <button 
        class="recommendations-toggle flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg transition-colors"
        on:click={() => showRecommendationsPanel = !showRecommendationsPanel}
      >
        <span class="text-primary">📋</span>
        <span class="text-sm font-medium text-primary">
          {language === 'he' ? `${recommendations.length} המלצות` : `${recommendations.length} Recommendations`}
        </span>
        <span class="text-primary transform transition-transform {showRecommendationsPanel ? 'rotate-180' : ''}">
          ▼
        </span>
      </button>
      
      {#if showRecommendationsPanel}
        <div 
          class="recommendations-panel bg-bg-dark/95 backdrop-blur-sm rounded-lg border border-primary/30 p-4 max-h-64 overflow-y-auto"
          transition:fly={{ y: 20, duration: 300 }}
        >
          <h4 class="text-sm font-semibold text-primary mb-3">
            {language === 'he' ? 'המלצות לשיפור' : 'Improvement Recommendations'}
          </h4>
          
          {#each recommendations as rec (rec.id)}
            <div 
              class="recommendation-item py-2 border-b border-white/10 last:border-0"
              transition:fade={{ duration: 150 }}
            >
              <div class="flex items-start gap-2">
                <span class="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                  {rec.priority}
                </span>
                <div class="flex-1">
                  <h5 class="text-sm font-medium text-text-primary">
                    {language === 'he' ? rec.titleHe : rec.title}
                  </h5>
                  <p class="text-xs text-text-muted mt-1">
                    {language === 'he' ? rec.descriptionHe : rec.description}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
    
    <!-- Session Metrics Mini Display -->
    {#if analytics?.metrics}
      <div 
        class="metrics-mini bg-bg-dark/80 backdrop-blur-sm rounded-lg border border-white/10 p-2"
        transition:fade={{ duration: 200 }}
      >
        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="metric">
            <span class="text-xs text-text-muted block">{language === 'he' ? 'רעד' : 'Tremor'}</span>
            <span class="text-sm font-bold text-text-primary">{analytics.metrics.avgTremor.toFixed(1)}</span>
          </div>
          <div class="metric">
            <span class="text-xs text-text-muted block">{language === 'he' ? 'מהירות' : 'Speed'}</span>
            <span class="text-sm font-bold text-text-primary">{analytics.metrics.avgSpeed.toFixed(2)}</span>
          </div>
          <div class="metric">
            <span class="text-xs text-text-muted block">{language === 'he' ? 'לחץ' : 'Pressure'}</span>
            <span class="text-sm font-bold text-text-primary">{analytics.metrics.avgPressure.toFixed(2)}</span>
          </div>
          <div class="metric">
            <span class="text-xs text-text-muted block">{language === 'he' ? 'עקביות' : 'Consist.'}</span>
            <span class="text-sm font-bold text-text-primary">{Math.round(analytics.metrics.consistency)}%</span>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .ai-coaching-overlay {
    pointer-events: none;
  }
  
  .ai-coaching-overlay > * {
    pointer-events: auto;
  }
  
  .feedback-card {
    animation: pulse-border 2s ease-in-out infinite;
  }
  
  @keyframes pulse-border {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  
  .predictions-panel {
    animation: warning-pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes warning-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
    50% { box-shadow: 0 0 10px 2px rgba(249, 115, 22, 0.2); }
  }
  
  .recommendations-panel::-webkit-scrollbar {
    width: 4px;
  }
  
  .recommendations-panel::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .recommendations-panel::-webkit-scrollbar-thumb {
    background: var(--color-primary, #00ff88);
    border-radius: 2px;
  }
</style>
