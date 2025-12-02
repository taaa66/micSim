<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { currentModuleContext } from '../lib/contextStore.js';
  import { audio } from '../lib/audio.js';
  import TorqueGauge from './TorqueGauge.svelte';
  import OrganicBackground from './OrganicBackground.svelte';
  import ModuleIcons from './ModuleIcons.svelte';
  import UIIcons from './UIIcons.svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut, elasticOut } from 'svelte/easing';

  const dispatch = createEventDispatcher();

  // Modules ranked by Educational Value (Research-Based)
  // Rank 1-5: CORE (Must-Have) | Rank 6-8: USEFUL | Rank 9-11: Optional/Low-Value
  const allModules = [
    // RANK 1: Capsulorhexis (Educational Value: 5/5, Frequency: 5/5, Complication: 5/5)
    { id: 'capsulorhexis', num: 1, name: 'CAPSULORHEXIS', code: 'CCC', goal: 'Continuous curvilinear capsular tear (5-5.5mm).', metrics: [{l:'PATH',v:95},{l:'FORCE',v:88},{l:'CIRC',v:92}], mastery: 95, completed: true, core: true, rank: 1, pgyStage: 'PGY-2 Early', difficulty: 'CRITICAL', skills: ['Path Accuracy','Stability','Angle Control'], prevents: ['Capsule Runout','PCR (Posterior Capsule Rupture)','Radial Tear Extension'], hapticNote: 'Limited - Requires visual force feedback' },
    
    // RANK 2: Corneal Tunnel (Educational Value: 4/5, Frequency: 5/5, Complication: 4/5)
    { id: 'corneal-tunnel', num: 2, name: 'CORNEAL TUNNEL', code: 'C-TUNEL', goal: 'Self-sealing bi-planar incision.', metrics: [{l:'ANGLE',v:65},{l:'DEPTH',v:70},{l:'SEAL',v:60}], mastery: 65, completed: false, core: true, rank: 2, pgyStage: 'PGY-2 Mid', difficulty: 'HIGH', skills: ['Angle Control','Depth Control','Path Accuracy'], prevents: ['Wound Leakage','Surgically Induced Astigmatism','Thermal Burn','Iris Incarceration'] },
    
    // RANK 3: Micro-Tremor Control (Educational Value: 4/5, Frequency: 5/5, Complication: 3/5)
    { id: 'micro-tremor', num: 3, name: 'MICRO-TREMOR', code: 'MT-CTRL', goal: 'Suppress physiologic tremor in target zones.', metrics: [{l:'STAB',v:85},{l:'ACC',v:92},{l:'TREM',v:78}], mastery: 85, completed: true, core: true, rank: 3, pgyStage: 'PGY-2 Early', difficulty: 'FUNDAMENTAL', skills: ['Tremor Suppression','Stability','Spatial Accuracy'], prevents: ['Iatrogenic Injury','Instrument Slippage','Capsular/Iris Damage'], hapticNote: 'Ideal for stylus - Pure kinematics' },
    
    // RANK 4: Tissue Grasping (Educational Value: 3/5, Frequency: 5/5, Complication: 2/5)
    { id: 'tissue-grasping', num: 4, name: 'TISSUE GRASP', code: 'T-GRASP', goal: 'Controlled grasping without crush injury.', metrics: [{l:'FORCE',v:70},{l:'PRESS',v:88},{l:'HOLD',v:95}], mastery: 72, completed: false, core: true, rank: 4, pgyStage: 'PGY-2 Early', difficulty: 'FOUNDATIONAL', skills: ['Grasping Force Control','Pressure Sensing','Hand-Eye Coordination'], prevents: ['Capsule Crush','Iris Trauma','Endothelial Cell Damage'], hapticNote: 'Requires force quantification display' },
    
    // RANK 5: Needle Angle (Educational Value: 3/5, Frequency: 3/5, Complication: 4/5)
    { id: 'needle-angle', num: 5, name: 'NEEDLE ANGLE', code: 'N-ANGLE', goal: 'Precise paracentesis & IVT injection angles.', metrics: [{l:'ANGLE',v:92},{l:'DEPTH',v:85},{l:'TRACT',v:90}], mastery: 92, completed: true, core: true, rank: 5, pgyStage: 'PGY-2 Mid', difficulty: 'IMPORTANT', skills: ['Angle Control','Depth Control','Counter-Traction'], prevents: ['Retinal Damage (IVT)','Lens Touch','Wound Architecture Failure'] },
    
    // RANK 6: Corneal Suture Placement (Educational Value: 3/5, Frequency: 3/5, Complication: 5/5)
    { id: 'corneal-suture', num: 6, name: 'SUTURE PLACE', code: 'S-PLACE', goal: 'Symmetric depth & uniform bite length.', metrics: [{l:'SYM',v:75},{l:'DEPTH',v:80},{l:'BITE',v:70}], mastery: 75, completed: false, rank: 6, pgyStage: 'PGY-3 Mid', difficulty: 'HIGH', skills: ['Angle Control','Depth Uniformity','Path Accuracy'], prevents: ['Astigmatism','Wound Gape','Cheese-Wiring'], note: 'Core for Cornea Track' },
    
    // RANK 7: Suture Tension (Educational Value: 4/5, Frequency: 3/5, Complication: 5/5)
    { id: 'suture-tension', num: 7, name: 'SUTURE TENS', code: 'S-TENS', goal: 'Optimal knot tension (visual force gauge).', metrics: [{l:'TENS',v:88},{l:'CONS',v:85},{l:'GAPE',v:90}], mastery: 88, completed: true, rank: 7, pgyStage: 'PGY-3 Late', difficulty: 'REFINEMENT', skills: ['Tension Control','Consistency','Force Sensing'], prevents: ['Wound Gape','Astigmatism','Tissue Necrosis'], hapticNote: 'High haptic demand - Sensory substitution required' },
    
    // RANK 8: Gas/Liquid Injection (Educational Value: 2/5, Frequency: 2/5, Complication: 3/5)
    { id: 'gas-injection', num: 8, name: 'GAS/LIQ INJ', code: 'FL-INJK', goal: 'Controlled flow rate & IOP management.', metrics: [{l:'FLOW',v:60},{l:'PRESS',v:65},{l:'STAB',v:70}], mastery: 60, completed: false, rank: 8, pgyStage: 'PGY-4 Early', difficulty: 'NICHE', skills: ['Flow Rate Regulation','Pressure Control','Angle Stability'], prevents: ['IOP Spike','Descemet Membrane Detachment','Retinal Damage'], note: 'Core for Retina Track' },
    
    // RANK 9: Corneal Arc (Educational Value: 1/5, Frequency: 1/5, Complication: 2/5)
    { id: 'corneal-arc', num: 9, name: 'CORNEAL ARC', code: 'ARC-CUT', goal: 'Limbal relaxing incisions (elective).', metrics: [{l:'PATH',v:40},{l:'DEPTH',v:50},{l:'SLIP',v:45}], mastery: 40, completed: false, rank: 9, pgyStage: 'PGY-4 Optional', difficulty: 'ELECTIVE', skills: ['Path Precision','Depth Control','Slip Prevention'], prevents: ['Over-Correction','Perforation','Irregular Astigmatism'], note: 'Low educational value - Refractive only' },
    
    // RANK 10: Reflex/Floaters (Educational Value: 1/5, Frequency: 1/5, Complication: 1/5)
    { id: 'reflex-floaters', num: 10, name: 'REFLEX/REACT', code: 'RLX-RCT', goal: 'YAG vitreolysis targeting (diagnostic).', metrics: [{l:'REACT',v:98},{l:'ACC',v:95},{l:'STAB',v:92}], mastery: 98, completed: true, rank: 10, pgyStage: 'N/A', difficulty: 'NON-SURGICAL', skills: ['Reaction Time','Target Acquisition','Stabilization'], prevents: ['N/A - Not surgical motor skill'], note: 'NOT RECOMMENDED - Laser procedure, not surgical' },
    
    // RANK 6 (ESSENTIAL MISSING): Hydrodissection Control
    { id: 'hydrodissection', num: 11, name: 'HYDRODISSECT', code: 'H-DISS', goal: 'Controlled fluid wave visualization.', metrics: [{l:'FLOW',v:45},{l:'PRESS',v:60},{l:'WAVE',v:50}], mastery: 45, completed: false, core: true, rank: 6, pgyStage: 'PGY-2 Mid', difficulty: 'ESSENTIAL', skills: ['Flow Control','Pressure Sensing','Wave Visualization'], prevents: ['Zonular Dialysis','Zonular Stress','Incomplete Cortical Separation'], note: 'ESSENTIAL MISSING MODULE - Prevents zonular complications' }
  ];

  let selectedModule = null;
  let hoveredModule = null;
  let trainingProgress = 78;

  // === BOOT SEQUENCE STATE ===
  let bootPhase = 0; // 0=black, 1=title, 2=eye, 3=modules, 4=footer, 5=ready
  let modulesVisible = [];
  let latencyValue = 38;
  let dotFlashCount = 0;

  // === TRACE LINE STATE (to Apex panel) ===
  let traceActive = false;
  let trace = { x1: 0, y1: 0, x2: 0, y2: 0, len: 0 };

  // V12: system status & ambient AO
  let systemStatus = 'NOMINAL';
  let supportsStrokeAnim = true;
  let tensionRate = 0;
  let tensionTimer = null;
  let unselectingId = null;

  onMount(() => {
    // Phase 1: Title scanline (0-800ms)
    setTimeout(() => bootPhase = 1, 100);
    // Phase 2: Eye projection (800-1200ms)
    setTimeout(() => bootPhase = 2, 800);
    // Phase 3: Modules build sequentially (1200-2000ms)
    setTimeout(() => bootPhase = 3, 1200);
    allModules.forEach((_, i) => {
      setTimeout(() => {
        modulesVisible = [...modulesVisible, i];
      }, 1200 + i * 70);
    });
    // Phase 4: Footer slides up (2000ms)
    setTimeout(() => bootPhase = 4, 2000);
    // Dot flash animation
    setTimeout(() => { dotFlashCount = 1; }, 2100);
    setTimeout(() => { dotFlashCount = 2; }, 2200);
    setTimeout(() => { dotFlashCount = 3; }, 2300);
    // Phase 5: Ready
    setTimeout(() => bootPhase = 5, 2400);

    // Latency flicker effect
    setInterval(() => {
      latencyValue = 35 + Math.floor(Math.random() * 8);
    }, 150);

    // AO status from latency heuristic
    setInterval(() => {
      systemStatus = latencyValue > 150 ? 'WARNING' : 'NOMINAL';
    }, 300);

    // Stroke animation fallback detection
    try {
      supportsStrokeAnim = !!(window.CSS && CSS.supports && CSS.supports('transition', 'stroke-dashoffset 0.8s ease'));
    } catch (_) { supportsStrokeAnim = false; }

    // V11 zero-scroll QA (post-boot)
    setTimeout(() => {
      const de = document.documentElement;
      const hasH = de.scrollWidth > de.clientWidth;
      const hasV = de.scrollHeight > de.clientHeight;
      if (hasH || hasV) {
        console.warn('[QA][Scroll] Detected scrollbar', { hasH, hasV });
      }
    }, 3000);
  });

  // V12: Simulate Tension Delta while capsulorhexis detail is open
  $: if (selectedModule && selectedModule.id === 'capsulorhexis') {
    clearInterval(tensionTimer);
    tensionTimer = setInterval(() => {
      const drift = (latencyValue / 200) + (Math.random() - 0.5) * 2;
      tensionRate = Math.max(0, Math.min(100, tensionRate + drift));
    }, 220);
  } else {
    clearInterval(tensionTimer);
    tensionRate = 0;
  }

  async function selectModule(m) { 
    selectedModule = m;
    // V11 DCS: set immutable integer payload to global context before UI refresh
    try { currentModuleContext.set(m.num); } catch (_) {}
    // V12: sonic click and init
    try { audio.init(); audio.click(); } catch (_) {}
    dispatch('moduleHover', m);
    await tick();
    const moduleEl = document.querySelector(`.module-card[data-module="${m.id}"]`);
    const apexEl = document.querySelector('.apex-panel');
    if (moduleEl && apexEl) {
      const mr = moduleEl.getBoundingClientRect();
      const ar = apexEl.getBoundingClientRect();
      const x1 = mr.left + mr.width / 2;
      const y1 = mr.top + mr.height / 2;
      const x2 = ar.left + 8;
      const y2 = ar.top + Math.min(ar.height, window.innerHeight - ar.top) / 2;
      const len = Math.hypot(x2 - x1, y2 - y1);
      trace = { x1, y1, x2, y2, len };
      traceActive = false;
      requestAnimationFrame(() => { traceActive = true; try { audio.chime(); } catch (_) {} });
    } else {
      traceActive = false;
    }
  }
  
  function closeDetail() {
    if (selectedModule) {
      unselectingId = selectedModule.id;
      setTimeout(() => { unselectingId = null; }, 260);
    }
    selectedModule = null;
  }
  
  function launchModule() { 
    if (selectedModule) {
      dispatch('select', selectedModule);
      selectedModule = null;
    }
  }
  
  function handleModuleHover(m) {
    hoveredModule = m;
    if (m) dispatch('moduleHover', m);
  }

  // Custom transition for modules
  function moduleIn(node, { delay = 0 }) {
    return {
      delay,
      duration: 300,
      easing: cubicOut,
      css: (t) => `
        opacity: ${t};
        transform: rotate(var(--angle)) translateX(calc(var(--radius) * ${0.5 + t * 0.5})) rotate(calc(-1 * var(--angle))) scale(${0.6 + t * 0.4});
      `
    };
  }
