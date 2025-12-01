<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut, cubicOut } from 'svelte/easing';

  export let onComplete = null;
  export let onBack = null;

  const dispatch = createEventDispatcher();

  // Game configuration
  const GAME_DURATION = 45000; // 45 seconds
  const GRIP_ZONES = 3; // Number of grip zones
  const VIRUS_SPAWN_INTERVAL = 2000; // ms between virus spawns
  const VIRUS_ATTACK_DURATION = 3000; // ms to repel virus
  const GRIP_TOLERANCE = 30; // pixels

  // Game state
  let gameState = 'ready'; // ready, playing, complete
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;
  let animationFrame;

  // Stylus model
  const stylusLength = 300;
  const stylusWidth = 20;
  let stylusX = 0;
  let stylusY = 0;
  let stylusRotation = -20; // degrees

  // Grip zones (finger positions)
  let gripZones = [];
  let activeFingers = []; // Currently touching fingers

  // Viruses
  let viruses = [];
  let virusIdCounter = 0;

  // Pointer tracking
  let pointers = new Map(); // Multi-touch support
  let currentPressure = 0.5;

  // Scoring
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let comboMultiplier = 1;
  let virusesDefeated = 0;
  let virusesLost = 0;
  let gripAccuracy = 100;
  let totalGripTime = 0;
  let perfectGripTime = 0;

  // Visual effects
  let purifyEffect = false;
  let screenFlash = null;
  let particles = [];

  // Timer
  let timeRemaining = GAME_DURATION;
  let startTime = null;
  let timerInterval = null;
  let virusSpawnInterval = null;

  function initGripZones() {
    // Define ideal grip zones on the stylus
    const zones = [
      { id: 0, name: 'Thumb', relX: 0.3, relY: -0.5, radius: 25, color: '#f59e0b', active: false, compromised: false },
      { id: 1, name: 'Index', relX: 0.5, relY: 0.5, radius: 22, color: '#34d399', active: false, compromised: false },
      { id: 2, name: 'Middle', relX: 0.7, relY: 0.5, radius: 20, color: '#60a5fa', active: false, compromised: false }
    ];
    
    gripZones = zones.map(zone => ({
      ...zone,
      x: 0,
      y: 0
    }));
    
    updateGripZonePositions();
  }

  function updateGripZonePositions() {
    const centerX = width / 2;
    const centerY = height / 2;
    const rad = (stylusRotation * Math.PI) / 180;
    
    stylusX = centerX;
    stylusY = centerY;
    
    gripZones.forEach(zone => {
      // Calculate position along stylus
      const alongStylus = (zone.relX - 0.5) * stylusLength;
      const perpendicular = zone.relY * stylusWidth * 2;
      
      // Rotate around stylus center
      zone.x = centerX + alongStylus * Math.cos(rad) - perpendicular * Math.sin(rad);
      zone.y = centerY + alongStylus * Math.sin(rad) + perpendicular * Math.cos(rad);
    });
  }

  function handlePointerDown(e) {
    if (gameState === 'complete') return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const point = {
      id: e.pointerId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5
    };
    
    pointers.set(e.pointerId, point);
    currentPressure = e.pressure || 0.5;
    
    if (gameState === 'ready') {
      startGame();
    }
    
    checkGripZones();
  }

  function handlePointerMove(e) {
    if (gameState !== 'playing') return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const point = pointers.get(e.pointerId);
    
    if (point) {
      point.x = e.clientX - rect.left;
      point.y = e.clientY - rect.top;
      point.pressure = e.pressure || 0.5;
      currentPressure = e.pressure || 0.5;
    }
    
    checkGripZones();
  }

  function handlePointerUp(e) {
    pointers.delete(e.pointerId);
    checkGripZones();
  }

  function checkGripZones() {
    let allZonesActive = true;
    let activeCount = 0;
    
    gripZones.forEach(zone => {
      zone.active = false;
      
      // Check if any pointer is in this zone
      for (const [id, pointer] of pointers) {
        const dx = pointer.x - zone.x;
        const dy = pointer.y - zone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= zone.radius + GRIP_TOLERANCE) {
          zone.active = true;
          activeCount++;
          
          // Check for virus repelling
          checkVirusRepel(zone, pointer);
          break;
        }
      }
      
      if (!zone.active && !zone.compromised) {
        allZonesActive = false;
      }
    });
    
    // Update grip accuracy
    const idealActive = gripZones.filter(z => !z.compromised).length;
    if (idealActive > 0) {
      gripAccuracy = (activeCount / idealActive) * 100;
    }
    
    // Combo system
    if (allZonesActive && activeCount >= 2) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      comboMultiplier = 1 + Math.floor(combo / 60) * 0.5;
      score += comboMultiplier;
      perfectGripTime += 16;
    } else if (activeCount === 0) {
      combo = 0;
      comboMultiplier = 1;
    }
    
    totalGripTime += 16;
  }

  function checkVirusRepel(zone, pointer) {
    viruses.forEach(virus => {
      if (virus.targetZone === zone.id && !virus.defeated) {
        // Check if pressure change or slight movement to repel
        const pressureChange = Math.abs(pointer.pressure - 0.5) > 0.1;
        
        if (pressureChange || virus.repelProgress > 0) {
          virus.repelProgress += 2;
          
          if (virus.repelProgress >= 100) {
            defeatVirus(virus);
          }
        }
      }
    });
  }

  function spawnVirus() {
    if (gameState !== 'playing') return;
    
    // Find a non-compromised zone to attack
    const availableZones = gripZones.filter(z => !z.compromised);
    if (availableZones.length === 0) return;
    
    const targetZone = availableZones[Math.floor(Math.random() * availableZones.length)];
    
    const virus = {
      id: virusIdCounter++,
      targetZone: targetZone.id,
      x: targetZone.x + (Math.random() - 0.5) * 100,
      y: targetZone.y + (Math.random() - 0.5) * 100,
      targetX: targetZone.x,
      targetY: targetZone.y,
      progress: 0,
      repelProgress: 0,
      defeated: false,
      spawnTime: performance.now()
    };
    
    viruses.push(virus);
  }

  function defeatVirus(virus) {
    virus.defeated = true;
    virusesDefeated++;
    score += 50 * comboMultiplier;
    
    // Particles
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: virus.x,
        y: virus.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        color: '#34d399'
      });
    }
  }

  function updateViruses() {
    const now = performance.now();
    
    viruses = viruses.filter(virus => {
      if (virus.defeated) return false;
      
      // Move toward target
      const dx = virus.targetX - virus.x;
      const dy = virus.targetY - virus.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 2) {
        virus.x += (dx / dist) * 1.5;
        virus.y += (dy / dist) * 1.5;
      }
      
      // Check if virus reached zone and wasn't repelled
      virus.progress = Math.min(100, ((now - virus.spawnTime) / VIRUS_ATTACK_DURATION) * 100);
      
      if (virus.progress >= 100 && virus.repelProgress < 100) {
        // Virus wins - compromise the zone
        const zone = gripZones.find(z => z.id === virus.targetZone);
        if (zone) {
          zone.compromised = true;
          zone.active = false;
          virusesLost++;
          screenFlash = 'red';
          setTimeout(() => screenFlash = null, 200);
          
          // Lock failure sound/feedback
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        }
        return false;
      }
      
      return true;
    });
  }

  function startGame() {
    gameState = 'playing';
    startTime = performance.now();
    timeRemaining = GAME_DURATION;
    score = 0;
    combo = 0;
    maxCombo = 0;
    comboMultiplier = 1;
    virusesDefeated = 0;
    virusesLost = 0;
    gripAccuracy = 100;
    totalGripTime = 0;
    perfectGripTime = 0;
    viruses = [];
    particles = [];
    purifyEffect = false;
    
    initGripZones();
    
    timerInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      timeRemaining = Math.max(0, GAME_DURATION - elapsed);
      
      if (timeRemaining <= 0) {
        endGame();
      }
    }, 100);
    
    virusSpawnInterval = setInterval(spawnVirus, VIRUS_SPAWN_INTERVAL);
    
    render();
  }

  function endGame() {
    gameState = 'complete';
    clearInterval(timerInterval);
    clearInterval(virusSpawnInterval);
    cancelAnimationFrame(animationFrame);
    
    // Check for gold grip (95%+ accuracy)
    const accuracyPercent = totalGripTime > 0 ? (perfectGripTime / totalGripTime) * 100 : 0;
    const goldGrip = accuracyPercent >= 95 && virusesLost === 0;
    
    if (goldGrip) {
      purifyEffect = true;
      score += 500;
    }
    
    const finalScore = {
      overall: Math.round(score),
      gripAccuracy: Math.round(accuracyPercent),
      virusesDefeated,
      virusesLost,
      zonesCompromised: gripZones.filter(z => z.compromised).length,
      maxCombo,
      goldGrip,
      grade: calculateGrade()
    };
    
    if (onComplete) onComplete(finalScore);
    dispatch('complete', finalScore);
  }

  function calculateGrade() {
    const accuracyPercent = totalGripTime > 0 ? (perfectGripTime / totalGripTime) * 100 : 0;
    const compromised = gripZones.filter(z => z.compromised).length;
    
    if (accuracyPercent >= 95 && compromised === 0) return 'S';
    if (accuracyPercent >= 80 && compromised <= 1) return 'A';
    if (accuracyPercent >= 60 && compromised <= 2) return 'B';
    if (compromised < GRIP_ZONES) return 'C';
    return 'D';
  }

  function render() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Screen flash effect
    if (screenFlash) {
      ctx.fillStyle = screenFlash === 'red' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(52, 211, 153, 0.3)';
      ctx.fillRect(0, 0, width, height);
    }
    
    // Draw stylus
    drawStylus();
    
    // Draw grip zones
    drawGripZones();
    
    // Draw viruses
    drawViruses();
    
    // Draw particles
    updateAndDrawParticles();
    
    // Draw HUD
    drawHUD();
    
    // Purify effect
    if (purifyEffect) {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
      ctx.fillRect(0, 0, width, height);
    }
    
    if (gameState === 'playing') {
      updateViruses();
      animationFrame = requestAnimationFrame(render);
    }
  }

  function drawStylus() {
    const centerX = width / 2;
    const centerY = height / 2;
    const rad = (stylusRotation * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);
    
    // Stylus body
    const gradient = ctx.createLinearGradient(-stylusLength/2, 0, stylusLength/2, 0);
    gradient.addColorStop(0, '#2a3a40');
    gradient.addColorStop(0.5, '#3a4a50');
    gradient.addColorStop(1, '#1a2a30');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(-stylusLength/2, -stylusWidth/2, stylusLength, stylusWidth, 8);
    ctx.fill();
    
    // Stylus tip
    ctx.fillStyle = '#0fb89f';
    ctx.beginPath();
    ctx.moveTo(stylusLength/2, 0);
    ctx.lineTo(stylusLength/2 + 20, -5);
    ctx.lineTo(stylusLength/2 + 30, 0);
    ctx.lineTo(stylusLength/2 + 20, 5);
    ctx.closePath();
    ctx.fill();
    
    // Stylus highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-stylusLength/2 + 10, -stylusWidth/2 + 3);
    ctx.lineTo(stylusLength/2 - 10, -stylusWidth/2 + 3);
    ctx.stroke();
    
    ctx.restore();
  }

  function drawGripZones() {
    gripZones.forEach(zone => {
      // Zone glow
      if (zone.active && !zone.compromised) {
        const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius * 2);
        gradient.addColorStop(0, `${zone.color}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(zone.x - zone.radius * 2, zone.y - zone.radius * 2, zone.radius * 4, zone.radius * 4);
      }
      
      // Zone circle
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      
      if (zone.compromised) {
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.strokeStyle = '#4a4a4a';
      } else if (zone.active) {
        ctx.fillStyle = `${zone.color}60`;
        ctx.strokeStyle = zone.color;
      } else {
        ctx.fillStyle = `${zone.color}20`;
        ctx.strokeStyle = `${zone.color}80`;
      }
      
      ctx.fill();
      ctx.lineWidth = zone.active ? 3 : 2;
      ctx.stroke();
      
      // Zone label
      ctx.fillStyle = zone.compromised ? '#666' : '#e0f5f0';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.name, zone.x, zone.y);
      
      // Compromised X
      if (zone.compromised) {
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(zone.x - 10, zone.y - 10);
        ctx.lineTo(zone.x + 10, zone.y + 10);
        ctx.moveTo(zone.x + 10, zone.y - 10);
        ctx.lineTo(zone.x - 10, zone.y + 10);
        ctx.stroke();
      }
    });
  }

  function drawViruses() {
    viruses.forEach(virus => {
      if (virus.defeated) return;
      
      const zone = gripZones.find(z => z.id === virus.targetZone);
      if (!zone) return;
      
      // Virus body
      const pulseSize = 12 + Math.sin(performance.now() / 100) * 3;
      
      ctx.beginPath();
      ctx.arc(virus.x, virus.y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168, 85, 247, ${0.8 - virus.repelProgress / 200})`;
      ctx.fill();
      
      // Virus spikes
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + performance.now() / 500;
        const spikeX = virus.x + Math.cos(angle) * (pulseSize + 5);
        const spikeY = virus.y + Math.sin(angle) * (pulseSize + 5);
        
        ctx.beginPath();
        ctx.arc(spikeX, spikeY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();
      }
      
      // Attack line to target
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 - virus.repelProgress / 400})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(virus.x, virus.y);
      ctx.lineTo(zone.x, zone.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Repel progress bar
      if (virus.repelProgress > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(virus.x - 20, virus.y - 25, 40, 6);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(virus.x - 20, virus.y - 25, (virus.repelProgress / 100) * 40, 6);
      }
      
      // Attack progress bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(virus.x - 20, virus.y + 20, 40, 4);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(virus.x - 20, virus.y + 20, (virus.progress / 100) * 40, 4);
    });
  }

  function updateAndDrawParticles() {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.floor((p.life / 30) * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    });
  }

  function drawHUD() {
    // Timer
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`TIME: ${Math.ceil(timeRemaining / 1000)}s`, 20, 30);
    
    // Grip accuracy
    const accuracyColor = gripAccuracy >= 80 ? '#34d399' : gripAccuracy >= 50 ? '#fbbf24' : '#f87171';
    ctx.fillStyle = accuracyColor;
    ctx.font = 'bold 16px system-ui';
    ctx.fillText(`GRIP: ${Math.round(gripAccuracy)}%`, 20, 55);
    
    // Pressure indicator
    ctx.fillStyle = '#5a7a80';
    ctx.font = '11px system-ui';
    ctx.fillText(`Pressure: ${(currentPressure * 100).toFixed(0)}%`, 20, 75);
    
    // Combo
    if (combo > 0) {
      ctx.fillStyle = '#fbbf24';
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
    
    // Viruses defeated
    ctx.fillStyle = '#a855f7';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`🦠 Defeated: ${virusesDefeated}`, 20, height - 20);
    
    // Zones status
    const activeZones = gripZones.filter(z => !z.compromised).length;
    ctx.fillStyle = activeZones === GRIP_ZONES ? '#34d399' : '#fbbf24';
    ctx.fillText(`Zones: ${activeZones}/${GRIP_ZONES}`, 150, height - 20);
  }

  function reset() {
    gameState = 'ready';
    clearInterval(timerInterval);
    clearInterval(virusSpawnInterval);
    cancelAnimationFrame(animationFrame);
    timeRemaining = GAME_DURATION;
    score = 0;
    combo = 0;
    maxCombo = 0;
    comboMultiplier = 1;
    virusesDefeated = 0;
    virusesLost = 0;
    gripAccuracy = 100;
    totalGripTime = 0;
    perfectGripTime = 0;
    viruses = [];
    particles = [];
    purifyEffect = false;
    screenFlash = null;
    pointers.clear();
    
    initGripZones();
    
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawStylus();
      drawGripZones();
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    initGripZones();
    drawStylus();
    drawGripZones();
  });

  onDestroy(() => {
    clearInterval(timerInterval);
    clearInterval(virusSpawnInterval);
    cancelAnimationFrame(animationFrame);
  });
