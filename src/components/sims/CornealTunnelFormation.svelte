<script>
  import { onMount } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    scorePathAccuracy,
    scorePressureUniformity,
    scoreTiltAccuracy,
    scoreTremor,
    generateLinePath
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/corneal-tunnel-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Target path: straight horizontal tunnel
  const startPoint = { x: 150, y: 250 };
  const endPoint = { x: 650, y: 250 };
  const idealPath = generateLinePath(startPoint, endPoint, 100);
  const targetTiltX = 0;
  const targetTiltY = -15; // Slight downward tilt
  const tiltTolerance = 5;
  const targetPressure = 0.5;
  const pressureTolerance = 0.15;

  let drawnPath = [];
  let pressures = [];
  let tilts = [];
  let currentPoint = null;
  let score = null;

  function handlePointerMove(e) {
    const { raw, smoothed, allRaw } = e.detail;
    currentPoint = smoothed;
    drawnPath = allRaw;
    
    // Collect pressure and tilt data
    pressures.push(raw.pressure);
    tilts.push({ tiltX: raw.tiltX, tiltY: raw.tiltY });

    // Check for plunge failure (sudden pressure spike)
    if (pressures.length > 5) {
      const recentPressures = pressures.slice(-5);
      const pressureChange = Math.abs(recentPressures[4] - recentPressures[0]);
      if (pressureChange > 0.4) {
        wrapper.triggerFailure('plunge');
      }
    }

    render();
  }

  function handlePointerEnd(e) {
    const { rawPoints } = e.detail;
    drawnPath = rawPoints;
    render();
  }

  function handleSessionEnd(e) {
    const { reason, smoothedPoints, tremorResiduals, totalDuration } = e.detail;

    if (reason === 'plunge') {
      score = { overall: 0, pathAccuracy: 0, pressureUniformity: 0, tiltAccuracy: 0, tremor: 0, status: 'FAILED - Plunge Detected' };
    } else {
      const pathAccuracy = scorePathAccuracy(smoothedPoints, idealPath);
      const pressureUniformity = scorePressureUniformity(pressures);
      const tiltAccuracy = scoreTiltAccuracy(tilts, targetTiltX, targetTiltY, tiltTolerance);
      const tremor = scoreTremor(tremorResiduals, totalDuration);
      const overall = Math.round((pathAccuracy * 0.35 + pressureUniformity * 0.3 + tiltAccuracy * 0.2 + tremor * 0.15));
      score = { overall, pathAccuracy, pressureUniformity, tiltAccuracy, tremor, status: 'COMPLETE' };
    }

    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw cornea background shape
    ctx.beginPath();
    ctx.ellipse(400, 250, 300, 200, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(150, 180, 200, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 180, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw target tunnel path
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.strokeStyle = 'rgba(15, 184, 159, 0.4)';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw depth guides
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y - 12);
    ctx.lineTo(endPoint.x, endPoint.y - 12);
    ctx.moveTo(startPoint.x, startPoint.y + 12);
    ctx.lineTo(endPoint.x, endPoint.y + 12);
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw user path
    if (drawnPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
      for (let i = 1; i < drawnPath.length; i++) {
        ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
      }
      ctx.strokeStyle = '#0fb89f';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw current point
    if (currentPoint) {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // Draw start/end markers
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#34d399';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f87171';
    ctx.fill();
  }

  function reset() {
    drawnPath = [];
    pressures = [];
    tilts = [];
    currentPoint = null;
    score = null;
    wrapper?.reset();
    render();
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
      <h1>Corneal Tunnel Formation</h1>
      <p>Maintain constant pressure and tilt (±{tiltTolerance}°) through the tunnel.</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  <SimModuleWrapper
    bind:this={wrapper}
    duration={30000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.12}
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

  {#if score}
    <div class="score-panel">
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item">
          <span class="score-label">Overall</span>
          <span class="score-value">{score.overall}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Path Accuracy</span>
          <span class="score-value">{Math.round(score.pathAccuracy)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Pressure Uniformity</span>
          <span class="score-value">{Math.round(score.pressureUniformity)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Tilt Accuracy</span>
          <span class="score-value">{Math.round(score.tiltAccuracy)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Tremor Control</span>
          <span class="score-value">{Math.round(score.tremor)}%</span>
        </div>
      </div>
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

  .score-panel {
    max-width: 900px;
    margin: 1.5rem auto 0;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .score-panel h2 {
    margin: 0 0 1rem;
    text-align: center;
    color: #e0f5f0;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .score-item {
    text-align: center;
    padding: 1rem;
    background: rgba(15, 184, 159, 0.1);
    border-radius: 12px;
  }

  .score-label {
    display: block;
    font-size: 0.8rem;
    color: #7aa8a0;
    margin-bottom: 0.5rem;
  }

  .score-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0fb89f;
  }
</style>
