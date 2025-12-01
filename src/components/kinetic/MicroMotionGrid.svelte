<script lang="ts">
  /**
   * MicroMotionGrid - Subtle grid animation for visual depth
   */
  import { COLORS, KINETIC } from '../../core/constants';

  export let gridSize: number = 40;
  export let color: string = COLORS.PRIMARY;
  export let opacity: number = 0.05;
  export let animated: boolean = true;
</script>

<div
  class="micro-motion-grid absolute inset-0 overflow-hidden pointer-events-none"
  style="transform: translateZ(0);"
>
  <svg
    class="w-full h-full"
    style="opacity: {opacity};"
  >
    <defs>
      <pattern
        id="grid-pattern"
        width={gridSize}
        height={gridSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M {gridSize} 0 L 0 0 0 {gridSize}"
          fill="none"
          stroke={color}
          stroke-width="0.5"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
  </svg>

  {#if animated}
    <div
      class="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-bg-dark"
      style="
        animation: pulse {KINETIC.TRANSITION_SLOW * 10}ms ease-in-out infinite;
        transform: translateZ(0);
      "
    ></div>
  {/if}
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  .micro-motion-grid {
    will-change: transform;
    z-index: 0;
  }
</style>
