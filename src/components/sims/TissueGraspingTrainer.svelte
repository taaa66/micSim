<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    euclideanDistance,
    standardDeviation,
    scorePressureUniformity
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/tissue-grasping-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Difficulty settings
  const DIFFICULTY = {
    easy: { maxStretch: 40, holdTime: 1500, pressureRange: [0.3, 0.7] },
    normal: { maxStretch: 25, holdTime: 2000, pressureRange: [0.4, 0.6] },
    hard: { maxStretch: 15, holdTime: 2500, pressureRange: [0.45, 0.55] }
  };

  let difficulty = 'normal';
  $: config = DIFFICULTY[difficulty];

  // Tissue targets
  const tissueTargets = [
    { x: 250, y: 250, grabbed: false, success: false },
    { x: 400, y: 200, grabbed: false, success: false },
    { x: 550, y: 280, grabbed: false, success: false },
    { x: 350, y: 350, grabbed: false, success: false }
  ];

  let currentTargetIndex = 0;
  let gameState = 'ready';
  let grabPoint = null;
  let currentPoint = null;
  let pressures = [];
  let holdStartTime = null;
  let stretchDistance = 0;
  let score = null;
  let feedbackMessage = '';
  let feedbackType = '';
  let successfulGrabs = 0;
  let overstretches = 0;

  function handlePointerStart(e) {
    if (gameState === 'complete' || gameState === 'failed') return;
    
    const { point } = e.detail;
    const target = tissueTargets[currentTargetIndex];
    
    if (!target) return;
    
    const dist = euclideanDistance(point, target);
    if (dist < 30) {
      grabPoint = { ...point };
      gameState = 'grabbing';
      holdStartTime = performance.now();
      pressures = [point.pressure || 0.5];
      feedbackMessage = 'Hold steady... Don\'t stretch!';
      feedbackType = 'info';
    }
    
    render();
  }

  function handlePointerMove(e) {
    if (gameState !== 'grabbing') return;
    
    const { raw } = e.detail;
    currentPoint = raw;
    pressures.push(raw.pressure || 0.5);
    
    // Calculate stretch distance
    stretchDistance = euclideanDistance(raw, grabPoint);
    
    // Check for overstretch
    if (stretchDistance > config.maxStretch) {
      triggerOverstretch();
      return;
    }
    
    // Check pressure bounds
    const pressure = raw.pressure || 0.5;
    if (pressure < config.pressureRange[0] || pressure > config.pressureRange[1]) {
      feedbackMessage = pressure < config.pressureRange[0] ? 'Press harder!' : 'Too much pressure!';
      feedbackType = 'error';
    } else {
      const holdDuration = performance.now() - holdStartTime;
      const progress = Math.min(100, (holdDuration / config.holdTime) * 100);
      feedbackMessage = `Holding... ${Math.round(progress)}%`;
      feedbackType = 'info';
      
      // Check for successful hold
      if (holdDuration >= config.holdTime) {
        triggerSuccess();
      }
    }
    
    render();
  }

  function handlePointerEnd(e) {
    if (gameState !== 'grabbing') return;
    
    // Released too early
    const holdDuration = performance.now() - holdStartTime;
    if (holdDuration < config.holdTime) {
      feedbackMessage = 'Released too early! Hold for longer.';
      feedbackType = 'error';
      gameState = 'ready';
      grabPoint = null;
      stretchDistance = 0;
    }
    
    render();
  }

  function triggerOverstretch() {
    overstretches++;
    tissueTargets[currentTargetIndex].success = false;
    feedbackMessage = `OVERSTRETCH! Tissue stretched ${Math.round(stretchDistance)}px (max: ${config.maxStretch}px)`;
    feedbackType = 'error';
    
    gameState = 'ready';
    grabPoint = null;
    stretchDistance = 0;
    currentTargetIndex++;
    
    if (currentTargetIndex >= tissueTargets.length) {
      endGame();
    }
    
    render();
  }

  function triggerSuccess() {
    successfulGrabs++;
    tissueTargets[currentTargetIndex].grabbed = true;
    tissueTargets[currentTargetIndex].success = true;
    feedbackMessage = 'Perfect grasp! Moving to next target...';
    feedbackType = 'success';
    
    gameState = 'ready';
    grabPoint = null;
    stretchDistance = 0;
    currentTargetIndex++;
    
    if (currentTargetIndex >= tissueTargets.length) {
      endGame();
    }
    
    render();
  }

  function endGame() {
    gameState = 'complete';
    
    const pressureScore = scorePressureUniformity(pressures);
    const accuracyScore = (successfulGrabs / tissueTargets.length) * 100;
    const overstretchPenalty = overstretches * 15;
    const overall = Math.max(0, Math.round((accuracyScore * 0.5 + pressureScore * 0.5) - overstretchPenalty));
    
    score = {
      overall,
      accuracy: Math.round(accuracyScore),
      pressureControl: Math.round(pressureScore),
      successfulGrabs,
      overstretches,
      status: successfulGrabs === tissueTargets.length ? 'PERFECT!' : 
              successfulGrabs > tissueTargets.length / 2 ? 'GOOD' : 'NEEDS PRACTICE'
    };
    
    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw tissue targets
    tissueTargets.forEach((target, i) => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(target.x, target.y, 25, 0, Math.PI * 2);
      if (target.success) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.strokeStyle = '#34d399';
      } else if (i === currentTargetIndex) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.strokeStyle = '#fbbf24';
      } else if (i < currentTargetIndex) {
        ctx.fillStyle = 'rgba(248, 113, 113, 0.2)';
        ctx.strokeStyle = '#f87171';
      } else {
        ctx.fillStyle = 'rgba(15, 184, 159, 0.1)';
        ctx.strokeStyle = 'rgba(15, 184, 159, 0.3)';
      }
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = i === currentTargetIndex ? '#fbbf24' : (target.success ? '#34d399' : '#0fb89f');
      ctx.fill();
    });

    // Draw grab indicator
    if (grabPoint && gameState === 'grabbing') {
      // Stretch visualization
      if (currentPoint) {
        const stretchRatio = stretchDistance / config.maxStretch;
        const color = stretchRatio < 0.5 ? '#34d399' : stretchRatio < 0.8 ? '#fbbf24' : '#f87171';
        
        ctx.beginPath();
        ctx.moveTo(grabPoint.x, grabPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Max stretch boundary
        ctx.beginPath();
        ctx.arc(grabPoint.x, grabPoint.y, config.maxStretch, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Hold progress ring
      if (holdStartTime) {
        const progress = Math.min(1, (performance.now() - holdStartTime) / config.holdTime);
        ctx.beginPath();
        ctx.arc(grabPoint.x, grabPoint.y, 35, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = '#0fb89f';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Current pointer
    if (currentPoint && gameState === 'grabbing') {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }

  function reset() {
    tissueTargets.forEach(t => { t.grabbed = false; t.success = false; });
    currentTargetIndex = 0;
    gameState = 'ready';
    grabPoint = null;
    currentPoint = null;
    pressures = [];
    holdStartTime = null;
    stretchDistance = 0;
    score = null;
    successfulGrabs = 0;
    overstretches = 0;
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
      <h1>Tissue Grasping Trainer</h1>
      <p>Grasp tissue targets without overstretching. Hold steady.</p>
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
    <span>Target: {currentTargetIndex + 1}/{tissueTargets.length}</span>
    <span>Successful: {successfulGrabs}</span>
    <span>Overstretches: {overstretches}</span>
    <span>Max Stretch: {config.maxStretch}px</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={score.status === 'PERFECT!'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item"><span class="score-label">Overall</span><span class="score-value">{score.overall}%</span></div>
        <div class="score-item"><span class="score-label">Accuracy</span><span class="score-value">{score.accuracy}%</span></div>
        <div class="score-item"><span class="score-label">Pressure</span><span class="score-value">{score.pressureControl}%</span></div>
        <div class="score-item"><span class="score-label">Successful</span><span class="score-value">{score.successfulGrabs}/{tissueTargets.length}</span></div>
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
