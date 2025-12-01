<script lang="ts">
  /**
   * TraceLine Component (V12.0)
   * DCS Trace Line - Must complete transition in < 250ms
   */
  import { onMount, createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { KINETIC, COLORS } from '../../core/constants';
  import type { ITraceLineConfig } from '../../core/models';

  export let config: ITraceLineConfig = {
    startX: 0,
    startY: 0,
    endX: 100,
    endY: 100,
    duration: KINETIC.TRACE_LINE_MAX_MS,
    color: COLORS.PRIMARY,
    width: 2
  };
  export let active: boolean = false;
  export let gpuAccelerated: boolean = true;

  const dispatch = createEventDispatcher();
  
  // V12.0 Requirement: Clamp duration to max 250ms
  $: clampedDuration = Math.min(config.duration, KINETIC.TRACE_LINE_MAX_MS);

  const lineProgress = tweened(0, {
    duration: clampedDuration,
    easing: cubicOut
  });

  let startTime: number = 0;
  let svgElement: SVGSVGElement;

  $: lineLength = Math.sqrt(
    Math.pow(config.endX - config.startX, 2) + 
    Math.pow(config.endY - config.startY, 2)
  );

  $: currentEndX = config.startX + (config.endX - config.startX) * $lineProgress;
  $: currentEndY = config.startY + (config.endY - config.startY) * $lineProgress;

  export function animate() {
    startTime = performance.now();
    lineProgress.set(0, { duration: 0 });
    
    requestAnimationFrame(() => {
      lineProgress.set(1).then(() => {
        const duration = performance.now() - startTime;
        
        dispatch('complete', {
          duration,
          withinLimit: duration <= KINETIC.TRACE_LINE_MAX_MS
        });

        if (duration > KINETIC.TRACE_LINE_MAX_MS) {
          console.warn(
            `[TraceLine] Animation exceeded ${KINETIC.TRACE_LINE_MAX_MS}ms limit: ${duration.toFixed(2)}ms`
          );
        }
      });
    });
  }

  export function reset() {
    lineProgress.set(0, { duration: 0 });
  }

  $: if (active) {
    animate();
  }

  onMount(() => {
    if (gpuAccelerated && svgElement) {
      svgElement.style.transform = 'translateZ(0)';
      svgElement.style.willChange = 'transform';
    }
  });
</script>

<svg
  bind:this={svgElement}
  class="trace-line absolute inset-0 w-full h-full pointer-events-none"
  style="
    {gpuAccelerated ? 'transform: translateZ(0);' : ''}
    will-change: contents;
  "
>
  <line
    x1={config.startX}
    y1={config.startY}
    x2={currentEndX}
    y2={currentEndY}
    stroke={config.color}
    stroke-width={config.width}
    stroke-linecap="round"
  />
  
  <!-- Glow effect -->
  <line
    x1={config.startX}
    y1={config.startY}
    x2={currentEndX}
    y2={currentEndY}
    stroke={config.color}
    stroke-width={config.width * 3}
    stroke-linecap="round"
    opacity="0.3"
    filter="blur(4px)"
  />
</svg>

<style>
  .trace-line {
    z-index: 10;
  }
  
  line {
    will-change: x2, y2;
  }
</style>