</script>

<div class="game-container">
  <header class="game-header">
    <button class="back-btn" on:click={onBack}>← Back</button>
    <div class="game-title">
      <h1>🤏 NANO-GRIP GAUNTLET</h1>
      <p>Hold the grip zones. Repel viruses with pressure changes.</p>
    </div>
    <button class="reset-btn" on:click={reset}>Reset</button>
  </header>

  <div class="timer-bar">
    <div class="timer-fill" style="width: {(timeRemaining / GAME_DURATION) * 100}%"></div>
    <span class="timer-text">{Math.ceil(timeRemaining / 1000)}s</span>
  </div>

  {#if gameState === 'ready'}
    <div class="start-prompt" in:scale={{ duration: 300, easing: elasticOut }}>
      <span class="prompt-icon">✋</span>
      <p>Touch the glowing grip zones to begin</p>
      <span class="threshold-info">Hold all zones • Vary pressure to repel viruses</span>
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
      <span class="stat-label">GRIP</span>
      <span class="stat-value" class:perfect={gripAccuracy >= 95}>{Math.round(gripAccuracy)}%</span>
    </div>
    <div class="stat">
      <span class="stat-label">DEFEATED</span>
      <span class="stat-value virus">{virusesDefeated}</span>
    </div>
    <div class="stat">
      <span class="stat-label">LOST</span>
      <span class="stat-value" class:danger={virusesLost > 0}>{virusesLost}</span>
    </div>
    <div class="stat">
      <span class="stat-label">MAX COMBO</span>
      <span class="stat-value combo">{maxCombo}</span>
    </div>
  </div>

  {#if gameState === 'complete'}
    <div class="score-panel" in:scale={{ duration: 400, easing: cubicOut }}>
      <h2 class="grade grade-{calculateGrade().toLowerCase()}">{calculateGrade()}</h2>
      
      {#if totalGripTime > 0 && (perfectGripTime / totalGripTime) >= 0.95 && virusesLost === 0}
        <div class="gold-badge" in:fly={{ y: -20, duration: 300 }}>
          ✨ GOLD GRIP ACHIEVED ✨
        </div>
      {/if}
      
      <div class="final-score">{Math.round(score)} pts</div>
      
      <div class="score-grid">
        <div class="score-item">
          <span class="score-label">Grip Accuracy</span>
          <span class="score-value">{totalGripTime > 0 ? Math.round((perfectGripTime / totalGripTime) * 100) : 0}%</span>
        </div>
        <div class="score-item">
          <span class="score-label">Viruses Defeated</span>
          <span class="score-value">{virusesDefeated}</span>
        </div>
        <div class="score-item">
          <span class="score-label">Zones Lost</span>
          <span class="score-value">{gripZones.filter(z => z.compromised).length}</span>
        </div>
        <div class="score-item">
          <span class="score-label">Max Combo</span>
          <span class="score-value">{maxCombo}x</span>
        </div>
      </div>
      
      <div class="skill-transfer">
        <span class="transfer-label">SKILL TRANSFER →</span>
        <span class="transfer-target">Tissue Grasping, Suture Tension, Instrument Control</span>
      </div>
      
      <button class="try-again-btn" on:click={reset}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .game-container {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #1a0d20 0%, #2a1535 100%);
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
    color: #b8a8c8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .back-btn:hover, .reset-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #e0d5f0;
  }

  .game-title {
    flex: 1;
    text-align: center;
  }

  .game-title h1 {
    margin: 0;
    font-size: 1.5rem;
    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .game-title p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #9a8aaa;
  }

  .timer-bar {
    position: relative;
    height: 8px;
    background: #2a2035;
    border-radius: 4px;
    margin-bottom: 1rem;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: linear-gradient(90deg, #7c3aed, #a855f7);
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
    background: rgba(0, 0, 0, 0.9);
    padding: 2rem 3rem;
    border-radius: 16px;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }

  .prompt-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .start-prompt p {
    color: #e0d5f0;
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }

  .threshold-info {
    color: #9a8aaa;
    font-size: 0.85rem;
  }

  .canvas-wrapper {
    max-width: 900px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 40px rgba(168, 85, 247, 0.15);
  }

  canvas {
    display: block;
    width: 100%;
    height: auto;
    background: linear-gradient(180deg, #0a0510 0%, #150a20 100%);
    cursor: pointer;
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
    color: #6a5a7a;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #a855f7;
  }

  .stat-value.perfect {
    color: #34d399;
    text-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
  }

  .stat-value.virus {
    color: #a855f7;
  }

  .stat-value.danger {
    color: #f87171;
  }

  .stat-value.combo {
    color: #fbbf24;
  }

  .score-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 10, 30, 0.98);
    border: 1px solid rgba(168, 85, 247, 0.3);
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

  .grade-s { color: #fbbf24; text-shadow: 0 0 30px rgba(251, 191, 36, 0.8); }
  .grade-a { color: #a855f7; text-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
  .grade-b { color: #34d399; }
  .grade-c { color: #60a5fa; }
  .grade-d { color: #f87171; }

  .gold-badge {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1a1a1a;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .final-score {
    font-size: 1.5rem;
    color: #e0d5f0;
    margin-bottom: 1.5rem;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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
    color: #9a8aaa;
    margin-bottom: 0.25rem;
  }

  .score-item .score-value {
    font-size: 1rem;
    font-weight: 700;
    color: #a855f7;
  }

  .skill-transfer {
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .transfer-label {
    display: block;
    font-size: 0.7rem;
    color: #a855f7;
    letter-spacing: 1px;
    margin-bottom: 0.25rem;
  }

  .transfer-target {
    color: #e0d5f0;
    font-size: 0.9rem;
  }

  .try-again-btn {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
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
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }
</style>
