<script>
  import { onMount, onDestroy } from 'svelte';
  import SimModuleWrapper from '../SimModuleWrapper.svelte';
  import { euclideanDistance, standardDeviation } from '../../lib/ScoringEngine.js';

  export let onComplete;
  export let onBack;
  export let backgroundImageUrl = '/assets/images/hydrodissection-background.svg';

  let wrapper;
  let canvas;
  let ctx;
  let width = 800;
  let height = 500;

  const DIFFICULTY = {
    easy: { maxPressure: 80, flowTolerance: 0.3, zonularStressMax: 70 },
    normal: { maxPressure: 60, flowTolerance: 0.2, zonularStressMax: 50 },
    hard: { maxPressure: 45, flowTolerance: 0.15, zonularStressMax: 35 }
  };

  let difficulty = 'normal';
  $: config = DIFFICULTY[difficulty];

  // Anatomical elements
  const center = { x: 400, y: 250 };
  const lensRadius = 100;
  const capsuleRadius = 110;
  const zonuleCount = 12;
  
  // Injection point
  const injectionZone = { x: 280, y: 200, radius: 25 };
  
  // Game state
  let gameState = 'ready';
  let isInjecting = false;
  let currentPoint = null;
  let injectionStart = null;
  
  // Fluid dynamics
  let fluidWaveProgress = 0;        // 0-360 degrees around lens
  let fluidWaveVisible = false;
  let totalFluidInjected = 0;
  let currentFlowRate = 0;
  let flowRateHistory = [];
  
  // Pressure & stress (SENSORY SUBSTITUTION)
  let chamberPressure = 30;         // Normal IOP ~15-20, we start slightly elevated
  let zonularStress = 0;            // 0-100
  let zonularStressPoints = [];     // Per-zonule stress
  let peakZonularStress = 0;
  
  // Clinical indicators
  let waveQuality = 'none';         // 'none', 'partial', 'complete', 'excessive'
  let separationStatus = 'attached'; // 'attached', 'separating', 'complete', 'dialysis-risk'
  
  let score = null;
  let feedbackMessage = 'Position cannula in injection zone and begin fluid injection.';
  let feedbackType = 'info';
  
  // Animation
  let animationFrame = null;
  let lastTime = 0;

  // Initialize zonular stress points
  function initZonules() {
    zonularStressPoints = [];
    for (let i = 0; i < zonuleCount; i++) {
      zonularStressPoints.push({
        angle: (i / zonuleCount) * Math.PI * 2,
        stress: 0,
        intact: true
      });
    }
  }
  initZonules();

  function handlePointerStart(e) {
    if (gameState === 'complete' || gameState === 'failed') return;
    
    const { point } = e.detail;
    const distToZone = euclideanDistance(point, injectionZone);
    
    if (distToZone < injectionZone.radius) {
      injectionStart = point;
      isInjecting = true;
      gameState = 'injecting';
      feedbackMessage = 'Injecting... Control pressure with stylus pressure.';
      feedbackType = 'info';
    }
    
    render();
  }

  function handlePointerMove(e) {
    if (!isInjecting) return;
    
    const { raw, velocity } = e.detail;
    currentPoint = raw;
    
    // Calculate flow rate based on pressure (stylus pressure = injection force)
    const pressure = raw.pressure || 0.5;
    currentFlowRate = pressure;
    flowRateHistory.push(currentFlowRate);
    
    // Update chamber pressure based on flow
    const pressureIncrease = currentFlowRate * 2;
    chamberPressure = Math.min(100, 30 + pressureIncrease * 50);
    
    // Inject fluid and progress wave
    if (currentFlowRate > 0.1) {
      const fluidIncrement = currentFlowRate * 0.8;
      totalFluidInjected += fluidIncrement;
      
      // Fluid wave progresses around the lens
      if (totalFluidInjected > 5) {
        fluidWaveVisible = true;
        fluidWaveProgress = Math.min(360, totalFluidInjected * 3);
      }
      
      // Calculate zonular stress based on flow rate and pressure
      updateZonularStress(currentFlowRate, chamberPressure);
    }
    
    // Update wave quality
    updateWaveQuality();
    
    // Check for complications
    checkComplications();
    
    // Update feedback
    updateFeedback();
    
    render();
  }

  function handlePointerEnd(e) {
    if (!isInjecting) return;
    
    isInjecting = false;
    currentFlowRate = 0;
    
    // Check completion
    if (fluidWaveProgress >= 350 && zonularStress < config.zonularStressMax) {
      triggerSuccess();
    } else if (fluidWaveProgress < 180) {
      feedbackMessage = 'Incomplete wave. Continue injection or try again.';
      feedbackType = 'info';
      gameState = 'ready';
    }
    
    render();
  }

  function updateZonularStress(flowRate, pressure) {
    // Higher flow = more stress on zonules
    const baseStress = flowRate * 30 + (pressure - 30) * 0.5;
    
    // Stress concentrates on zonules near injection point
    zonularStressPoints.forEach((zonule, i) => {
      const angleToInjection = Math.atan2(
        injectionZone.y - center.y,
        injectionZone.x - center.x
      );
      const angleDiff = Math.abs(zonule.angle - angleToInjection);
      const proximity = 1 - Math.min(angleDiff, Math.PI * 2 - angleDiff) / Math.PI;
      
      // More stress on zonules near injection and opposite side
      const stressMultiplier = 0.5 + proximity * 0.5;
      zonule.stress = Math.min(100, zonule.stress + baseStress * stressMultiplier * 0.1);
      
      if (zonule.stress > 90) {
        zonule.intact = false; // Zonular dialysis!
      }
    });
    
    // Overall zonular stress
    zonularStress = Math.max(...zonularStressPoints.map(z => z.stress));
    peakZonularStress = Math.max(peakZonularStress, zonularStress);
  }

  function updateWaveQuality() {
    if (fluidWaveProgress < 90) {
      waveQuality = 'none';
      separationStatus = 'attached';
    } else if (fluidWaveProgress < 270) {
      waveQuality = 'partial';
      separationStatus = 'separating';
    } else if (fluidWaveProgress < 360) {
      waveQuality = 'complete';
      separationStatus = 'separating';
    } else {
      waveQuality = 'complete';
      separationStatus = 'complete';
    }
    
    // Check for excessive pressure
    if (chamberPressure > config.maxPressure) {
      waveQuality = 'excessive';
    }
    
    // Check for dialysis risk
    if (zonularStress > config.zonularStressMax) {
      separationStatus = 'dialysis-risk';
    }
  }

  function checkComplications() {
    // Zonular dialysis
    const damagedZonules = zonularStressPoints.filter(z => !z.intact).length;
    if (damagedZonules >= 2) {
      triggerFailure('zonular-dialysis');
      return;
    }
    
    // Excessive pressure
    if (chamberPressure > 95) {
      triggerFailure('pressure-spike');
      return;
    }
  }

  function updateFeedback() {
    if (separationStatus === 'dialysis-risk') {
      feedbackMessage = `⚠️ ZONULAR STRESS: ${Math.round(zonularStress)}% - Reduce pressure!`;
      feedbackType = 'error';
    } else if (chamberPressure > config.maxPressure) {
      feedbackMessage = `⚠️ HIGH PRESSURE: ${Math.round(chamberPressure)}mmHg - Ease injection!`;
      feedbackType = 'error';
    } else if (waveQuality === 'partial') {
      feedbackMessage = `Wave ${Math.round(fluidWaveProgress)}° - Continue steady injection`;
      feedbackType = 'info';
    } else if (waveQuality === 'complete') {
      feedbackMessage = `✓ Complete wave achieved! Release to finish.`;
      feedbackType = 'success';
    } else {
      feedbackMessage = `Injecting... Flow: ${Math.round(currentFlowRate * 100)}%`;
      feedbackType = 'info';
    }
  }

  function triggerSuccess() {
    gameState = 'complete';
    
    const flowUniformity = 100 - standardDeviation(flowRateHistory) * 200;
    const pressureControl = Math.max(0, 100 - (chamberPressure - 30));
    const zonularSafety = Math.max(0, 100 - peakZonularStress);
    const waveComplete = fluidWaveProgress >= 350 ? 100 : (fluidWaveProgress / 350) * 100;
    
    const overall = Math.round(
      flowUniformity * 0.25 +
      pressureControl * 0.25 +
      zonularSafety * 0.30 +
      waveComplete * 0.20
    );
    
    score = {
      overall,
      flowUniformity: Math.round(flowUniformity),
      pressureControl: Math.round(pressureControl),
      zonularSafety: Math.round(zonularSafety),
      waveCompletion: Math.round(waveComplete),
      peakPressure: Math.round(chamberPressure),
      peakZonularStress: Math.round(peakZonularStress),
      status: overall >= 80 ? 'EXCELLENT!' : overall >= 60 ? 'GOOD' : 'NEEDS PRACTICE'
    };
    
    feedbackMessage = 'Hydrodissection complete! Lens fully separated.';
    feedbackType = 'success';
    
    if (onComplete) onComplete(score);
  }

  function triggerFailure(reason) {
    gameState = 'failed';
    
    if (reason === 'zonular-dialysis') {
      feedbackMessage = '🔴 FAILURE: Zonular Dialysis! Multiple zonules damaged.';
    } else if (reason === 'pressure-spike') {
      feedbackMessage = '🔴 FAILURE: Pressure Spike! Risk of capsular rupture.';
    }
    feedbackType = 'error';
    
    score = {
      overall: 0,
      flowUniformity: 0,
      pressureControl: 0,
      zonularSafety: 0,
      waveCompletion: Math.round((fluidWaveProgress / 360) * 100),
      status: `FAILED - ${reason.replace('-', ' ').toUpperCase()}`
    };
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Draw lens (crystalline lens)
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, lensRadius, lensRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 180, 140, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180, 160, 120, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw capsule
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, capsuleRadius, capsuleRadius * 0.75, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 150, 180, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw zonules
    zonularStressPoints.forEach((zonule, i) => {
      const innerX = center.x + Math.cos(zonule.angle) * capsuleRadius;
      const innerY = center.y + Math.sin(zonule.angle) * capsuleRadius * 0.75;
      const outerX = center.x + Math.cos(zonule.angle) * (capsuleRadius + 30);
      const outerY = center.y + Math.sin(zonule.angle) * (capsuleRadius * 0.75 + 25);
      
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      
      if (!zonule.intact) {
        ctx.strokeStyle = '#f87171';
        ctx.setLineDash([3, 3]);
      } else if (zonule.stress > 60) {
        ctx.strokeStyle = '#fbbf24';
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = 'rgba(150, 180, 200, 0.5)';
        ctx.setLineDash([]);
      }
      ctx.lineWidth = zonule.intact ? 2 : 1;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw fluid wave
    if (fluidWaveVisible && fluidWaveProgress > 0) {
      const startAngle = Math.PI; // Start from injection side
      const endAngle = startAngle + (fluidWaveProgress * Math.PI / 180);
      
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, lensRadius + 5, (lensRadius + 5) * 0.7, 0, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Wave front glow
      const frontX = center.x + Math.cos(endAngle) * (lensRadius + 5);
      const frontY = center.y + Math.sin(endAngle) * (lensRadius + 5) * 0.7;
      ctx.beginPath();
      ctx.arc(frontX, frontY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.fill();
    }

    // Draw injection zone
    ctx.beginPath();
    ctx.arc(injectionZone.x, injectionZone.y, injectionZone.radius, 0, Math.PI * 2);
    ctx.fillStyle = gameState === 'injecting' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 191, 36, 0.2)';
    ctx.fill();
    ctx.strokeStyle = gameState === 'injecting' ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Cannula tip
    if (currentPoint && isInjecting) {
      ctx.beginPath();
      ctx.moveTo(injectionZone.x - 30, injectionZone.y - 20);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.strokeStyle = '#c0c0c0';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(currentPoint.x, currentPoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    // =====================================================
    // SENSORY SUBSTITUTION: Pressure & Stress Gauges
    // =====================================================
    
    // Chamber Pressure Gauge
    const pressureX = 20;
    const pressureY = 100;
    const gaugeHeight = 200;
    const gaugeWidth = 25;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(pressureX, pressureY, gaugeWidth, gaugeHeight);
    
    // Danger zone
    ctx.fillStyle = 'rgba(248, 113, 113, 0.2)';
    ctx.fillRect(pressureX, pressureY, gaugeWidth, gaugeHeight * 0.3);
    
    // Warning zone
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.fillRect(pressureX, pressureY + gaugeHeight * 0.3, gaugeWidth, gaugeHeight * 0.2);
    
    // Safe zone
    ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
    ctx.fillRect(pressureX, pressureY + gaugeHeight * 0.5, gaugeWidth, gaugeHeight * 0.5);
    
    // Current pressure
    const pressureFill = (chamberPressure / 100) * gaugeHeight;
    const pressureColor = chamberPressure > config.maxPressure ? '#f87171' : 
                          chamberPressure > config.maxPressure * 0.8 ? '#fbbf24' : '#34d399';
    ctx.fillStyle = pressureColor;
    ctx.fillRect(pressureX, pressureY + gaugeHeight - pressureFill, gaugeWidth, pressureFill);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeRect(pressureX, pressureY, gaugeWidth, gaugeHeight);
    
    // Labels
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('IOP', pressureX, pressureY - 10);
    ctx.fillStyle = pressureColor;
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`${Math.round(chamberPressure)}`, pressureX, pressureY + gaugeHeight + 15);

    // Zonular Stress Gauge
    const stressX = 55;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(stressX, pressureY, gaugeWidth, gaugeHeight);
    
    const stressFill = (zonularStress / 100) * gaugeHeight;
    const stressColor = zonularStress > config.zonularStressMax ? '#f87171' : 
                        zonularStress > config.zonularStressMax * 0.7 ? '#fbbf24' : '#34d399';
    ctx.fillStyle = stressColor;
    ctx.fillRect(stressX, pressureY + gaugeHeight - stressFill, gaugeWidth, stressFill);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeRect(stressX, pressureY, gaugeWidth, gaugeHeight);
    
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '9px system-ui';
    ctx.fillText('Zonule', stressX, pressureY - 10);
    ctx.fillStyle = stressColor;
    ctx.font = 'bold 11px system-ui';
    ctx.fillText(`${Math.round(zonularStress)}%`, stressX, pressureY + gaugeHeight + 15);

    // Wave Progress Arc
    const waveX = width - 80;
    const waveY = 150;
    const waveRadius = 40;
    
    ctx.beginPath();
    ctx.arc(waveX, waveY, waveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(waveX, waveY, waveRadius, -Math.PI / 2, -Math.PI / 2 + (fluidWaveProgress / 360) * Math.PI * 2);
    ctx.strokeStyle = fluidWaveProgress >= 350 ? '#34d399' : '#60a5fa';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.fillStyle = '#e0f5f0';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(fluidWaveProgress)}°`, waveX, waveY + 5);
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '9px system-ui';
    ctx.fillText('Wave', waveX, waveY + 55);

    // Status indicator
    ctx.fillStyle = '#7aa8a0';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Separation: ${separationStatus}`, width - 130, height - 30);
  }

  function reset() {
    gameState = 'ready';
    isInjecting = false;
    currentPoint = null;
    injectionStart = null;
    fluidWaveProgress = 0;
    fluidWaveVisible = false;
    totalFluidInjected = 0;
    currentFlowRate = 0;
    flowRateHistory = [];
    chamberPressure = 30;
    zonularStress = 0;
    peakZonularStress = 0;
    waveQuality = 'none';
    separationStatus = 'attached';
    score = null;
    feedbackMessage = 'Position cannula in injection zone and begin fluid injection.';
    feedbackType = 'info';
    initZonules();
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
      <h1>Hydrodissection Control</h1>
      <p>Inject fluid to separate lens from capsule. Watch zonular stress!</p>
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
    backgroundOverlayOpacity={0.15}
    on:pointerstart={handlePointerStart}
    on:pointermove={handlePointerMove}
    on:pointerend={handlePointerEnd}
  >
    <canvas bind:this={canvas} {width} {height} style="width: 100%; height: 100%;"></canvas>
  </SimModuleWrapper>

  <div class="stats-bar">
    <span>Max Pressure: {config.maxPressure}mmHg</span>
    <span>Zonular Limit: {config.zonularStressMax}%</span>
    <span>Wave Target: 350°+</span>
  </div>

  {#if score}
    <div class="score-panel" class:success={score.status.includes('EXCELLENT')} class:failed={gameState === 'failed'}>
      <h2>{score.status}</h2>
      <div class="score-grid">
        <div class="score-item"><span class="score-label">Overall</span><span class="score-value">{score.overall}%</span></div>
        <div class="score-item"><span class="score-label">Flow Control</span><span class="score-value">{score.flowUniformity}%</span></div>
        <div class="score-item"><span class="score-label">Pressure</span><span class="score-value">{score.pressureControl}%</span></div>
        <div class="score-item"><span class="score-label">Zonular Safety</span><span class="score-value">{score.zonularSafety}%</span></div>
        <div class="score-item"><span class="score-label">Wave Complete</span><span class="score-value">{score.waveCompletion}%</span></div>
        {#if score.peakPressure}
          <div class="score-item" class:warning={score.peakPressure > 60}><span class="score-label">Peak IOP</span><span class="score-value">{score.peakPressure}</span></div>
        {/if}
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
  .score-panel.failed { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.2); }
  .score-panel h2 { margin: 0 0 1rem; text-align: center; color: #e0f5f0; }
  .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 1rem; }
  .score-item { text-align: center; padding: 1rem; background: rgba(15,184,159,0.1); border-radius: 12px; }
  .score-item.warning { background: rgba(251,191,36,0.15); }
  .score-item.warning .score-value { color: #fbbf24; }
  .score-label { display: block; font-size: 0.7rem; color: #7aa8a0; margin-bottom: 0.5rem; }
  .score-value { font-size: 1.2rem; font-weight: 700; color: #0fb89f; }
  .try-again-btn { display: block; width: 100%; max-width: 200px; margin: 1.5rem auto 0; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #0a7c6d 0%, #0fb89f 100%); border: none; border-radius: 10px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .try-again-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(15,184,159,0.3); }
</style>
