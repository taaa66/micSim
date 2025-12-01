<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    euclideanDistance,
    scoreTiltAccuracy,
    scorePressureUniformity,
    scoreTremor
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/needle-angle-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Target angles for needle insertion
  const ANGLE_TARGETS = [
    { angle: 45, name: '45° Standard' },
    { angle: 30, name: '30° Shallow' },
    { angle: 60, name: '60° Deep' },
    { angle: 15, name: '15° Tangential' }
  ];

  const DIFFICULTY = {
    easy: { tolerance: 8, depthTolerance: 30 },
    normal: { tolerance: 5, depthTolerance: 20 },
    hard: { tolerance: 3, depthTolerance: 10 }
  };

  let difficulty = 'normal';
  $: config = DIFFICULTY[difficulty];

  let currentTargetIndex = 0;
  $: currentTarget = ANGLE_TARGETS[currentTargetIndex];
  
  let gameState = 'ready';
  let insertionStart = null;
  let insertionEnd = null;
  let currentPoint = null;
  let tilts = [];
  let pressures = [];
  let attempts = [];
  let score = null;
  let feedbackMessage = '';
  let feedbackType = '';

  // Entry zone
  const entryZone = { x: 200, y: 350, width: 100, height: 40 };

  function calculateInsertionAngle(start, end) {
    const dx = end.x - start.x;
    const dy = start.y - end.y; // Inverted Y for screen coords
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  function handlePointerStart(e) {
    if (gameState === 'complete') return;
    
    const { point } = e.detail;
    
    // Check if starting in entry zone
    if (point.x >= entryZone.x && point.x <= entryZone.x + entryZone.width &&
        point.y >= entryZone.y && point.y <= entryZone.y + entryZone.height) {
      insertionStart = { ...point };
      gameState = 'inserting';
      tilts = [];
      pressures = [];
      feedbackMessage = `Insert at ${currentTarget.angle}°. Watch the angle indicator.`;
      feedbackType = 'info';
    }
    
    render();
  }

  function handlePointerMove(e) {
    if (gameState !== 'inserting') return;
    
    const { raw } = e.detail;
    currentPoint = raw;
    tilts.push({ tiltX: raw.tiltX || 0, tiltY: raw.tiltY || 0 });
    pressures.push(raw.pressure || 0.5);
    
    // Calculate current angle
    const currentAngle = calculateInsertionAngle(insertionStart, raw);
    const angleDiff = Math.abs(currentAngle - currentTarget.angle);
    
    if (angleDiff <= config.tolerance) {
      feedbackMessage = `Angle: ${Math.round(currentAngle)}° ✓ Perfect!`;
      feedbackType = 'success';
    } else if (angleDiff <= config.tolerance * 2) {
      feedbackMessage = `Angle: ${Math.round(currentAngle)}° - Adjust ${currentAngle < currentTarget.angle ? 'up' : 'down'}`;
      feedbackType = 'info';
    } else {
      feedbackMessage = `Angle: ${Math.round(currentAngle)}° ✗ Target: ${currentTarget.angle}°`;
      feedbackType = 'error';
    }
    
    render();
  }

  function handlePointerEnd(e) {
    if (gameState !== 'inserting') return;
    
    const { rawPoints } = e.detail;
    if (rawPoints.length < 2) {
      gameState = 'ready';
      return;
    }
    
    insertionEnd = rawPoints[rawPoints.length - 1];
    
    // Calculate final angle
    const finalAngle = calculateInsertionAngle(insertionStart, insertionEnd);
    const angleDiff = Math.abs(finalAngle - currentTarget.angle);
    const depth = euclideanDistance(insertionStart, insertionEnd);
    
    const success = angleDiff <= config.tolerance && depth >= config.depthTolerance;
    
    attempts.push({
      target: currentTarget,
      achievedAngle: Math.round(finalAngle),
      angleDiff: Math.round(angleDiff),
      depth: Math.round(depth),
      success
    });
    
    if (success) {
      feedbackMessage = `Excellent! ${Math.round(finalAngle)}° achieved. Moving to next angle...`;
      feedbackType = 'success';
    } else {
      feedbackMessage = angleDiff > config.tolerance 
        ? `Angle off by ${Math.round(angleDiff)}°. Try again or continue.`
        : `Insertion too shallow (${Math.round(depth)}px). Need ${config.depthTolerance}px.`;
      feedbackType = 'error';
    }
    
    currentTargetIndex++;
    if (currentTargetIndex >= ANGLE_TARGETS.length) {
      endGame();
    } else {
      gameState = 'ready';
      insertionStart = null;
      insertionEnd = null;
    }
    
    render();
  }

  function endGame() {
    gameState = 'complete';
    
    const successCount = attempts.filter(a => a.success).length;
    const avgAngleDiff = attempts.reduce((sum, a) => sum + a.angleDiff, 0) / attempts.length;
    const angleScore = Math.max(0, 100 - avgAngleDiff * 5);
    const pressureScore = scorePressureUniformity(pressures);
    const overall = Math.round((angleScore * 0.6 + pressureScore * 0.4) * (successCount / ANGLE_TARGETS.length));
    
    score = {
      overall,
      angleAccuracy: Math.round(angleScore),
      pressureControl: Math.round(pressureScore),
      successCount,
      totalAttempts: ANGLE_TARGETS.length,
      avgDeviation: Math.round(avgAngleDiff),
      status: successCount === ANGLE_TARGETS.length ? 'PERFECT!' : 
              successCount >= ANGLE_TARGETS.length / 2 ? 'GOOD' : 'NEEDS PRACTICE'
    };
    
    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw tissue surface line
    ctx.beginPath();
    ctx.moveTo(50, 350);
    ctx.lineTo(750, 350);
    ctx.strokeStyle = 'rgba(139, 92, 78, 0.6)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw entry zone
    ctx.fillStyle = 'rgba(15, 184, 159, 0.2)';
    ctx.fillRect(entryZone.x, entryZone.y, entryZone.width, entryZone.height);
    ctx.strokeStyle = '#0fb89f';
    ctx.lineWidth = 2;
    ctx.strokeRect(entryZone.x, entryZone.y, entryZone.width, entryZone.height);
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '12px system-ui';
    ctx.fillText('Entry Zone', entryZone.x + 10, entryZone.y + 25);

    // Draw target angle guide
    if (currentTarget && gameState !== 'complete') {
      const guideLength = 150;
      const angleRad = currentTarget.angle * (Math.PI / 180);
      const guideEndX = entryZone.x + 50 + Math.cos(angleRad) * guideLength;
      const guideEndY = entryZone.y - Math.sin(angleRad) * guideLength;
      
      // Target angle line
      ctx.beginPath();
      ctx.moveTo(entryZone.x + 50, entryZone.y);
      ctx.lineTo(guideEndX, guideEndY);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Angle arc
      ctx.beginPath();
      ctx.arc(entryZone.x + 50, entryZone.y, 40, -angleRad, 0);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Angle label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(`${currentTarget.angle}°`, entryZone.x + 100, entryZone.y - 10);
    }

    // Draw current insertion
    if (insertionStart && currentPoint && gameState === 'inserting') {
      const currentAngle = calculateInsertionAngle(insertionStart, currentPoint);
      const angleDiff = Math.abs(currentAngle - currentTarget.angle);
      const color = angleDiff <= config.tolerance ? '#34d399' : 
                    angleDiff <= config.tolerance * 2 ? '#fbbf24' : '#f87171';
      
      ctx.beginPath();
      ctx.moveTo(insertionStart.x, insertionStart.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Needle tip
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Draw completed attempts
    attempts.forEach((attempt, i) => {
      const startX = entryZone.x + 50;
      const startY = entryZone.y;
      const angleRad = attempt.achievedAngle * (Math.PI / 180);
      const endX = startX + Math.cos(angleRad) * attempt.depth;
      const endY = startY - Math.sin(angleRad) * attempt.depth;
      
      ctx.beginPath();
      ctx.moveTo(startX + i * 10, startY);
      ctx.lineTo(endX + i * 10, endY);
      ctx.strokeStyle = attempt.success ? 'rgba(52, 211, 153, 0.5)' : 'rgba(248, 113, 113, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Progress indicator
    ctx.fillStyle = '#e0f5f0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`Target ${currentTargetIndex + 1}/${ANGLE_TARGETS.length}: ${currentTarget?.name || 'Complete'}`, width - 20, 30);
    ctx.textAlign = 'left';
  }

  function reset() {
    currentTargetIndex = 0;
    gameState = 'ready';
    insertionStart = null;
    insertionEnd = null;
    currentPoint = null;
    tilts = [];
    pressures = [];
    attempts = [];
    score = null;
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
      <h1>Needle Angle Trainer</h1>
      <p>Insert needle at the exact target angle. Maintain steady pressure.</p>
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
    <canvas 
      bind:this={canvas} 
      {width} 
      {height} 
      style="width: 100%; height: 100%; touch-action: none; -webkit-user-select: none; user-select: none;"
    ></canvas>
  </SimModuleWrapper>

  <div class="stats-bar">
    <span>Tolerance: ±{config.tolerance}°</span>
    <span>Min Depth: {config.depthTolerance}px</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={score.status === 'PERFECT!'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item"><span class="score-label">Overall</span><span class="score-value">{score.overall}%</span></div>
        <div class="score-item"><span class="score-label">Angle Accuracy</span><span class="score-value">{score.angleAccuracy}%</span></div>
        <div class="score-item"><span class="score-label">Pressure</span><span class="score-value">{score.pressureControl}%</span></div>
        <div class="score-item"><span class="score-label">Avg Deviation</span><span class="score-value">{score.avgDeviation}°</span></div>
        <div class="score-item"><span class="score-label">Success</span><span class="score-value">{score.successCount}/{score.totalAttempts}</span></div>
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
