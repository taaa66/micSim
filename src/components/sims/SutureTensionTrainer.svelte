<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    euclideanDistance,
    standardDeviation
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/suture-tension-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  const DIFFICULTY = {
    easy: { tensionRange: [0.3, 0.7], tolerance: 0.15, holdTime: 2000 },
    normal: { tensionRange: [0.4, 0.6], tolerance: 0.10, holdTime: 2500 },
    hard: { tensionRange: [0.45, 0.55], tolerance: 0.05, holdTime: 3000 }
  };

  let difficulty = 'normal';
  $: config = DIFFICULTY[difficulty];

  // Suture points - simulate tying knots at specific tensions
  const suturePoints = [
    { x: 200, y: 250, targetTension: 0.5, name: 'Knot 1' },
    { x: 350, y: 180, targetTension: 0.45, name: 'Knot 2' },
    { x: 500, y: 220, targetTension: 0.55, name: 'Knot 3' },
    { x: 400, y: 350, targetTension: 0.5, name: 'Knot 4' }
  ];

  let currentKnotIndex = 0;
  let gameState = 'ready';
  let grabPoint = null;
  let currentPoint = null;
  let tensionHistory = [];
  let currentTension = 0;
  let holdStartTime = null;
  let inTargetZone = false;
  let knotResults = [];
  let score = null;
  let feedbackMessage = '';
  let feedbackType = '';

  // SENSORY SUBSTITUTION: Clinical outcome indicators
  let clinicalRisk = 'optimal';  // 'wound-gape', 'optimal', 'astigmatism', 'necrosis'
  let woundGapeRisk = 0;         // 0-100 (too loose)
  let astigmatismRisk = 0;       // 0-100 (uneven/too tight)
  let tissueStress = 0;          // Visual stress indicator

  // Calculate clinical risks based on tension
  function updateClinicalRisks(tension, targetTension, tolerance) {
    const deviation = tension - targetTension;
    
    // Too loose = wound gaping risk
    if (deviation < -tolerance) {
      woundGapeRisk = Math.min(100, Math.abs(deviation) * 200);
      astigmatismRisk = 0;
      clinicalRisk = 'wound-gape';
    }
    // Too tight = astigmatism/necrosis risk
    else if (deviation > tolerance) {
      woundGapeRisk = 0;
      astigmatismRisk = Math.min(100, deviation * 200);
      clinicalRisk = deviation > tolerance * 2 ? 'necrosis' : 'astigmatism';
    }
    // Optimal range
    else {
      woundGapeRisk = 0;
      astigmatismRisk = 0;
      clinicalRisk = 'optimal';
    }
    
    // Tissue stress visualization
    tissueStress = Math.abs(deviation) / tolerance * 50;
  }

  // Calculate tension based on distance and pressure
  function calculateTension(point, origin, pressure) {
    const distance = euclideanDistance(point, origin);
    const maxDist = 150;
    const distFactor = Math.min(1, distance / maxDist);
    // Combine distance pull with pressure for realistic tension feel
    return Math.min(1, distFactor * 0.6 + (pressure || 0.5) * 0.4);
  }

  function handlePointerStart(e) {
    if (gameState === 'complete') return;
    
    const { point } = e.detail;
    const knot = suturePoints[currentKnotIndex];
    
    if (!knot) return;
    
    const dist = euclideanDistance(point, knot);
    if (dist < 40) {
      grabPoint = { ...knot };
      gameState = 'tensioning';
      tensionHistory = [];
      holdStartTime = null;
      inTargetZone = false;
      feedbackMessage = 'Pull to apply tension. Find the target zone.';
      feedbackType = 'info';
    }
    
    render();
  }

  function handlePointerMove(e) {
    if (gameState !== 'tensioning') return;
    
    const { raw } = e.detail;
    currentPoint = raw;
    
    // Calculate current tension
    currentTension = calculateTension(raw, grabPoint, raw.pressure);
    tensionHistory.push(currentTension);
    
    const knot = suturePoints[currentKnotIndex];
    const targetMin = knot.targetTension - config.tolerance;
    const targetMax = knot.targetTension + config.tolerance;
    
    // Update clinical risk indicators (sensory substitution)
    updateClinicalRisks(currentTension, knot.targetTension, config.tolerance);
    
    // Check if in target tension zone
    if (currentTension >= targetMin && currentTension <= targetMax) {
      if (!inTargetZone) {
        inTargetZone = true;
        holdStartTime = performance.now();
      }
      
      const holdDuration = performance.now() - holdStartTime;
      const progress = Math.min(100, (holdDuration / config.holdTime) * 100);
      
      feedbackMessage = `✓ OPTIMAL TENSION - Hold... ${Math.round(progress)}%`;
      feedbackType = 'success';
      
      if (holdDuration >= config.holdTime) {
        completeKnot(true);
      }
    } else {
      inTargetZone = false;
      holdStartTime = null;
      
      if (currentTension < targetMin) {
        feedbackMessage = `⚠️ TOO LOOSE (${Math.round(currentTension * 100)}%) - Wound Gape Risk: ${Math.round(woundGapeRisk)}%`;
        feedbackType = 'error';
      } else {
        const riskType = clinicalRisk === 'necrosis' ? '🔴 NECROSIS RISK' : '⚠️ Astigmatism Risk';
        feedbackMessage = `${riskType} - Too tight (${Math.round(currentTension * 100)}%)`;
        feedbackType = 'error';
      }
    }
    
    render();
  }

  function handlePointerEnd(e) {
    if (gameState !== 'tensioning') return;
    
    // Released before completing
    if (!inTargetZone || (holdStartTime && performance.now() - holdStartTime < config.holdTime)) {
      feedbackMessage = 'Released too early! Hold the tension longer.';
      feedbackType = 'error';
    }
    
    gameState = 'ready';
    grabPoint = null;
    currentTension = 0;
    inTargetZone = false;
    holdStartTime = null;
    
    render();
  }

  function completeKnot(success) {
    const knot = suturePoints[currentKnotIndex];
    const avgTension = tensionHistory.reduce((a, b) => a + b, 0) / tensionHistory.length;
    const tensionVariance = standardDeviation(tensionHistory);
    
    knotResults.push({
      knot: knot.name,
      success,
      avgTension: Math.round(avgTension * 100),
      targetTension: Math.round(knot.targetTension * 100),
      variance: Math.round(tensionVariance * 100)
    });
    
    feedbackMessage = `${knot.name} secured! Avg tension: ${Math.round(avgTension * 100)}%`;
    feedbackType = 'success';
    
    currentKnotIndex++;
    gameState = 'ready';
    grabPoint = null;
    currentTension = 0;
    tensionHistory = [];
    inTargetZone = false;
    holdStartTime = null;
    
    if (currentKnotIndex >= suturePoints.length) {
      endGame();
    }
    
    render();
  }

  function endGame() {
    gameState = 'complete';
    
    const successCount = knotResults.filter(k => k.success).length;
    const avgVariance = knotResults.reduce((sum, k) => sum + k.variance, 0) / knotResults.length;
    const avgAccuracy = knotResults.reduce((sum, k) => {
      const diff = Math.abs(k.avgTension - k.targetTension);
      return sum + Math.max(0, 100 - diff * 2);
    }, 0) / knotResults.length;
    
    const consistencyScore = Math.max(0, 100 - avgVariance * 5);
    const overall = Math.round(avgAccuracy * 0.6 + consistencyScore * 0.4);
    
    score = {
      overall,
      accuracy: Math.round(avgAccuracy),
      consistency: Math.round(consistencyScore),
      successCount,
      totalKnots: suturePoints.length,
      avgVariance: Math.round(avgVariance),
      status: successCount === suturePoints.length ? 'MASTER SURGEON!' : 
              successCount >= suturePoints.length / 2 ? 'GOOD TECHNIQUE' : 'NEEDS PRACTICE'
    };
    
    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw suture line connecting knots
    if (suturePoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(suturePoints[0].x, suturePoints[0].y);
      for (let i = 1; i < suturePoints.length; i++) {
        ctx.lineTo(suturePoints[i].x, suturePoints[i].y);
      }
      ctx.strokeStyle = 'rgba(100, 150, 180, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw knot points
    suturePoints.forEach((knot, i) => {
      const isActive = i === currentKnotIndex;
      const isComplete = i < currentKnotIndex;
      const result = knotResults[i];
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(knot.x, knot.y, 35, 0, Math.PI * 2);
      if (isComplete && result?.success) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
        ctx.strokeStyle = '#34d399';
      } else if (isActive) {
        ctx.fillStyle = inTargetZone ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.1)';
        ctx.strokeStyle = inTargetZone ? '#34d399' : '#fbbf24';
      } else {
        ctx.fillStyle = 'rgba(15, 184, 159, 0.05)';
        ctx.strokeStyle = 'rgba(15, 184, 159, 0.2)';
      }
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner knot
      ctx.beginPath();
      ctx.arc(knot.x, knot.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = isComplete ? '#34d399' : (isActive ? '#fbbf24' : '#5a7a80');
      ctx.fill();

      // Target tension label
      ctx.fillStyle = isActive ? '#fbbf24' : '#7aa8a0';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(knot.targetTension * 100)}%`, knot.x, knot.y + 50);
      ctx.fillText(knot.name, knot.x, knot.y - 45);
    });

    // Draw tension line when pulling
    if (grabPoint && currentPoint && gameState === 'tensioning') {
      const knot = suturePoints[currentKnotIndex];
      const targetMin = knot.targetTension - config.tolerance;
      const targetMax = knot.targetTension + config.tolerance;
      
      // Tension line
      ctx.beginPath();
      ctx.moveTo(grabPoint.x, grabPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.strokeStyle = inTargetZone ? '#34d399' : 
                        (currentTension < targetMin ? '#fbbf24' : '#f87171');
      ctx.lineWidth = 3;
      ctx.stroke();

      // Current point
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Hold progress ring
      if (holdStartTime && inTargetZone) {
        const progress = Math.min(1, (performance.now() - holdStartTime) / config.holdTime);
        ctx.beginPath();
        ctx.arc(grabPoint.x, grabPoint.y, 40, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Tension meter
    const meterX = width - 60;
    const meterY = 80;
    const meterHeight = height - 160;
    const meterWidth = 30;
    
    // Meter background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    // Target zone
    if (currentKnotIndex < suturePoints.length) {
      const knot = suturePoints[currentKnotIndex];
      const zoneTop = meterY + (1 - knot.targetTension - config.tolerance) * meterHeight;
      const zoneBottom = meterY + (1 - knot.targetTension + config.tolerance) * meterHeight;
      
      ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
      ctx.fillRect(meterX, zoneTop, meterWidth, zoneBottom - zoneTop);
    }
    
    // Current tension fill
    const tensionFill = currentTension * meterHeight;
    const tensionColor = inTargetZone ? '#34d399' : (currentTension < 0.4 ? '#fbbf24' : '#f87171');
    ctx.fillStyle = tensionColor;
    ctx.fillRect(meterX, meterY + meterHeight - tensionFill, meterWidth, tensionFill);
    
    // Meter border
    ctx.strokeStyle = '#5a7a80';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
    
    // Labels
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('100%', meterX + meterWidth / 2, meterY - 5);
    ctx.fillText('0%', meterX + meterWidth / 2, meterY + meterHeight + 15);
    ctx.fillText(`${Math.round(currentTension * 100)}%`, meterX + meterWidth / 2, meterY + meterHeight + 35);

    // =====================================================
    // SENSORY SUBSTITUTION: Clinical Outcome Panel
    // (Compensates for lack of haptic feedback)
    // =====================================================
    if (gameState === 'tensioning') {
      const panelX = 15;
      const panelY = 80;
      const panelWidth = 140;
      const panelHeight = 120;
      
      // Panel background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
      
      // Title
      ctx.fillStyle = '#7aa8a0';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('CLINICAL OUTCOME', panelX + 8, panelY + 15);
      
      // Wound Gape Risk
      const gapeY = panelY + 35;
      ctx.fillStyle = '#7aa8a0';
      ctx.font = '9px system-ui';
      ctx.fillText('Wound Gape:', panelX + 8, gapeY);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(panelX + 8, gapeY + 4, 100, 8);
      ctx.fillStyle = woundGapeRisk > 50 ? '#f87171' : woundGapeRisk > 20 ? '#fbbf24' : '#34d399';
      ctx.fillRect(panelX + 8, gapeY + 4, woundGapeRisk, 8);
      
      // Astigmatism Risk
      const astigY = panelY + 60;
      ctx.fillStyle = '#7aa8a0';
      ctx.fillText('Astigmatism:', panelX + 8, astigY);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(panelX + 8, astigY + 4, 100, 8);
      ctx.fillStyle = astigmatismRisk > 50 ? '#f87171' : astigmatismRisk > 20 ? '#fbbf24' : '#34d399';
      ctx.fillRect(panelX + 8, astigY + 4, astigmatismRisk, 8);
      
      // Clinical Status
      const statusY = panelY + 90;
      ctx.font = 'bold 10px system-ui';
      if (clinicalRisk === 'optimal') {
        ctx.fillStyle = '#34d399';
        ctx.fillText('✓ OPTIMAL', panelX + 8, statusY);
      } else if (clinicalRisk === 'wound-gape') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('⚠ WOUND LEAK RISK', panelX + 8, statusY);
      } else if (clinicalRisk === 'astigmatism') {
        ctx.fillStyle = '#fb923c';
        ctx.fillText('⚠ ASTIGMATISM RISK', panelX + 8, statusY);
      } else if (clinicalRisk === 'necrosis') {
        ctx.fillStyle = '#f87171';
        ctx.fillText('🔴 TISSUE NECROSIS!', panelX + 8, statusY);
      }
      
      // Tissue stress visualization around current knot
      if (grabPoint && tissueStress > 0) {
        const stressColor = clinicalRisk === 'optimal' ? 'rgba(52, 211, 153, 0.2)' :
                           clinicalRisk === 'necrosis' ? 'rgba(248, 113, 113, 0.4)' :
                           'rgba(251, 191, 36, 0.3)';
        ctx.beginPath();
        ctx.arc(grabPoint.x, grabPoint.y, 35 + tissueStress * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = stressColor;
        ctx.fill();
      }
    }
  }

  function reset() {
    currentKnotIndex = 0;
    gameState = 'ready';
    grabPoint = null;
    currentPoint = null;
    tensionHistory = [];
    currentTension = 0;
    holdStartTime = null;
    inTargetZone = false;
    knotResults = [];
    score = null;
    feedbackMessage = '';
    feedbackType = '';
    
    // Reset clinical risk indicators
    clinicalRisk = 'optimal';
    woundGapeRisk = 0;
    astigmatismRisk = 0;
    tissueStress = 0;
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
</script>

<div class="sim-container">
  <header class="sim-header">
    <button class="back-btn" on:click={onBack}>← Back</button>
    <div class="sim-title">
      <h1>Suture Tension Trainer</h1>
      <p>Apply exact tension to each knot. Hold in the green zone.</p>
    </div>
    <div class="header-controls">
      <div class="difficulty-selector">
        <button class="diff-btn" class:active={difficulty === 'easy'} on:click={() => setDifficulty('easy')}>Easy</button>
        <button class="diff-btn" class:active={difficulty === 'normal'} on:click={() => setDifficulty('normal')}>Normal</button>
        <button class="diff-btn" class:active={difficulty === 'hard'} on:click={() => setDifficulty('hard')}>Hard</button>
      </div>
      <button class="reset-btn" on:click={reset}>Reset</button>
    </div>
  </header>

  {#if feedbackMessage}
    <div class="feedback-banner" class:success={feedbackType === 'success'} class:error={feedbackType === 'error'}>
      {feedbackMessage}
    </div>
  {/if}

  <SimModuleWrapper
    bind:this={wrapper}
    duration={90000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.1}
    on:pointerstart={handlePointerStart}
    on:pointermove={handlePointerMove}
    on:pointerend={handlePointerEnd}
  >
    <canvas bind:this={canvas} {width} {height} style="width: 100%; height: 100%;"></canvas>
  </SimModuleWrapper>

  <div class="stats-bar">
    <span>Knot: {currentKnotIndex + 1}/{suturePoints.length}</span>
    <span>Tolerance: ±{Math.round(config.tolerance * 100)}%</span>
    <span>Hold: {config.holdTime / 1000}s</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={score.status === 'MASTER SURGEON!'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item"><span class="score-label">Overall</span><span class="score-value">{score.overall}%</span></div>
        <div class="score-item"><span class="score-label">Accuracy</span><span class="score-value">{score.accuracy}%</span></div>
        <div class="score-item"><span class="score-label">Consistency</span><span class="score-value">{score.consistency}%</span></div>
        <div class="score-item"><span class="score-label">Knots Secured</span><span class="score-value">{score.successCount}/{score.totalKnots}</span></div>
      </div>
      <button class="try-again-btn" on:click={reset}>Try Again</button>
    </div>
  {/if}
</div>

<style>
  .sim-container { min-height: 100vh; padding: 1.5rem; background: linear-gradient(135deg, #0d1f23 0%, #1a3038 100%); }
  .sim-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; max-width: 900px; margin-left: auto; margin-right: auto; flex-wrap: wrap; }
  .back-btn, .reset-btn { padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #8ab0a8; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
  .back-btn:hover, .reset-btn:hover { background: rgba(255,255,255,0.1); color: #e0f5f0; }
  .sim-title { flex: 1; text-align: center; }
  .sim-title h1 { margin: 0; font-size: 1.5rem; color: #e0f5f0; }
  .sim-title p { margin: 0.25rem 0 0; font-size: 0.9rem; color: #7aa8a0; }
  .header-controls { display: flex; align-items: center; gap: 0.75rem; }
  .difficulty-selector { display: flex; gap: 0.25rem; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 0.25rem; }
  .diff-btn { padding: 0.4rem 0.8rem; background: transparent; border: none; border-radius: 6px; color: #7aa8a0; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
  .diff-btn:hover { background: rgba(255,255,255,0.05); color: #e0f5f0; }
  .diff-btn.active { background: rgba(15,184,159,0.3); color: #0fb89f; }
  .feedback-banner { max-width: 900px; margin: 0 auto 1rem; padding: 0.75rem 1rem; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 10px; color: #93c5fd; text-align: center; font-size: 0.9rem; }
  .feedback-banner.success { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.3); color: #34d399; }
  .feedback-banner.error { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.3); color: #f87171; }
  .stats-bar { max-width: 900px; margin: 0.75rem auto; display: flex; justify-content: center; gap: 1.5rem; font-size: 0.8rem; color: #7aa8a0; }
  .score-panel { max-width: 900px; margin: 1.5rem auto 0; padding: 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
  .score-panel.success { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2); }
  .score-panel h2 { margin: 0 0 1rem; text-align: center; color: #e0f5f0; }
  .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
  .score-item { text-align: center; padding: 1rem; background: rgba(15,184,159,0.1); border-radius: 12px; }
  .score-label { display: block; font-size: 0.75rem; color: #7aa8a0; margin-bottom: 0.5rem; }
  .score-value { font-size: 1.3rem; font-weight: 700; color: #0fb89f; }
  .try-again-btn { display: block; width: 100%; max-width: 200px; margin: 1.5rem auto 0; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #0a7c6d 0%, #0fb89f 100%); border: none; border-radius: 10px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .try-again-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(15,184,159,0.3); }
</style>
