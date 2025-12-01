<script>
  import { onMount, onDestroy } from 'svelte';
  let el;
  let pos = { x: -9999, y: -9999 };
  let angle = 0;
  let raf;
  let visible = false;

  function update() {
    const card = document.querySelector('.module-card[data-module="suture-tension"]');
    if (card) {
      const r = card.getBoundingClientRect();
      pos.x = r.left + r.width / 2;
      pos.y = r.top - 12; // a little above the card
      visible = true;
    } else {
      visible = false;
    }
    // Oscillating torque vector (fast, subtle)
    const t = performance.now() / 1000;
    angle = (Math.sin(t * 8) * 0.5 + Math.sin(t * 13) * 0.3) * 45; // ±~36°
    el && (el.style.transform = `translate(${pos.x}px, ${pos.y}px)`);
    raf = requestAnimationFrame(update);
  }

  onMount(() => { raf = requestAnimationFrame(update); });
  onDestroy(() => cancelAnimationFrame(raf));
</script>

{#if visible}
  <div class="torque-root" bind:this={el} aria-hidden="true">
    <div class="arrow" style="--a: {angle}deg"></div>
  </div>
{/if}

<style>
  .torque-root {
    position: fixed; /* track viewport position over the card */
    z-index: 4;
    pointer-events: none;
  }
  .arrow {
    width: 0; height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 12px solid rgba(52,211,153,0.9);
    filter: drop-shadow(0 0 6px rgba(52,211,153,0.5));
    transform: translate(-50%, -100%) rotate(var(--a, 0deg));
    animation: vibrate .06s linear infinite; /* fast micro-vibration */
  }
  @keyframes vibrate {
    0%,100% { transform: translate(-50%, -100%) rotate(var(--a, 0deg)) translateX(-0.6px); }
    50% { transform: translate(-50%, -100%) rotate(var(--a, 0deg)) translateX(0.6px); }
  }
</style>
