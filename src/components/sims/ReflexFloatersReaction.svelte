<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import {
    scoreReactionTime,
    euclideanDistance
  } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/red-reflex-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  // Game state
  let targets = [];
  let currentTarget = null;
  let targetAppearTime = null;
  let reactionTimes = [];
  let correctionAccuracies = [];
  let stabilizationTimes = [];
  let roundCount = 0;
  const maxRounds = 8;
  const targetRadius = 25;
  const hitRadius = 35;
  const velocityThreshold = 0.1; // V_inst < 0.1 = stopped

  let currentPoint = null;
  let velocityHistory = [];
  let score = null;
  let gameActive = false;
  let animationFrame = null;

  function spawnTarget() {
    if (roundCount >= maxRounds) {
      endGame();
      return;
    }

    const margin = 80;
    currentTarget = {
      x: margin + Math.random() * (width - margin * 2),
      y: margin + Math.random() * (height - margin * 2),
      spawnTime: performance.now()
    };
    targetAppearTime = performance.now();
    roundCount++;
    render();
  }

  function handlePointerMove(e) {
    if (!gameActive) return;
    
    const { raw, velocity } = e.detail;
    currentPoint = raw;
    velocityHistory.push(velocity);

    // Keep only last 10 velocity samples
    if (velocityHistory.length > 10) {
      velocityHistory.shift();
    }

    // Check if stopped on target
    if (currentTarget && targetAppearTime) {
      const dist = euclideanDistance(raw, currentTarget);
      const avgVelocity = velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length;

      if (dist <= hitRadius && avgVelocity < velocityThreshold) {
        // Successfully stopped on target
        const reactionTime = performance.now() - targetAppearTime;
        reactionTimes.push(reactionTime);
        correctionAccuracies.push(Math.max(0, 100 - (dist / hitRadius) * 100));
        
        // Calculate time to stabilize (from first entering radius to stop)
        stabilizationTimes.push(reactionTime);

        currentTarget = null;
        targetAppearTime = null;
        velocityHistory = [];

        // Spawn next target after brief delay
        setTimeout(spawnTarget, 500);
      }
    }

    render();
  }

  function handlePointerStart(e) {
    if (!gameActive) {
      gameActive = true;
      roundCount = 0;
      reactionTimes = [];
      correctionAccuracies = [];
      stabilizationTimes = [];
      spawnTarget();
    }
  }

  function handleSessionEnd(e) {
    endGame();
  }

  function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationFrame);

    if (reactionTimes.length === 0) {
      score = { overall: 0, avgReactionTime: 0, accuracy: 0, stabilization: 0, status: 'NO TARGETS HIT' };
    } else {
      const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
      const accuracy = correctionAccuracies.reduce((a, b) => a + b, 0) / correctionAccuracies.length;
      const reactionScore = scoreReactionTime(avgReactionTime, 800); // Target: 800ms
      const stabilization = Math.min(100, (1000 / avgReactionTime) * 50);

      const overall = Math.round((reactionScore * 0.4 + accuracy * 0.35 + stabilization * 0.25));
      score = {
        overall,
        avgReactionTime: Math.round(avgReactionTime),
        accuracy: Math.round(accuracy),
        stabilization: Math.round(stabilization),
        targetsHit: reactionTimes.length,
        status: reactionTimes.length >= maxRounds ? 'COMPLETE' : 'PARTIAL'
      };
    }

    if (onComplete) onComplete(score);
    render();
  }

  function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(15, 184, 159, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw current target
    if (currentTarget) {
      // Outer glow
      const gradient = ctx.createRadialGradient(
        currentTarget.x, currentTarget.y, 0,
        currentTarget.x, currentTarget.y, hitRadius * 1.5
      );
      gradient.addColorStop(0, 'rgba(248, 113, 113, 0.4)');
      gradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(currentTarget.x - hitRadius * 1.5, currentTarget.y - hitRadius * 1.5, hitRadius * 3, hitRadius * 3);

      // Hit zone
      ctx.beginPath();
      ctx.arc(currentTarget.x, currentTarget.y, hitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Target core
      ctx.beginPath();
      ctx.arc(currentTarget.x, currentTarget.y, targetRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#f87171';
      ctx.fill();

      // Target center
      ctx.beginPath();
      ctx.arc(currentTarget.x, currentTarget.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Pulse animation
      const elapsed = performance.now() - currentTarget.spawnTime;
      const pulse = Math.sin(elapsed / 200) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(currentTarget.x, currentTarget.y, targetRadius * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw current pointer
    if (currentPoint) {
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#0fb89f';
      ctx.fill();

      // Velocity indicator
      const avgVel = velocityHistory.length > 0
        ? velocityHistory.reduce((a, b) => a + b, 0) / velocityHistory.length
        : 0;
      const velIndicatorSize = Math.min(30, avgVel * 50);
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 10 + velIndicatorSize, 0, Math.PI * 2);
      ctx.strokeStyle = avgVel < velocityThreshold ? 'rgba(52, 211, 153, 0.8)' : 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw HUD
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Targets: ${reactionTimes.length}/${maxRounds}`, 20, 30);

    if (!gameActive && !score) {
      ctx.fillStyle = '#e0f5f0';
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Touch/Click to Start', width / 2, height / 2);
      ctx.font = '14px system-ui';
      ctx.fillStyle = '#7aa8a0';
      ctx.fillText('Stop on each target as quickly as possible', width / 2, height / 2 + 30);
    }
  }

  function animateLoop() {
    render();
    if (gameActive) {
      animationFrame = requestAnimationFrame(animateLoop);
    }
  }

  function reset() {
    gameActive = false;
    currentTarget = null;
    targetAppearTime = null;
    reactionTimes = [];
    correctionAccuracies = [];
    stabilizationTimes = [];
    roundCount = 0;
    currentPoint = null;
    velocityHistory = [];
    score = null;
    cancelAnimationFrame(animationFrame);
    wrapper?.reset();
    render();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    render();
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="sim-container">
  <header class="sim-header">
    <button class="back-btn" on:click={onBack}>← Back</button>
    <div class="sim-title">
      <h1>Reflex/Floaters Reaction</h1>
      <p>Stop on each target as fast as possible. Velocity must drop below threshold.</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  <SimModuleWrapper
    bind:this={wrapper}
    duration={20000}
    {backgroundImageUrl}
    backgroundOverlayOpacity={0.05}
    on:pointerstart={handlePointerStart}
    on:pointermove={handlePointerMove}
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
          <span class="score-label">Avg Reaction</span>
          <span class="score-value">{score.avgReactionTime}ms</span>
        </div>
        <div class="score-item">
          <span class="score-label">Accuracy</span>
          <span class="score-value">{score.accuracy}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Stabilization</span>
          <span class="score-value">{score.stabilization}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Targets Hit</span>
          <span class="score-value">{score.targetsHit}/{maxRounds}</span>
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
