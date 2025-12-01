<script>
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  
  export let data = [];
  export let height = 200;
  
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  
  let width = 600;
  let containerEl;
  
  // Animated line progress
  const lineProgress = tweened(0, { duration: 1500, easing: cubicOut });
  
  onMount(() => {
    if (containerEl) {
      width = containerEl.clientWidth;
    }
    lineProgress.set(1);
  });
  
  // Calculate chart dimensions
  $: chartWidth = width - padding.left - padding.right;
  $: chartHeight = height - padding.top - padding.bottom;
  
  // Filter days with data
  $: activeDays = data.filter(d => d.averageScore !== null);
  
  // Calculate scales
  $: xScale = (index) => {
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };
  
  $: yScale = (value) => {
    const min = 0;
    const max = 100;
    return padding.top + chartHeight - ((value - min) / (max - min)) * chartHeight;
  };
  
  // Generate line path
  $: linePath = (() => {
    if (activeDays.length < 2) return '';
    
    let path = '';
    let started = false;
    
    data.forEach((d, i) => {
      if (d.averageScore !== null) {
        const x = xScale(i);
        const y = yScale(d.averageScore);
        
        if (!started) {
          path += `M ${x} ${y}`;
          started = true;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
    });
    
    return path;
  })();
  
  // Generate area path
  $: areaPath = (() => {
    if (activeDays.length < 2) return '';
    
    let path = '';
    let firstX = 0;
    let lastX = 0;
    let started = false;
    
    data.forEach((d, i) => {
      if (d.averageScore !== null) {
        const x = xScale(i);
        const y = yScale(d.averageScore);
        
        if (!started) {
          firstX = x;
          path += `M ${x} ${yScale(0)} L ${x} ${y}`;
          started = true;
        } else {
          path += ` L ${x} ${y}`;
        }
        lastX = x;
      }
    });
    
    if (started) {
      path += ` L ${lastX} ${yScale(0)} L ${firstX} ${yScale(0)} Z`;
    }
    
    return path;
  })();
  
  // Calculate total path length for animation
  $: pathLength = 2000; // Approximate
  
  // Y-axis labels
  $: yLabels = [0, 25, 50, 75, 100];
  
  // X-axis labels (show every 5 days)
  $: xLabels = data.filter((d, i) => i % 5 === 0 || i === data.length - 1);
</script>

<div class="chart-container" bind:this={containerEl}>
  <svg {width} {height} class="chart-svg">
    <defs>
      <!-- Area gradient -->
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(52, 211, 153, 0.4)" />
        <stop offset="100%" stop-color="rgba(52, 211, 153, 0)" />
      </linearGradient>
      
      <!-- Line gradient -->
      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0fb89f" />
        <stop offset="50%" stop-color="#34d399" />
        <stop offset="100%" stop-color="#6ee7b7" />
      </linearGradient>
      
      <!-- Glow effect -->
      <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    <!-- Grid lines -->
    {#each yLabels as label}
      <line
        x1={padding.left}
        y1={yScale(label)}
        x2={width - padding.right}
        y2={yScale(label)}
        class="grid-line"
      />
      <text
        x={padding.left - 8}
        y={yScale(label) + 4}
        class="y-label"
      >
        {label}
      </text>
    {/each}
    
    <!-- X-axis labels -->
    {#each data as d, i}
      {#if i % 7 === 0 || i === data.length - 1}
        <text
          x={xScale(i)}
          y={height - 10}
          class="x-label"
        >
          {d.label}
        </text>
      {/if}
    {/each}
    
    <!-- Area fill -->
    {#if areaPath}
      <path
        d={areaPath}
        fill="url(#areaGradient)"
        class="area-path"
        style="opacity: {$lineProgress}"
      />
    {/if}
    
    <!-- Line -->
    {#if linePath}
      <path
        d={linePath}
        stroke="url(#lineGradient)"
        stroke-width="3"
        fill="none"
        class="line-path"
        filter="url(#lineGlow)"
        stroke-dasharray={pathLength}
        stroke-dashoffset={pathLength * (1 - $lineProgress)}
      />
    {/if}
    
    <!-- Data points -->
    {#each data as d, i}
      {#if d.averageScore !== null}
        <g class="data-point" style="opacity: {$lineProgress}">
          <!-- Outer glow -->
          <circle
            cx={xScale(i)}
            cy={yScale(d.averageScore)}
            r="8"
            class="point-glow"
          />
          <!-- Point -->
          <circle
            cx={xScale(i)}
            cy={yScale(d.averageScore)}
            r="5"
            class="point"
          />
          <!-- Inner dot -->
          <circle
            cx={xScale(i)}
            cy={yScale(d.averageScore)}
            r="2"
            class="point-inner"
          />
          
          <!-- Tooltip trigger area -->
          <circle
            cx={xScale(i)}
            cy={yScale(d.averageScore)}
            r="15"
            fill="transparent"
            class="point-hover"
          />
          
          <!-- Tooltip -->
          <g class="tooltip" transform="translate({xScale(i)}, {yScale(d.averageScore) - 30})">
            <rect x="-35" y="-12" width="70" height="24" rx="6" />
            <text y="4" text-anchor="middle">
              {d.averageScore}% • {d.sessions} 🎯
            </text>
          </g>
        </g>
      {/if}
    {/each}
    
    <!-- Session bars (bottom) -->
    {#each data as d, i}
      {#if d.sessions > 0}
        <rect
          x={xScale(i) - 3}
          y={height - padding.bottom + 5}
          width="6"
          height={Math.min(d.sessions * 3, 15)}
          rx="2"
          class="session-bar"
          style="opacity: {$lineProgress * 0.6}"
        />
      {/if}
    {/each}
  </svg>
  
  <!-- Legend -->
  <div class="legend">
    <div class="legend-item">
      <span class="legend-dot score"></span>
      <span>ציון ממוצע</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot sessions"></span>
      <span>מספר אימונים</span>
    </div>
  </div>
</div>

<style>
  .chart-container {
    width: 100%;
    position: relative;
  }
  
  .chart-svg {
    display: block;
    overflow: visible;
  }
  
  .grid-line {
    stroke: rgba(122, 168, 160, 0.1);
    stroke-width: 1;
  }
  
  .y-label {
    font-size: 10px;
    fill: rgba(122, 168, 160, 0.6);
    text-anchor: end;
    font-family: monospace;
  }
  
  .x-label {
    font-size: 9px;
    fill: rgba(122, 168, 160, 0.6);
    text-anchor: middle;
  }
  
  .area-path {
    transition: opacity 0.5s ease;
  }
  
  .line-path {
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-dashoffset 1.5s ease-out;
  }
  
  .point-glow {
    fill: rgba(52, 211, 153, 0.3);
  }
  
  .point {
    fill: #34d399;
    stroke: #0a1a1f;
    stroke-width: 2;
    transition: r 0.2s ease;
  }
  
  .point-inner {
    fill: #fff;
  }
  
  .data-point:hover .point {
    r: 7;
  }
  
  .tooltip {
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }
  
  .data-point:hover .tooltip {
    opacity: 1;
  }
  
  .tooltip rect {
    fill: rgba(10, 26, 31, 0.95);
    stroke: rgba(52, 211, 153, 0.5);
    stroke-width: 1;
  }
  
  .tooltip text {
    font-size: 10px;
    fill: #e0f5f0;
    font-weight: 600;
  }
  
  .session-bar {
    fill: rgba(251, 191, 36, 0.6);
  }
  
  .legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 12px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: rgba(122, 168, 160, 0.8);
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  
  .legend-dot.score {
    background: #34d399;
  }
  
  .legend-dot.sessions {
    background: rgba(251, 191, 36, 0.6);
  }
</style>
