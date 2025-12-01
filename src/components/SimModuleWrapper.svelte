<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { movingAverageSmooth, calculateVelocities, calculateTremorResiduals } from '../lib/ScoringEngine.js';

  export let duration = 40000; // 40 seconds default
  export let active = true;
  export let backgroundImageUrl = null; // Hyper-realistic background image
  export let backgroundOverlayOpacity = 0.15; // Subtle overlay for depth

  const dispatch = createEventDispatcher();

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

  // =====================================================
  // INITIALIZATION SYSTEM - Dead-zone & Movement Threshold
  // =====================================================
  const DEAD_ZONE_MS = 200;           // No failures for first 200ms
  const MOVEMENT_THRESHOLD_PX = 12;   // ~0.3mm at typical screen DPI (40px/mm)
  let initPhase = true;               // In initialization phase
  let initStartTime = null;           // When init phase started
  let baselinePoint = null;           // First touch point (baseline)
  let activeMovementDetected = false; // Has user made deliberate movement?
  let totalMovementFromBaseline = 0;  // Cumulative movement distance

  // Current pointer data (reactive)
  let currentPointer = {
    x: 0,
    y: 0,
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    pointerType: '',
    velocity: 0
  };

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

  function processPoints() {
    if (rawPoints.length < 2) return;
    
    // Apply moving average smoothing (window = 5)
    smoothedPoints = movingAverageSmooth(rawPoints, 5);
    
    // Calculate velocities
    velocities = calculateVelocities(rawPoints);
    
    // Calculate tremor residuals
    tremorResiduals = calculateTremorResiduals(rawPoints, smoothedPoints);
    
    // Update current velocity
    if (velocities.length > 0) {
      currentPointer.velocity = velocities[velocities.length - 1];
    }
  }

  function handlePointerDown(e) {
    if (!active || failed) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Capture pointer for better touch handling
    if (canvasElement && e.pointerId !== undefined) {
      try {
        canvasElement.setPointerCapture(e.pointerId);
      } catch (err) {
        // Pointer capture may not be supported
      }
    }
    
    // FULL INPUT RESET - establish neutral baseline
    isDrawing = true;
    rawPoints = [];
    smoothedPoints = [];
    velocities = [];
    tremorResiduals = [];
    
    // Initialize dead-zone and baseline
    initPhase = true;
    initStartTime = performance.now();
    activeMovementDetected = false;
    totalMovementFromBaseline = 0;
    
    const data = extractPointerData(e);
    baselinePoint = { x: data.x, y: data.y }; // Store baseline position
    rawPoints.push(data);
    currentPointer = { ...data, velocity: 0 };
    
    if (!startTime) {
      startTime = performance.now();
      startTimer();
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
    
    // =====================================================
    // INITIALIZATION PHASE CHECK
    // =====================================================
    const timeSinceInit = performance.now() - (initStartTime || performance.now());
    const inDeadZone = timeSinceInit < DEAD_ZONE_MS;
    
    // Calculate movement from baseline
    if (baselinePoint) {
      const dx = data.x - baselinePoint.x;
      const dy = data.y - baselinePoint.y;
      const distFromBaseline = Math.sqrt(dx * dx + dy * dy);
      totalMovementFromBaseline = Math.max(totalMovementFromBaseline, distFromBaseline);
      
      // Check if deliberate movement threshold exceeded
      if (!activeMovementDetected && totalMovementFromBaseline > MOVEMENT_THRESHOLD_PX) {
        activeMovementDetected = true;
        initPhase = false;
      }
    }
    
    // Exit init phase after dead-zone even without movement (for static holds)
    if (inDeadZone) {
      initPhase = true;
    } else if (!activeMovementDetected) {
      // After dead-zone, if no movement, still allow but mark init complete
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
      // Initialization state - child components should check these
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
    
    // Release pointer capture
    if (canvasElement && e.pointerId !== undefined) {
      try {
        canvasElement.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore
      }
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
    
    dispatch('sessionend', {
      reason,
      rawPoints,
      smoothedPoints,
      velocities,
      tremorResiduals,
      totalDuration: performance.now() - (startTime || performance.now())
    });
  }

  export function triggerFailure(reason) {
    failed = true;
    endSession(reason);
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
    
    // Reset initialization state
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

  onMount(() => {
    if (canvasElement) {
      canvasElement.style.touchAction = 'none';
    }
  });

  onDestroy(() => {
    clearInterval(timerInterval);
  });
</script>

<div class="sim-wrapper">
  <div class="timer-bar">
    <div class="timer-fill" style="width: {(timeRemaining / duration) * 100}%"></div>
    <span class="timer-text">{Math.ceil(timeRemaining / 1000)}s</span>
  </div>
  
  <div class="pointer-info">
    <span>Pressure: {currentPointer.pressure.toFixed(2)}</span>
    <span>Tilt: ({currentPointer.tiltX}°, {currentPointer.tiltY}°)</span>
    <span>Velocity: {currentPointer.velocity.toFixed(2)} px/ms</span>
    <span>Type: {currentPointer.pointerType || '—'}</span>
  </div>
  
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
  
  {#if failed}
    <div class="failure-overlay">
      <span>FAILED</span>
    </div>
  {/if}
</div>

<style>
  .sim-wrapper {
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
  }
</style>
