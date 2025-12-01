<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';

  export let onComplete = null;
  export let onBack = null;

  const dispatch = createEventDispatcher();

  // Game configuration
  const GAME_DURATION = 30000; // 30 seconds
  const TREMOR_THRESHOLD_MICRON = 50; // 50 micron threshold
  const PLATINUM_LOCK_DURATION = 5000; // 5 seconds for platinum
  const PIXEL_TO_MICRON = 2.5; // Approximate conversion

  // Game state
  let gameState = 'ready'; // ready, playing, complete
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;
  let animationFrame;

  // Pointer tracking
  let currentPoint = null;
  let pointHistory = [];
  let isHolding = false;

  // Tremor metrics
  let currentTremorRMS = 0;
  let tremorHistory = [];
  let avgTremor = 0;
  let minTremor = Infinity;

  // Shield state
  let shieldCharge = 0;
  let shieldColor = 'orange'; // orange -> red (danger) -> emerald (locked)
  let shieldCracks = [];
  let shieldLocked = false;
  let platinumAchieved = false;
  let platinumStartTime = null;

  // Score & combo
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let comboMultiplier = 1;
  let stableTime = 0;
  let totalStableTime = 0;

  // Visual effects
  let screenShake = 0;
  let energyBurst = false;
  let particles = [];

  // Timer
  let timeRemaining = GAME_DURATION;
  let startTime = null;
  let timerInterval = null;

  // Audio feedback
  let buzzInterval = null;

  // Energy well position (center)
  $: wellX = width / 2;
  $: wellY = height / 2;
  const wellRadius = 80;
  const innerWellRadius = 40;

  function calculateRMS(points) {
    if (points.length < 2) return 0;
    
    // Calculate center of mass
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
    
    // Calculate RMS deviation from center
    const squaredDeviations = points.map(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      return dx * dx + dy * dy;
    });
    
    const meanSquared = squaredDeviations.reduce((a, b) => a + b, 0) / squaredDeviations.length;
    return Math.sqrt(meanSquared) * PIXEL_TO_MICRON;
  }

  function handlePointerDown(e) {
    if (gameState === 'complete') return;
    
    const rect = canvas.getBoundingClientRect();
    currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: performance.now()
    };
    
    pointHistory = [currentPoint];
    isHolding = true;
    
    if (gameState === 'ready') {
      startGame();
    }
  }

  function handlePointerMove(e) {
    if (!isHolding || gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: performance.now()
    };
    
    pointHistory.push(currentPoint);
    
    // Keep only last 30 points for RMS calculation
    if (pointHistory.length > 30) {
      pointHistory = pointHistory.slice(-30);
    }
    
    // Calculate real-time tremor
    currentTremorRMS = calculateRMS(pointHistory);
    tremorHistory.push(currentTremorRMS);
    
    // Update metrics
    avgTremor = tremorHistory.reduce((a, b) => a + b, 0) / tremorHistory.length;
    minTremor = Math.min(minTremor, currentTremorRMS);
    
    updateShieldState();
  }

  function handlePointerUp() {
    isHolding = false;
    currentPoint = null;
    pointHistory = [];
    
    // Reset combo if released
    if (gameState === 'playing') {
      combo = 0;
      comboMultiplier = 1;
      shieldCharge = Math.max(0, shieldCharge - 20);
    }
  }

  function updateShieldState() {
    const tremorMicron = currentTremorRMS;
    const inWell = isInWell();
    
    if (inWell && tremorMicron < TREMOR_THRESHOLD_MICRON) {
      // Stable in well - charge shield
      shieldCharge = Math.min(100, shieldCharge + 0.5);
      stableTime += 16; // ~60fps
      totalStableTime += 16;
      
      // Update combo
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      
      // Combo multiplier every 60 frames (1 second)
      comboMultiplier = 1 + Math.floor(combo / 60) * 0.5;
      
      // Score based on stability
      const stabilityBonus = Math.max(0, (TREMOR_THRESHOLD_MICRON - tremorMicron) / TREMOR_THRESHOLD_MICRON);
      score += stabilityBonus * comboMultiplier;
      
      // Shield color progression
      if (shieldCharge < 30) {
        shieldColor = 'orange';
      } else if (shieldCharge < 70) {
        shieldColor = 'yellow';
      } else {
        shieldColor = 'emerald';
        shieldLocked = true;
      }
      
      // Check for platinum lock (5 seconds of perfect stability)
      if (tremorMicron < TREMOR_THRESHOLD_MICRON * 0.5) {
        if (!platinumStartTime) {
          platinumStartTime = performance.now();
        } else if (performance.now() - platinumStartTime >= PLATINUM_LOCK_DURATION) {
          triggerPlatinumLock();
        }
      } else {
        platinumStartTime = null;
      }
      
      // Remove cracks when stable
      if (shieldCracks.length > 0 && Math.random() < 0.02) {
        shieldCracks.pop();
      }
      
    } else if (tremorMicron >= TREMOR_THRESHOLD_MICRON) {
      // Tremor too high - damage shield
      shieldCharge = Math.max(0, shieldCharge - 1);
      shieldColor = 'red';
      shieldLocked = false;
      platinumStartTime = null;
      
      // Add cracks
      if (Math.random() < 0.1 && shieldCracks.length < 8) {
        shieldCracks = [...shieldCracks, {
          angle: Math.random() * Math.PI * 2,
          length: 20 + Math.random() * 30,
          id: Date.now()
        }];
      }
      
      // Trigger buzz feedback
      triggerBuzz();
      
      // Reset combo
      combo = 0;
      comboMultiplier = 1;
    }
  }

  function isInWell() {
    if (!currentPoint) return false;
    const dx = currentPoint.x - wellX;
    const dy = currentPoint.y - wellY;
    return Math.sqrt(dx * dx + dy * dy) <= wellRadius;
  }

  function triggerPlatinumLock() {
    if (platinumAchieved) return;
    
    platinumAchieved = true;
    shieldColor = 'platinum';
    screenShake = 10;
    energyBurst = true;
    
    // Bonus score
    score += 500 * comboMultiplier;
    
    // Create particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: wellX,
        y: wellY,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 60,
        color: '#E5E4E2'
      });
    }
    
    setTimeout(() => {
      energyBurst = false;
      screenShake = 0;
    }, 500);
  }

  function triggerBuzz() {
    // Visual buzz effect
    screenShake = Math.min(5, screenShake + 1);
    setTimeout(() => screenShake = Math.max(0, screenShake - 1), 50);
  }

  function startGame() {
    gameState = 'playing';
    startTime = performance.now();
    timeRemaining = GAME_DURATION;
    score = 0;
    combo = 0;
    maxCombo = 0;
    comboMultiplier = 1;
    shieldCharge = 0;
    shieldColor = 'orange';
    shieldCracks = [];
    shieldLocked = false;
    platinumAchieved = false;
    platinumStartTime = null;
    tremorHistory = [];
    stableTime = 0;
    totalStableTime = 0;
    minTremor = Infinity;
    particles = [];
    
    timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      timeRemaining = Math.max(0, GAME_DURATION - elapsed);
      
      if (timeRemaining <= 0) {
        endGame();
      }
    }, 100);
    
    render();
  }

  function endGame() {
    gameState = 'complete';
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrame);
    
    const finalScore = {
      overall: Math.round(score),
      avgTremor: Math.round(avgTremor * 10) / 10,
      minTremor: Math.round(minTremor * 10) / 10,
      maxCombo,
      stableTimePercent: Math.round((totalStableTime / GAME_DURATION) * 100),
      platinumAchieved,
      shieldIntegrity: Math.round(shieldCharge),
      grade: calculateGrade()
    };
    
    if (onComplete) onComplete(finalScore);
    dispatch('complete', finalScore);
  }

  function calculateGrade() {
    const stablePercent = (totalStableTime / GAME_DURATION) * 100;
    if (platinumAchieved && stablePercent > 80) return 'S';
    if (stablePercent > 70 && avgTremor < 30) return 'A';
    if (stablePercent > 50 && avgTremor < 40) return 'B';
    if (stablePercent > 30) return 'C';
    return 'D';
  }

  function render() {
    if (!ctx || gameState !== 'playing') return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Apply screen shake
    ctx.save();
    if (screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * screenShake,
        (Math.random() - 0.5) * screenShake
      );
    }
    
    // Draw energy well background
    drawEnergyWell();
    
    // Draw shield
    drawShield();
    
    // Draw cracks
    drawCracks();
    
    // Draw particles
    updateAndDrawParticles();
    
    // Draw pointer
    if (currentPoint && isHolding) {
      drawPointer();
    }
    
    // Draw tremor meter
    drawTremorMeter();
    
    // Draw combo meter
    drawComboMeter();
    
    ctx.restore();
    
    animationFrame = requestAnimationFrame(render);
  }

  function drawEnergyWell() {
    // Outer glow
    const gradient = ctx.createRadialGradient(wellX, wellY, 0, wellX, wellY, wellRadius * 1.5);
    gradient.addColorStop(0, 'rgba(15, 184, 159, 0.3)');
    gradient.addColorStop(0.5, 'rgba(15, 184, 159, 0.1)');
    gradient.addColorStop(1, 'rgba(15, 184, 159, 0)');
    
    ctx.beginPath();
    ctx.arc(wellX, wellY, wellRadius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Well ring
    ctx.beginPath();
    ctx.arc(wellX, wellY, wellRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(15, 184, 159, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner well
    ctx.beginPath();
    ctx.arc(wellX, wellY, innerWellRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 184, 159, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 184, 159, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Pulsing center
    const pulseSize = innerWellRadius * 0.3 + Math.sin(performance.now() / 200) * 5;
    ctx.beginPath();
    ctx.arc(wellX, wellY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.fill();
  }

  function drawShield() {
    const shieldRadius = wellRadius + 20;
    
    // Shield color based on state
    let color;
    switch (shieldColor) {
      case 'orange': color = { r: 251, g: 146, b: 60 }; break;
      case 'yellow': color = { r: 250, g: 204, b: 21 }; break;
      case 'red': color = { r: 248, g: 113, b: 113 }; break;
      case 'emerald': color = { r: 52, g: 211, b: 153 }; break;
      case 'platinum': color = { r: 229, g: 228, b: 226 }; break;
      default: color = { r: 251, g: 146, b: 60 };
    }
    
    // Shield arc based on charge
    const chargeAngle = (shieldCharge / 100) * Math.PI * 2;
    
    ctx.beginPath();
    ctx.arc(wellX, wellY, shieldRadius, -Math.PI / 2, -Math.PI / 2 + chargeAngle);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Glow effect
    ctx.beginPath();
    ctx.arc(wellX, wellY, shieldRadius, -Math.PI / 2, -Math.PI / 2 + chargeAngle);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
    ctx.lineWidth = 16;
    ctx.stroke();
    
    // Energy burst effect
    if (energyBurst) {
      ctx.beginPath();
      ctx.arc(wellX, wellY, shieldRadius + 30, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(229, 228, 226, 0.8)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  function drawCracks() {
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
    ctx.lineWidth = 2;
    
    shieldCracks.forEach(crack => {
      const startX = wellX + Math.cos(crack.angle) * (wellRadius + 10);
      const startY = wellY + Math.sin(crack.angle) * (wellRadius + 10);
      const endX = startX + Math.cos(crack.angle + 0.2) * crack.length;
      const endY = startY + Math.sin(crack.angle + 0.2) * crack.length;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  }

  function updateAndDrawParticles() {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life--;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(229, 228, 226, ${p.life / 60})`;
      ctx.fill();
    });
  }

  function drawPointer() {
    const tremorRatio = Math.min(1, currentTremorRMS / (TREMOR_THRESHOLD_MICRON * 1.5));
    const ringColor = tremorRatio < 0.5 ? '#34d399' : tremorRatio < 0.8 ? '#fbbf24' : '#f87171';
    
    // Outer tremor indicator
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, 20 + tremorRatio * 15, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner pointer
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  function drawTremorMeter() {
    const meterX = 20;
    const meterY = height - 50;
    const meterWidth = 180;
    const meterHeight = 16;
    
    // Label
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`TREMOR: ${Math.round(currentTremorRMS)}μm`, meterX, meterY - 8);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    // Fill
    const tremorFill = Math.min(1, currentTremorRMS / (TREMOR_THRESHOLD_MICRON * 1.5));
    const fillColor = tremorFill < 0.5 ? '#34d399' : tremorFill < 0.7 ? '#fbbf24' : '#f87171';
    ctx.fillStyle = fillColor;
    ctx.fillRect(meterX, meterY, meterWidth * tremorFill, meterHeight);
    
    // Threshold marker
    const thresholdX = meterX + (TREMOR_THRESHOLD_MICRON / (TREMOR_THRESHOLD_MICRON * 1.5)) * meterWidth;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(thresholdX, meterY - 4);
    ctx.lineTo(thresholdX, meterY + meterHeight + 4);
    ctx.stroke();
  }

  function drawComboMeter() {
    const meterX = width - 200;
    const meterY = 20;
    
    // Combo text
    ctx.fillStyle = combo > 0 ? '#fbbf24' : '#5a7a80';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`${combo}x`, meterX + 180, meterY + 25);
    
    // Multiplier
    if (comboMultiplier > 1) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(`×${comboMultiplier.toFixed(1)}`, meterX + 180, meterY + 45);
    }
    
    // Score
    ctx.fillStyle = '#e0f5f0';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText(`${Math.round(score)}`, meterX + 180, meterY + 70);
  }

  function reset() {
    gameState = 'ready';
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrame);
    timeRemaining = GAME_DURATION;
    score = 0;
    combo = 0;
    maxCombo = 0;
    comboMultiplier = 1;
    shieldCharge = 0;
    shieldColor = 'orange';
    shieldCracks = [];
    shieldLocked = false;
    platinumAchieved = false;
    platinumStartTime = null;
    tremorHistory = [];
    currentTremorRMS = 0;
    avgTremor = 0;
    minTremor = Infinity;
    stableTime = 0;
    totalStableTime = 0;
    particles = [];
    screenShake = 0;
    energyBurst = false;
    currentPoint = null;
    pointHistory = [];
    isHolding = false;
    
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawEnergyWell();
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    drawEnergyWell();
  });

  onDestroy(() => {
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="game-container">
  <header class="game-header">
    <button class="back-btn" on:click={onBack}>← Back</button>
    <div class="game-title">
      <h1>🛡️ THE TREMOR SHIELD</h1>
      <p>Hold steady over the energy well. Minimize tremor to charge the shield.</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  <div class="timer-bar">
    <div class="timer-fill" style="width: {(timeRemaining / GAME_DURATION) * 100}%"></div>
    <span class="timer-text">{Math.ceil(timeRemaining / 1000)}s</span>
  </div>

  {#if gameState === 'ready'}
    <div class="start-prompt" in:scale={{ duration: 300, easing: elasticOut }}>
      <span class="prompt-icon">🎯</span>
      <p>Touch and hold over the energy well to begin</p>
      <span class="threshold-info">Tremor threshold: {TREMOR_THRESHOLD_MICRON}μm</span>
    </div>
  {/if}

  <div class="canvas-wrapper">
    <canvas
      bind:this={canvas}
      {width}
      {height}
      on:pointerdown={handlePointerDown}
      on:pointermove={handlePointerMove}
      on:pointerup={handlePointerUp}
      on:pointerleave={handlePointerUp}
      on:pointercancel={handlePointerUp}
      style="touch-action: none;"
    ></canvas>
  </div>

  <div class="stats-bar">
    <div class="stat">
      <span class="stat-label">SHIELD</span>
      <span class="stat-value" class:charged={shieldCharge > 70}>{Math.round(shieldCharge)}%</span>
    </div>
    <div class="stat">
      <span class="stat-label">AVG TREMOR</span>
      <span class="stat-value">{avgTremor.toFixed(1)}μm</span>
    </div>
    <div class="stat">
      <span class="stat-label">STABLE TIME</span>
      <span class="stat-value">{Math.round(totalStableTime / 1000)}s</span>
    </div>
    <div class="stat">
      <span class="stat-label">MAX COMBO</span>
      <span class="stat-value combo">{maxCombo}</span>
    </div>
  </div>

  {#if platinumAchieved}
    <div class="platinum-badge" in:fly={{ y: -50, duration: 500, easing: elasticOut }}>
      ⚡ PLATINUM LOCK ACHIEVED ⚡
    </div>
  {/if}

  {#if gameState === 'complete'}
    <div class="score-panel" in:scale={{ duration: 400, easing: cubicOut }}>
      <h2 class="grade grade-{calculateGrade().toLowerCase()}">{calculateGrade()}</h2>
      <div class="final-score">{Math.round(score)} pts</div>
      
      <div class="score-grid">
        <div class="score-item">
          <span class="score-label">Avg Tremor</span>
          <span class="score-value">{avgTremor.toFixed(1)}μm</span>
        </div>
        <div class="score-item">
          <span class="score-label">Min Tremor</span>
          <span class="score-value">{minTremor === Infinity ? '—' : minTremor.toFixed(1)}μm</span>
        </div>
        <div class="score-item">
          <span class="score-label">Stable Time</span>
          <span class="score-value">{Math.round((totalStableTime / GAME_DURATION) * 100)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Max Combo</span>
          <span class="score-value">{maxCombo}x</span>
        </div>
        <div class="score-item">
          <span class="score-label">Shield</span>
          <span class="score-value">{Math.round(shieldCharge)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Platinum</span>
          <span class="score-value">{platinumAchieved ? '✓' : '—'}</span>
        </div>
      </div>
      
      <div class="skill-transfer">
        <span class="transfer-label">SKILL TRANSFER →</span>
        <span class="transfer-target">Micro-Tremor Control, Capsulorhexis</span>
      </div>
      
      <button class="try-again-btn" on:click={reset}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .game-container {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0d1f23 0%, #1a3038 100%);
    position: relative;
  }

  .game-header {
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
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #8ab0a8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .back-btn:hover, .reset-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #e0f5f0;
  }

  .game-title {
    flex: 1;
    text-align: center;
  }

  .game-title h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #e0f5f0;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .game-title p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .timer-bar {
    position: relative;
    height: 8px;
    background: #2a3a40;
    border-radius: 4px;
    margin-bottom: 1rem;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
    transition: width 0.1s linear;
  }

  .timer-text {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #fff;
    font-weight: 600;
  }

  .start-prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
    background: rgba(0, 0, 0, 0.8);
    padding: 2rem 3rem;
    border-radius: 16px;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .prompt-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .start-prompt p {
    color: #e0f5f0;
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  .threshold-info {
    color: #7aa8a0;
    font-size: 0.85rem;
  }

  .canvas-wrapper {
    max-width: 900px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 40px rgba(251, 191, 36, 0.1);
  }

  canvas {
    display: block;
    width: 100%;
    height: auto;
    background: linear-gradient(180deg, #0a1a1f 0%, #0d2530 100%);
    cursor: crosshair;
  }

  .stats-bar {
    max-width: 900px;
    margin: 1rem auto 0;
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .stat {
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 0.7rem;
    color: #5a7a80;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #0fb89f;
  }

  .stat-value.charged {
    color: #34d399;
    text-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
  }

  .stat-value.combo {
    color: #fbbf24;
  }

  .platinum-badge {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%);
    color: #1a1a1a;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 2px;
    box-shadow: 0 0 40px rgba(229, 228, 226, 0.5);
    z-index: 100;
  }

  .score-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10, 26, 31, 0.98);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 20px;
    padding: 2rem;
    width: 90%;
    max-width: 450px;
    z-index: 100;
    text-align: center;
  }

  .grade {
    font-size: 4rem;
    margin: 0;
    font-weight: 800;
  }

  .grade-s { color: #E5E4E2; text-shadow: 0 0 30px rgba(229, 228, 226, 0.8); }
  .grade-a { color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
  .grade-b { color: #34d399; }
  .grade-c { color: #60a5fa; }
  .grade-d { color: #f87171; }

  .final-score {
    font-size: 1.5rem;
    color: #e0f5f0;
    margin-bottom: 1.5rem;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .score-item {
    background: rgba(255, 255, 255, 0.03);
    padding: 0.75rem;
    border-radius: 8px;
  }

  .score-item .score-label {
    display: block;
    font-size: 0.7rem;
    color: #7aa8a0;
    margin-bottom: 0.25rem;
  }

  .score-item .score-value {
    font-size: 1rem;
    font-weight: 700;
    color: #0fb89f;
  }

  .skill-transfer {
    background: rgba(15, 184, 159, 0.1);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .transfer-label {
    display: block;
    font-size: 0.7rem;
    color: #0fb89f;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .transfer-target {
    color: #e0f5f0;
    font-size: 0.9rem;
  }

  .try-again-btn {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    border: none;
    border-radius: 10px;
    color: #1a1a1a;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .try-again-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.4);
  }
</style>