</script>

<div class="dashboard" class:booting={bootPhase < 5}>
  <!-- Organic Background Layer -->
  <OrganicBackground />
  
  <!-- Header - 2028 Professional Design -->
  <header class="header" class:visible={bootPhase >= 1}>
    <div class="header-left">
      <div class="brand-logo">
        <UIIcons icon="eye" size={28} color="var(--primary-400)" />
        <span class="brand-mark">OS+</span>
      </div>
    </div>
    <div class="header-center">
      <h1 class="brand-title">
        OphthalmoSim<span class="brand-plus">+</span>
      </h1>
      <p class="brand-tagline">
        Surgical Training Platform
      </p>
    </div>
    <div class="header-right">
      <div class="header-status">
        <span class="status-dot"></span>
        <span class="status-text">Online</span>
      </div>
      <button class="header-avatar">
        <UIIcons icon="user" size={18} color="var(--neutral-100)" />
      </button>
    </div>

  {#if traceActive}
    <div class="trace-overlay" aria-hidden="true">
      <svg class="trace-svg" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} preserveAspectRatio="none">
        <line class="trace-line" class:active={traceActive}
          x1={trace.x1} y1={trace.y1} x2={trace.x2} y2={trace.y2}
          style={`--len:${trace.len}px`} />
      </svg>
    </div>
  {/if}

  <!-- V12 Torque Vector Gauge near Module 7 -->
  <TorqueGauge />
    <span class="session-id">SID: 0x4F7A</span>
  </header>

  <!-- Main Circular Container -->
  <div class="main-container" class:dim={!!selectedModule}>
    <!-- V12 Ambient AO overlay -->
    <div class="ambient-ao" class:warning={systemStatus==='WARNING'} aria-hidden="true"></div>
    <!-- Technical Data Flow Lines -->
    <svg class="data-flow" viewBox="-50 -50 100 100">
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(0,255,255,0)" />
          <stop offset="50%" stop-color="rgba(0,255,255,0.5)" />
          <stop offset="100%" stop-color="rgba(0,255,255,0)" />
        </linearGradient>
      </defs>
      {#each allModules as _, i}
        {@const a = -90 + i * 360 / allModules.length}
        {@const r = a * Math.PI / 180}
        <line class="flow-line" x1="0" y1="0" x2={38 * Math.cos(r)} y2={38 * Math.sin(r)} 
          stroke="rgba(0,255,255,0.2)" stroke-width="0.4"/>
        <line class="flow-pulse" x1="0" y1="0" x2={38 * Math.cos(r)} y2={38 * Math.sin(r)} 
          stroke="url(#flowGrad)" stroke-width="0.6" style="--delay: {i * 0.15}s"/>
      {/each}
      <circle cx="0" cy="0" r="12" stroke="rgba(0,255,255,0.25)" stroke-width="0.3" fill="none" class="orbit-ring"/>
      <circle cx="0" cy="0" r="25" stroke="rgba(0,255,255,0.15)" stroke-width="0.2" fill="none" class="orbit-ring"/>
    </svg>

    <!-- Central Eye with projection animation -->
    {#if bootPhase >= 2}
      <div class="eye" in:scale={{ duration: 400, easing: elasticOut, start: 0.3 }}>
        <div class="eye-outer">
          <div class="eye-glow"></div>
          {#if bootPhase === 2}
            <div class="eye-burst"></div>
          {/if}
          <div class="iris">
            <div class="pupil" class:active={hoveredModule}>
              <div class="reflection"></div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Module Cards - Positioned in Circle with sequential build -->
    {#each allModules as m, i}
      {@const angle = -90 + (i * 360 / allModules.length)}
      {#if modulesVisible.includes(i)}
        <button
          class="module-card"
          class:selected={selectedModule?.id === m.id}
          class:completed={m.completed}
          class:core={m.core}
          class:hovered={hoveredModule?.id === m.id}
          class:unselecting={unselectingId === m.id}
          style="--angle: {angle}deg; --index: {i};"
          data-module={m.id}
          in:moduleIn={{ delay: 0 }}
          on:click={() => selectModule(m)}
          on:mouseenter={() => handleModuleHover(m)}
          on:mouseleave={() => handleModuleHover(null)}
        >
          <!-- Progress Ring with animated fill -->
          <svg class="prog-ring" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(0,255,255,0.15)" stroke-width="2"/>
            <circle class="prog-fill" class:no-anim={!supportsStrokeAnim} cx="20" cy="20" r="17" fill="none" stroke="var(--cyan-400)" stroke-width="2.5"
              stroke-dasharray="107" stroke-dashoffset="var(--offset)"
              stroke-linecap="round" transform="rotate(-90 20 20)"
              style="--offset: {107 - (107 * m.mastery / 100)}"/>
          </svg>
          
          <!-- Module Icon -->
          <div class="module-icon">
            <ModuleIcons moduleId={m.id} size={20} color="var(--cyan-400)" />
          </div>
          
          <span class="icon-num">{m.num}</span>

          <!-- Content -->
          <div class="card-content">
            <span class="card-name">{m.name}</span>
            <span class="card-code">{m.code}</span>
            {#if m.completed}<span class="check">✓</span>{/if}
          </div>
        </button>
      {/if}
    {/each}
  </div>

  <!-- Detail Panel -->
  {#if selectedModule}
    <div class="overlay" transition:fade={{ duration: 150 }} on:click={closeDetail} on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') closeDetail(); }} role="button" tabindex="0">
      <div class="detail-panel" transition:fly={{ y: 30, duration: 200 }} on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
        <button class="close-btn" on:click={closeDetail}>×</button>
        <h2>{selectedModule.num}. {selectedModule.name}</h2>
        <span class="detail-code">{selectedModule.code}</span>
        <p class="detail-goal">{selectedModule.goal}</p>
        
        <div class="detail-stats">
          <div class="stat-box"><span>MASTERY</span><strong>{selectedModule.mastery}%</strong></div>
          <div class="stat-box"><span>STATUS</span><strong class={selectedModule.completed ? 'green' : 'amber'}>{selectedModule.completed ? 'COMPLETE' : 'IN PROGRESS'}</strong></div>
          {#if selectedModule.rank}
            <div class="stat-box rank"><span>RANK</span><strong class:core={selectedModule.rank <= 5}>#{selectedModule.rank}</strong></div>
          {/if}
        </div>
        
        <!-- Research-Based Metadata -->
        {#if selectedModule.pgyStage || selectedModule.difficulty}
          <div class="detail-meta">
            {#if selectedModule.pgyStage}
              <span class="meta-badge pgy">{selectedModule.pgyStage}</span>
            {/if}
            {#if selectedModule.difficulty}
              <span class="meta-badge difficulty" class:critical={selectedModule.difficulty === 'CRITICAL'}>
                {selectedModule.difficulty}
              </span>
            {/if}
          </div>
        {/if}
        
        {#if selectedModule.hapticNote}
          <div class="haptic-note">
            <span class="note-icon">ℹ️</span>
            <span class="note-text">{selectedModule.hapticNote}</span>
          </div>
        {/if}

        {#if selectedModule.id === 'capsulorhexis'}
          <div class="detail-section">
            <h4>TENSION DELTA</h4>
            <div class="tension-gauge" style="--v:{tensionRate}">
              <svg viewBox="0 0 60 60">
                <defs>
                  <linearGradient id="tdg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#0fb89f" />
                    <stop offset="100%" stop-color="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle cx="30" cy="30" r="24" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"/>
                <circle class="td-fill" cx="30" cy="30" r="24" stroke="url(#tdg)" stroke-width="6" fill="none"
                  stroke-linecap="round" stroke-dasharray="151" stroke-dashoffset="calc(151 - (var(--v) * 1.51))" transform="rotate(-90 30 30)"/>
              </svg>
              <span class="td-label">{Math.round(tensionRate)}%</span>
            </div>
          </div>
        {/if}

        <div class="detail-section">
          <h4>SKILLS TRAINED</h4>
          <div class="tags">{#each selectedModule.skills as s}<span class="tag">{s}</span>{/each}</div>
        </div>

        <div class="detail-section risk">
          <h4>RISK MITIGATION</h4>
          <ul>{#each selectedModule.prevents as p}<li>⚠ {p}</li>{/each}</ul>
        </div>

        <button class="launch-btn" on:click={launchModule}>▶ LAUNCH MODULE</button>
      </div>
    </div>
  {/if}

  <!-- Quick Access Cards - 2028 Design -->
  {#if bootPhase >= 4}
    <div class="quick-access-panel" in:fly={{ y: 30, duration: 500, easing: cubicOut }}>
      <button class="quick-card" on:click={() => dispatch('coreGames')}>
        <div class="quick-icon games">🎮</div>
        <div class="quick-content">
          <span class="quick-title">Core Games</span>
          <span class="quick-desc">Motor Skills Training</span>
        </div>
        <span class="quick-arrow">→</span>
      </button>
      
      <button class="quick-card" on:click={() => dispatch('okapGames')}>
        <div class="quick-icon okap">📚</div>
        <div class="quick-content">
          <span class="quick-title">OKAP Prep</span>
          <span class="quick-desc">Knowledge Assessment</span>
        </div>
        <span class="quick-arrow">→</span>
      </button>
      
      <button class="quick-card" on:click={() => dispatch('rota')}>
        <div class="quick-icon rota">📅</div>
        <div class="quick-content">
          <span class="quick-title">My Schedule</span>
          <span class="quick-desc">Shifts & Planning</span>
        </div>
        <span class="quick-arrow">→</span>
      </button>
    </div>
  {/if}

  <!-- Footer with slide-up animation -->
  {#if bootPhase >= 4}
    <footer class="footer" in:fly={{ y: 50, duration: 300, easing: cubicOut }}>
      <div class="status-group">
        <span class="status operational">
          <i class="dot" class:flash={dotFlashCount > 0 && dotFlashCount < 4}></i>
          OPERATIONAL
        </span>
        <span class="divider">|</span>
        <span class="status latency">LATENCY: <span class="flicker">{latencyValue}</span>ms <span class="time-sig" class:amber={latencyValue>150}></span></span>
      </div>
      <div class="progress-section">
        <span>TRAINING: {trainingProgress}%</span>
        <div class="progress-bar"><div class="progress-fill" style="width:{trainingProgress}%"></div></div>
      </div>
      <div class="brand">
        <span>OPHTHALMO-SIM</span><span class="plus">+PLUS</span>
        <span class="divider">|</span>
        <span class="network-status">📶 SYNC</span>
      </div>
    </footer>
  {/if}
</div>

<style>
  .dashboard {
    /* 2028 Professional Design Variables */
    --bg: var(--bg-space, #0C0F14);
    --bg2: var(--bg-panel, #12161D);
    --accent: var(--primary-500, #14B8A6);
    --accent-bright: var(--primary-400, #26D4C4);
    --text: #FFFFFF;
    --text-muted: #8B9AAB;
    --gold: #F59E0B;
    --card-size: min(100px, 14vw);
    --radius: min(34vw, 34vh, 280px);
    
    width: 100%;
    height: 100vh;
    height: 100dvh;
    background: linear-gradient(180deg, var(--bg) 0%, #080A0E 100%);
    color: var(--text);
    font-family: var(--font-primary, 'Inter', -apple-system, sans-serif);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: clamp(16px, 3vmin, 28px);
    padding-bottom: calc(env(safe-area-inset-bottom) + clamp(16px, 3vmin, 28px));
  }
  .dashboard.booting {
    background: #000;
  }

  /* === 2028 PROFESSIONAL HEADER === */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: rgba(18, 22, 29, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    margin-bottom: 16px;
    z-index: 10;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .header.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .brand-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .brand-mark {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--primary-400, #26D4C4);
    letter-spacing: -0.02em;
  }
  
  .header-center { 
    text-align: center;
    flex: 1;
  }
  
  .brand-title {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: clamp(1.1rem, 3vw, 1.5rem);
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0;
    color: #FFFFFF;
  }
  
  .brand-plus {
    color: var(--primary-400, #26D4C4);
    font-weight: 700;
  }
  
  .brand-tagline {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted, #8B9AAB);
    margin: 2px 0 0;
    letter-spacing: 0.02em;
  }
  
  .header-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(20, 184, 166, 0.1);
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 20px;
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
    background: #10B981;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .status-text {
    font-size: 0.7rem;
    font-weight: 600;
    color: #10B981;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .header-avatar {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .header-avatar:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .session-id {
    font-size: 0.65rem;
    font-family: var(--font-mono, monospace);
    color: rgba(139, 154, 171, 0.4);
  }

  /* === MAIN CONTAINER === */
  .main-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Apex panel is now overlay, no margin needed */
    margin-right: 0;
    padding: clamp(6px, 2cqh, 16px) 10px;
    container-type: size;
    /* Recompute radius using container query units */
    --radius: min(38cqw, 42cqh, 300px);
    --base-dist: calc(var(--radius) * 0.98);
  }

  /* iPad Portrait optimization */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .main-container {
      --radius: min(42cqw, 38cqh, 280px);
    }
    .dashboard {
      --card-size: min(85px, 13vw);
    }
  }

  /* iPad Landscape - show panel on side */
  @media (min-width: 1024px) {
    .main-container {
      margin-right: min(320px, 30vw);
    }
  }
  
  /* Mobile - full width */
  @media (max-width: 767px) {
    .main-container {
      margin-right: 0;
      --radius: min(32vw, 28vh, 140px);
    }
    .dashboard {
      --card-size: min(56px, 14vw);
    }
    .card-name {
      font-size: clamp(5px, 2vw, 7px);
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }
    .card-code {
      font-size: 5px;
      padding: 0 2px;
    }
    .icon-num {
      font-size: 9px;
    }
    .module-icon {
      transform: scale(0.7);
    }
  }
  
  /* Very small phones (iPhone SE, etc) */
  @media (max-width: 400px) {
    .main-container {
      --radius: min(28vw, 24vh, 110px);
    }
    .dashboard {
      --card-size: min(48px, 12vw);
    }
    .card-name {
      font-size: 5px;
    }
  }

  /* Small-height tuning (iPad Safari UI visible) */
  @media (max-height: 700px) {
    .dashboard { --card-size: min(60px, 11vw); }
    .main-container { --radius: min(28vw, 28vh, 160px); }
  }
  
  /* iPhone landscape */
  @media (max-height: 500px) and (orientation: landscape) {
    .dashboard { --card-size: min(50px, 10vh); }
    .main-container { --radius: min(20vw, 35vh, 120px); }
    .header { padding: 4px 8px; }
  }

  /* === DATA FLOW - SIMPLE & STABLE === */
  .data-flow {
    position: absolute;
    width: calc(var(--radius) * 2.5);
    height: calc(var(--radius) * 2.5);
    pointer-events: none;
  }
  
  .flow-pulse {
    stroke-dasharray: 5 30;
    animation: flowStream 2s linear infinite;
    animation-delay: var(--delay, 0s);
  }
  
  @keyframes flowStream {
    0% { stroke-dashoffset: 40; opacity: 0; }
    50% { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }
  
  .orbit-ring {
    animation: orbitPulse 4s ease-in-out infinite;
  }
  
  @keyframes orbitPulse {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
  }

  /* === CENTRAL EYE with glow === */
  .eye {
    position: absolute;
    width: clamp(60px, 15vw, 100px);
    height: clamp(60px, 15vw, 100px);
    z-index: 5;
  }
  .eye-outer {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, var(--bg-elevated) 0%, var(--bg-space) 100%);
    border: 2px solid var(--cyan-400);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 40px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.1);
    position: relative;
    animation: eyePulse 3s ease-in-out infinite;
  }
  .eye-burst {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(52,211,153,0.35) 0%, rgba(52,211,153,0.0) 60%);
    filter: blur(4px);
    animation: eyeBurst 0.6s ease-out forwards;
  }
  @keyframes eyeBurst {
    0% { opacity: 0; transform: scale(0.7); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 0; transform: scale(1.3); }
  }
  @keyframes eyePulse {
    0%, 100% { box-shadow: 0 0 40px rgba(0,255,255,0.3), inset 0 0 20px rgba(0,255,255,0.1); }
    50% { box-shadow: 0 0 60px rgba(0,255,255,0.5), inset 0 0 30px rgba(0,255,255,0.15); }
  }
  .eye-glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 70%);
    border-radius: 50%;
    animation: glowPulse 2s ease-in-out infinite;
  }
  @keyframes glowPulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  .iris {
    width: 55%;
    height: 55%;
    border-radius: 50%;
    background: radial-gradient(circle, var(--cyan-800) 0%, var(--cyan-900) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 15px rgba(0,255,255,0.3);
  }
  .pupil {
    width: 50%;
    height: 50%;
    background: #000;
    border-radius: 50%;
    position: relative;
    transition: transform 0.3s ease;
  }
  .pupil.active {
    transform: scale(1.15);
  }
  .reflection {
    position: absolute;
    top: 20%;
    left: 25%;
    width: 30%;
    height: 30%;
    background: rgba(255,255,255,0.7);
    border-radius: 50%;
  }

  /* === MODULE CARDS with hover lift === */
  .module-card {
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--card-size);
    height: var(--card-size);
    --dist: var(--base-dist);
    transform: rotate(var(--angle)) translateX(var(--dist)) rotate(calc(-1 * var(--angle)));
    transform-origin: center center;
    margin-left: calc(var(--card-size) / -2);
    margin-top: calc(var(--card-size) / -2);
    
    background: 
      linear-gradient(135deg, rgba(52,211,153,0.04) 0%, transparent 100%),
      radial-gradient(circle at 30% 30%, rgba(15, 30, 35, 0.98), rgba(8, 20, 25, 0.95));
    border: 1.5px solid rgba(52,211,153,0.25);
    border-radius: 50%;
    cursor: pointer;
    transition: all var(--duration-base) var(--ease-in-out);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px;
    z-index: 6;
    box-shadow: 
      inset 0 1px 2px rgba(52,211,153,0.08),
      0 2px 8px rgba(0,0,0,0.12);
  }
  
  /* Z-axis lift on hover */
  .module-card:hover, .module-card.hovered {
    border-color: var(--primary-400);
    box-shadow: 
      inset 0 1px 2px rgba(52,211,153,0.12),
      0 4px 16px rgba(52,211,153,0.2),
      0 8px 32px rgba(52,211,153,0.15);
    z-index: 20;
    transform: rotate(var(--angle)) translateX(var(--dist)) rotate(calc(-1 * var(--angle))) scale(1.08) translateY(-2px);
  }
  .module-card.unselecting {
    animation: unselectSnap 0.26s cubic-bezier(.2,.9,.2,1);
  }
  @keyframes unselectSnap {
    0%   { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(calc(-1 * var(--angle))) scale(1.02); }
    40%  { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(calc(-1 * var(--angle))) scale(1.06); }
    100% { transform: rotate(var(--angle)) translateX(var(--dist)) rotate(calc(-1 * var(--angle))) scale(1.00); }
  }
  .module-card.selected {
    border-color: var(--accent-bright);
    box-shadow: 0 0 40px rgba(52,211,153,0.5);
    animation: selectedPulse 1.5s ease-in-out infinite;
    --dist: calc(var(--base-dist) * 0.78); /* Snap-to-panel toward center */
  }
  .module-card.core {
    box-shadow: 0 0 0 0 rgba(15,184,159,0.0);
    animation: corePulse 3s ease-in-out infinite;
  }
  @keyframes corePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(15,184,159,0.0); }
    50% { box-shadow: 0 0 20px 2px rgba(15,184,159,0.25); }
  }
  @keyframes selectedPulse {
    0%, 100% { box-shadow: 0 0 40px rgba(52,211,153,0.5); }
    50% { box-shadow: 0 0 60px rgba(52,211,153,0.7); }
  }
  /* Completed modules have subtle pulse */
  .module-card.completed {
    border-color: rgba(52,211,153,0.5);
    animation: completedPulse 4s ease-in-out infinite;
  }
  @keyframes completedPulse {
    0%, 100% { border-color: rgba(52,211,153,0.4); }
    50% { border-color: rgba(52,211,153,0.6); }
  }

  /* Progress ring animation */
  .prog-ring {
    position: absolute;
    inset: 2px;
  }
  .prog-fill {
    transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .prog-fill.no-anim { transition: none; }
  .module-card.selected .prog-fill {
    animation: ringTrace 0.8s ease-out;
  }
  @keyframes ringTrace {
    from { stroke-dashoffset: 107; }
    to { stroke-dashoffset: var(--offset); }
  }
  /* Module Icon */
  .module-icon {
    position: absolute;
    top: 45%; /* Move up slightly */
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    opacity: 0.9;
    transition: all 0.3s ease;
  }
  
  .module-card:hover .module-icon {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  .icon-num {
    position: absolute;
    top: 12%;
    right: 15%;
    font-size: clamp(10px, 2.5vw, 12px);
    font-weight: 700;
    color: var(--cyan-400);
    font-family: var(--font-display);
    z-index: 3;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
    background: rgba(10, 26, 31, 0.8); /* Improve contrast */
    padding: 1px 4px;
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 255, 0.2);
  }

  .card-content {
    position: absolute;
    bottom: 10%; /* Slightly lower */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    z-index: 1;
    width: 92%; /* Slightly tighter to avoid edge collision */
  }
  .card-name {
    font-size: clamp(7px, 1.1vw, 9px);
    font-weight: 700;
    color: var(--text);
    text-align: center;
    line-height: 1.2; /* Better line height for wrap */
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    white-space: normal; /* Allow wrapping */
    max-width: 100%;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-code {
    font-size: clamp(6px, 0.9vw, 8px);
    color: var(--cyan-400);
    font-weight: 600;
    opacity: 0.9;
    letter-spacing: 1px;
    background: rgba(0, 255, 255, 0.1);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .check {
    color: var(--accent-bright);
    font-size: clamp(8px, 2vw, 10px);
  }

  /* Context dimming when detail is open */
  .main-container.dim .module-card:not(.selected) {
    opacity: 0.15;
    filter: saturate(0.6) brightness(0.7);
    transition: opacity 0.4s ease, filter 0.4s ease;
  }

  /* Detail Panel Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  .detail-panel {
    width: 100%;
    max-width: 400px;
    background: var(--bg2);
    border: 1px solid var(--accent);
    border-radius: 12px;
    padding: 24px;
    position: relative;
    box-shadow: 0 0 60px rgba(52,211,153,0.2);
  }
  .close-btn {
    position: absolute;
    top: 12px;
    right: 16px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 24px;
    cursor: pointer;
    line-height: 1;
    min-width: 44px;
    min-height: 44px;
  }
  .detail-panel h2 {
    font-size: 18px;
    margin: 0 0 4px;
    color: var(--text);
  }
  .detail-code {
    display: inline-block;
    font-size: 10px;
    background: var(--accent);
    color: var(--bg);
    padding: 3px 10px;
    border-radius: 4px;
    font-weight: 700;
  }
  .detail-goal {
    color: var(--text-muted);
    font-size: 14px;
    margin: 16px 0;
  }
  .detail-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }
  .stat-box {
    flex: 1;
    background: rgba(255,255,255,0.03);
    padding: 12px;
    border-radius: 8px;
    text-align: center;
  }
  .stat-box span {
    display: block;
    font-size: 9px;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  .stat-box strong {
    font-size: 16px;
    color: var(--accent-bright);
  }
  .stat-box strong.amber { color: #f59e0b; }
  .stat-box strong.green { color: var(--accent-bright); }
  .stat-box.rank strong { color: #fbbf24; }
  .stat-box.rank strong.core { color: #34d399; font-weight: 800; }
  
  /* Research metadata badges */
  .detail-meta {
    display: flex;
    gap: 8px;
    margin: 12px 0 16px;
    flex-wrap: wrap;
  }
  .meta-badge {
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .meta-badge.pgy {
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #60a5fa;
  }
  .meta-badge.difficulty {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fbbf24;
  }
  .meta-badge.difficulty.critical {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #f87171;
  }
  
  /* Haptic limitation note */
  .haptic-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(59, 130, 246, 0.1);
    border-left: 3px solid #3b82f6;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  .note-icon {
    font-size: 14px;
    flex-shrink: 0;
  }
  .note-text {
    font-size: 11px;
    color: #93c5fd;
    line-height: 1.4;
  }
  
  .detail-section { margin-bottom: 16px; }
  /* V12 Tension Delta gauge */
  .tension-gauge { display:flex; align-items:center; gap:10px; }
  .tension-gauge svg { width:56px; height:56px; filter: drop-shadow(0 0 6px rgba(255,255,255,0.05)); }
  .td-label { font-weight:700; color:#fbbf24; }
  .detail-section h4 {
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 1px;
    margin: 0 0 8px;
  }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    font-size: 11px;
    padding: 5px 12px;
    background: rgba(52,211,153,0.15);
    border: 1px solid rgba(52,211,153,0.3);
    border-radius: 16px;
    color: var(--accent-bright);
  }
  .detail-section.risk h4 { color: #f59e0b; }
  .detail-section.risk ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .detail-section.risk li {
    font-size: 12px;
    color: #fca5a5;
    padding: 8px 12px;
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.15);
    border-radius: 6px;
    margin-bottom: 4px;
  }
  .launch-btn {
    width: 100%;
    padding: var(--space-4) var(--space-6);
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--radius-md);
    color: var(--neutral-950);
    font-family: var(--font-primary);
    font-weight: var(--font-semibold);
    font-size: var(--text-base);
    letter-spacing: var(--tracking-wide);
    cursor: pointer;
    min-height: 48px;
    transition: all var(--duration-base) var(--ease-in-out);
    position: relative;
    overflow: hidden;
    box-shadow: 
      0 4px 12px rgba(52,211,153,0.25),
      inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .launch-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: translateX(-100%);
    animation: btnShine 3s ease-in-out infinite;
  }
  @keyframes btnShine {
    0%, 100% { transform: translateX(-100%); }
    50% { transform: translateX(100%); }
  }
  .launch-btn:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 8px 20px rgba(52,211,153,0.35),
      inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .launch-btn:active {
    transform: translateY(0);
    box-shadow: 
      0 2px 8px rgba(52,211,153,0.2),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }

  /* Footer */
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: rgba(10,26,31,0.95);
    border-top: 1px solid rgba(52,211,153,0.15);
    font-size: clamp(8px, 1.5vw, 10px);
    font-family: monospace;
    z-index: 10;
    flex-wrap: wrap;
    gap: 8px;
  }
  .status-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .status { display: flex; align-items: center; gap: 4px; }
  .dot {
    width: 6px;
    height: 6px;
    background: var(--accent-bright);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--accent-bright);
    transition: all 0.1s;
  }
  .dot.flash {
    animation: dotFlash 0.15s ease-in-out;
  }
  @keyframes dotFlash {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(1.5); }
  }
  .operational { color: var(--accent-bright); }
  .latency { color: var(--accent); }
  .flicker {
    display: inline-block;
    min-width: 20px;
    text-align: right;
    animation: latencyFlicker 0.15s steps(2) infinite;
  }
  @keyframes latencyFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  .divider { color: rgba(255,255,255,0.2); }

  .progress-section {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
  }
  .progress-bar {
    width: clamp(80px, 15vw, 150px);
    height: 5px;
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-bright));
    position: relative;
    animation: progressGlow 2s ease-in-out infinite;
  }
  .progress-fill::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5));
    animation: progressShimmer 1.5s ease-in-out infinite;
  }
  @keyframes progressGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
  }
  @keyframes progressShimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text);
    font-weight: 700;
  }
  .plus { color: var(--accent); }
  .network-status {
    color: var(--accent-bright);
    font-weight: 600;
  }

  /* V12 Ambient AO */
  .ambient-ao {
    position: absolute; inset: 0; pointer-events: none; z-index: 1;
    background: radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.0) 60%),
                linear-gradient(180deg, rgba(200,230,255,0.04), rgba(200,230,255,0.02));
    mix-blend-mode: screen;
  }
  .ambient-ao.warning {
    background: radial-gradient(150% 150% at 50% 50%, rgba(255,200,100,0.06) 0%, rgba(0,0,0,0.0) 60%),
                linear-gradient(180deg, rgba(255,200,100,0.05), rgba(255,200,100,0.02));
    animation: aoPulse 2s ease-in-out infinite;
  }
  @keyframes aoPulse { 0%,100%{opacity:.7} 50%{opacity:1} }

  /* V12 60Hz diagnostic time signature */
  .time-sig {
    display:inline-block; width:0; height:0; margin-left:6px; vertical-align:middle;
    border-left: 6px solid transparent; border-right:6px solid transparent; border-bottom:10px solid #34d399;
    animation: tsFlicker .016s steps(2) infinite; /* ~60Hz */
  }
  .time-sig.amber { border-bottom-color: #f59e0b; }
  @keyframes tsFlicker { 0%{opacity:.7} 50%{opacity:1} 100%{opacity:.7} }

  /* Trace line overlay */
  .trace-overlay { position: fixed; inset: 0; pointer-events: none; z-index: var(--z-alerts, 4); }
  .trace-svg { width: 100vw; height: 100vh; }
  .trace-line {
    stroke: rgba(255,255,255,0.9);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-dasharray: var(--len);
    stroke-dashoffset: var(--len);
    transition: stroke-dashoffset .25s ease-out;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.25));
  }
  .trace-line.active { stroke-dashoffset: 0; }

  /* === 2028 QUICK ACCESS PANEL === */
  .quick-access-panel {
    position: fixed;
    bottom: calc(80px + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 50;
    padding: 8px;
    background: rgba(18, 22, 29, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  
  .quick-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 160px;
  }
  
  .quick-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }
  
  .quick-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }
  
  .quick-icon.games {
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(6, 182, 212, 0.1));
    border: 1px solid rgba(20, 184, 166, 0.3);
  }
  
  .quick-icon.okap {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  
  .quick-icon.rota {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.1));
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
  
  .quick-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }
  
  .quick-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #FFFFFF;
    letter-spacing: -0.01em;
  }
  
  .quick-desc {
    font-size: 0.7rem;
    color: var(--text-muted, #8B9AAB);
    font-weight: 500;
  }
  
  .quick-arrow {
    font-size: 1rem;
    color: var(--text-muted, #8B9AAB);
    margin-left: auto;
    transition: transform 0.2s;
  }
  
  .quick-card:hover .quick-arrow {
    transform: translateX(4px);
    color: var(--primary-400, #26D4C4);
  }
  
  @media (max-width: 768px) {
    .quick-access-panel {
      flex-direction: column;
      width: calc(100% - 32px);
      max-width: 320px;
      bottom: calc(70px + env(safe-area-inset-bottom));
    }
    
    .quick-card {
      min-width: auto;
      width: 100%;
    }
  }
  </style>
