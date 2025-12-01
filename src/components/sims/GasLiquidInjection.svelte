<script>
  import { onMount } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    scoreTiltAccuracy,
    scoreTremor,
    scoreSpeedUniformity,
    euclideanDistance
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/gas-injection-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Target zone for injection
  const targetZone = { x: 500, y: 250, radius: 40 };
  const targetTiltX = 15;  // Angled entry
  const targetTiltY = -10;
  const tiltTolerance = 3; // ±3° as specified

  let drawnPath = [];
  let tilts = [];
  let currentPoint = null;
  let isInTargetZone = false;
  let injectionStartTime = null;
  let injectionPhasePoints = [];
  let injectionPhaseTilts = [];
  let score = null;

  function handlePointerMove(e) {
    const { raw, allRaw, allTremorResiduals } = e.detail;
    currentPoint = raw;
    drawnPath = allRaw;
    tilts.push({ tiltX: raw.tiltX, tiltY: raw.tiltY });

    // Check if in target zone
    const dist = euclideanDistance(raw, targetZone);
    const wasInZone = isInTargetZone;
    isInTargetZone = dist <= targetZone.radius;

    if (isInTargetZone) {
      if (!wasInZone) {
        // Just entered injection zone
        injectionStartTime = performance.now();
        injectionPhasePoints = [];
        injectionPhaseTilts = [];
      }
      injectionPhasePoints.push(raw);
      injectionPhaseTilts.push({ tiltX: raw.tiltX, tiltY: raw.tiltY });

      // Check tilt tolerance
      const tiltDevX = Math.abs(raw.tiltX - targetTiltX);
      const tiltDevY = Math.abs(raw.tiltY - targetTiltY);
      if (tiltDevX > tiltTolerance || tiltDevY > tiltTolerance) {
        // Small penalty but don't fail immediately for tilt
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
    const { reason, tremorResiduals, totalDuration } = e.detail;

    // Calculate injection phase tremor (last 2 seconds in zone)
    const injectionTremorResiduals = [];
    if (injectionPhasePoints.length > 1) {
      // Simple tremor calculation for injection phase
      for (let i = 1; i < injectionPhasePoints.length; i++) {
        const dx = injectionPhasePoints[i].x - injectionPhasePoints[i-1].x;
        const dy = injectionPhasePoints[i].y - injectionPhasePoints[i-1].y;
        injectionTremorResiduals.push(Math.hypot(dx, dy));
      }
    }

    const tiltAccuracy = scoreTiltAccuracy(injectionPhaseTilts, targetTiltX, targetTiltY, tiltTolerance);
    const stability = injectionTremorResiduals.length > 0
      ? scoreTremor(injectionTremorResiduals, injectionPhasePoints.length * 16) // ~60fps
      : 50;
    const approachSmoothness = scoreSpeedUniformity(
      drawnPath.slice(0, -injectionPhasePoints.length).map((p, i, arr) => {
        if (i === 0) return 0;
        return euclideanDistance(p, arr[i-1]);
      }).filter(v => v > 0)
    );

    const overall = Math.round((tiltAccuracy * 0.4 + stability * 0.4 + approachSmoothness * 0.2));
    score = {
      overall,
      tiltAccuracy,
      stability,
      approachSmoothness,
      injectionDuration: injectionPhasePoints.length > 0 ? ((performance.now() - injectionStartTime) / 1000).toFixed(1) : 0,
      status: injectionPhasePoints.length > 10 ? 'COMPLETE' : 'INCOMPLETE - Did not inject'
    };

    if (onComplete) onComplete(score);
  }

  function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw eye background
    ctx.beginPath();
    ctx.ellipse(400, 250, 250, 180, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 180, 200, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw iris
    ctx.beginPath();
    ctx.arc(400, 250, 100, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(80, 120, 150, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 120, 150, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pupil
    ctx.beginPath();
    ctx.arc(400, 250, 35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 30, 40, 0.8)';
    ctx.fill();

    // Draw target injection zone
    ctx.beginPath();
    ctx.arc(targetZone.x, targetZone.y, targetZone.radius, 0, Math.PI * 2);
    ctx.fillStyle = isInTargetZone ? 'rgba(15, 184, 159, 0.3)' : 'rgba(15, 184, 159, 0.1)';
    ctx.fill();
    ctx.strokeStyle = isInTargetZone ? '#0fb89f' : 'rgba(15, 184, 159, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw target angle indicator
    const angleIndicatorLen = 60;
    const angleRad = Math.atan2(targetTiltY, targetTiltX);
    ctx.beginPath();
    ctx.moveTo(targetZone.x, targetZone.y);
    ctx.lineTo(
      targetZone.x + Math.cos(angleRad) * angleIndicatorLen,
      targetZone.y + Math.sin(angleRad) * angleIndicatorLen
    );
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw user path
    if (drawnPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(drawnPath[0].x, drawnPath[0].y);
      for (let i = 1; i < drawnPath.length; i++) {
        ctx.lineTo(drawnPath[i].x, drawnPath[i].y);
      }
      ctx.strokeStyle = '#0fb89f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw current point with tilt indicator
    if (currentPoint) {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = isInTargetZone ? '#0fb89f' : '#fff';
      ctx.fill();

      // Show current tilt direction
      const tiltRad = Math.atan2(currentPoint.tiltY || 0, currentPoint.tiltX || 0);
      const tiltMag = Math.hypot(currentPoint.tiltX || 0, currentPoint.tiltY || 0);
      if (tiltMag > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoint.x, currentPoint.y);
        ctx.lineTo(
          currentPoint.x + Math.cos(tiltRad) * tiltMag,
          currentPoint.y + Math.sin(tiltRad) * tiltMag
        );
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw instructions
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Target Tilt: (${targetTiltX}°, ${targetTiltY}°) ± ${tiltTolerance}°`, 400, 30);
    if (isInTargetZone) {
      ctx.fillStyle = '#0fb89f';
      ctx.fillText('IN TARGET ZONE - Hold steady!', 400, height - 20);
    }
  }

  function reset() {
    drawnPath = [];
    tilts = [];
    currentPoint = null;
    isInTargetZone = false;
    injectionStartTime = null;
    injectionPhasePoints = [];
    injectionPhaseTilts = [];
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
      <h1>Gas/Liquid Injection</h1>
      <p>Navigate to target zone and hold steady at the correct angle.</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  <SimModuleWrapper
    bind:this={wrapper}
    duration={25000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.08}
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
          <span class="score-label">Tilt Accuracy</span>
          <span class="score-value">{Math.round(score.tiltAccuracy)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Stability</span>
          <span class="score-value">{Math.round(score.stability)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Approach</span>
          <span class="score-value">{Math.round(score.approachSmoothness)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Injection Time</span>
          <span class="score-value">{score.injectionDuration}s</span>
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
