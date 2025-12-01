<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';

  export let onComplete = null;
  export let onBack = null;

  const dispatch = createEventDispatcher();

  // Game configuration
  const TRACK_LENGTH = 100; // Track segments
  const IDEAL_ANGLE_TOLERANCE = 2; // degrees for combo mode
  const WALL_TOLERANCE = 5; // degrees before wall hit
  const SPEED_BASE = 0.3;
  const SPEED_BOOST = 0.15;

  // Game state
  let gameState = 'ready'; // ready, playing, complete
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;
  let animationFrame;

  // Ship state
  let shipPosition = 0; // 0-100 along track
  let shipAngle = 0; // Current stylus angle
  let shipHealth = 100;
  let shipSpeed = SPEED_BASE;
  let inComboZone = false;
  let comboActive = false;

  // Track generation
  let trackSegments = [];
  let currentSegmentIndex = 0;

  // Stylus tracking
  let currentTiltX = 0;
  let currentTiltY = 0;
  let isTracking = false;

  // Scoring
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let comboMultiplier = 1;
  let perfectSegments = 0;
  let wallHits = 0;
  let speedBoosts = 0;

  // Visual effects
  let screenShake = 0;
  let sonicBoom = false;
  let trailParticles = [];
  let boostParticles = [];

  // Time
  let startTime = null;
  let elapsedTime = 0;
  let bestTime = null;

  function generateTrack() {
    trackSegments = [];
    let currentAngle = 0;
    
    for (let i = 0; i < TRACK_LENGTH; i++) {
      // Generate smooth angle changes
      const angleChange = (Math.random() - 0.5) * 30;
      currentAngle += angleChange;
      currentAngle = Math.max(-60, Math.min(60, currentAngle)); // Clamp to ±60°
      
      trackSegments.push({
        index: i,
        idealAngle: currentAngle,
        width: 15 + Math.random() * 10, // Track width varies
        hasBoost: Math.random() < 0.15 && i > 5, // 15% chance of boost
        color: `hsl(${180 + i * 2}, 70%, 50%)`
      });
    }
  }

  function handlePointerDown(e) {
    if (gameState === 'complete') return;
    
    isTracking = true;
    updateTilt(e);
    
    if (gameState === 'ready') {
      startGame();
    }
  }

  function handlePointerMove(e) {
    if (!isTracking || gameState !== 'playing') return;
    updateTilt(e);
  }

  function handlePointerUp() {
    isTracking = false;
  }

  function updateTilt(e) {
    // Get tilt from stylus or simulate from position
    if (e.tiltX !== undefined && e.tiltY !== undefined && e.pointerType === 'pen') {
      currentTiltX = e.tiltX;
      currentTiltY = e.tiltY;
    } else {
      // Simulate tilt from pointer position relative to center
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      currentTiltX = ((x - centerX) / centerX) * 45;
      currentTiltY = ((y - centerY) / centerY) * 45;
    }
    
    // Calculate combined angle
    shipAngle = currentTiltX; // Primary control is X tilt
  }

  function startGame() {
    gameState = 'playing';
    generateTrack();
    startTime = performance.now();
    shipPosition = 0;
    shipHealth = 100;
    shipSpeed = SPEED_BASE;
    score = 0;
    combo = 0;
    maxCombo = 0;
    comboMultiplier = 1;
    perfectSegments = 0;
    wallHits = 0;
    speedBoosts = 0;
    currentSegmentIndex = 0;
    trailParticles = [];
    boostParticles = [];
    sonicBoom = false;
    
    render();
  }

  function updateGame() {
    if (gameState !== 'playing' || !isTracking) return;
    
    const segment = trackSegments[currentSegmentIndex];
    if (!segment) {
      endGame(true);
      return;
    }
    
    // Calculate angle deviation
    const deviation = Math.abs(shipAngle - segment.idealAngle);
    
    // Check for wall collision
    if (deviation > segment.width + WALL_TOLERANCE) {
      // Wall hit!
      wallHits++;
      shipHealth -= 10;
      screenShake = 8;
      combo = 0;
      comboMultiplier = 1;
      inComboZone = false;
      comboActive = false;
      shipSpeed = Math.max(SPEED_BASE * 0.5, shipSpeed - 0.1);
      
      // Vibration feedback (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      if (shipHealth <= 0) {
        endGame(false);
        return;
      }
    } else if (deviation <= IDEAL_ANGLE_TOLERANCE) {
      // Perfect angle - combo zone!
      if (!inComboZone) {
        inComboZone = true;
        comboActive = true;
      }
      
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      comboMultiplier = 1 + Math.floor(combo / 30) * 0.5;
      
      // Check for speed boost pickup
      if (segment.hasBoost && !segment.boostCollected) {
        segment.boostCollected = true;
        speedBoosts++;
        shipSpeed = Math.min(SPEED_BASE + SPEED_BOOST * 3, shipSpeed + SPEED_BOOST);
        
        // Boost particles
        for (let i = 0; i < 10; i++) {
          boostParticles.push({
            x: width / 2,
            y: height * 0.7,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 5 - 2,
            life: 30,
            color: '#60a5fa'
          });
        }
      }
      
      score += 10 * comboMultiplier;
      perfectSegments++;
      
    } else {
      // In track but not perfect
      inComboZone = false;
      if (comboActive && combo > 10) {
        // Lost combo
        comboActive = false;
      }
      score += 5;
    }
    
    // Move ship forward
    shipPosition += shipSpeed;
    currentSegmentIndex = Math.floor(shipPosition);
    
    // Trail particles
    if (Math.random() < 0.3) {
      trailParticles.push({
        x: width / 2 + (Math.random() - 0.5) * 20,
        y: height * 0.7,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 1,
        life: 20,
        color: inComboZone ? '#60a5fa' : '#34d399'
      });
    }
    
    // Check for completion
    if (shipPosition >= TRACK_LENGTH) {
      // Check for sonic boom (no wall hits)
      if (wallHits === 0) {
        sonicBoom = true;
        score += 1000;
      }
      endGame(true);
    }
    
    // Decay screen shake
    screenShake = Math.max(0, screenShake - 0.5);
  }

  function endGame(completed) {
    gameState = 'complete';
    cancelAnimationFrame(animationFrame);
    elapsedTime = performance.now() - startTime;
    
    const finalScore = {
      overall: Math.round(score),
      completed,
      time: Math.round(elapsedTime / 100) / 10,
      perfectPercent: Math.round((perfectSegments / TRACK_LENGTH) * 100),
      maxCombo,
      wallHits,
      speedBoosts,
      sonicBoom,
      health: shipHealth,
      grade: calculateGrade(completed)
    };
    
    if (onComplete) onComplete(finalScore);
    dispatch('complete', finalScore);
  }

  function calculateGrade(completed) {
    if (!completed) return 'F';
    if (sonicBoom && perfectSegments > TRACK_LENGTH * 0.8) return 'S';
    if (wallHits === 0 && perfectSegments > TRACK_LENGTH * 0.6) return 'A';
    if (wallHits <= 3 && perfectSegments > TRACK_LENGTH * 0.4) return 'B';
    if (shipHealth > 50) return 'C';
    return 'D';
  }

  function render() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Apply screen shake
    ctx.save();
    if (screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * screenShake,
        (Math.random() - 0.5) * screenShake
      );
    }
    
    // Draw track
    drawTrack();
    
    // Draw particles
    updateAndDrawParticles();
    
    // Draw ship
    drawShip();
    
    // Draw HUD
    drawHUD();
    
    ctx.restore();
    
    if (gameState === 'playing') {
      updateGame();
      animationFrame = requestAnimationFrame(render);
    }
  }

  function drawTrack() {
    const visibleSegments = 20;
    const segmentHeight = height / visibleSegments;
    
    for (let i = 0; i < visibleSegments; i++) {
      const segIndex = currentSegmentIndex + i;
      if (segIndex >= TRACK_LENGTH) continue;
      
      const segment = trackSegments[segIndex];
      if (!segment) continue;
      
      const y = height - (i * segmentHeight) - segmentHeight;
      const trackCenterX = width / 2 + (segment.idealAngle / 60) * (width * 0.3);
      const trackWidth = segment.width * 4;
      
      // Track walls
      ctx.fillStyle = `rgba(15, 184, 159, ${0.3 - i * 0.01})`;
      ctx.fillRect(trackCenterX - trackWidth, y, trackWidth * 2, segmentHeight + 1);
      
      // Track borders
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trackCenterX - trackWidth, y);
      ctx.lineTo(trackCenterX - trackWidth, y + segmentHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(trackCenterX + trackWidth, y);
      ctx.lineTo(trackCenterX + trackWidth, y + segmentHeight);
      ctx.stroke();
      
      // Ideal line (center)
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(trackCenterX, y);
      ctx.lineTo(trackCenterX, y + segmentHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Speed boost pickup
      if (segment.hasBoost && !segment.boostCollected) {
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(trackCenterX, y + segmentHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', trackCenterX, y + segmentHeight / 2);
      }
    }
    
    // Combo zone indicator
    if (inComboZone) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
      ctx.fillRect(0, 0, width, height);
    }
  }

  function drawShip() {
    const shipX = width / 2 + (shipAngle / 60) * (width * 0.3);
    const shipY = height * 0.7;
    
    // Ship glow
    const gradient = ctx.createRadialGradient(shipX, shipY, 0, shipX, shipY, 30);
    gradient.addColorStop(0, inComboZone ? 'rgba(96, 165, 250, 0.5)' : 'rgba(52, 211, 153, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(shipX - 30, shipY - 30, 60, 60);
    
    // Ship body
    ctx.save();
    ctx.translate(shipX, shipY);
    ctx.rotate((shipAngle / 180) * Math.PI * 0.3);
    
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-10, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(10, 10);
    ctx.closePath();
    
    ctx.fillStyle = inComboZone ? '#60a5fa' : '#34d399';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Engine glow
    ctx.beginPath();
    ctx.moveTo(-6, 10);
    ctx.lineTo(0, 20 + shipSpeed * 20);
    ctx.lineTo(6, 10);
    ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + shipSpeed})`;
    ctx.fill();
    
    ctx.restore();
    
    // Sonic boom effect
    if (sonicBoom) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(shipX, shipY, 50, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function updateAndDrawParticles() {
    // Trail particles
    trailParticles = trailParticles.filter(p => p.life > 0);
    trailParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.floor((p.life / 20) * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
    
    // Boost particles
    boostParticles = boostParticles.filter(p => p.life > 0);
    boostParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.floor((p.life / 30) * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  }

  function drawHUD() {
    // Progress bar
    const progressWidth = (shipPosition / TRACK_LENGTH) * (width - 40);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 20, width - 40, 10);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(20, 20, progressWidth, 10);
    
    // Health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(20, 40, 150, 8);
    ctx.fillStyle = shipHealth > 50 ? '#34d399' : shipHealth > 25 ? '#fbbf24' : '#f87171';
    ctx.fillRect(20, 40, (shipHealth / 100) * 150, 8);
    
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`HEALTH: ${shipHealth}%`, 20, 60);
    
    // Angle indicator
    ctx.fillStyle = '#e0f5f0';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${shipAngle.toFixed(1)}°`, width / 2, height - 20);
    
    // Target angle
    const segment = trackSegments[currentSegmentIndex];
    if (segment) {
      ctx.fillStyle = '#7aa8a0';
      ctx.font = '11px system-ui';
      ctx.fillText(`Target: ${segment.idealAngle.toFixed(1)}°`, width / 2, height - 40);
    }
    
    // Combo display
    if (combo > 0) {
      ctx.fillStyle = inComboZone ? '#60a5fa' : '#fbbf24';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${combo}x`, width - 20, 40);
      
      if (comboMultiplier > 1) {
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px system-ui';
        ctx.fillText(`×${comboMultiplier.toFixed(1)}`, width - 20, 58);
      }
    }
    
    // Score
    ctx.fillStyle = '#e0f5f0';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(score)}`, width - 20, 85);
    
    // Speed indicator
    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`SPEED: ${(shipSpeed * 100).toFixed(0)}%`, 20, height - 20);
  }

  function reset() {
    gameState = 'ready';
    cancelAnimationFrame(animationFrame);
    shipPosition = 0;
    shipHealth = 100;
    shipSpeed = SPEED_BASE;
    score = 0;
    combo = 0;
    maxCombo = 0;
    comboMultiplier = 1;
    perfectSegments = 0;
    wallHits = 0;
    speedBoosts = 0;
    currentSegmentIndex = 0;
    trailParticles = [];
    boostParticles = [];
    sonicBoom = false;
    screenShake = 0;
    isTracking = false;
    
    generateTrack();
    
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawTrack();
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    generateTrack();
    drawTrack();
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="game-container">
  <header class="game-header">
    <button class="back-btn" on:click={onBack}>← Back</button>
    <div class="game-title">
      <h1>🚀 THE VECTOR RACE</h1>
      <p>Tilt to navigate. Match the track angle. Collect speed boosts.</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  {#if gameState === 'ready'}
    <div class="start-prompt" in:scale={{ duration: 300, easing: elasticOut }}>
      <span class="prompt-icon">🎮</span>
      <p>Touch and tilt to steer the ship</p>
      <span class="threshold-info">Stay within ±{IDEAL_ANGLE_TOLERANCE}° for combo mode</span>
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
      <span class="stat-label">PROGRESS</span>
      <span class="stat-value">{Math.round((shipPosition / TRACK_LENGTH) * 100)}%</span>
    </div>
    <div class="stat">
      <span class="stat-label">PERFECT</span>
      <span class="stat-value">{perfectSegments}</span>
    </div>
    <div class="stat">
      <span class="stat-label">WALL HITS</span>
      <span class="stat-value" class:danger={wallHits > 0}>{wallHits}</span>
    </div>
    <div class="stat">
      <span class="stat-label">BOOSTS</span>
      <span class="stat-value boost">{speedBoosts}</span>
    </div>
  </div>

  {#if gameState === 'complete'}
    <div class="score-panel" in:scale={{ duration: 400, easing: cubicOut }}>
      <h2 class="grade grade-{calculateGrade(shipHealth > 0).toLowerCase()}">{calculateGrade(shipHealth > 0)}</h2>
      
      {#if sonicBoom}
        <div class="sonic-badge" in:fly={{ y: -20, duration: 300 }}>
          💥 SONIC BOOM - NO WALL HITS! 💥
        </div>
      {/if}
      
      <div class="final-score">{Math.round(score)} pts</div>
      
      <div class="score-grid">
        <div class="score-item">
          <span class="score-label">Time</span>
          <span class="score-value">{(elapsedTime / 1000).toFixed(1)}s</span>
        </div>
        <div class="score-item">
          <span class="score-label">Perfect %</span>
          <span class="score-value">{Math.round((perfectSegments / TRACK_LENGTH) * 100)}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Max Combo</span>
          <span class="score-value">{maxCombo}x</span>
        </div>
        <div class="score-item">
          <span class="score-label">Wall Hits</span>
          <span class="score-value">{wallHits}</span>
        </div>
        <div class="score-item">
          <span class="score-label">Boosts</span>
          <span class="score-value">{speedBoosts}</span>
        </div>
        <div class="score-item">
          <span class="score-label">Health</span>
          <span class="score-value">{shipHealth}%</span>
        </div>
      </div>
      
      <div class="skill-transfer">
        <span class="transfer-label">SKILL TRANSFER →</span>
        <span class="transfer-target">Needle Angle, Corneal Tunnel, Suture Placement</span>
      </div>
      
      <button class="try-again-btn" on:click={reset}>Race Again</button>
    </div>
  {/if}
</div>

<style>
  .game-container {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0d1520 0%, #1a2535 100%);
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
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .game-title p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #7aa8a0;
  }

  .start-prompt {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 10;
    background: rgba(0, 0, 0, 0.9);
    padding: 2rem 3rem;
    border-radius: 16px;
    border: 1px solid rgba(96, 165, 250, 0.3);
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
    box-shadow: 0 0 40px rgba(96, 165, 250, 0.15);
  }

  canvas {
    display: block;
    width: 100%;
    height: auto;
    background: linear-gradient(180deg, #050a10 0%, #0a1520 100%);
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
    color: #60a5fa;
  }

  .stat-value.danger {
    color: #f87171;
  }

  .stat-value.boost {
    color: #fbbf24;
  }

  .score-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10, 20, 30, 0.98);
    border: 1px solid rgba(96, 165, 250, 0.3);
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
  .grade-a { color: #60a5fa; text-shadow: 0 0 20px rgba(96, 165, 250, 0.5); }
  .grade-b { color: #34d399; }
  .grade-c { color: #fbbf24; }
  .grade-d { color: #f87171; }
  .grade-f { color: #ef4444; }

  .sonic-badge {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

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
    color: #60a5fa;
  }

  .skill-transfer {
    background: rgba(96, 165, 250, 0.1);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .transfer-label {
    display: block;
    font-size: 0.7rem;
    color: #60a5fa;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .transfer-target {
    color: #e0f5f0;
    font-size: 0.9rem;
  }

  .try-again-btn {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .try-again-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.4);
  }
</style>
