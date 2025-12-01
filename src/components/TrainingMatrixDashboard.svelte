<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  // ===== CURRICULUM DATA =====
  const curriculum = {
    foundation: {
      name: 'Foundation Skills',
      shortName: 'FOUNDATION',
      phase: 'Pre-Surgical',
      icon: '🎯',
      modules: [
        {
          id: 'micro-tremor',
          name: 'Micro-Tremor Control',
          shortName: 'Micro-Tremor',
          description: 'Hold steady in target zones. Minimize physiologic hand tremor.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 120,
          icon: '◎',
          skills: ['Tremor Suppression', 'Stability', 'Spatial Accuracy'],
          prevents: ['Instrument Slippage', 'Inadvertent Tissue Contact', 'Capsular Damage']
        },
        {
          id: 'tissue-grasping',
          name: 'Tissue Grasping Trainer',
          shortName: 'Tissue Grasping',
          description: 'Grasp tissue without overstretching. Control force to prevent crush injury.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 60,
          icon: '✊',
          skills: ['Grasping Force', 'Pressure Control', 'Hold Stability'],
          prevents: ['Tissue Crush Injury', 'Capsular Tear', 'Zonular Stress']
        },
        {
          id: 'needle-angle',
          name: 'Needle Angle Trainer',
          shortName: 'Needle Angle',
          description: 'Insert needle at precise angles for paracentesis and IVT procedures.',
          pgy: 'PGY-2 Mid',
          classification: 'CORE',
          duration: 90,
          icon: '∠',
          skills: ['Angle Control', 'Depth Control', 'Pressure Uniformity'],
          prevents: ['Iris Trauma', 'Lens Touch', 'Improper Wound Architecture']
        }
      ]
    },
    incision: {
      name: 'Incision & Access',
      shortName: 'INCISION',
      phase: 'Surgical Phase 1',
      icon: '🔪',
      modules: [
        {
          id: 'corneal-tunnel',
          name: 'Corneal Tunnel Formation',
          shortName: 'Corneal Tunnel',
          description: 'Create self-sealing, multi-planar wound. Prevent astigmatism and leakage.',
          pgy: 'PGY-2 Mid',
          classification: 'CORE',
          duration: 30,
          icon: '━',
          skills: ['Angle Control', 'Depth Control', 'Path Accuracy'],
          prevents: ['Wound Leakage', 'Induced Astigmatism', 'Thermal Burn']
        }
      ]
    },
    capsulorhexis: {
      name: 'Capsulorhexis',
      shortName: 'CCC',
      phase: 'Surgical Phase 2',
      icon: '⭕',
      modules: [
        {
          id: 'capsulorhexis',
          name: 'Capsulorhexis Trainer',
          shortName: 'CCC Trainer',
          description: 'Continuous curvilinear tear with visual force feedback. Prevent runout/PCR.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 40,
          icon: '◯',
          skills: ['Path Accuracy', 'Stability', 'Force Control'],
          prevents: ['Anterior Capsule Runout', 'PCR', 'Residual Flap']
        }
      ]
    },
    phaco: {
      name: 'Phacoemulsification',
      shortName: 'PHACO',
      phase: 'Surgical Phase 3',
      icon: '💧',
      modules: [
        {
          id: 'hydrodissection',
          name: 'Hydrodissection Control',
          shortName: 'Hydrodissection',
          description: 'Controlled fluid wave delivery. Prevent zonular stress.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 45,
          icon: '💧',
          skills: ['Flow Control', 'Pressure Sensing', 'Wave Visualization'],
          prevents: ['Zonular Dialysis', 'Pressure Spike', 'Incomplete Separation']
        },
        {
          id: 'phaco-sculpting',
          name: 'Phaco Sculpting',
          shortName: 'Phaco Sculpt',
          description: 'Trench creation and quadrant removal. Hand-eye-foot coordination.',
          pgy: 'PGY-2 Mid',
          classification: 'CORE',
          duration: 60,
          icon: '⚡',
          skills: ['Depth Control', 'Pedal Coordination', 'Quadrant Management'],
          prevents: ['Posterior Capsule Rupture', 'Wound Burn', 'Nuclear Fragment Loss'],
          comingSoon: true
        }
      ]
    },
    implantation: {
      name: 'IOL Implantation',
      shortName: 'IOL',
      phase: 'Surgical Phase 4',
      icon: '⊙',
      modules: [
        {
          id: 'iol-insertion',
          name: 'IOL Insertion & Centration',
          shortName: 'IOL Insertion',
          description: 'Foldable IOL insertion with haptic placement accuracy.',
          pgy: 'PGY-2 Late',
          classification: 'CORE',
          duration: 45,
          icon: '⊙',
          skills: ['Haptic Control', 'Centration', 'Corneal Clearance'],
          prevents: ['IOL Decentration', 'Capsular Damage', 'Endothelial Touch'],
          comingSoon: true
        },
        {
          id: 'viscoelastic',
          name: 'Viscoelastic Management',
          shortName: 'OVD Control',
          description: 'OVD injection, exchange, and anterior chamber maintenance.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 30,
          icon: '◈',
          skills: ['Flow Control', 'Chamber Stability', 'Endothelial Protection'],
          prevents: ['AC Collapse', 'Endothelial Damage', 'IOP Spike'],
          comingSoon: true
        }
      ]
    },
    closure: {
      name: 'Wound Closure',
      shortName: 'CLOSURE',
      phase: 'Surgical Phase 5',
      icon: '✂️',
      modules: [
        {
          id: 'wound-hydration',
          name: 'Wound Hydration & Sealing',
          shortName: 'Wound Hydration',
          description: 'Stromal hydration for self-sealing closure.',
          pgy: 'PGY-2 Late',
          classification: 'CORE',
          duration: 25,
          icon: '≋',
          skills: ['Injection Precision', 'Seal Verification'],
          prevents: ['Wound Leak', 'Hypotony', 'Endophthalmitis Risk'],
          comingSoon: true
        },
        {
          id: 'corneal-suture',
          name: 'Corneal Suture Placement',
          shortName: 'Corneal Suture',
          description: 'Symmetric entry/exit points. Prevent astigmatism.',
          pgy: 'PGY-3 Mid',
          classification: 'USEFUL',
          duration: 35,
          icon: '⤫',
          skills: ['Angle Control', 'Depth Uniformity', 'Path Accuracy'],
          prevents: ['Induced Astigmatism', 'Wound Gape', 'Cheese-Wiring']
        },
        {
          id: 'suture-tension',
          name: 'Suture Tension Trainer',
          shortName: 'Suture Tension',
          description: 'Precise knot tension with visual force feedback.',
          pgy: 'PGY-3 Late',
          classification: 'USEFUL',
          duration: 90,
          icon: '⊗',
          skills: ['Tension Control', 'Consistency', 'Force Sensing'],
          prevents: ['Wound Gape', 'Tissue Necrosis', 'Suture Cheese-Wire']
        }
      ]
    },
    specialty: {
      name: 'Specialty Procedures',
      shortName: 'SPECIALTY',
      phase: 'Advanced',
      icon: '🔬',
      modules: [
        {
          id: 'gas-injection',
          name: 'Gas/Liquid Injection',
          shortName: 'Gas Injection',
          description: 'Vitreoretinal fluidics. Flow rate and pressure control.',
          pgy: 'PGY-4 Early',
          classification: 'USEFUL',
          duration: 25,
          icon: '↘',
          skills: ['Flow Rate', 'Pressure Control', 'Angle Stability'],
          prevents: ['Retinal Damage', 'IOP Spike', 'Improper Tamponade'],
          track: 'Retina'
        },
        {
          id: 'corneal-arc',
          name: 'Corneal Arc Cutter',
          shortName: 'Arc Keratotomy',
          description: 'Precise arcuate incisions for astigmatism correction.',
          pgy: 'PGY-3 Mid',
          classification: 'USEFUL',
          duration: 40,
          icon: '⌒',
          skills: ['Path Precision', 'Depth Control', 'Slip Prevention'],
          prevents: ['Over-Correction', 'Perforation', 'Irregular Astigmatism']
        },
        {
          id: 'capsule-polish',
          name: 'Posterior Capsule Polishing',
          shortName: 'Capsule Polish',
          description: 'I/A tip control with extreme tremor suppression.',
          pgy: 'PGY-3 Early',
          classification: 'CORE',
          duration: 45,
          icon: '✧',
          skills: ['Tremor Control', 'Depth Precision', 'Force Limitation'],
          prevents: ['PCR', 'Retained Cortex', 'PCO'],
          comingSoon: true
        }
      ]
    },
    emergency: {
      name: 'Complication Management',
      shortName: 'EMERGENCY',
      phase: 'Emergency Skills',
      icon: '⚠️',
      modules: [
        {
          id: 'capsule-tear-rescue',
          name: 'Capsule Tear Rescue',
          shortName: 'Tear Rescue',
          description: 'Manage radial tears. Emergency OVD placement.',
          pgy: 'PGY-3 Mid',
          classification: 'ADVANCED',
          duration: 60,
          icon: '⚠',
          skills: ['Crisis Recognition', 'OVD Placement', 'Technique Modification'],
          prevents: ['PCR Extension', 'Vitreous Loss', 'Nuclear Drop'],
          comingSoon: true
        },
        {
          id: 'zonular-stress',
          name: 'Zonular Stress Monitor',
          shortName: 'Zonular Monitor',
          description: 'Real-time zonular stress feedback during maneuvers.',
          pgy: 'PGY-3 Late',
          classification: 'ADVANCED',
          duration: 45,
          icon: '📊',
          skills: ['Stress Recognition', 'Force Modulation', 'Safe Limits'],
          prevents: ['Zonular Dialysis', 'Lens Subluxation', 'Vitreous Prolapse'],
          comingSoon: true
        },
        {
          id: 'reflex-floaters',
          name: 'Reflex/Floaters Reaction',
          shortName: 'Reflex Response',
          description: 'Rapid target acquisition and stabilization training.',
          pgy: 'PGY-2 Mid',
          classification: 'USEFUL',
          duration: 30,
          icon: '⚡',
          skills: ['Reaction Time', 'Correction Accuracy', 'Stabilization'],
          prevents: ['Delayed Response', 'Overcorrection', 'Instrument Collision']
        }
      ]
    }
  };

  // ===== FILTER STATE =====
  let selectedPGY = 'all';
  let selectedStatus = 'all';
  let selectedPhase = 'foundation';
  let selectedModule = null;
  let showComingSoon = true;

  // ===== COMPUTED DATA =====
  const phaseKeys = Object.keys(curriculum);
  
  $: currentPhase = curriculum[selectedPhase];
  
  $: filteredModules = currentPhase?.modules.filter(m => {
    if (!showComingSoon && m.comingSoon) return false;
    if (selectedStatus !== 'all' && m.classification !== selectedStatus.toUpperCase()) return false;
    if (selectedPGY !== 'all' && !m.pgy.includes(selectedPGY)) return false;
    return true;
  }) || [];

  $: totalModules = Object.values(curriculum).reduce((sum, p) => sum + p.modules.length, 0);
  $: activeModules = Object.values(curriculum).reduce((sum, p) => 
    sum + p.modules.filter(m => !m.comingSoon).length, 0);
  $: coreModules = Object.values(curriculum).reduce((sum, p) => 
    sum + p.modules.filter(m => m.classification === 'CORE').length, 0);

  // ===== FUNCTIONS =====
  function selectPhase(phase) {
    selectedPhase = phase;
    selectedModule = null;
  }

  function selectModule(module) {
    selectedModule = module;
  }

  function launchModule(module) {
    if (module.comingSoon) return;
    dispatch('select', module);
  }

  function getClassificationColor(classification) {
    switch(classification) {
      case 'CORE': return '#0fb89f';
      case 'USEFUL': return '#a78bfa';
      case 'ADVANCED': return '#f59e0b';
      default: return '#666';
    }
  }

  function getPGYColor(pgy) {
    if (pgy.includes('PGY-2')) return '#34d399';
    if (pgy.includes('PGY-3')) return '#60a5fa';
    if (pgy.includes('PGY-4')) return '#f472b6';
    return '#888';
  }
