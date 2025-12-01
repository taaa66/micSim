<script>
  import { onMount } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    scoreSymmetry,
    scorePressureUniformity,
    scoreTremor,
    euclideanDistance
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/corneal-suture-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Suture points - 3 pairs of entry/exit points
  const sutureTargets = [
    { entry: { x: 200, y: 200 }, exit: { x: 200, y: 300 } },
    { entry: { x: 400, y: 180 }, exit: { x: 400, y: 320 } },
    { entry: { x: 600, y: 200 }, exit: { x: 600, y: 300 } }
  ];
  const toleranceRadius = 15; // ~1mm at this scale

  let drawnPath = [];
  let pressures = [];
  let currentPoint = null;
  let currentSutureIndex = 0;
  let phase = 'entry'; // 'entry' or 'exit'
  let recordedPoints = []; // {entry, exit} for each suture
  let score = null;
  let failed = false;

  function handlePointerMove(e) {
    const { raw, allRaw } = e.detail;
    currentPoint = raw;
    drawnPath = allRaw;
    pressures.push(raw.pressure);
    render();
  }

  function handlePointerEnd(e) {
    if (failed || !currentPoint) return;

    const target = sutureTargets[currentSutureIndex];
    const targetPoint = phase === 'entry' ? target.entry : target.exit;
    const distance = euclideanDistance(currentPoint, targetPoint);

    if (distance > toleranceRadius * 2) {
      // Outside tolerance - fail
      wrapper.triggerFailure('missed-point');
      failed = true;
      return;
    }

    // Record the point
    if (phase === 'entry') {
      recordedPoints[currentSutureIndex] = { entry: { ...currentPoint } };
      phase = 'exit';
    } else {
      recordedPoints[currentSutureIndex].exit = { ...currentPoint };
      phase = 'entry';
      currentSutureIndex++;

      if (currentSutureIndex >= sutureTargets.length) {
        // All sutures complete - trigger scoring
        wrapper.triggerFailure('complete'); // Using failure to end session
      }
    }

    drawnPath = [];
    render();
  }

  function handleSessionEnd(e) {
    const { reason, tremorResiduals, totalDuration } = e.detail;

    if (reason === 'missed-point') {
      score = { overall: 0, symmetry: 0, pressureUniformity: 0, tremor: 0, status: 'FAILED - Missed Target' };
    } else {
      // Calculate symmetry for all completed sutures
      let totalSymmetry = 0;
      let validSutures = 0;

      for (let i = 0; i < recordedPoints.length; i++) {
        if (recordedPoints[i]?.entry && recordedPoints[i]?.exit) {
          const sym = scoreSymmetry(
            recordedPoints[i].entry,
            recordedPoints[i].exit,
            sutureTargets[i].entry,
            sutureTargets[i].exit
          );
          totalSymmetry += sym;
          validSutures++;
        }
      }

      const symmetry = validSutures > 0 ? totalSymmetry / validSutures : 0;
      const pressureUniformity = scorePressureUniformity(pressures);
      const tremor = scoreTremor(tremorResiduals, totalDuration);
      const overall = Math.round((symmetry * 0.5 + pressureUniformity * 0.25 + tremor * 0.25));
      score = { overall, symmetry, pressureUniformity, tremor, status: 'COMPLETE' };
    }

    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw cornea outline
    ctx.beginPath();
    ctx.ellipse(400, 250, 280, 180, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(150, 180, 200, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 180, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw suture targets
    sutureTargets.forEach((suture, idx) => {
      const isActive = idx === currentSutureIndex;
      const isComplete = idx < currentSutureIndex;
      const alpha = isComplete ? 0.3 : (isActive ? 1 : 0.5);

      // Entry point
      ctx.beginPath();
      ctx.arc(suture.entry.x, suture.entry.y, toleranceRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (isActive && phase === 'entry') {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
        ctx.fill();
      }

      // Exit point
      ctx.beginPath();
      ctx.arc(suture.exit.x, suture.exit.y, toleranceRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(248, 113, 113, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (isActive && phase === 'exit') {
        ctx.fillStyle = 'rgba(248, 113, 113, 0.2)';
        ctx.fill();
      }

      // Connecting line (ideal path)
      ctx.beginPath();
      ctx.moveTo(suture.entry.x, suture.entry.y);
      ctx.lineTo(suture.exit.x, suture.exit.y);
      ctx.strokeStyle = `rgba(15, 184, 159, ${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw recorded points
      if (recordedPoints[idx]?.entry) {
        ctx.beginPath();
        ctx.arc(recordedPoints[idx].entry.x, recordedPoints[idx].entry.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.fill();
      }
      if (recordedPoints[idx]?.exit) {
        ctx.beginPath();
        ctx.arc(recordedPoints[idx].exit.x, recordedPoints[idx].exit.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f87171';
        ctx.fill();
      }
    });

    // Draw current path
    if (drawnPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
      for (let i = 1; i < drawnPath.length; i++) {
        ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
      }
      ctx.strokeStyle = '#0fb89f';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Draw current point
    if (currentPoint) {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // Draw instructions
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    const instruction = phase === 'entry' 
      ? `Suture ${currentSutureIndex + 1}/${sutureTargets.length}: Target ENTRY point (green)`
      : `Suture ${currentSutureIndex + 1}/${sutureTargets.length}: Target EXIT point (red)`;
    ctx.fillText(instruction, 400, 30);
  }

  function reset() {
    drawnPath = [];
    pressures = [];
    currentPoint = null;
    currentSutureIndex = 0;
    phase = 'entry';
    recordedPoints = [];
    score = null;
    failed = false;
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
      <h1>Corneal Suture Placement</h1>
      <p>Puncture entry (green) then exit (red) points. Tolerance: ±{toleranceRadius}px</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  <SimModuleWrapper
    bind:this={wrapper}
    duration={35000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.1}
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
          <span class="score-label">Symmetry</span>
          <span class="score-value">{Math.round(score.symmetry)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Pressure Uniformity</span>
          <span class="score-value">{Math.round(score.pressureUniformity)}%</span>
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
