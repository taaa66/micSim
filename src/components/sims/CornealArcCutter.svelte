<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    euclideanDistance,
    scorePathAccuracy,
    scoreSpeedUniformity,
    scorePressureUniformity
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/corneal-arc-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  const DIFFICULTY = {
    easy: { tolerance: 20, arcWidth: 15 },
    normal: { tolerance: 12, arcWidth: 10 },
    hard: { tolerance: 6, arcWidth: 6 }
  };

  let difficulty = 'normal';
  $: config = DIFFICULTY[difficulty];

  // Arc parameters
  const center = { x: 400, y: 300 };
  const arcRadius = 150;
  const arcStartAngle = Math.PI * 0.8;  // ~144°
  const arcEndAngle = Math.PI * 0.2;    // ~36°
  
  // Generate ideal arc path
  function generateArcPath(numPoints = 100) {
    const points = [];
    const totalAngle = (2 * Math.PI) - (arcStartAngle - arcEndAngle);
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const angle = arcStartAngle - t * totalAngle;
      points.push({
        x: center.x + arcRadius * Math.cos(angle),
        y: center.y + arcRadius * Math.sin(angle)
      });
    }
    return points;
  }
  
  const idealPath = generateArcPath(100);

  let gameState = 'ready';
  let drawnPath = [];
  let currentPoint = null;
  let pressures = [];
  let velocities = [];
  let slipPoints = [];
  let score = null;
  let feedbackMessage = '';
  let feedbackType = '';
  let progressPercent = 0;

  function getClosestPointOnArc(point) {
    let minDist = Infinity;
    let closestPoint = null;
    let closestIndex = 0;
    
    for (let i = 0; i < idealPath.length; i++) {
      const dist = euclideanDistance(point, idealPath[i]);
      if (dist < minDist) {
        minDist = dist;
        closestPoint = idealPath[i];
        closestIndex = i;
      }
    }
    
    return { point: closestPoint, distance: minDist, index: closestIndex };
  }

  function handlePointerStart(e) {
    if (gameState === 'complete' || gameState === 'failed') return;
    
    const { point } = e.detail;
    const closest = getClosestPointOnArc(point);
    
    // Must start near the beginning of the arc
    if (closest.index > 15 || closest.distance > config.tolerance * 2) {
      feedbackMessage = 'Start at the beginning of the arc (left side)';
      feedbackType = 'error';
      return;
    }
    
    drawnPath = [point];
    pressures = [point.pressure || 0.5];
    velocities = [];
    slipPoints = [];
    gameState = 'cutting';
    feedbackMessage = 'Follow the arc smoothly...';
    feedbackType = 'info';
    
    render();
  }

  function handlePointerMove(e) {
    if (gameState !== 'cutting') return;
    
    const { raw, velocity, allRaw } = e.detail;
    currentPoint = raw;
    drawnPath = allRaw;
    pressures.push(raw.pressure || 0.5);
    if (velocity) velocities.push(velocity);
    
    // Check deviation from arc
    const closest = getClosestPointOnArc(raw);
    progressPercent = Math.round((closest.index / idealPath.length) * 100);
    
    if (closest.distance > config.tolerance) {
      // Slip detected!
      slipPoints.push({ ...raw, deviation: closest.distance });
      
      if (closest.distance > config.tolerance * 2) {
        // Major slip - failure
        triggerSlipFailure(raw, closest.distance);
        return;
      }
      
      feedbackMessage = `SLIP! Deviation: ${Math.round(closest.distance)}px. Get back on track!`;
      feedbackType = 'error';
    } else {
      feedbackMessage = `Progress: ${progressPercent}% | Deviation: ${Math.round(closest.distance)}px`;
      feedbackType = closest.distance < config.tolerance * 0.5 ? 'success' : 'info';
    }
    
    // Check if reached the end
    if (closest.index >= idealPath.length - 5 && closest.distance <= config.tolerance) {
      triggerSuccess();
    }
    
    render();
  }

  function handlePointerEnd(e) {
    if (gameState !== 'cutting') return;
    
    const closest = getClosestPointOnArc(currentPoint);
    
    if (closest.index < idealPath.length - 10) {
      feedbackMessage = `Cut incomplete. Only ${progressPercent}% done.`;
      feedbackType = 'error';
      gameState = 'ready';
    }
  }

  function triggerSlipFailure(point, deviation) {
    gameState = 'failed';
    
    feedbackMessage = `FAILURE: Major slip! Deviated ${Math.round(deviation)}px from arc.`;
    feedbackType = 'error';
    
    score = {
      overall: 0,
      pathAccuracy: 0,
      speedUniformity: 0,
      pressureControl: 0,
      slipCount: slipPoints.length,
      status: 'FAILED - Slip Out'
    };
    
    wrapper?.triggerFailure('slip');
    render();
  }

  function triggerSuccess() {
    gameState = 'complete';
    
    const pathAccuracy = scorePathAccuracy(drawnPath, idealPath);
    const speedUniformity = scoreSpeedUniformity(velocities);
    const pressureControl = scorePressureUniformity(pressures);
    const slipPenalty = slipPoints.length * 5;
    
    const overall = Math.max(0, Math.round(
      pathAccuracy * 0.4 + speedUniformity * 0.3 + pressureControl * 0.3 - slipPenalty
    ));
    
    score = {
      overall,
      pathAccuracy: Math.round(pathAccuracy),
      speedUniformity: Math.round(speedUniformity),
      pressureControl: Math.round(pressureControl),
      slipCount: slipPoints.length,
      status: slipPoints.length === 0 ? 'PERFECT CUT!' : 
              slipPoints.length < 3 ? 'GOOD' : 'NEEDS PRACTICE'
    };
    
    feedbackMessage = 'Arc cut complete!';
    feedbackType = 'success';
    
    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw cornea representation
    ctx.beginPath();
    ctx.arc(center.x, center.y, arcRadius + 60, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 169, 180, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 169, 180, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ideal arc path (guide)
    ctx.beginPath();
    ctx.arc(center.x, center.y, arcRadius, arcStartAngle, arcEndAngle, true);
    ctx.strokeStyle = 'rgba(15, 184, 159, 0.4)';
    ctx.lineWidth = config.arcWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw tolerance boundaries
    ctx.beginPath();
    ctx.arc(center.x, center.y, arcRadius - config.tolerance, arcStartAngle, arcEndAngle, true);
    ctx.strokeStyle = 'rgba(15, 184, 159, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(center.x, center.y, arcRadius + config.tolerance, arcStartAngle, arcEndAngle, true);
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.15)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw start and end markers
    const startX = center.x + arcRadius * Math.cos(arcStartAngle);
    const startY = center.y + arcRadius * Math.sin(arcStartAngle);
    const endX = center.x + arcRadius * Math.cos(arcEndAngle);
    const endY = center.y + arcRadius * Math.sin(arcEndAngle);
    
    ctx.beginPath();
    ctx.arc(startX, startY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startX, startY);
    
    ctx.beginPath();
    ctx.arc(endX, endY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('E', endX, endY);

    // Draw user's cut path
    if (drawnPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
      for (let i = 1; i < drawnPath.length; i++) {
        ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
      }
      ctx.strokeStyle = gameState === 'complete' ? '#34d399' : 
                        gameState === 'failed' ? '#f87171' : '#0fb89f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw slip points
    slipPoints.forEach(slip => {
      ctx.beginPath();
      ctx.arc(slip.x, slip.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248, 113, 113, 0.6)';
      ctx.fill();
    });

    // Draw current point
    if (currentPoint && gameState === 'cutting') {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // Progress indicator
    if (gameState === 'cutting') {
      ctx.fillStyle = '#e0f5f0';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${progressPercent}%`, width - 20, 30);
    }
  }

  function reset() {
    gameState = 'ready';
    drawnPath = [];
    currentPoint = null;
    pressures = [];
    velocities = [];
    slipPoints = [];
    score = null;
    progressPercent = 0;
    feedbackMessage = '';
    feedbackType = '';
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
      <h1>Corneal Arc Cutter</h1>
      <p>Follow the arc precisely. Don't slip outside the tolerance zone.</p>
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
    duration={60000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.1}
    on:pointerstart={handlePointerStart}
    on:pointermove={handlePointerMove}
    on:pointerend={handlePointerEnd}
  >
    <canvas bind:this={canvas} {width} {height} style="width: 100%; height: 100%;"></canvas>
  </SimModuleWrapper>

  <div class="stats-bar">
    <span>Tolerance: ±{config.tolerance}px</span>
    <span>Slips: {slipPoints.length}</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={score.status === 'PERFECT CUT!'} class:failed={gameState === 'failed'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item"><span class="score-label">Overall</span><span class="score-value">{score.overall}%</span></div>
        <div class="score-item"><span class="score-label">Path Accuracy</span><span class="score-value">{score.pathAccuracy}%</span></div>
        <div class="score-item"><span class="score-label">Speed</span><span class="score-value">{score.speedUniformity}%</span></div>
        <div class="score-item"><span class="score-label">Pressure</span><span class="score-value">{score.pressureControl}%</span></div>
        <div class="score-item" class:error={score.slipCount > 0}><span class="score-label">Slips</span><span class="score-value">{score.slipCount}</span></div>
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
  .score-panel.failed { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.2); }
  .score-panel h2 { margin: 0 0 1rem; text-align: center; color: #e0f5f0; }
  .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; }
  .score-item { text-align: center; padding: 1rem; background: rgba(15,184,159,0.1); border-radius: 12px; }
  .score-item.error { background: rgba(248,113,113,0.15); }
  .score-item.error .score-value { color: #f87171; }
  .score-label { display: block; font-size: 0.75rem; color: #7aa8a0; margin-bottom: 0.5rem; }
  .score-value { font-size: 1.3rem; font-weight: 700; color: #0fb89f; }
  .try-again-btn { display: block; width: 100%; max-width: 200px; margin: 1.5rem auto 0; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #0a7c6d 0%, #0fb89f 100%); border: none; border-radius: 10px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .try-again-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(15,184,159,0.3); }
</style>
