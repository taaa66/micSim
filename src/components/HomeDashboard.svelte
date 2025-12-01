<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Curriculum organized by surgical phase and PGY stage
  const curriculum = {
    foundation: {
      name: 'Foundation Skills',
      phase: 'Pre-Surgical',
      description: 'Master before any live surgery',
      modules: [
        {
          id: 'micro-tremor',
          name: 'Micro-Tremor Control',
          description: 'Hold steady in target zones. Minimize physiologic hand tremor.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 120,
          icon: '◎',
          skills: ['Tremor Suppression', 'Stability', 'Spatial Accuracy']
        },
        {
          id: 'tissue-grasping',
          name: 'Tissue Grasping Trainer',
          description: 'Grasp tissue without overstretching. Control force to prevent crush injury.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 60,
          icon: '✊',
          skills: ['Grasping Force', 'Pressure Control', 'Hold Stability']
        },
        {
          id: 'needle-angle',
          name: 'Needle Angle Trainer',
          description: 'Insert needle at precise angles for paracentesis and IVT procedures.',
          pgy: 'PGY-2 Mid',
          classification: 'CORE',
          duration: 90,
          icon: '∠',
          skills: ['Angle Control', 'Depth Control', 'Pressure Uniformity']
        }
      ]
    },
    incision: {
      name: 'Incision & Access',
      phase: 'Surgical Phase 1',
      description: 'Wound construction and entry',
      modules: [
        {
          id: 'corneal-tunnel',
          name: 'Corneal Tunnel Formation',
          description: 'Create self-sealing, multi-planar wound. Prevent astigmatism and leakage.',
          pgy: 'PGY-2 Mid',
          classification: 'CORE',
          duration: 30,
          icon: '━',
          skills: ['Angle Control', 'Depth Control', 'Path Accuracy'],
          complications: ['Wound Leakage', 'Induced Astigmatism', 'Thermal Burn']
        }
      ]
    },
    capsulorhexis: {
      name: 'Capsulorhexis',
      phase: 'Surgical Phase 2',
      description: 'Critical anterior capsule management',
      modules: [
        {
          id: 'capsulorhexis',
          name: 'Capsulorhexis Trainer',
          description: 'Continuous curvilinear tear with visual force feedback. Prevent runout/PCR.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 40,
          icon: '◯',
          skills: ['Path Accuracy', 'Stability', 'Force Control'],
          complications: ['Anterior Capsule Runout', 'PCR', 'Residual Flap']
        }
      ]
    },
    phaco: {
      name: 'Phacoemulsification',
      phase: 'Surgical Phase 3',
      description: 'Nucleus removal - Coming Soon',
      modules: [
        {
          id: 'hydrodissection',
          name: 'Hydrodissection Control',
          description: 'Controlled fluid wave delivery. Prevent zonular stress.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 45,
          icon: '💧',
          skills: ['Flow Control', 'Pressure Sensing', 'Wave Visualization'],
          complications: ['Zonular Dialysis', 'Pressure Spike', 'Incomplete Separation']
        },
        {
          id: 'phaco-sculpting',
          name: 'Phaco Sculpting',
          description: 'Trench creation and quadrant removal. Hand-eye-foot coordination.',
          pgy: 'PGY-2 Mid',
          classification: 'CORE',
          duration: 60,
          icon: '⚡',
          skills: ['Depth Control', 'Pedal Coordination', 'Quadrant Management'],
          comingSoon: true
        }
      ]
    },
    implantation: {
      name: 'IOL Implantation',
      phase: 'Surgical Phase 4',
      description: 'Lens insertion - Coming Soon',
      modules: [
        {
          id: 'iol-insertion',
          name: 'IOL Insertion & Centration',
          description: 'Foldable IOL insertion with haptic placement accuracy.',
          pgy: 'PGY-2 Late',
          classification: 'CORE',
          duration: 45,
          icon: '⊙',
          skills: ['Haptic Control', 'Centration', 'Corneal Clearance'],
          comingSoon: true
        },
        {
          id: 'viscoelastic',
          name: 'Viscoelastic Management',
          description: 'OVD injection, exchange, and anterior chamber maintenance.',
          pgy: 'PGY-2 Early',
          classification: 'CORE',
          duration: 30,
          icon: '◈',
          skills: ['Flow Control', 'Chamber Stability', 'Endothelial Protection'],
          comingSoon: true
        }
      ]
    },
    closure: {
      name: 'Wound Closure',
      phase: 'Surgical Phase 5',
      description: 'Sealing and suturing',
      modules: [
        {
          id: 'wound-hydration',
          name: 'Wound Hydration & Sealing',
          description: 'Stromal hydration for self-sealing closure.',
          pgy: 'PGY-2 Late',
          classification: 'CORE',
          duration: 25,
          icon: '≋',
          skills: ['Injection Precision', 'Seal Verification'],
          comingSoon: true
        },
        {
          id: 'corneal-suture',
          name: 'Corneal Suture Placement',
          description: 'Symmetric entry/exit points. Prevent astigmatism.',
          pgy: 'PGY-3 Mid',
          classification: 'USEFUL',
          duration: 35,
          icon: '⤫',
          skills: ['Angle Control', 'Depth Uniformity', 'Path Accuracy']
        },
        {
          id: 'suture-tension',
          name: 'Suture Tension Trainer',
          description: 'Precise knot tension with visual force feedback.',
          pgy: 'PGY-3 Late',
          classification: 'USEFUL',
          duration: 90,
          icon: '⊗',
          skills: ['Tension Control', 'Consistency', 'Force Sensing']
        }
      ]
    },
    specialty: {
      name: 'Specialty Procedures',
      phase: 'Advanced',
      description: 'Subspecialty and refinement skills',
      modules: [
        {
          id: 'gas-injection',
          name: 'Gas/Liquid Injection',
          description: 'Vitreoretinal fluidics. Flow rate and pressure control.',
          pgy: 'PGY-4 Early',
          classification: 'USEFUL',
          duration: 25,
          icon: '↘',
          skills: ['Flow Rate', 'Pressure Control', 'Angle Stability'],
          track: 'Retina'
        },
        {
          id: 'capsule-polish',
          name: 'Posterior Capsule Polishing',
          description: 'I/A tip control with extreme tremor suppression.',
          pgy: 'PGY-3 Early',
          classification: 'CORE',
          duration: 45,
          icon: '✧',
          skills: ['Tremor Control', 'Depth Precision', 'Force Limitation'],
          comingSoon: true
        }
      ]
    },
    emergency: {
      name: 'Complication Management',
      phase: 'Emergency Skills',
      description: 'Managing surgical complications',
      modules: [
        {
          id: 'capsule-tear-rescue',
          name: 'Capsule Tear Rescue',
          description: 'Manage radial tears. Emergency OVD placement.',
          pgy: 'PGY-3 Mid',
          classification: 'ADVANCED',
          duration: 60,
          icon: '⚠',
          skills: ['Crisis Recognition', 'OVD Placement', 'Technique Modification'],
          comingSoon: true
        },
        {
          id: 'zonular-stress',
          name: 'Zonular Stress Monitor',
          description: 'Real-time zonular stress feedback during maneuvers.',
          pgy: 'PGY-3 Late',
          classification: 'ADVANCED',
          duration: 45,
          icon: '📊',
          skills: ['Stress Recognition', 'Force Modulation', 'Safe Limits'],
          comingSoon: true
        }
      ]
    }
  };

  let selectedPhase = 'all';
  let selectedPGY = 'all';
  let showComingSoon = true;

  $: filteredCurriculum = Object.entries(curriculum).map(([key, phase]) => ({
    ...phase,
    key,
    modules: phase.modules.filter(m => {
      if (!showComingSoon && m.comingSoon) return false;
      if (selectedPGY !== 'all' && !m.pgy.includes(selectedPGY)) return false;
      return true;
    })
  })).filter(phase => phase.modules.length > 0);

  $: totalModules = Object.values(curriculum).reduce((sum, p) => sum + p.modules.length, 0);
  $: availableModules = Object.values(curriculum).reduce((sum, p) => 
    sum + p.modules.filter(m => !m.comingSoon).length, 0);

  function selectSim(sim) {
    if (sim.comingSoon) return;
    dispatch('select', sim);
  }