</script>

<div class="matrix-dashboard">
  <!-- ===== HEADER BAR ===== -->
  <header class="dashboard-header">
    <div class="header-left">
      <h1 class="dashboard-title">SURGICAL TRAINING MATRIX</h1>
      <div class="header-stats">
        <span class="stat"><span class="stat-value">{activeModules}</span>/{totalModules} Active</span>
        <span class="stat-divider">|</span>
        <span class="stat"><span class="stat-value">{coreModules}</span> Core</span>
      </div>
    </div>
    
    <div class="header-filters">
      <!-- PGY Filter -->
      <div class="filter-group">
        <span class="filter-label">PGY STAGE</span>
        <div class="filter-buttons">
          {#each ['all', 'PGY-2', 'PGY-3', 'PGY-4'] as pgy}
            <button 
              class="filter-btn" 
              class:active={selectedPGY === pgy}
              on:click={() => selectedPGY = pgy}
            >
              {pgy === 'all' ? 'ALL' : pgy}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Status Filter -->
      <div class="filter-group">
        <span class="filter-label">STATUS</span>
        <div class="filter-buttons">
          {#each ['all', 'CORE', 'USEFUL', 'ADVANCED'] as status}
            <button 
              class="filter-btn" 
              class:active={selectedStatus === status.toLowerCase()}
              class:core={status === 'CORE'}
              class:useful={status === 'USEFUL'}
              class:advanced={status === 'ADVANCED'}
              on:click={() => selectedStatus = status.toLowerCase()}
            >
              {status === 'all' ? 'ALL' : status}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </header>

  <!-- ===== PHASE TABS ===== -->
  <nav class="phase-tabs">
    {#each phaseKeys as phase}
      <button 
        class="phase-tab" 
        class:active={selectedPhase === phase}
        on:click={() => selectPhase(phase)}
      >
        <span class="phase-icon">{curriculum[phase].icon}</span>
        <span class="phase-name">{curriculum[phase].shortName}</span>
        <span class="phase-count">{curriculum[phase].modules.length}</span>
      </button>
    {/each}
  </nav>

  <!-- ===== MAIN CONTENT AREA ===== -->
  <div class="main-content">
    <!-- MODULE MATRIX -->
    <section class="module-matrix" class:has-detail={selectedModule}>
      <div class="matrix-header">
        <h2>{currentPhase?.name}</h2>
        <span class="phase-badge">{currentPhase?.phase}</span>
      </div>
      
      <div class="module-grid">
        {#each filteredModules as module (module.id)}
          <button 
            class="module-card"
            class:selected={selectedModule?.id === module.id}
            class:coming-soon={module.comingSoon}
            on:click={() => selectModule(module)}
            transition:scale={{ duration: 200 }}
          >
            <div class="card-header">
              <span class="module-icon">{module.icon}</span>
              <div class="card-badges">
                <span 
                  class="classification-badge"
                  style="--badge-color: {getClassificationColor(module.classification)}"
                >
                  {module.classification}
                </span>
              </div>
            </div>
            
            <h3 class="module-name">{module.shortName}</h3>
            
            <div class="card-meta">
              <span class="pgy-tag" style="--pgy-color: {getPGYColor(module.pgy)}">
                {module.pgy.replace(' Early', '').replace(' Mid', '').replace(' Late', '')}
              </span>
              <span class="duration">{module.duration}s</span>
            </div>
            
            {#if module.comingSoon}
              <div class="coming-soon-overlay">
                <span>COMING SOON</span>
              </div>
            {/if}
          </button>
        {:else}
          <div class="no-modules">
            <span class="no-modules-icon">🔍</span>
            <p>No modules match current filters</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- DETAIL PANEL -->
    {#if selectedModule}
      <aside class="detail-panel" transition:fly={{ x: 50, duration: 300 }}>
        <div class="detail-header">
          <div class="detail-title-row">
            <span class="detail-icon">{selectedModule.icon}</span>
            <div>
              <h2>{selectedModule.name}</h2>
              <span class="detail-subtitle">MODULE DETAIL</span>
            </div>
          </div>
          <button class="close-detail" on:click={() => selectedModule = null}>×</button>
        </div>
        
        <div class="detail-body">
          <!-- Goal Section -->
          <section class="detail-section">
            <h3>OBJECTIVE</h3>
            <p class="objective-text">{selectedModule.description}</p>
          </section>
          
          <!-- Metrics Grid -->
          <section class="detail-section">
            <h3>SKILLS TRAINED</h3>
            <div class="skills-grid">
              {#each selectedModule.skills as skill, i}
                <div class="skill-item">
                  <div class="skill-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      {#if i === 0}
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="3"/>
                      {:else if i === 1}
                        <path d="M12 2v20M2 12h20"/>
                        <circle cx="12" cy="12" r="6"/>
                      {:else}
                        <polygon points="12,2 22,22 2,22"/>
                      {/if}
                    </svg>
                  </div>
                  <span class="skill-name">{skill}</span>
                </div>
              {/each}
            </div>
          </section>
          
          <!-- Risk Mitigation -->
          <section class="detail-section risk-section">
            <h3>
              <span class="risk-icon">🛡️</span>
              RISK MITIGATION
            </h3>
            <div class="prevents-list">
              {#each selectedModule.prevents || [] as risk}
                <div class="prevent-item">
                  <span class="prevent-icon">⚠</span>
                  <span class="prevent-text">{risk}</span>
                  <span class="prevent-status">●</span>
                </div>
              {/each}
            </div>
          </section>
          
          <!-- Module Info -->
          <section class="detail-section info-section">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Duration</span>
                <span class="info-value">{selectedModule.duration}s</span>
              </div>
              <div class="info-item">
                <span class="info-label">Stage</span>
                <span class="info-value" style="color: {getPGYColor(selectedModule.pgy)}">{selectedModule.pgy}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Classification</span>
                <span class="info-value" style="color: {getClassificationColor(selectedModule.classification)}">{selectedModule.classification}</span>
              </div>
            </div>
          </section>
        </div>
        
        <!-- Launch Button -->
        <div class="detail-footer">
          <button 
            class="launch-btn"
            class:disabled={selectedModule.comingSoon}
            on:click={() => launchModule(selectedModule)}
          >
            {#if selectedModule.comingSoon}
              <span>COMING SOON</span>
            {:else}
              <span class="launch-icon">▶</span>
              <span>LAUNCH MODULE</span>
            {/if}
          </button>
        </div>
      </aside>
    {/if}
  </div>
</div>

<style>
  .matrix-dashboard {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #0a1a1f 0%, #0d2229 50%, #081418 100%);
    overflow: hidden;
  }

  /* ===== HEADER ===== */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(15, 184, 159, 0.2);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .dashboard-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 3px;
    margin: 0;
    background: linear-gradient(135deg, #0fb89f, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: #7aa8a0;
  }

  .stat-value {
    color: #0fb89f;
    font-weight: 700;
  }

  .stat-divider {
    opacity: 0.3;
  }

  .header-filters {
    display: flex;
    gap: 32px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    color: #5a7a80;
    font-weight: 600;
  }

  .filter-buttons {
    display: flex;
    gap: 4px;
  }

  .filter-btn {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #7aa8a0;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    background: rgba(15, 184, 159, 0.1);
    border-color: rgba(15, 184, 159, 0.3);
  }

  .filter-btn.active {
    background: rgba(15, 184, 159, 0.2);
    border-color: #0fb89f;
    color: #0fb89f;
    box-shadow: 0 0 10px rgba(15, 184, 159, 0.2);
  }

  .filter-btn.core.active { border-color: #0fb89f; color: #0fb89f; }
  .filter-btn.useful.active { border-color: #a78bfa; color: #a78bfa; }
  .filter-btn.advanced.active { border-color: #f59e0b; color: #f59e0b; }

  /* ===== PHASE TABS ===== */
  .phase-tabs {
    display: flex;
    gap: 2px;
    padding: 0 24px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .phase-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #5a7a80;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .phase-tab:hover {
    color: #7aa8a0;
    background: rgba(255, 255, 255, 0.02);
  }

  .phase-tab.active {
    color: #0fb89f;
    border-bottom-color: #0fb89f;
    background: rgba(15, 184, 159, 0.05);
  }

  .phase-icon {
    font-size: 14px;
  }

  .phase-name {
    display: block;
  }

  .phase-count {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 9px;
  }

  .phase-tab.active .phase-count {
    background: rgba(15, 184, 159, 0.2);
    color: #0fb89f;
  }

  /* ===== MAIN CONTENT ===== */
  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* ===== MODULE MATRIX ===== */
  .module-matrix {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    transition: all 0.3s ease;
  }

  .module-matrix.has-detail {
    max-width: calc(100% - 400px);
  }

  .matrix-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .matrix-header h2 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #e0f5f0;
  }

  .phase-badge {
    font-size: 9px;
    padding: 4px 10px;
    background: rgba(15, 184, 159, 0.15);
    border: 1px solid rgba(15, 184, 159, 0.3);
    border-radius: 12px;
    color: #0fb89f;
    letter-spacing: 1px;
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  /* ===== MODULE CARD ===== */
  .module-card {
    position: relative;
    padding: 16px;
    background: linear-gradient(135deg, rgba(20, 40, 50, 0.8), rgba(15, 30, 40, 0.9));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    overflow: hidden;
  }

  .module-card:hover {
    transform: translateY(-2px);
    border-color: rgba(15, 184, 159, 0.4);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  .module-card.selected {
    border-color: #0fb89f;
    box-shadow: 0 0 20px rgba(15, 184, 159, 0.3);
    background: linear-gradient(135deg, rgba(15, 184, 159, 0.1), rgba(15, 30, 40, 0.9));
  }

  .module-card.coming-soon {
    opacity: 0.6;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .module-icon {
    font-size: 24px;
    line-height: 1;
  }

  .card-badges {
    display: flex;
    gap: 4px;
  }

  .classification-badge {
    font-size: 8px;
    padding: 3px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--badge-color);
    color: var(--badge-color);
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .module-name {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 10px 0;
    color: #e0f5f0;
    line-height: 1.3;
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pgy-tag {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--pgy-color);
    font-weight: 600;
  }

  .duration {
    font-size: 10px;
    color: #5a7a80;
    font-family: 'SF Mono', monospace;
  }

  .coming-soon-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 12px;
  }

  .coming-soon-overlay span {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #666;
  }

  .no-modules {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #5a7a80;
  }

  .no-modules-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  /* ===== DETAIL PANEL ===== */
  .detail-panel {
    width: 400px;
    background: linear-gradient(180deg, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98));
    border-left: 1px solid rgba(15, 184, 159, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
    background: rgba(15, 184, 159, 0.08);
    border-bottom: 1px solid rgba(15, 184, 159, 0.15);
  }

  .detail-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .detail-icon {
    font-size: 32px;
    line-height: 1;
  }

  .detail-header h2 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #e0f5f0;
  }

  .detail-subtitle {
    font-size: 9px;
    letter-spacing: 2px;
    color: #0fb89f;
    display: block;
    margin-top: 4px;
  }

  .close-detail {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #7aa8a0;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-detail:hover {
    background: rgba(248, 113, 113, 0.2);
    border-color: #f87171;
    color: #f87171;
  }

  .detail-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .detail-section {
    margin-bottom: 24px;
  }

  .detail-section h3 {
    font-size: 10px;
    letter-spacing: 2px;
    color: #5a7a80;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .risk-icon {
    font-size: 14px;
  }

  .objective-text {
    font-size: 13px;
    line-height: 1.6;
    color: #b8d4d0;
    margin: 0;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .skill-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 8px;
    background: rgba(15, 184, 159, 0.08);
    border: 1px solid rgba(15, 184, 159, 0.15);
    border-radius: 8px;
  }

  .skill-icon-wrap {
    width: 32px;
    height: 32px;
    color: #0fb89f;
  }

  .skill-icon-wrap svg {
    width: 100%;
    height: 100%;
  }

  .skill-name {
    font-size: 10px;
    color: #b8d4d0;
    text-align: center;
    font-weight: 500;
  }

  .risk-section h3 {
    color: #f59e0b;
  }

  .prevents-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .prevent-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.15);
    border-radius: 6px;
  }

  .prevent-icon {
    color: #f87171;
    font-size: 12px;
  }

  .prevent-text {
    flex: 1;
    font-size: 12px;
    color: #d4a8a8;
  }

  .prevent-status {
    color: #5a7a80;
    font-size: 8px;
  }

  .info-section {
    margin-bottom: 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .info-item {
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .info-label {
    display: block;
    font-size: 9px;
    color: #5a7a80;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 13px;
    font-weight: 700;
    color: #e0f5f0;
  }

  /* ===== LAUNCH BUTTON ===== */
  .detail-footer {
    padding: 16px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .launch-btn {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #0fb89f, #0d9a85);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .launch-btn:hover:not(.disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(15, 184, 159, 0.4);
  }

  .launch-btn.disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }

  .launch-icon {
    font-size: 10px;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1200px) {
    .phase-tabs {
      overflow-x: auto;
    }
    
    .phase-name {
      display: none;
    }
    
    .detail-panel {
      width: 350px;
    }
  }

  @media (max-width: 900px) {
    .header-filters {
      flex-direction: column;
      gap: 12px;
    }
    
    .module-matrix.has-detail {
      display: none;
    }
    
    .detail-panel {
      width: 100%;
    }
  }
</style>
