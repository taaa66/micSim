<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  // ===== TRAINING MATRIX DATA =====
  const skillMatrix = [
    { id: 'mt', name: 'Micro-Tremor', code: 'MT-CTRL', pgy: 1, mastery: 92, status: 'mastered' },
    { id: 'tg', name: 'Tissue Grasp', code: 'T-GRASP', pgy: 1, mastery: 78, status: 'proficient' },
    { id: 'na', name: 'Needle Angle', code: 'N-ANGLE', pgy: 1, mastery: 88, status: 'mastered' },
    { id: 'ct', name: 'Corneal Tunnel', code: 'C-TUNEL', pgy: 2, mastery: 65, status: 'proficient' },
    { id: 'ccc', name: 'Capsulorhexis', code: 'CCC', pgy: 2, mastery: 95, status: 'mastered' },
    { id: 'hd', name: 'Hydrodissect', code: 'H-DISS', pgy: 2, mastery: 45, status: 'remedial' },
    { id: 'st', name: 'Suture Tens', code: 'S-TENS', pgy: 3, mastery: 82, status: 'mastered' },
    { id: 'sp', name: 'Suture Place', code: 'S-PLACE', pgy: 3, mastery: 70, status: 'proficient' },
    { id: 'gi', name: 'Gas/Liq Inj', code: 'FL-INJK', pgy: 3, mastery: 55, status: 'proficient' },
    { id: 'rr', name: 'Reflex/React', code: 'RLX-RCT', pgy: 1, mastery: 98, status: 'mastered' },
    { id: 'ca', name: 'Corneal Arc', code: 'ARC-CUT', pgy: 4, mastery: 38, status: 'remedial' },
    { id: 'wh', name: 'Wound Hydra', code: 'W-HYDR', pgy: 3, mastery: 72, status: 'proficient' },
    { id: 'pc', name: 'Phaco Chop', code: 'P-CHOP', pgy: 4, mastery: 25, status: 'remedial' },
    { id: 'io', name: 'IOL Insert', code: 'IOL-INS', pgy: 4, mastery: 60, status: 'proficient' },
    { id: 'vt', name: 'Vitrectomy', code: 'VIT-ECT', pgy: 5, mastery: 15, status: 'remedial' },
    { id: 'mb', name: 'Membrane Peel', code: 'MEM-PL', pgy: 5, mastery: 20, status: 'remedial' }
  ];

  // Leaderboard scatter data
  const leaderboardData = [
    { name: 'Dr. A. Patel', score: 99.1, time: 42, rank: 1 },
    { name: 'Dr. K. Chen', score: 97.8, time: 48, rank: 2 },
    { name: 'Dr. E. Davies', score: 95.2, time: 55, rank: 3 },
    { name: 'Dr. M. Kumar', score: 94.1, time: 51, rank: 4 },
    { name: 'Dr. J. Smith', score: 88.9, time: 62, rank: 5, isUser: true },
    { name: 'Dr. L. Wong', score: 86.5, time: 58, rank: 6 },
    { name: 'Dr. B. Schmidt', score: 84.2, time: 70, rank: 7 },
    { name: 'Dr. R. Tanaka', score: 82.0, time: 65, rank: 8 },
    { name: 'Dr. S. Ali', score: 79.5, time: 72, rank: 9 },
    { name: 'Dr. C. Brown', score: 75.0, time: 80, rank: 10 }
  ];

  let selectedSkill = skillMatrix[4]; // Default: CCC
  let hoveredSkill = null;
  let currentTime = new Date().toLocaleTimeString();
  let apiLatency = 38;
  let capsularStress = 42;
  let iop = 18.5;

  // Tremor spectrum data (simulated FFT)
  const tremorSpectrum = Array.from({ length: 32 }, (_, i) => ({
    freq: 4 + i * 0.5,
    amplitude: i >= 8 && i <= 16 ? 30 + Math.random() * 40 : 5 + Math.random() * 15
  }));

  // Force profile data
  const forceProfile = Array.from({ length: 50 }, (_, i) => ({
    t: i,
    grip: 20 + Math.sin(i * 0.3) * 15 + Math.random() * 5,
    tension: 25 + Math.cos(i * 0.2) * 12 + Math.random() * 4
  }));

  function selectSkill(skill) {
    selectedSkill = skill;
  }

  function getStatusColor(status) {
    if (status === 'mastered') return '#10b981';
    if (status === 'proficient') return '#f59e0b';
    return '#ef4444';
  }

  function launchModule() {
    if (selectedSkill) {
      dispatch('select', { id: selectedSkill.id, name: selectedSkill.name });
    }
  }

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date().toLocaleTimeString();
      apiLatency = 35 + Math.floor(Math.random() * 10);
      capsularStress = 35 + Math.floor(Math.random() * 20);
      iop = 16 + Math.random() * 6;
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="console">
  <!-- Header -->
  <header class="console-header">
    <div class="header-left">
      <svg class="apex-shield" viewBox="0 0 32 32">
        <path d="M16 2L4 8v8c0 8 5.5 13 12 15 6.5-2 12-7 12-15V8L16 2z" fill="none" stroke="url(#goldG)" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="4" fill="url(#goldG)"/>
        <defs><linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4a853"/><stop offset="100%" stop-color="#b8860b"/>
        </linearGradient></defs>
      </svg>
    </div>
    <h1 class="header-title">OPHTHALMIC SURGICAL KNOWLEDGE CONSOLE <span class="version">(OSKC)</span></h1>
    <div class="header-right">
      <span class="time">{currentTime}</span>
    </div>
  </header>

  <!-- Main 3x3 Grid -->
  <main class="grid-container">
    <!-- Panel 1: Tremor & Stability (Top Left) -->
    <section class="panel p1">
      <div class="panel-header">
        <span class="panel-title">TREMOR & STABILITY ANALYSIS</span>
        <span class="panel-tag">FFT SPECTRUM</span>
      </div>
      <div class="panel-content spectrum">
        <svg viewBox="0 0 200 80" class="spectrum-chart">
          {#each tremorSpectrum as bar, i}
            <rect 
              x={i * 6 + 2} 
              y={80 - bar.amplitude} 
              width="4" 
              height={bar.amplitude}
              fill={bar.freq >= 8 && bar.freq <= 12 ? '#10b981' : '#2d3748'}
              opacity={bar.freq >= 8 && bar.freq <= 12 ? 1 : 0.5}
            />
          {/each}
          <line x1="48" y1="0" x2="48" y2="80" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="2,2"/>
          <line x1="96" y1="0" x2="96" y2="80" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="2,2"/>
          <text x="72" y="10" fill="#f59e0b" font-size="6" text-anchor="middle">8-12Hz TARGET</text>
        </svg>
        <div class="spectrum-stats">
          <div class="stat"><span>PEAK</span><strong>9.2Hz</strong></div>
          <div class="stat"><span>AMP</span><strong>0.08mm</strong></div>
          <div class="stat"><span>STAB</span><strong class="green">94%</strong></div>
        </div>
      </div>
      <div class="data-feed">0x4F7A 0x3E2B 0x9C1D 0x5A8F</div>
    </section>

    <!-- Panel 2: Incision Geometrics (Top Center) -->
    <section class="panel p2">
      <div class="panel-header">
        <span class="panel-title">INCISION GEOMETRICS</span>
        <span class="panel-tag">3D VECTOR</span>
      </div>
      <div class="panel-content vector-map">
        <svg viewBox="0 0 120 100" class="cornea-wireframe">
          <!-- Cornea wireframe -->
          <ellipse cx="60" cy="50" rx="45" ry="35" fill="none" stroke="#3d4852" stroke-width="0.5"/>
          <ellipse cx="60" cy="50" rx="35" ry="25" fill="none" stroke="#3d4852" stroke-width="0.5"/>
          <ellipse cx="60" cy="50" rx="25" ry="18" fill="none" stroke="#3d4852" stroke-width="0.5"/>
          <!-- Incision vectors -->
          <path d="M25 40 L35 35 L45 38" stroke="#10b981" stroke-width="1.5" fill="none"/>
          <path d="M95 40 L85 35 L75 38" stroke="#10b981" stroke-width="1.5" fill="none"/>
          <!-- Depth indicator -->
          <line x1="60" y1="20" x2="60" y2="80" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="2,2"/>
          <!-- Heat zones -->
          <circle cx="35" cy="36" r="8" fill="url(#heatGrad)" opacity="0.6"/>
          <circle cx="85" cy="36" r="8" fill="url(#heatGrad)" opacity="0.6"/>
          <defs>
            <radialGradient id="heatGrad">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
          </defs>
        </svg>
        <div class="vector-stats">
          <span>ANGLE: <strong>45.2°</strong></span>
          <span>DEPTH: <strong>92%</strong></span>
        </div>
      </div>
    </section>

    <!-- Panel 3: Apex League Scatter (Top Right) -->
    <section class="panel p3">
      <div class="panel-header">
        <span class="panel-title">APEX LEAGUE RANKINGS</span>
        <span class="panel-tag">SCATTER</span>
      </div>
      <div class="panel-content scatter">
        <svg viewBox="0 0 140 90" class="scatter-plot">
          <!-- Axes -->
          <line x1="20" y1="80" x2="135" y2="80" stroke="#3d4852" stroke-width="0.5"/>
          <line x1="20" y1="10" x2="20" y2="80" stroke="#3d4852" stroke-width="0.5"/>
          <text x="75" y="88" fill="#6b7280" font-size="5" text-anchor="middle">TIME (min)</text>
          <text x="8" y="45" fill="#6b7280" font-size="5" text-anchor="middle" transform="rotate(-90 8 45)">SCORE</text>
          <!-- Data points -->
          {#each leaderboardData as user}
            <circle 
              cx={20 + (user.time - 40) * 2.5}
              cy={80 - (user.score - 70) * 2}
              r={user.isUser ? 5 : 3}
              fill={user.isUser ? '#10b981' : '#6b7280'}
              stroke={user.isUser ? '#10b981' : 'none'}
              stroke-width={user.isUser ? 2 : 0}
              opacity={user.isUser ? 1 : 0.7}
            />
            {#if user.rank <= 3 || user.isUser}
              <text 
                x={22 + (user.time - 40) * 2.5}
                y={78 - (user.score - 70) * 2}
                fill={user.isUser ? '#10b981' : '#9ca3af'}
                font-size="4"
              >{user.rank}</text>
            {/if}
          {/each}
        </svg>
      </div>
    </section>

    <!-- Panel 4: Force Modulation (Mid Left) -->
    <section class="panel p4">
      <div class="panel-header">
        <span class="panel-title">FORCE MODULATION</span>
        <span class="panel-tag">HAPTIC</span>
      </div>
      <div class="panel-content force-graph">
        <svg viewBox="0 0 200 70" class="force-chart">
          <!-- Target range -->
          <rect x="0" y="20" width="200" height="25" fill="rgba(245,158,11,0.1)"/>
          <line x1="0" y1="20" x2="200" y2="20" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="2,2"/>
          <line x1="0" y1="45" x2="200" y2="45" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="2,2"/>
          <!-- Grip line -->
          <polyline 
            points={forceProfile.map((p, i) => `${i * 4},${70 - p.grip}`).join(' ')}
            fill="none" stroke="#10b981" stroke-width="1"
          />
          <!-- Tension line -->
          <polyline 
            points={forceProfile.map((p, i) => `${i * 4},${70 - p.tension}`).join(' ')}
            fill="none" stroke="#8b5cf6" stroke-width="1"
          />
        </svg>
        <div class="force-legend">
          <span class="legend-item"><i class="dot green"></i>GRIP</span>
          <span class="legend-item"><i class="dot purple"></i>TENSION</span>
          <span class="legend-item"><i class="dot amber"></i>TARGET</span>
        </div>
        <!-- Haptic feedback viz -->
        <div class="haptic-wave">
          <svg viewBox="0 0 60 20">
            <path d="M0 10 Q5 5,10 10 T20 10 T30 10 T40 10 T50 10 T60 10" fill="none" stroke="#6b7280" stroke-width="1">
              <animate attributeName="d" dur="0.5s" repeatCount="indefinite"
                values="M0 10 Q5 5,10 10 T20 10 T30 10 T40 10 T50 10 T60 10;
                        M0 10 Q5 15,10 10 T20 10 T30 10 T40 10 T50 10 T60 10;
                        M0 10 Q5 5,10 10 T20 10 T30 10 T40 10 T50 10 T60 10"/>
            </path>
          </svg>
          <span>HAPTIC FB</span>
        </div>
      </div>
    </section>

    <!-- Panel 5: Training Matrix (Mid Center - MAIN) -->
    <section class="panel p5 main-panel">
      <div class="panel-header">
        <span class="panel-title">TRAINING MATRIX</span>
        <span class="panel-tag">COMMAND</span>
      </div>
      <div class="panel-content matrix">
        <div class="matrix-grid">
          {#each skillMatrix as skill}
            <button 
              class="matrix-cell"
              class:selected={selectedSkill?.id === skill.id}
              class:hovered={hoveredSkill?.id === skill.id}
              style="--status-color: {getStatusColor(skill.status)}"
              on:click={() => selectSkill(skill)}
              on:mouseenter={() => hoveredSkill = skill}
              on:mouseleave={() => hoveredSkill = null}
            >
              <span class="cell-code">{skill.code}</span>
              <span class="cell-mastery">{skill.mastery}%</span>
            </button>
          {/each}
        </div>
        <!-- Link trace to Panel 9 -->
        {#if selectedSkill}
          <div class="trace-line"></div>
        {/if}
      </div>
      <div class="matrix-legend">
        <span><i class="dot green"></i>MASTERED</span>
        <span><i class="dot amber"></i>PROFICIENT</span>
        <span><i class="dot red"></i>REMEDIAL</span>
      </div>
    </section>

    <!-- Panel 6: Flow & Fluidics (Mid Right) -->
    <section class="panel p6">
      <div class="panel-header">
        <span class="panel-title">FLOW & FLUIDICS</span>
        <span class="panel-tag">HYDRO</span>
      </div>
      <div class="panel-content fluidics">
        <div class="fluid-sim">
          <svg viewBox="0 0 100 60">
            <!-- Chamber -->
            <ellipse cx="50" cy="30" rx="40" ry="25" fill="none" stroke="#3d4852" stroke-width="1"/>
            <!-- Fluid waves -->
            <path d="M15 30 Q30 25, 50 30 T85 30" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.8">
              <animate attributeName="d" dur="2s" repeatCount="indefinite"
                values="M15 30 Q30 25, 50 30 T85 30;M15 30 Q30 35, 50 30 T85 30;M15 30 Q30 25, 50 30 T85 30"/>
            </path>
            <path d="M20 35 Q35 30, 50 35 T80 35" fill="none" stroke="#10b981" stroke-width="1" opacity="0.5">
              <animate attributeName="d" dur="2.5s" repeatCount="indefinite"
                values="M20 35 Q35 30, 50 35 T80 35;M20 35 Q35 40, 50 35 T80 35;M20 35 Q35 30, 50 35 T80 35"/>
            </path>
          </svg>
        </div>
        <div class="iop-gauge">
          <span class="iop-label">IOP</span>
          <span class="iop-value">{iop.toFixed(1)}<small>mmHg</small></span>
          <div class="iop-bar">
            <div class="iop-fill" style="width: {(iop / 25) * 100}%"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Panel 7: Wound Closure (Bottom Left) -->
    <section class="panel p7">
      <div class="panel-header">
        <span class="panel-title">WOUND CLOSURE</span>
        <span class="panel-tag">SYMMETRY</span>
      </div>
      <div class="panel-content symmetry">
        <svg viewBox="0 0 80 80" class="symmetry-dial">
          <circle cx="40" cy="40" r="35" fill="none" stroke="#2d3748" stroke-width="4"/>
          <circle cx="40" cy="40" r="35" fill="none" stroke="#10b981" stroke-width="4"
            stroke-dasharray="180" stroke-dashoffset="36" transform="rotate(-90 40 40)"/>
          <text x="40" y="38" fill="#fff" font-size="12" text-anchor="middle" font-weight="700">82%</text>
          <text x="40" y="50" fill="#6b7280" font-size="6" text-anchor="middle">SYMMETRY</text>
        </svg>
        <div class="seal-meter">
          <span>SEAL</span>
          <div class="seal-bar"><div class="seal-fill" style="width: 78%"></div></div>
          <span>78%</span>
        </div>
      </div>
    </section>

    <!-- Panel 8: Capsular Integrity (Bottom Center) -->
    <section class="panel p8">
      <div class="panel-header">
        <span class="panel-title">CAPSULAR INTEGRITY</span>
        <span class="panel-tag warn">STRESS</span>
      </div>
      <div class="panel-content capsular">
        <svg viewBox="0 0 100 80" class="stress-meter">
          <!-- Radial segments -->
          {#each Array(12) as _, i}
            <path 
              d="M50 40 L{50 + 35 * Math.cos((i * 30 - 90) * Math.PI / 180)} {40 + 35 * Math.sin((i * 30 - 90) * Math.PI / 180)}"
              stroke={i < capsularStress / 8 ? (i > 8 ? '#f59e0b' : '#10b981') : '#2d3748'}
              stroke-width="3"
              stroke-linecap="round"
            />
          {/each}
          <circle cx="50" cy="40" r="15" fill="#1a1f2e"/>
          <text x="50" y="43" fill="#fff" font-size="10" text-anchor="middle" font-weight="700">{capsularStress}%</text>
        </svg>
        {#if capsularStress > 60}
          <div class="warning-flash">⚠ TEAR RISK</div>
        {/if}
      </div>
      <div class="data-feed amber">STRESS PROPAGATION ACTIVE</div>
    </section>

    <!-- Panel 9: Session Report (Bottom Right) -->
    <section class="panel p9 report-panel">
      <div class="panel-header">
        <span class="panel-title">SESSION ANALYSIS</span>
        <span class="panel-tag">REPORT</span>
      </div>
      {#if selectedSkill}
        <div class="panel-content report" transition:fade={{ duration: 150 }}>
          <div class="report-header">
            <h3>{selectedSkill.name}</h3>
            <span class="report-code">{selectedSkill.code}</span>
          </div>
          <div class="report-meta">
            <div class="meta-item"><span>PGY STAGE</span><strong>PGY-{selectedSkill.pgy}</strong></div>
            <div class="meta-item"><span>STATUS</span><strong style="color: {getStatusColor(selectedSkill.status)}">{selectedSkill.status.toUpperCase()}</strong></div>
          </div>
          <div class="report-metrics">
            <div class="metric-bar">
              <span>MASTERY</span>
              <div class="bar"><div class="fill" style="width: {selectedSkill.mastery}%; background: {getStatusColor(selectedSkill.status)}"></div></div>
              <span>{selectedSkill.mastery}%</span>
            </div>
            <div class="metric-bar">
              <span>ACCURACY</span>
              <div class="bar"><div class="fill" style="width: {Math.min(selectedSkill.mastery + 5, 100)}%"></div></div>
              <span>{Math.min(selectedSkill.mastery + 5, 100)}%</span>
            </div>
            <div class="metric-bar">
              <span>CONSISTENCY</span>
              <div class="bar"><div class="fill" style="width: {Math.max(selectedSkill.mastery - 8, 0)}%"></div></div>
              <span>{Math.max(selectedSkill.mastery - 8, 0)}%</span>
            </div>
          </div>
          <button class="launch-btn" on:click={launchModule}>▶ LAUNCH TRAINING</button>
        </div>
      {/if}
    </section>
  </main>

  <!-- Footer -->
  <footer class="console-footer">
    <span class="footer-item">SYSTEM DIAGNOSTICS: <strong class="green">NOMINAL</strong></span>
    <span class="footer-divider">|</span>
    <span class="footer-item">API LATENCY: <strong>{apiLatency}ms</strong></span>
    <span class="footer-divider">|</span>
    <span class="footer-item">KERNEL V.5.0.1</span>
    <span class="footer-divider">|</span>
    <span class="footer-item">SESSION: 00:42:18</span>
  </footer>
</div>

<style>
  /* ===== V5.0 CLINICAL KNOWLEDGE MATRIX CONSOLE ===== */
  .console {
    --bg: #0f1419;
    --panel-bg: #1a1f2e;
    --border: #2d3748;
    --text: #e5e7eb;
    --text-muted: #6b7280;
    --green: #10b981;
    --amber: #f59e0b;
    --red: #ef4444;
    --purple: #8b5cf6;
    
    width: 100%;
    height: 100vh;
    background: var(--bg);
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--text);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* PBR: Subtle texture overlay */
    background-image: 
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px);
  }

  /* Header */
  .console-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: linear-gradient(180deg, #1a1f2e 0%, var(--bg) 100%);
    border-bottom: 1px solid var(--border);
  }
  .header-left { display: flex; align-items: center; gap: 12px; }
  .apex-shield { width: 28px; height: 28px; }
  .header-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
    margin: 0;
  }
  .version { color: var(--text-muted); font-weight: 400; }
  .header-right { font-size: 11px; color: var(--text-muted); font-family: 'SF Mono', monospace; }

  /* 3x3 Grid */
  .grid-container {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    grid-template-rows: 1fr 1.2fr 1fr;
    gap: 1px;
    padding: 1px;
    background: var(--border);
  }

  /* Panel Base */
  .panel {
    background: var(--panel-bg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    background: rgba(0,0,0,0.2);
  }
  .panel-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--text);
  }
  .panel-tag {
    font-size: 7px;
    padding: 2px 6px;
    background: rgba(16,185,129,0.15);
    color: var(--green);
    border-radius: 3px;
    font-weight: 600;
  }
  .panel-tag.warn {
    background: rgba(245,158,11,0.15);
    color: var(--amber);
  }
  .panel-content {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  /* Data Feed Decoration */
  .data-feed {
    font-size: 7px;
    font-family: 'SF Mono', monospace;
    color: rgba(107,114,128,0.5);
    padding: 4px 12px;
    border-top: 1px solid var(--border);
    letter-spacing: 1px;
    overflow: hidden;
    white-space: nowrap;
  }
  .data-feed.amber { color: rgba(245,158,11,0.6); }

  /* Panel 1: Spectrum */
  .spectrum { gap: 8px; }
  .spectrum-chart { width: 100%; height: 60px; }
  .spectrum-stats {
    display: flex;
    gap: 16px;
    font-size: 9px;
  }
  .spectrum-stats .stat { text-align: center; }
  .spectrum-stats span { color: var(--text-muted); display: block; font-size: 7px; }
  .spectrum-stats strong { color: var(--text); }
  .spectrum-stats .green { color: var(--green); }

  /* Panel 2: Vector Map */
  .vector-map { gap: 8px; }
  .cornea-wireframe { width: 100%; height: 80px; }
  .vector-stats {
    display: flex;
    gap: 20px;
    font-size: 9px;
    color: var(--text-muted);
  }
  .vector-stats strong { color: var(--green); }

  /* Panel 3: Scatter */
  .scatter-plot { width: 100%; height: 100%; }

  /* Panel 4: Force Graph */
  .force-graph { gap: 6px; }
  .force-chart { width: 100%; height: 50px; }
  .force-legend {
    display: flex;
    gap: 12px;
    font-size: 7px;
    color: var(--text-muted);
  }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .dot { width: 6px; height: 6px; border-radius: 50%; }
  .dot.green { background: var(--green); }
  .dot.purple { background: var(--purple); }
  .dot.amber { background: var(--amber); }
  .dot.red { background: var(--red); }
  .haptic-wave {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 6px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .haptic-wave svg { width: 40px; height: 12px; }

  /* Panel 5: Matrix (Main) */
  .main-panel { background: #151a28; }
  .matrix { padding: 8px; }
  .matrix-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: 100%;
  }
  .matrix-cell {
    aspect-ratio: 1.5;
    background: var(--status-color);
    opacity: 0.2;
    border: 1px solid var(--status-color);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    padding: 4px;
  }
  .matrix-cell:hover { opacity: 0.5; transform: scale(1.05); }
  .matrix-cell.selected { opacity: 1; box-shadow: 0 0 12px var(--status-color); }
  .cell-code { font-size: 7px; font-weight: 700; color: #fff; }
  .cell-mastery { font-size: 9px; font-weight: 800; color: #fff; }
  .matrix-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 8px;
    font-size: 7px;
    color: var(--text-muted);
  }
  .matrix-legend span { display: flex; align-items: center; gap: 4px; }
  .trace-line {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 50%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #fff);
    animation: tracePulse 1.5s infinite;
  }
  @keyframes tracePulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  /* Panel 6: Fluidics */
  .fluidics { gap: 10px; }
  .fluid-sim { width: 100%; }
  .iop-gauge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 9px;
    width: 100%;
  }
  .iop-label { color: var(--text-muted); font-size: 7px; }
  .iop-value { font-weight: 700; color: var(--green); }
  .iop-value small { font-size: 7px; color: var(--text-muted); margin-left: 2px; }
  .iop-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .iop-fill { height: 100%; background: var(--green); }

  /* Panel 7: Symmetry */
  .symmetry { gap: 10px; }
  .symmetry-dial { width: 70px; height: 70px; }
  .seal-meter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 8px;
    color: var(--text-muted);
    width: 100%;
  }
  .seal-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .seal-fill { height: 100%; background: var(--green); }

  /* Panel 8: Capsular */
  .capsular { position: relative; }
  .stress-meter { width: 80px; height: 70px; }
  .warning-flash {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    color: var(--amber);
    font-weight: 700;
    animation: flash 0.5s infinite;
  }
  @keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Panel 9: Report */
  .report-panel { background: #151a28; }
  .report { align-items: stretch; gap: 10px; padding: 12px; }
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
  }
  .report-header h3 { margin: 0; font-size: 12px; font-weight: 700; }
  .report-code {
    font-size: 8px;
    padding: 2px 8px;
    background: rgba(16,185,129,0.15);
    color: var(--green);
    border-radius: 4px;
  }
  .report-meta {
    display: flex;
    gap: 16px;
  }
  .meta-item { font-size: 9px; }
  .meta-item span { color: var(--text-muted); display: block; font-size: 7px; margin-bottom: 2px; }
  .meta-item strong { font-size: 11px; }
  .report-metrics { display: flex; flex-direction: column; gap: 6px; }
  .metric-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 8px;
  }
  .metric-bar span:first-child { width: 70px; color: var(--text-muted); }
  .metric-bar .bar { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .metric-bar .fill { height: 100%; background: var(--green); }
  .metric-bar span:last-child { width: 30px; text-align: right; font-weight: 600; }
  .launch-btn {
    margin-top: auto;
    padding: 10px;
    background: var(--green);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .launch-btn:hover { background: #34d399; box-shadow: 0 0 15px rgba(16,185,129,0.4); }

  /* Footer */
  .console-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 8px 24px;
    background: var(--panel-bg);
    border-top: 1px solid var(--border);
    font-size: 9px;
    font-family: 'SF Mono', monospace;
    color: var(--text-muted);
  }
  .footer-item strong { color: var(--text); }
  .footer-item .green { color: var(--green); }
  .footer-divider { color: var(--border); }
</style>
