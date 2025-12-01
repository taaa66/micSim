<script>
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  
  export let skills = [];
  export let size = 280;
  
  const center = size / 2;
  const maxRadius = (size / 2) - 40;
  const levels = 5; // 20%, 40%, 60%, 80%, 100%
  
  // Animated values for each skill
  let animatedScores = skills.map(() => tweened(0, { duration: 1000, easing: cubicOut }));
  
  // Calculate point position
  function getPoint(index, value, total) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  }
  
  // Generate polygon points for a level
  function getLevelPath(level) {
    const points = [];
    const numPoints = skills.length || 6;
    for (let i = 0; i < numPoints; i++) {
      const point = getPoint(i, level * 20, numPoints);
      points.push(`${point.x},${point.y}`);
    }
    return points.join(' ');
  }
  
  // Generate skill polygon path
  $: skillPath = (() => {
    if (!skills.length) return '';
    const points = skills.map((skill, i) => {
      const score = $animatedScores[i] || 0;
      return getPoint(i, score, skills.length);
    });
    return points.map(p => `${p.x},${p.y}`).join(' ');
  })();
  
  // Animate on mount and when skills change
  onMount(() => {
    updateAnimations();
  });
  
  $: if (skills.length > 0) {
    updateAnimations();
  }
  
  function updateAnimations() {
    skills.forEach((skill, i) => {
      if (!animatedScores[i]) {
        animatedScores[i] = tweened(0, { duration: 1000, easing: cubicOut });
      }
      animatedScores[i].set(skill.score || 0);
    });
  }
  
  // Label positions
  $: labelPositions = skills.map((skill, i) => {
    const point = getPoint(i, 115, skills.length);
    return { ...skill, ...point };
  });
</script>

<div class="radar-container">
  <svg viewBox="0 0 {size} {size}" class="radar-svg">
    <defs>
      <!-- Gradient for the skill area -->
      <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#34d399;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#0fb89f;stop-opacity:0.4" />
      </linearGradient>
      
      <!-- Glow filter -->
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <!-- Dot glow -->
      <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background levels -->
    {#each [5, 4, 3, 2, 1] as level}
      <polygon 
        points={getLevelPath(level)}
        class="level-polygon"
        style="opacity: {0.1 + level * 0.05}"
      />
    {/each}
    
    <!-- Level lines -->
    {#each [1, 2, 3, 4, 5] as level}
      <polygon 
        points={getLevelPath(level)}
        class="level-line"
      />
    {/each}
    
    <!-- Axis lines -->
    {#each skills as skill, i}
      {@const point = getPoint(i, 100, skills.length)}
      <line 
        x1={center} 
        y1={center} 
        x2={point.x} 
        y2={point.y}
        class="axis-line"
      />
    {/each}
    
    <!-- Skill area -->
    {#if skillPath}
      <polygon 
        points={skillPath}
        class="skill-polygon"
        filter="url(#glow)"
      />
      
      <!-- Skill area border -->
      <polygon 
        points={skillPath}
        class="skill-border"
      />
    {/if}
    
    <!-- Skill points -->
    {#each skills as skill, i}
      {@const score = $animatedScores[i] || 0}
      {@const point = getPoint(i, score, skills.length)}
      <circle 
        cx={point.x} 
        cy={point.y} 
        r="6"
        class="skill-point"
        style="fill: {skill.color}"
        filter="url(#dotGlow)"
      />
      <circle 
        cx={point.x} 
        cy={point.y} 
        r="3"
        class="skill-point-inner"
      />
    {/each}
    
    <!-- Center point -->
    <circle cx={center} cy={center} r="4" class="center-point" />
  </svg>
  
  <!-- Labels -->
  <div class="labels">
    {#each labelPositions as label, i}
      {@const score = Math.round($animatedScores[i] || 0)}
      <div 
        class="label"
        style="
          left: {label.x}px; 
          top: {label.y}px;
          --label-color: {label.color};
        "
      >
        <span class="label-icon">{label.icon}</span>
        <span class="label-name">{label.name}</span>
        <span class="label-score" class:high={score >= 80} class:low={score < 40}>
          {score}%
        </span>
      </div>
    {/each}
  </div>
  
  <!-- Level indicators -->
  <div class="level-labels">
    {#each [20, 40, 60, 80, 100] as level, i}
      <span 
        class="level-label"
        style="bottom: {40 + (maxRadius / 5) * (i + 1)}px"
      >
        {level}
      </span>
    {/each}
  </div>
</div>

<style>
  .radar-container {
    position: relative;
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1;
    margin: 0 auto;
  }
  
  .radar-svg {
    width: 100%;
    height: 100%;
  }
  
  .level-polygon {
    fill: rgba(15, 184, 159, 0.1);
  }
  
  .level-line {
    fill: none;
    stroke: rgba(15, 184, 159, 0.2);
    stroke-width: 1;
  }
  
  .axis-line {
    stroke: rgba(15, 184, 159, 0.15);
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }
  
  .skill-polygon {
    fill: url(#skillGradient);
    transition: all 0.3s ease;
  }
  
  .skill-border {
    fill: none;
    stroke: #34d399;
    stroke-width: 2;
    stroke-linejoin: round;
  }
  
  .skill-point {
    transition: all 0.2s ease;
  }
  
  .skill-point:hover {
    r: 8;
  }
  
  .skill-point-inner {
    fill: #fff;
  }
  
  .center-point {
    fill: rgba(15, 184, 159, 0.5);
  }
  
  .labels {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  
  .label {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;
  }
  
  .label-icon {
    font-size: 20px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  }
  
  .label-name {
    font-size: 10px;
    font-weight: 600;
    color: #e0f5f0;
    white-space: nowrap;
  }
  
  .label-score {
    font-size: 12px;
    font-weight: 700;
    color: var(--label-color, #34d399);
    background: rgba(0, 0, 0, 0.4);
    padding: 2px 6px;
    border-radius: 8px;
  }
  
  .label-score.high {
    color: #34d399;
    text-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
  }
  
  .label-score.low {
    color: #fbbf24;
  }
  
  .level-labels {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
  }
  
  .level-label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    color: rgba(122, 168, 160, 0.4);
    font-family: monospace;
  }
</style>
