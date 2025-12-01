<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    euclideanDistance,
    standardDeviation,
    calculateTremorResiduals,
    movingAverageSmooth
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/tremor-control-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  const DIFFICULTY = {
    easy: { maxTremor: 8, holdTime: 3000, zoneRadius: 25 },
    normal: { maxTremor: 5, holdTime: 4000, zoneRadius: 18 },
    hard: { maxTremor: 3, holdTime: 5000, zoneRadius: 12 }
  };

  let difficulty = 'normal';
  $: config = DIFFICULTY[difficulty];

  // Target zones for stability
  const stabilityZones = [
    { x: 200, y: 200 },
    { x: 400, y: 150 },
    { x: 600, y: 220 },
    { x: 300, y: 350 },
    { x: 500, y: 320 }
  ];

  let currentZoneIndex = 0;
  let gameState = 'ready';
  let currentPoint = null;
  let rawPoints = [];
  let smoothedPoints = [];
  let holdStartTime = null;
  let inZone = false;
  let tremorHistory = [];
  let currentTremor = 0;
  let maxTremorRecorded = 0;
  let zoneResults = [];
  let score = null;
  let feedbackMessage = '';
  let feedbackType = '';
  let animationFrame = null;

  function handlePointerStart(e) {
    if (gameState === 'complete') return;
    
    const { point } = e.detail;
    rawPoints = [point];
    smoothedPoints = [point];
    currentPoint = point;
    gameState = 'tracking';
    
    checkZoneEntry(point);
    render();
  }

  function handlePointerMove(e) {
    if (gameState !== 'tracking' && gameState !== 'holding') return;
    
    const { raw, allRaw, allSmoothed } = e.detail;
    currentPoint = raw;
    rawPoints = allRaw;
    smoothedPoints = allSmoothed || allRaw;
    
    // Calculate real-time tremor
    if (rawPoints.length >= 2 && smoothedPoints.length >= 2) {
      const residuals = calculateTremorResiduals(rawPoints.slice(-10), smoothedPoints.slice(-10));
      currentTremor = residuals.length > 0 
        ? residuals.reduce((a, b) => a + b, 0) / residuals.length 
        : 0;
      tremorHistory.push(currentTremor);
      maxTremorRecorded = Math.max(maxTremorRecorded, currentTremor);
    }
    
    checkZoneEntry(raw);
    render();
  }

  function handlePointerEnd(e) {
    if (gameState === 'holding') {
      // Released while in zone - check if held long enough
      const holdDuration = performance.now() - holdStartTime;
      if (holdDuration < config.holdTime) {
        feedbackMessage = 'Released too early! Keep holding in the zone.';
        feedbackType = 'error';
      }
    }
    
    gameState = 'ready';
    inZone = false;
    holdStartTime = null;
    render();
  }

  function checkZoneEntry(point) {
    const zone = stabilityZones[currentZoneIndex];
    if (!zone) return;
    
    const dist = euclideanDistance(point, zone);
    
    if (dist <= config.zoneRadius) {
      if (!inZone) {
        // Just entered zone
        inZone = true;
        holdStartTime = performance.now();
        gameState = 'holding';
        tremorHistory = [];
        maxTremorRecorded = 0;
      }
      
      // Check tremor while in zone
      if (currentTremor > config.maxTremor) {
        feedbackMessage = `Tremor too high! ${currentTremor.toFixed(1)}px (max: ${config.maxTremor}px)`;
        feedbackType = 'error';
      } else {
        const holdDuration = performance.now() - holdStartTime;
        const progress = Math.min(100, (holdDuration / config.holdTime) * 100);
        feedbackMessage = `Holding steady... ${Math.round(progress)}% | Tremor: ${currentTremor.toFixed(1)}px`;
        feedbackType = currentTremor < config.maxTremor * 0.5 ? 'success' : 'info';
        
        // Check for successful hold
        if (holdDuration >= config.holdTime && currentTremor <= config.maxTremor) {
          completeZone(true);
        }
      }
    } else {
      if (inZone) {
        // Left zone before completing
        feedbackMessage = 'Left the zone! Return to the target.';
        feedbackType = 'error';
        inZone = false;
        holdStartTime = null;
        gameState = 'tracking';
      } else {
        feedbackMessage = `Move to zone ${currentZoneIndex + 1}. Distance: ${Math.round(dist)}px`;
        feedbackType = 'info';
      }
    }
  }

  function completeZone(success) {
    const avgTremor = tremorHistory.length > 0 
      ? tremorHistory.reduce((a, b) => a + b, 0) / tremorHistory.length 
      : 0;
    
    zoneResults.push({
      zone: currentZoneIndex,
      success,
      avgTremor: Math.round(avgTremor * 100) / 100,
      maxTremor: Math.round(maxTremorRecorded * 100) / 100
    });
    
    feedbackMessage = success 
      ? `Zone ${currentZoneIndex + 1} complete! Avg tremor: ${avgTremor.toFixed(1)}px`
      : `Zone ${currentZoneIndex + 1} failed. Too much tremor.`;
    feedbackType = success ? 'success' : 'error';
    
    currentZoneIndex++;
    inZone = false;
    holdStartTime = null;
    gameState = 'tracking';
    tremorHistory = [];
    maxTremorRecorded = 0;
    
    if (currentZoneIndex >= stabilityZones.length) {
      endGame();
    }
  }

  function endGame() {
    gameState = 'complete';
    
    const successCount = zoneResults.filter(z => z.success).length;
    const avgTremor = zoneResults.reduce((sum, z) => sum + z.avgTremor, 0) / zoneResults.length;
    const tremorScore = Math.max(0, 100 - avgTremor * 10);
    const accuracyScore = (successCount / stabilityZones.length) * 100;
    const overall = Math.round(tremorScore * 0.6 + accuracyScore * 0.4);
    
    score = {
      overall,
      tremorControl: Math.round(tremorScore),
      accuracy: Math.round(accuracyScore),
      avgTremor: Math.round(avgTremor * 100) / 100,
      successCount,
      totalZones: stabilityZones.length,
      status: successCount === stabilityZones.length ? 'ROCK STEADY!' : 
              successCount >= stabilityZones.length / 2 ? 'GOOD CONTROL' : 'NEEDS PRACTICE'
    };
    
    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw stability zones
    stabilityZones.forEach((zone, i) => {
      const isActive = i === currentZoneIndex;
      const isComplete = i < currentZoneIndex;
      const result = zoneResults[i];
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, config.zoneRadius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? 'rgba(251, 191, 36, 0.3)' : 'rgba(15, 184, 159, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner zone
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, config.zoneRadius, 0, Math.PI * 2);
      if (isComplete && result?.success) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.strokeStyle = '#34d399';
      } else if (isComplete && !result?.success) {
        ctx.fillStyle = 'rgba(248, 113, 113, 0.3)';
        ctx.strokeStyle = '#f87171';
      } else if (isActive) {
        ctx.fillStyle = inZone ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.1)';
        ctx.strokeStyle = '#fbbf24';
      } else {
        ctx.fillStyle = 'rgba(15, 184, 159, 0.1)';
        ctx.strokeStyle = 'rgba(15, 184, 159, 0.3)';
      }
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Zone number
      ctx.fillStyle = isActive ? '#fbbf24' : (isComplete ? (result?.success ? '#34d399' : '#f87171') : '#7aa8a0');
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), zone.x, zone.y);
    });

    // Draw hold progress ring for active zone
    if (inZone && holdStartTime && currentZoneIndex < stabilityZones.length) {
      const zone = stabilityZones[currentZoneIndex];
      const progress = Math.min(1, (performance.now() - holdStartTime) / config.holdTime);
      
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, config.zoneRadius + 5, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = currentTremor <= config.maxTremor ? '#34d399' : '#f87171';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw tremor visualization
    if (rawPoints.length > 5 && gameState !== 'complete') {
      // Draw recent raw path (shows tremor)
      const recentRaw = rawPoints.slice(-30);
      ctx.beginPath();
      ctx.moveTo(recentRaw[0].x, recentRaw[0].y);
      for (let i = 1; i < recentRaw.length; i++) {
        ctx.lineTo(recentRaw[i].x, recentRaw[i].y);
      }
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw smoothed path (ideal)
      const recentSmooth = smoothedPoints.slice(-30);
      ctx.beginPath();
      ctx.moveTo(recentSmooth[0].x, recentSmooth[0].y);
      for (let i = 1; i < recentSmooth.length; i++) {
        ctx.lineTo(recentSmooth[i].x, recentSmooth[i].y);
      }
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw current pointer
    if (currentPoint && gameState !== 'complete') {
      // Tremor indicator ring
      const tremorRatio = Math.min(1, currentTremor / config.maxTremor);
      const ringColor = tremorRatio < 0.5 ? '#34d399' : tremorRatio < 0.8 ? '#fbbf24' : '#f87171';
      
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 15 + tremorRatio * 10, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // Tremor meter
    ctx.fillStyle = '#5a7a80';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Tremor Level:', 20, height - 40);
    
    const meterWidth = 150;
    const meterHeight = 12;
    const meterX = 20;
    const meterY = height - 30;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    const tremorFill = Math.min(1, currentTremor / (config.maxTremor * 1.5));
    const meterColor = tremorFill < 0.5 ? '#34d399' : tremorFill < 0.7 ? '#fbbf24' : '#f87171';
    ctx.fillStyle = meterColor;
    ctx.fillRect(meterX, meterY, meterWidth * tremorFill, meterHeight);
    
    // Threshold marker
    const thresholdX = meterX + (config.maxTremor / (config.maxTremor * 1.5)) * meterWidth;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(thresholdX, meterY - 3);
    ctx.lineTo(thresholdX, meterY + meterHeight + 3);
    ctx.stroke();
  }

  function reset() {
    currentZoneIndex = 0;
    gameState = 'ready';
    currentPoint = null;
    rawPoints = [];
    smoothedPoints = [];
    holdStartTime = null;
    inZone = false;
    tremorHistory = [];
    currentTremor = 0;
    maxTremorRecorded = 0;
    zoneResults = [];
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
      <h1>Micro-Tremor Control</h1>
      <p>Hold steady in each zone. Minimize hand tremor.</p>
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
    duration={120000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.1}
    on:pointerstart={handlePointerStart}
    on:pointermove={handlePointerMove}
    on:pointerend={handlePointerEnd}
  >
    <canvas bind:this={canvas} {width} {height} style="width: 100%; height: 100%;"></canvas>
  </SimModuleWrapper>

  <div class="stats-bar">
    <span>Zone: {currentZoneIndex + 1}/{stabilityZones.length}</span>
    <span>Max Tremor: {config.maxTremor}px</span>
    <span>Hold Time: {config.holdTime / 1000}s</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={score.status === 'ROCK STEADY!'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item"><span class="score-label">Overall</span><span class="score-value">{score.overall}%</span></div>
        <div class="score-item"><span class="score-label">Tremor Control</span><span class="score-value">{score.tremorControl}%</span></div>
        <div class="score-item"><span class="score-label">Avg Tremor</span><span class="score-value">{score.avgTremor}px</span></div>
        <div class="score-item"><span class="score-label">Zones Complete</span><span class="score-value">{score.successCount}/{score.totalZones}</span></div>
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
