<script>
  /**
   * =============================================================================
   * ENHANCED SIMULATION WRAPPER
   * =============================================================================
   * Extended SimModuleWrapper with integrated AI Coaching and Haptic Feedback.
   * Provides real-time feedback, adaptive difficulty, and stylus support.
   * =============================================================================
   */
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { movingAverageSmooth, calculateVelocities, calculateTremorResiduals } from '../lib/ScoringEngine.js';
  
  // AI Coaching
  import { aiCoach } from '../services/ai/AICoachingService';
  import AICoachingOverlay from './coaching/AICoachingOverlay.svelte';
  import DifficultySelector from './coaching/DifficultySelector.svelte';
  
  // Haptic Feedback
  import { hapticService, TISSUE_PROFILES } from '../services/haptic/HapticFeedbackService';
  import HapticFeedbackDisplay from './haptic/HapticFeedbackDisplay.svelte';

  // =============================================================================
  // PROPS
  // =============================================================================
  
  export let duration = 40000;
  export let active = true;
  export let backgroundImageUrl = null;
  export let backgroundOverlayOpacity = 0.15;
  export let moduleId = 'unknown';
  
  // AI Coaching options
  export let enableAICoaching = true;
  export let showCoachingOverlay = true;
  export let showDifficultySelector = true;
  export let initialDifficulty = 3;
  
  // Haptic Feedback options
  export let enableHaptics = true;
  export let showHapticDisplay = true;
  export let tissueType = 'capsule'; // Default tissue for force feedback
  
  // Language
  export let language = 'he';

  const dispatch = createEventDispatcher();

  // =============================================================================
  // STATE
  // =============================================================================
  
  let canvasElement;
  let rawPoints = [];
  let smoothedPoints = [];
  let velocities = [];
  let tremorResiduals = [];
  let isDrawing = false;
  let startTime = null;
  let timeRemaining = duration;
  let timerInterval = null;
  let failed = false;

  // Initialization system
  const DEAD_ZONE_MS = 200;
  const MOVEMENT_THRESHOLD_PX = 12;
  let initPhase = true;
  let initStartTime = null;
  let baselinePoint = null;
  let activeMovementDetected = false;
  let totalMovementFromBaseline = 0;

  // Current pointer data
  let currentPointer = {
    x: 0,
    y: 0,
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    pointerType: '',
    velocity: 0
  };

  // =============================================================================
  // POINTER DATA EXTRACTION
  // =============================================================================

  function extractPointerData(e) {
    const rect = canvasElement?.getBoundingClientRect() || { left: 0, top: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pointerType === 'pen' ? (e.pressure || 0.5) : 0.5,
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0,
      pointerType: e.pointerType,
      timeStamp: e.timeStamp || performance.now()
    };
  }

  // =============================================================================
  // POINT PROCESSING
  // =============================================================================

  function processPoints() {
    if (rawPoints.length < 2) return;
    
    smoothedPoints = movingAverageSmooth(rawPoints, 5);
    velocities = calculateVelocities(rawPoints);
    tremorResiduals = calculateTremorResiduals(rawPoints, smoothedPoints);
    
    if (velocities.length > 0) {
      currentPointer.velocity = velocities[velocities.length - 1];
    }
  }

  // =============================================================================
  // POINTER EVENT HANDLERS
  // =============================================================================

  function handlePointerDown(e) {
    if (!active || failed) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (canvasElement && e.pointerId !== undefined) {
      try {
        canvasElement.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
    
    isDrawing = true;
    rawPoints = [];
    smoothedPoints = [];
    velocities = [];
    tremorResiduals = [];
    
    initPhase = true;
    initStartTime = performance.now();
    activeMovementDetected = false;
    totalMovementFromBaseline = 0;
    
    const data = extractPointerData(e);
    baselinePoint = { x: data.x, y: data.y };
    rawPoints.push(data);
    currentPointer = { ...data, velocity: 0 };
    
    // Process haptic feedback
    if (enableHaptics) {
      hapticService.processPointerEvent(e);
      hapticService.onTissueContact();
    }
    
    if (!startTime) {
      startTime = performance.now();
      startTimer();
      
      // Start AI coaching session
      if (enableAICoaching) {
        aiCoach.startSession(moduleId);
      }
    }
    
    dispatch('pointerstart', { 
      point: data,
      initPhase: true,
      activeMovement: false
    });
  }

  function handlePointerMove(e) {
    if (!isDrawing || !active || failed) return;
    e.preventDefault();
    e.stopPropagation();
    
    const data = extractPointerData(e);
    rawPoints.push(data);
    
    processPoints();
    
    currentPointer = {
      ...data,
      velocity: velocities.length ? velocities[velocities.length - 1] : 0
    };
    
    // Process haptic feedback
    if (enableHaptics) {
      hapticService.processPointerEvent(e);
    }
    
    // Send metrics to AI coach
    if (enableAICoaching && !initPhase) {
      aiCoach.processMetrics({
        x: data.x,
        y: data.y,
        pressure: data.pressure,
        velocity: currentPointer.velocity,
        tiltX: data.tiltX,
        tiltY: data.tiltY,
        timestamp: data.timeStamp
      });
    }
    
    // Initialization phase check
    const timeSinceInit = performance.now() - (initStartTime || performance.now());
    const inDeadZone = timeSinceInit < DEAD_ZONE_MS;
    
    if (baselinePoint) {
      const dx = data.x - baselinePoint.x;
      const dy = data.y - baselinePoint.y;
      const distFromBaseline = Math.sqrt(dx * dx + dy * dy);
      totalMovementFromBaseline = Math.max(totalMovementFromBaseline, distFromBaseline);
      
      if (!activeMovementDetected && totalMovementFromBaseline > MOVEMENT_THRESHOLD_PX) {
        activeMovementDetected = true;
        initPhase = false;
      }
    }
    
    if (inDeadZone) {
      initPhase = true;
    } else if (!activeMovementDetected) {
      initPhase = false;
    }
    
    dispatch('pointermove', {
      raw: data,
      smoothed: smoothedPoints.length ? smoothedPoints[smoothedPoints.length - 1] : data,
      velocity: currentPointer.velocity,
      tremorMagnitude: tremorResiduals.length ? tremorResiduals[tremorResiduals.length - 1] : 0,
      allRaw: rawPoints,
      allSmoothed: smoothedPoints,
      allVelocities: velocities,
      allTremorResiduals: tremorResiduals,
      initPhase,
      inDeadZone,
      activeMovement: activeMovementDetected,
      movementFromBaseline: totalMovementFromBaseline
    });
  }

  function handlePointerUp(e) {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (canvasElement && e.pointerId !== undefined) {
      try {
        canvasElement.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    
    isDrawing = false;
    processPoints();
    
    dispatch('pointerend', {
      rawPoints,
      smoothedPoints,
      velocities,
      tremorResiduals,
      duration: performance.now() - (startTime || performance.now())
    });
  }

  function handlePointerLeave(e) {
    if (isDrawing) {
      handlePointerUp(e);
    }
  }

  // =============================================================================
  // TIMER & SESSION MANAGEMENT
  // =============================================================================

  function startTimer() {
    timeRemaining = duration;
    timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      timeRemaining = Math.max(0, duration - elapsed);
      
      if (timeRemaining <= 0) {
        endSession('timeout');
      }
    }, 100);
  }

  function endSession(reason) {
    clearInterval(timerInterval);
    timerInterval = null;
    isDrawing = false;
    
    // End AI coaching session
    if (enableAICoaching) {
      const analytics = aiCoach.endSession();
      dispatch('coachingAnalytics', analytics);
    }
    
    dispatch('sessionend', {
      reason,
      rawPoints,
      smoothedPoints,
      velocities,
      tremorResiduals,
      totalDuration: performance.now() - (startTime || performance.now())
    });
  }

  // =============================================================================
  // PUBLIC METHODS
  // =============================================================================

  export function triggerFailure(reason) {
    failed = true;
    if (enableHaptics) {
      hapticService.onError();
    }
    endSession(reason);
  }

  export function triggerSuccess() {
    if (enableHaptics) {
      hapticService.onSuccess();
    }
  }

  export function reset() {
    rawPoints = [];
    smoothedPoints = [];
    velocities = [];
    tremorResiduals = [];
    isDrawing = false;
    startTime = null;
    timeRemaining = duration;
    failed = false;
    clearInterval(timerInterval);
    timerInterval = null;
    
    initPhase = true;
    initStartTime = null;
    baselinePoint = null;
    activeMovementDetected = false;
    totalMovementFromBaseline = 0;
  }

  export function getSessionData() {
    return {
      rawPoints,
      smoothedPoints,
      velocities,
      tremorResiduals,
      duration: startTime ? performance.now() - startTime : 0
    };
  }

  export function setPathAccuracy(accuracy) {
    if (enableAICoaching) {
      aiCoach.updatePathAccuracy(accuracy);
    }
  }

  export function triggerHaptic(patternId) {
    if (enableHaptics) {
      hapticService.vibrate(patternId);
    }
  }

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  onMount(() => {
    if (canvasElement) {
      canvasElement.style.touchAction = 'none';
    }
    
    // Initialize AI coaching difficulty
    if (enableAICoaching) {
      aiCoach.setDifficulty(initialDifficulty);
    }
    
    // Initialize haptic tissue
    if (enableHaptics && tissueType) {
      hapticService.setTissue(tissueType);
    }
  });

  onDestroy(() => {
    clearInterval(timerInterval);
    if (enableHaptics) {
      hapticService.clearTissue();
      hapticService.clearTexture();
    }
  });

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  function handleDifficultyChange(e) {
    dispatch('difficultyChange', e.detail);
  }
</script>

<div class="enhanced-sim-wrapper">
  <!-- Timer Bar -->
  <div class="timer-bar">
    <div class="timer-fill" style="width: {(timeRemaining / duration) * 100}%"></div>
    <span class="timer-text">{Math.ceil(timeRemaining / 1000)}s</span>
  </div>
  
  <!-- Pointer Info -->
  <div class="pointer-info">
    <span>Pressure: {currentPointer.pressure.toFixed(2)}</span>
    <span>Tilt: ({currentPointer.tiltX}°, {currentPointer.tiltY}°)</span>
    <span>Velocity: {currentPointer.velocity.toFixed(2)} px/ms</span>
    <span>Type: {currentPointer.pointerType || '—'}</span>
  </div>
  
  <!-- Difficulty Selector -->
  {#if showDifficultySelector && enableAICoaching}
    <div class="difficulty-wrapper">
      <DifficultySelector 
        {language}
        compact={true}
        on:change={handleDifficultyChange}
      />
    </div>
  {/if}
  
  <!-- Canvas Container -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div 
    class="canvas-container"
    class:has-background={backgroundImageUrl}
    bind:this={canvasElement}
    on:pointerdown={handlePointerDown}
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
    on:pointerleave={handlePointerLeave}
    on:pointercancel={handlePointerUp}
    on:touchstart|preventDefault
    on:touchmove|preventDefault
    on:contextmenu|preventDefault
    role="application"
    aria-label="Simulator canvas"
  >
    {#if backgroundImageUrl}
      <div class="background-layer">
        <img 
          src={backgroundImageUrl} 
          alt="Surgical view background" 
          class="background-image"
          draggable="false"
        />
        <div 
          class="background-overlay" 
          style="opacity: {backgroundOverlayOpacity}"
        ></div>
        <div class="vignette-overlay"></div>
      </div>
    {/if}
    <div class="interaction-layer">
      <slot 
        {currentPointer}
        {rawPoints}
        {smoothedPoints}
        {velocities}
        {tremorResiduals}
        {isDrawing}
        {failed}
      />
    </div>
  </div>
  
  <!-- Failure Overlay -->
  {#if failed}
    <div class="failure-overlay">
      <span>FAILED</span>
    </div>
  {/if}
  
  <!-- AI Coaching Overlay -->
  {#if showCoachingOverlay && enableAICoaching}
    <AICoachingOverlay 
      isActive={true}
      {language}
      position="top-right"
    />
  {/if}
  
  <!-- Haptic Feedback Display -->
  {#if showHapticDisplay && enableHaptics}
    <HapticFeedbackDisplay 
      isActive={true}
      {language}
      position="left"
    />
  {/if}
</div>

<style>
  .enhanced-sim-wrapper {
    position: relative;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  .timer-bar {
    position: relative;
    height: 8px;
    background: #2a3a40;
    border-radius: 4px;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: linear-gradient(90deg, #0a7c6d, #0fb89f);
    transition: width 0.1s linear;
  }

  .timer-text {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #fff;
    font-weight: 600;
  }

  .pointer-info {
    display: flex;
    gap: 16px;
    font-size: 11px;
    color: #5a7a80;
    margin-bottom: 8px;
    font-family: 'SF Mono', monospace;
  }

  .difficulty-wrapper {
    position: absolute;
    top: 60px;
    left: 16px;
    z-index: 30;
  }

  .canvas-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    background: #1a2a2e;
    border-radius: 16px;
    overflow: hidden;
    cursor: crosshair;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .canvas-container.has-background {
    background: #000;
  }

  .background-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .background-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    user-select: none;
    -webkit-user-drag: none;
  }

  .background-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 40, 60, 0.3) 0%,
      rgba(0, 20, 30, 0.1) 50%,
      rgba(0, 40, 60, 0.3) 100%
    );
    mix-blend-mode: multiply;
  }

  .vignette-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.6) 100%
    );
    pointer-events: none;
  }

  .interaction-layer {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  .failure-overlay {
    position: absolute;
    inset: 0;
    background: rgba(200, 50, 50, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 700;
    color: #fff;
    border-radius: 16px;
    pointer-events: none;
    z-index: 50;
  }
</style>
