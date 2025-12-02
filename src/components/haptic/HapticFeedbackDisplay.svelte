<script lang="ts">
  /**
   * =============================================================================
   * HAPTIC FEEDBACK DISPLAY - Visual Force & Texture Feedback
   * =============================================================================
   * Provides visual representation of haptic feedback when physical
   * haptics are not available. Includes:
   * - Force feedback visualization (tissue resistance)
   * - Texture pattern visualization
   * - Stylus state display
   * =============================================================================
   */
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { 
    hapticService, 
    type IForceFeedbackState, 
    type IStylusState,
    type ITextureProfile,
    TISSUE_PROFILES
  } from '../../services/haptic/HapticFeedbackService';
  
  export let isActive: boolean = true;
  export let showStylusInfo: boolean = true;
  export let showForceGauge: boolean = true;
  export let showTexturePreview: boolean = true;
  export let position: 'left' | 'right' = 'left';
  export let language: 'en' | 'he' = 'he';
  
  // State
  let stylusState: IStylusState;
  let forceState: IForceFeedbackState;
  let activeTexture: ITextureProfile | null = null;
  
  // Unsubscribe functions
  let unsubStylus: () => void;
  let unsubForce: () => void;
  let unsubTexture: () => void;
  
  // Canvas for texture preview
  let textureCanvas: HTMLCanvasElement;
  let textureCtx: CanvasRenderingContext2D | null = null;
  
  onMount(() => {
    unsubStylus = hapticService.stylus$.subscribe(s => stylusState = s);
    unsubForce = hapticService.force$.subscribe(f => forceState = f);
    unsubTexture = hapticService.texture$.subscribe(t => {
      activeTexture = t;
      if (t && textureCtx) {
        renderTexturePreview(t);
      }
    });
    
    if (textureCanvas) {
      textureCtx = textureCanvas.getContext('2d');
    }
  });
  
  onDestroy(() => {
    unsubStylus?.();
    unsubForce?.();
    unsubTexture?.();
  });
  
  function renderTexturePreview(texture: ITextureProfile) {
    if (!textureCtx || !textureCanvas) return;
    
    const width = textureCanvas.width;
    const height = textureCanvas.height;
    const imageData = textureCtx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const value = calculateTextureValue(texture, x, y);
        const intensity = Math.floor(value * 255);
        
        // Green-tinted texture visualization
        data[idx] = intensity * 0.3;     // R
        data[idx + 1] = intensity;        // G
        data[idx + 2] = intensity * 0.5;  // B
        data[idx + 3] = 200;              // A
      }
    }
    
    textureCtx.putImageData(imageData, 0, 0);
  }
  
  function calculateTextureValue(texture: ITextureProfile, x: number, y: number): number {
    const freq = texture.granularity * 0.2;
    let value = 0;
    
    switch (texture.pattern) {
      case 'smooth':
        value = 0.3 + Math.sin(x * freq) * Math.sin(y * freq) * 0.1;
        break;
      case 'bumpy':
        value = 0.3 + Math.abs(Math.sin(x * freq * 3) * Math.cos(y * freq * 3)) * 0.5;
        break;
      case 'fibrous':
        value = 0.3 + Math.abs(Math.sin(x * freq + y * freq * 0.5)) * 0.4;
        break;
      case 'granular':
        value = 0.2 + (Math.sin(x * freq * 5) + Math.cos(y * freq * 7) + 2) * 0.2;
        break;
      case 'layered':
        value = 0.3 + Math.abs(Math.sin(y * freq * 2)) * 0.5;
        break;
    }
    
    return Math.min(1, value * texture.amplitude);
  }
  
  function getForceColor(force: number): string {
    if (force < 0.3) return '#22c55e'; // Green
    if (force < 0.6) return '#eab308'; // Yellow
    if (force < 0.85) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }
  
  function getStylusIcon(type: IStylusState['type']): string {
    switch (type) {
      case 'apple-pencil': return '✏️';
      case 'stylus': return '🖊️';
      case 'touch': return '👆';
      case 'mouse': return '🖱️';
      default: return '❓';
    }
  }
  
  $: forcePercent = forceState ? Math.round(forceState.currentForce * 100) : 0;
  $: deformPercent = forceState ? Math.round(forceState.deformation * 100) : 0;
  $: pressurePercent = stylusState ? Math.round(stylusState.pressure * 100) : 0;