</script>

<div class="dashboard">
  <header class="dashboard-header">
    <h1>Micro-Sim Ophthalmology Trainer</h1>
    <p>Structured Surgical Skill Curriculum • {availableModules} Active / {totalModules} Total Modules</p>
  </header>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <label for="pgy-select">PGY Stage:</label>
      <select id="pgy-select" bind:value={selectedPGY}>
        <option value="all">All Stages</option>
        <option value="PGY-2">PGY-2</option>
        <option value="PGY-3">PGY-3</option>
        <option value="PGY-4">PGY-4</option>
      </select>
    </div>
    <label class="toggle">
      <input type="checkbox" bind:checked={showComingSoon}>
      <span>Show Coming Soon</span>
    </label>
  </div>

  <!-- Curriculum Phases -->
  {#each filteredCurriculum as phase}
    <section class="phase-section">
      <div class="phase-header">
        <div class="phase-info">
          <h2>{phase.name}</h2>
          <span class="phase-label">{phase.phase}</span>
        </div>
        <p class="phase-desc">{phase.description}</p>
      </div>

      <div class="modules-grid">
        {#each phase.modules as sim}
          <button 
            class="module-card" 
            class:coming-soon={sim.comingSoon}
            class:core={sim.classification === 'CORE'}
            class:useful={sim.classification === 'USEFUL'}
            class:advanced={sim.classification === 'ADVANCED'}
            on:click={() => selectSim(sim)}
            disabled={sim.comingSoon}
          >
            <div class="module-icon">{sim.icon}</div>
            <div class="module-content">
              <div class="module-header">
                <h3>{sim.name}</h3>
                {#if sim.comingSoon}
                  <span class="badge coming">Coming Soon</span>
                {:else}
                  <span class="badge classification-{sim.classification.toLowerCase()}">{sim.classification}</span>
                {/if}
              </div>
              <p class="module-desc">{sim.description}</p>
              <div class="module-meta">
                <span class="pgy">{sim.pgy}</span>
                <span class="duration">{sim.duration}s</span>
                {#if sim.track}
                  <span class="track">{sim.track}</span>
                {/if}
              </div>
              {#if sim.skills}
                <div class="skills">
                  {#each sim.skills as skill}
                    <span class="skill-tag">{skill}</span>
                  {/each}
                </div>
              {/if}
              {#if sim.complications}
                <div class="complications">
                  <span class="comp-label">Prevents:</span>
                  {#each sim.complications as comp}
                    <span class="comp-tag">{comp}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/each}

  <!-- Legend -->
  <footer class="legend">
    <div class="legend-item"><span class="dot core"></span> CORE - Essential for competency</div>
    <div class="legend-item"><span class="dot useful"></span> USEFUL - Specialty/refinement</div>
    <div class="legend-item"><span class="dot advanced"></span> ADVANCED - Emergency/complication</div>
  </footer>
</div>

<style>
  .dashboard {
    min-height: 100vh;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0d1f23 0%, #1a3038 100%);
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .dashboard-header h1 {
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    color: #e0f5f0;
    margin: 0 0 0.5rem;
    font-weight: 700;
  }

  .dashboard-header p {
    color: #7aa8a0;
    font-size: 0.95rem;
    margin: 0;
  }

  /* Filters */
  .filters {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-group label {
    color: #7aa8a0;
    font-size: 0.85rem;
  }

  .filter-group select {
    padding: 0.4rem 0.8rem;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    color: #e0f5f0;
    font-size: 0.85rem;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #7aa8a0;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .toggle input {
    accent-color: #0fb89f;
  }

  /* Phase Sections */
  .phase-section {
    max-width: 1400px;
    margin: 0 auto 2.5rem;
  }

  .phase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .phase-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .phase-info h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .phase-label {
    padding: 0.25rem 0.6rem;
    background: rgba(15, 184, 159, 0.15);
    border-radius: 4px;
    color: #0fb89f;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .phase-desc {
    margin: 0;
    color: #6a9a92;
    font-size: 0.85rem;
  }

  /* Module Grid */
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }

  /* Module Card */
  .module-card {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    color: inherit;
    font-family: inherit;
    border-left: 3px solid transparent;
  }

  .module-card:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(15, 184, 159, 0.3);
    transform: translateY(-1px);
  }

  .module-card.core { border-left-color: #0fb89f; }
  .module-card.useful { border-left-color: #fbbf24; }
  .module-card.advanced { border-left-color: #f87171; }

  .module-card.coming-soon {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .module-icon {
    font-size: 1.8rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 184, 159, 0.1);
    border-radius: 10px;
    color: #0fb89f;
    flex-shrink: 0;
  }

  .coming-soon .module-icon {
    background: rgba(100,100,100,0.1);
    color: #666;
  }

  .module-content {
    flex: 1;
    min-width: 0;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .module-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #e0f5f0;
    font-weight: 600;
  }

  .badge {
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .badge.coming {
    background: rgba(100,100,100,0.3);
    color: #888;
  }

  .badge.classification-core {
    background: rgba(15, 184, 159, 0.2);
    color: #0fb89f;
  }

  .badge.classification-useful {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }

  .badge.classification-advanced {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
  }

  .module-desc {
    margin: 0 0 0.6rem;
    font-size: 0.8rem;
    color: #8ab0a8;
    line-height: 1.4;
  }

  .module-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .pgy {
    padding: 0.2rem 0.5rem;
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    border-radius: 4px;
  }

  .duration {
    padding: 0.2rem 0.5rem;
    background: rgba(255,255,255,0.05);
    color: #6a9a92;
    border-radius: 4px;
  }

  .track {
    padding: 0.2rem 0.5rem;
    background: rgba(168, 85, 247, 0.15);
    color: #a855f7;
    border-radius: 4px;
  }

  .skills {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
    margin-bottom: 0.4rem;
  }

  .skill-tag {
    padding: 0.15rem 0.4rem;
    background: rgba(15, 184, 159, 0.1);
    color: #5db8a8;
    border-radius: 3px;
    font-size: 0.65rem;
  }

  .complications {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .comp-label {
    color: #f87171;
    font-size: 0.65rem;
    font-weight: 500;
  }

  .comp-tag {
    padding: 0.15rem 0.4rem;
    background: rgba(248, 113, 113, 0.1);
    color: #fca5a5;
    border-radius: 3px;
    font-size: 0.65rem;
  }

  /* Legend */
  .legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #7aa8a0;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .dot.core { background: #0fb89f; }
  .dot.useful { background: #fbbf24; }
  .dot.advanced { background: #f87171; }
</style>
