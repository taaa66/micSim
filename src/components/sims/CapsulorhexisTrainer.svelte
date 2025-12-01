<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    scoreRadiusUniformity,
    scoreSpeedUniformity,
    scoreTremor,
    euclideanDistance,
    CAPSULORHEXIS_CONFIG,
    checkRunOutPrecise,
    checkLoopClosure,
    validateCapsulorhexisCompletion,
    findRunOutPoint
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/capsulorhexis-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Target circle parameters
  const center = { x: 400, y: 250 };
  const targetRadius = 120;

  // Difficulty settings
  let difficulty = 'normal';
  $: config = CAPSULORHEXIS_CONFIG[difficulty];

  // State
  let drawnPath = [];
  let smoothedPath = [];
  let currentPoint = null;
  let score = null;
  let startPoint = null;
  let isDrawing = false;
  let gameState = 'ready'; // 'ready', 'drawing', 'success', 'failed'
  
  // Run-out failure state
  let runOutPoint = null;
  let runOutFlashActive = false;
  let runOutFlashInterval = null;
  
  // Positioning phase - user must first reach the target circle before validation starts
  let hasReachedTarget = false;
  
  // Target guide fading
  let interactionStartTime = null;
  let guideOpacity = 0.4;
  let guideAnimationFrame = null;
  
  // Feedback message
  let feedbackMessage = '';
  let feedbackType = ''; // 'info', 'success', 'error'

  // SENSORY SUBSTITUTION: Visual force feedback (compensates for lack of haptic)
  let capsuleTension = 0;        // 0-100 scale
  let tensionHistory = [];
  let maxTensionReached = 0;
  let tearRiskLevel = 'safe';    // 'safe', 'caution', 'danger'
  let stretchDirection = null;   // Visual indicator of stretch direction
  let lastPoint = null;
  let velocityHistory = [];

  // Calculate capsule tension based on multiple factors
  function calculateCapsuleTension(point, prevPoint, velocity) {
    if (!prevPoint) return 0;
    
    // Factor 1: Radial deviation from target (stretch)
    const currentRadius = euclideanDistance(point, center);
    const radiusDeviation = Math.abs(currentRadius - targetRadius);
    const stretchFactor = Math.min(100, (radiusDeviation / config.runOutTolerancePx) * 60);
    
    // Factor 2: Velocity (faster = more tension on tissue)
    const velocityFactor = Math.min(30, (velocity || 0) * 50);
    
    // Factor 3: Direction change (sharp turns = stress concentration)
    let angleFactor = 0;
    if (drawnPath.length > 3) {
      const p1 = drawnPath[drawnPath.length - 3];
      const p2 = drawnPath[drawnPath.length - 2];
      const p3 = point;
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      const angleChange = Math.abs(angle2 - angle1);
      angleFactor = Math.min(20, angleChange * 30);
    }
    
    // Combined tension
    const tension = Math.min(100, stretchFactor + velocityFactor + angleFactor);
    
    // Update stretch direction for visual indicator
    stretchDirection = currentRadius > targetRadius ? 'outward' : 'inward';
    
    return tension;
  }

  // Update tear risk level based on tension
  function updateTearRisk(tension) {
    if (tension < 40) {
      tearRiskLevel = 'safe';
    } else if (tension < 70) {
      tearRiskLevel = 'caution';
    } else {
      tearRiskLevel = 'danger';
    }
  }

  function updateGuideOpacity() {
    if (!interactionStartTime || gameState !== 'drawing') {
      guideOpacity = 0.4;
      return;
    }
    
    const elapsed = (performance.now() - interactionStartTime) / 1000;
    if (elapsed < 5) {
      guideOpacity = 0.4;
    } else if (elapsed < 8) {
      // Fade out over 3 seconds
      guideOpacity = 0.4 * (1 - (elapsed - 5) / 3);
    } else {
      guideOpacity = 0;
    }
    
    render();
    guideAnimationFrame = requestAnimationFrame(updateGuideOpacity);
  }

  function handlePointerStart(e) {
    if (gameState === 'success' || gameState === 'failed') return;
    
    const { point } = e.detail;
    startPoint = point;
    drawnPath = [point];
    smoothedPath = [];
    isDrawing = true;
    gameState = 'drawing';
    interactionStartTime = performance.now();
    
    // Start guide fade animation
    updateGuideOpacity();
    
    // Reset positioning state for new attempt
    hasReachedTarget = false;
    feedbackMessage = 'Initializing... Hold steady.';
    feedbackType = 'info';
    
    render();
  }

  function handlePointerMove(e) {
    if (!isDrawing || gameState === 'failed' || gameState === 'success') return;
    
    const { raw, smoothed, allRaw, allSmoothed, velocity, initPhase, inDeadZone, activeMovement } = e.detail;
    currentPoint = smoothed;
    drawnPath = allRaw;
    smoothedPath = allSmoothed || allRaw;

    // =====================================================
    // INITIALIZATION PHASE - Suppress all failures
    // =====================================================
    if (initPhase || inDeadZone) {
      // During init: show stable message, no evaluation
      feedbackMessage = 'Initializing... Move stylus to begin.';
      feedbackType = 'info';
      render();
      return;
    }
    
    // Wait for active movement before any evaluation
    if (!activeMovement) {
      feedbackMessage = 'Ready. Move stylus toward the green circle.';
      feedbackType = 'info';
      render();
      return;
    }

    // SENSORY SUBSTITUTION: Calculate and display capsule tension
    capsuleTension = calculateCapsuleTension(raw, lastPoint, velocity);
    tensionHistory.push(capsuleTension);
    maxTensionReached = Math.max(maxTensionReached, capsuleTension);
    updateTearRisk(capsuleTension);
    lastPoint = raw;

    // Check if current point is within the valid target zone
    const runOutCheck = checkRunOutPrecise(raw, center, targetRadius, config.runOutTolerancePx);
    
    // POSITIONING PHASE: User must first reach the target circle before validation starts
    // This allows clicking anywhere to start, then moving to the target
    if (!hasReachedTarget) {
      if (!runOutCheck.isRunOut) {
        // User has reached the valid zone - start tracking from here
        hasReachedTarget = true;
        startPoint = raw; // Reset start point to where they entered the valid zone
        drawnPath = [raw];
        feedbackMessage = 'Good! Now trace the circle back to this point.';
        feedbackType = 'success';
      } else {
        // Still positioning - show guidance
        feedbackMessage = `Move to the green circle to begin (${Math.round(runOutCheck.deviationMm * 10) / 10}mm away)`;
        feedbackType = 'info';
        render();
        return;
      }
    }
    
    // After reaching target, check for run-out
    if (hasReachedTarget && runOutCheck.isRunOut) {
      triggerRunOutFailure(raw, runOutCheck);
      return;
    }

    // Update feedback based on tension level
    if (tearRiskLevel === 'danger') {
      feedbackMessage = `⚠️ HIGH TENSION: ${Math.round(capsuleTension)}% - Slow down!`;
      feedbackType = 'error';
    } else if (tearRiskLevel === 'caution') {
      feedbackMessage = `Moderate tension: ${Math.round(capsuleTension)}% - Be careful`;
      feedbackType = 'info';
    }

    // Check for successful loop closure while drawing
    if (drawnPath.length > 30) {
      const distToStart = euclideanDistance(raw, startPoint);
      if (distToStart < 25) {
        // Potentially closing the loop - check full validation
        checkCompletion();
      }
    }

    render();
  }

  function handlePointerEnd(e) {
    if (gameState === 'failed' || gameState === 'success') return;
    
    const { rawPoints, smoothedPoints } = e.detail;
    drawnPath = rawPoints;
    smoothedPath = smoothedPoints;
    isDrawing = false;
    
    // Check completion when user lifts stylus
    checkCompletion();
    
    render();
  }

  function checkCompletion() {
    const validation = validateCapsulorhexisCompletion(
      smoothedPath.length ? smoothedPath : drawnPath,
      center,
      targetRadius,
      config
    );
    
    if (validation.success) {
      triggerSuccess(validation);
    } else {
      feedbackMessage = validation.reason;
      feedbackType = 'info';
    }
  }

  function triggerRunOutFailure(point, runOutCheck) {
    gameState = 'failed';
    isDrawing = false;
    runOutPoint = point;
    
    // Start flashing indicator
    runOutFlashActive = true;
    let flashCount = 0;
    runOutFlashInterval = setInterval(() => {
      runOutFlashActive = !runOutFlashActive;
      flashCount++;
      render();
      if (flashCount >= 10) {
        clearInterval(runOutFlashInterval);
        runOutFlashActive = true;
        render();
      }
    }, 150);
    
    feedbackMessage = `FAILURE: Capsular Run Out! Deviated ${runOutCheck.deviationMm}mm ${runOutCheck.direction}.`;
    feedbackType = 'error';
    
    score = {
      overall: 0,
      radiusUniformity: 0,
      speedUniformity: 0,
      tremor: 0,
      status: 'FAILED - Capsular Run Out',
      deviation: runOutCheck.deviationMm
    };
    
    wrapper?.triggerFailure('run-out');
    render();
  }

  function triggerSuccess(validation) {
    gameState = 'success';
    isDrawing = false;
    cancelAnimationFrame(guideAnimationFrame);
    
    feedbackMessage = 'SUCCESS! Capsulorhexis complete!';
    feedbackType = 'success';
    
    // Calculate detailed scores
    const radiusUniformity = scoreRadiusUniformity(smoothedPath, center);
    const speedUniformity = scoreSpeedUniformity(wrapper?.getSessionData()?.velocities || []);
    const tremor = scoreTremor(
      wrapper?.getSessionData()?.tremorResiduals || [],
      performance.now() - (interactionStartTime || performance.now())
    );
    
    // Calculate tension control score (sensory substitution metric)
    const avgTension = tensionHistory.length > 0 
      ? tensionHistory.reduce((a, b) => a + b, 0) / tensionHistory.length 
      : 0;
    const tensionControl = Math.max(0, Math.round(100 - avgTension * 1.5));
    
    const overall = Math.round(
      radiusUniformity * 0.30 +
      speedUniformity * 0.20 +
      tremor * 0.15 +
      tensionControl * 0.15 +
      validation.scores.closureOverlap * 0.20
    );
    
    score = {
      overall,
      radiusUniformity: Math.round(radiusUniformity),
      speedUniformity: Math.round(speedUniformity),
      tremor: Math.round(tremor),
      tensionControl: tensionControl,
      maxTension: Math.round(maxTensionReached),
      closureOverlap: validation.scores.closureOverlap,
      radiusAccuracy: validation.scores.radiusAccuracy,
      status: 'SUCCESS!'
    };
    
    if (onComplete) onComplete(score);
    render();
  }

  function handleSessionEnd(e) {
    if (gameState === 'success' || gameState === 'failed') return;
    
    // Timeout or other end - check final status
    checkCompletion();
    
    if (gameState !== 'success') {
      gameState = 'failed';
      feedbackMessage = 'Time expired. Loop not completed.';
      feedbackType = 'error';
      score = {
        overall: 0,
        radiusUniformity: 0,
        speedUniformity: 0,
        tremor: 0,
        status: 'FAILED - Incomplete'
      };
    }
  }

  function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw target circle guide (fades after 5 seconds)
    if (guideOpacity > 0) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, targetRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(15, 184, 159, ${guideOpacity})`;
      ctx.lineWidth = 20;
      ctx.stroke();
      
      // Inner tolerance guide
      ctx.beginPath();
      ctx.arc(center.x, center.y, targetRadius - config.runOutTolerancePx, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(15, 184, 159, ${guideOpacity * 0.3})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Outer tolerance guide
      ctx.beginPath();
      ctx.arc(center.x, center.y, targetRadius + config.runOutTolerancePx, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(248, 113, 113, ${guideOpacity * 0.3})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw user path
    if (drawnPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
      for (let i = 1; i < drawnPath.length; i++) {
        ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
      }
      
      // Color based on state
      if (gameState === 'success') {
        ctx.strokeStyle = '#34d399';
      } else if (gameState === 'failed') {
        ctx.strokeStyle = '#f87171';
      } else {
        ctx.strokeStyle = '#0fb89f';
      }
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw start point indicator
    if (startPoint && gameState === 'drawing') {
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();
    }

    // Draw current point indicator
    if (currentPoint && isDrawing) {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      
      // Draw line to start point to show closure progress
      if (startPoint && drawnPath.length > 20) {
        const distToStart = euclideanDistance(currentPoint, startPoint);
        const closureOpacity = Math.max(0, 1 - distToStart / 100);
        ctx.beginPath();
        ctx.moveTo(currentPoint.x, currentPoint.y);
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.strokeStyle = `rgba(52, 211, 153, ${closureOpacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw run-out failure indicator
    if (runOutPoint && gameState === 'failed') {
      if (runOutFlashActive) {
        // Outer glow
        ctx.beginPath();
        ctx.arc(runOutPoint.x, runOutPoint.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(248, 113, 113, 0.3)';
        ctx.fill();
        
        // Inner marker
        ctx.beginPath();
        ctx.arc(runOutPoint.x, runOutPoint.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#f87171';
        ctx.fill();
        
        // X mark
        ctx.beginPath();
        ctx.moveTo(runOutPoint.x - 8, runOutPoint.y - 8);
        ctx.lineTo(runOutPoint.x + 8, runOutPoint.y + 8);
        ctx.moveTo(runOutPoint.x + 8, runOutPoint.y - 8);
        ctx.lineTo(runOutPoint.x - 8, runOutPoint.y + 8);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Draw center dot
    ctx.beginPath();
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 184, 159, 0.5)';
    ctx.fill();

    // =====================================================
    // SENSORY SUBSTITUTION: Visual Tension Meter
    // (Compensates for lack of haptic feedback)
    // =====================================================
    if (gameState === 'drawing' || gameState === 'ready') {
      const meterX = 20;
      const meterY = 80;
      const meterWidth = 24;
      const meterHeight = height - 160;
      
      // Meter background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
      
      // Safe zone (bottom 40%)
      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.fillRect(meterX, meterY + meterHeight * 0.6, meterWidth, meterHeight * 0.4);
      
      // Caution zone (middle 30%)
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
      ctx.fillRect(meterX, meterY + meterHeight * 0.3, meterWidth, meterHeight * 0.3);
      
      // Danger zone (top 30%)
      ctx.fillStyle = 'rgba(248, 113, 113, 0.15)';
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight * 0.3);
      
      // Current tension fill
      const tensionFill = (capsuleTension / 100) * meterHeight;
      let tensionColor;
      if (tearRiskLevel === 'safe') {
        tensionColor = '#34d399';
      } else if (tearRiskLevel === 'caution') {
        tensionColor = '#fbbf24';
      } else {
        tensionColor = '#f87171';
      }
      ctx.fillStyle = tensionColor;
      ctx.fillRect(meterX, meterY + meterHeight - tensionFill, meterWidth, tensionFill);
      
      // Meter border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
      
      // Zone labels
      ctx.fillStyle = '#f87171';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('TEAR', meterX + meterWidth + 5, meterY + 15);
      
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('WARN', meterX + meterWidth + 5, meterY + meterHeight * 0.45);
      
      ctx.fillStyle = '#34d399';
      ctx.fillText('SAFE', meterX + meterWidth + 5, meterY + meterHeight - 10);
      
      // Title
      ctx.save();
      ctx.translate(meterX - 5, meterY + meterHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#7aa8a0';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('CAPSULE TENSION', 0, 0);
      ctx.restore();
      
      // Current value
      ctx.fillStyle = tensionColor;
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(capsuleTension)}%`, meterX + meterWidth / 2, meterY + meterHeight + 20);
      
      // Stretch direction indicator
      if (stretchDirection && isDrawing && currentPoint) {
        const arrowSize = 15;
        const arrowX = currentPoint.x + 20;
        const arrowY = currentPoint.y;
        
        ctx.beginPath();
        if (stretchDirection === 'outward') {
          // Arrow pointing outward (away from center)
          const angle = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x);
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX + Math.cos(angle) * arrowSize, arrowY + Math.sin(angle) * arrowSize);
          ctx.strokeStyle = tearRiskLevel === 'danger' ? '#f87171' : '#fbbf24';
        } else {
          // Arrow pointing inward
          const angle = Math.atan2(center.y - currentPoint.y, center.x - currentPoint.x);
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX + Math.cos(angle) * arrowSize, arrowY + Math.sin(angle) * arrowSize);
          ctx.strokeStyle = '#34d399';
        }
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  function reset() {
    // Clear intervals
    clearInterval(runOutFlashInterval);
    cancelAnimationFrame(guideAnimationFrame);
    
    // Reset state
    drawnPath = [];
    smoothedPath = [];
    currentPoint = null;
    startPoint = null;
    score = null;
    isDrawing = false;
    gameState = 'ready';
    runOutPoint = null;
    runOutFlashActive = false;
    hasReachedTarget = false;
    interactionStartTime = null;
    guideOpacity = 0.4;
    feedbackMessage = 'Click anywhere, then move to the green circle to start.';
    feedbackType = 'info';
    
    // Reset tension state (sensory substitution)
    capsuleTension = 0;
    tensionHistory = [];
    maxTensionReached = 0;
    tearRiskLevel = 'safe';
    stretchDirection = null;
    lastPoint = null;
    velocityHistory = [];
    
    wrapper?.reset();
    render();
  }

  function setDifficulty(level) {
    difficulty = level;
    reset();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    render();
  });

  onDestroy(() => {
    clearInterval(runOutFlashInterval);
    cancelAnimationFrame(guideAnimationFrame);
  });
</script>

<div class="sim-container">
  <header class="sim-header">
    <button class="back-btn" on:click={onBack}>← Back</button>
    <div class="sim-title">
      <h1>Capsulorhexis Trainer</h1>
      <p>Draw a closed circular tear. Return to start point to complete.</p>
    </div>
    <div class="header-controls">
      <div class="difficulty-selector">
        <button 
          class="diff-btn" 
          class:active={difficulty === 'easy'}
          on:click={() => setDifficulty('easy')}
        >Easy</button>
        <button 
          class="diff-btn" 
          class:active={difficulty === 'normal'}
          on:click={() => setDifficulty('normal')}
        >Normal</button>
        <button 
          class="diff-btn" 
          class:active={difficulty === 'hard'}
          on:click={() => setDifficulty('hard')}
        >Hard</button>
      </div>
      <button class="reset-btn" on:click={reset}>Reset</button>
    </div>
  </header>

  <!-- Feedback Banner -->
  {#if feedbackMessage}
    <div class="feedback-banner" class:success={feedbackType === 'success'} class:error={feedbackType === 'error'}>
      {feedbackMessage}
    </div>
  {/if}

  <SimModuleWrapper
    bind:this={wrapper}
    duration={40000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.1}
    on:pointerstart={handlePointerStart}
    on:pointermove={handlePointerMove}
    on:pointerend={handlePointerEnd}
    on:sessionend={handleSessionEnd}
  >
    <canvas
      bind:this={canvas}
      {width}
      {height}
      style="width: 100%; height: 100%;"
    ></canvas>
  </SimModuleWrapper>

  <!-- Difficulty Info -->
  <div class="difficulty-info">
    <span>Tolerance: ±{(config.runOutTolerancePx / 25).toFixed(1)}mm</span>
    <span>Radius: ±{config.radiusTolerancePercent}%</span>
    <span>Closure: {config.completionOverlapPercent}%</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={gameState === 'success'} class:failed={gameState === 'failed'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item">
          <span class="score-label">Overall</span>
          <span class="score-value">{score.overall}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Radius Uniformity</span>
          <span class="score-value">{Math.round(score.radiusUniformity)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Speed Uniformity</span>
          <span class="score-value">{Math.round(score.speedUniformity)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Tremor Control</span>
          <span class="score-value">{Math.round(score.tremor)}%</span>
        </div>
        {#if score.closureOverlap !== undefined}
          <div class="score-item">
            <span class="score-label">Loop Closure</span>
            <span class="score-value">{score.closureOverlap}%</span>
          </div>
        {/if}
        {#if score.radiusAccuracy !== undefined}
          <div class="score-item">
            <span class="score-label">Radius Accuracy</span>
            <span class="score-value">{score.radiusAccuracy}%</span>
          </div>
        {/if}
        {#if score.tensionControl !== undefined}
          <div class="score-item">
            <span class="score-label">Tension Control</span>
            <span class="score-value">{score.tensionControl}%</span>
          </div>
        {/if}
        {#if score.maxTension !== undefined}
          <div class="score-item" class:warning={score.maxTension > 70}>
            <span class="score-label">Peak Tension</span>
            <span class="score-value">{score.maxTension}%</span>
          </div>
        {/if}
        {#if score.deviation !== undefined}
          <div class="score-item error">
            <span class="score-label">Deviation</span>
            <span class="score-value">{score.deviation}mm</span>
          </div>
        {/if}
      </div>
      <button class="try-again-btn" on:click={reset}>Try Again</button>
    </div>
  {/if}
</div>

<style>
  .sim-container {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0d1f23 0%, #1a3038 100%);
  }

  .sim-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    flex-wrap: wrap;
  }

  .back-btn, .reset-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #8ab0a8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .back-btn:hover, .reset-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e0f5f0;
  }

  .sim-title {
    flex: 1;
    text-align: center;
    min-width: 200px;
  }

  .sim-title h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #e0f5f0;
  }

  .sim-title p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #7aa8a0;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .difficulty-selector {
    display: flex;
    gap: 0.25rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 0.25rem;
  }

  .diff-btn {
    padding: 0.4rem 0.8rem;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #7aa8a0;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .diff-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e0f5f0;
  }

  .diff-btn.active {
    background: rgba(15, 184, 159, 0.3);
    color: #0fb89f;
  }

  .feedback-banner {
    max-width: 900px;
    margin: 0 auto 1rem;
    padding: 0.75rem 1rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 10px;
    color: #93c5fd;
    text-align: center;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease;
  }

  .feedback-banner.success {
    background: rgba(52, 211, 153, 0.15);
    border-color: rgba(52, 211, 153, 0.3);
    color: #34d399;
  }

  .feedback-banner.error {
    background: rgba(248, 113, 113, 0.15);
    border-color: rgba(248, 113, 113, 0.3);
    color: #f87171;
    animation: shake 0.5s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }

  .difficulty-info {
    max-width: 900px;
    margin: 0.75rem auto;
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    font-size: 0.75rem;
    color: #5a7a80;
  }

  .score-panel {
    max-width: 900px;
    margin: 1.5rem auto 0;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .score-panel.success {
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.2);
  }

  .score-panel.failed {
    background: rgba(248, 113, 113, 0.08);
    border-color: rgba(248, 113, 113, 0.2);
  }

  .score-panel h2 {
    margin: 0 0 1rem;
    text-align: center;
    color: #e0f5f0;
  }

  .score-panel.success h2 {
    color: #34d399;
  }

  .score-panel.failed h2 {
    color: #f87171;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .score-item {
    text-align: center;
    padding: 1rem;
    background: rgba(15, 184, 159, 0.1);
    border-radius: 12px;
  }

  .score-item.error {
    background: rgba(248, 113, 113, 0.15);
  }

  .score-item.error .score-value {
    color: #f87171;
  }

  .score-item.warning {
    background: rgba(251, 191, 36, 0.15);
  }

  .score-item.warning .score-value {
    color: #fbbf24;
  }

  .score-label {
    display: block;
    font-size: 0.75rem;
    color: #7aa8a0;
    margin-bottom: 0.5rem;
  }

  .score-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: #0fb89f;
  }

  .try-again-btn {
    display: block;
    width: 100%;
    max-width: 200px;
    margin: 1.5rem auto 0;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #0a7c6d 0%, #0fb89f 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .try-again-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(15, 184, 159, 0.3);
  }
</style>