</script>

{#if isActive}
  <div 
    class="haptic-display fixed z-40 flex flex-col gap-3 w-48"
    class:left-4={position === 'left'}
    class:right-4={position === 'right'}
    class:bottom-4={true}
    dir={language === 'he' ? 'rtl' : 'ltr'}
  >
    <!-- Stylus Info Panel -->
    {#if showStylusInfo && stylusState}
      <div 
        class="stylus-panel bg-bg-dark/90 backdrop-blur-sm rounded-lg border border-primary/30 p-3"
        transition:fade={{ duration: 200 }}
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">{getStylusIcon(stylusState.type)}</span>
          <span class="text-xs font-semibold text-text-primary uppercase tracking-wide">
            {stylusState.type === 'apple-pencil' ? 'Apple Pencil' : 
             stylusState.type === 'stylus' ? 'Stylus' :
             stylusState.type === 'touch' ? (language === 'he' ? 'מגע' : 'Touch') :
             stylusState.type === 'mouse' ? (language === 'he' ? 'עכבר' : 'Mouse') : 
             (language === 'he' ? 'לא ידוע' : 'Unknown')}
          </span>
          {#if stylusState.isConnected}
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {/if}
        </div>
        
        <!-- Pressure Bar -->
        <div class="metric mb-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-text-muted">{language === 'he' ? 'לחץ' : 'Pressure'}</span>
            <span class="text-text-primary font-medium">{pressurePercent}%</span>
          </div>
          <div class="h-2 bg-bg-medium rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-100"
              style="width: {pressurePercent}%"
            ></div>
          </div>
        </div>
        
        <!-- Tilt Visualization -->
        {#if stylusState.supportsTilt}
          <div class="tilt-viz flex items-center justify-center gap-4 mt-2">
            <div class="tilt-indicator relative w-12 h-12 rounded-full border border-primary/30 bg-bg-medium/50">
              <div 
                class="tilt-dot absolute w-3 h-3 rounded-full bg-primary"
                style="
                  left: calc(50% + {stylusState.tiltX * 0.3}px - 6px);
                  top: calc(50% + {stylusState.tiltY * 0.3}px - 6px);
                "
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-px h-full bg-primary/20"></div>
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="h-px w-full bg-primary/20"></div>
              </div>
            </div>
            <div class="text-xs text-text-muted">
              <div>X: {stylusState.tiltX}°</div>
              <div>Y: {stylusState.tiltY}°</div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Force Feedback Gauge -->
    {#if showForceGauge && forceState}
      {@const forceLevel = forceState.currentForce < 0.3 ? 'low' : forceState.currentForce < 0.6 ? 'medium' : forceState.currentForce < 0.85 ? 'high' : 'critical'}
      <div 
        class="force-panel bg-bg-dark/90 backdrop-blur-sm rounded-lg border p-3 transition-colors {forceLevel === 'low' ? 'border-green-500/50' : forceLevel === 'medium' ? 'border-yellow-500/50' : forceLevel === 'high' ? 'border-orange-500/50' : 'border-red-500/50'}"
        class:animate-pulse={forceState.isBreaking}
        transition:fade={{ duration: 200 }}
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-text-primary">
            {language === 'he' ? 'התנגדות רקמה' : 'Tissue Resistance'}
          </span>
          {#if forceState.isBroken}
            <span class="text-xs text-red-400 font-bold animate-pulse">
              {language === 'he' ? 'קרע!' : 'TEAR!'}
            </span>
          {:else if forceState.isBreaking}
            <span class="text-xs text-orange-400 font-bold">
              {language === 'he' ? 'זהירות!' : 'CAUTION!'}
            </span>
          {/if}
        </div>
        
        <!-- Circular Force Gauge -->
        <div class="force-gauge relative w-24 h-24 mx-auto mb-2">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <!-- Background arc -->
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              stroke-width="8"
              stroke-dasharray="188.5"
              stroke-dashoffset="47"
              transform="rotate(135 50 50)"
            />
            <!-- Force arc -->
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={getForceColor(forceState.currentForce)}
              stroke-width="8"
              stroke-dasharray="188.5"
              stroke-dashoffset={188.5 - (forceState.currentForce * 141.4)}
              stroke-linecap="round"
              transform="rotate(135 50 50)"
              class="transition-all duration-100"
            />
            <!-- Break threshold marker -->
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(239, 68, 68, 0.5)"
              stroke-width="2"
              stroke-dasharray="4 184.5"
              stroke-dashoffset={188.5 - (0.85 * 141.4)}
              transform="rotate(135 50 50)"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              class="text-2xl font-bold transition-colors"
              style="color: {getForceColor(forceState.currentForce)}"
            >
              {forcePercent}%
            </span>
            <span class="text-[10px] text-text-muted">
              {language === 'he' ? 'כוח' : 'Force'}
            </span>
          </div>
        </div>
        
        <!-- Deformation Bar -->
        <div class="deformation mt-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-text-muted">{language === 'he' ? 'עיוות' : 'Deformation'}</span>
            <span class="text-text-primary">{deformPercent}%</span>
          </div>
          <div class="h-1.5 bg-bg-medium rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
              style="width: {deformPercent}%"
            ></div>
          </div>
        </div>
        
        <!-- Direction Indicator -->
        {#if forceState.direction.x !== 0 || forceState.direction.y !== 0}
          <div class="direction mt-2 flex items-center justify-center">
            <div 
              class="direction-arrow w-6 h-6 text-primary"
              style="transform: rotate({Math.atan2(forceState.direction.y, forceState.direction.x) * 180 / Math.PI}deg)"
            >
              →
            </div>
            <span class="text-xs text-text-muted ml-1">
              {language === 'he' ? 'כיוון כוח' : 'Force dir'}
            </span>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Texture Preview -->
    {#if showTexturePreview && activeTexture}
      <div 
        class="texture-panel bg-bg-dark/90 backdrop-blur-sm rounded-lg border border-primary/30 p-3"
        transition:scale={{ duration: 200 }}
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-text-primary">
            {language === 'he' ? activeTexture.nameHe : activeTexture.name}
          </span>
          <span class="text-xs text-text-muted">
            {language === 'he' ? 'מרקם' : 'Texture'}
          </span>
        </div>
        
        <canvas 
          bind:this={textureCanvas}
          width="160"
          height="40"
          class="w-full h-10 rounded border border-white/10"
        ></canvas>
        
        <div class="texture-stats grid grid-cols-2 gap-1 mt-2 text-[10px]">
          <div class="flex justify-between">
            <span class="text-text-muted">{language === 'he' ? 'חספוס' : 'Rough'}</span>
            <span class="text-text-primary">{Math.round(activeTexture.roughness * 100)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">{language === 'he' ? 'עוצמה' : 'Amp'}</span>
            <span class="text-text-primary">{Math.round(activeTexture.amplitude * 100)}%</span>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Haptic Events Log (mini) -->
    <div class="events-mini bg-bg-dark/70 backdrop-blur-sm rounded-lg border border-white/10 p-2">
      <div class="flex items-center gap-1 text-[10px] text-text-muted">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span>{language === 'he' ? 'משוב הפטי פעיל' : 'Haptic feedback active'}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .haptic-display {
    pointer-events: none;
  }
  
  .haptic-display > * {
    pointer-events: auto;
  }
  
  .force-panel.animate-pulse {
    animation: danger-pulse 0.5s ease-in-out infinite;
  }
  
  @keyframes danger-pulse {
    0%, 100% { 
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 15px 5px rgba(239, 68, 68, 0.2);
      transform: scale(1.02);
    }
  }
  
  .tilt-dot {
    transition: left 0.1s ease-out, top 0.1s ease-out;
  }
  
  .direction-arrow {
    font-size: 1.2rem;
    transition: transform 0.1s ease-out;
  }
</style>
