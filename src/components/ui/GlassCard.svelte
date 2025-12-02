<script lang="ts">
  export let variant: 'default' | 'dark' | 'glow' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let hoverEffect = false;
  export let className = '';
</script>

<div 
  class="glass-card variant-{variant} padding-{padding} {className}"
  class:hover-effect={hoverEffect}
  on:click
  on:keydown
  role="group"
>
  <!-- Shine effect element -->
  <div class="shine"></div>
  
  <slot />
</div>

<style>
  .glass-card {
    position: relative;
    background: rgba(15, 23, 42, 0.6); /* Slate 900 with opacity */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s var(--ease-smooth, cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  /* VARIANTS */
  .variant-dark {
    background: rgba(2, 6, 23, 0.8);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .variant-glow {
    background: rgba(20, 184, 166, 0.05);
    border: 1px solid rgba(20, 184, 166, 0.2);
    box-shadow: 
      0 0 15px rgba(20, 184, 166, 0.1),
      inset 0 0 20px rgba(20, 184, 166, 0.05);
  }

  /* PADDING */
  .padding-none { padding: 0; }
  .padding-sm { padding: 0.75rem; }
  .padding-md { padding: 1.5rem; }
  .padding-lg { padding: 2rem; }

  /* HOVER EFFECT */
  .hover-effect:hover {
    transform: translateY(-2px);
    border-color: rgba(20, 184, 166, 0.3);
    box-shadow: 
      0 10px 15px -3px rgba(0, 0, 0, 0.2),
      0 4px 6px -2px rgba(0, 0, 0, 0.1),
      0 0 20px rgba(20, 184, 166, 0.1);
  }

  /* SHINE ANIMATION */
  .shine {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      125deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.02) 45%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.02) 55%,
      transparent 60%,
      transparent 100%
    );
    transform: translateX(-100%);
    transition: transform 0.5s;
    pointer-events: none;
  }

  .hover-effect:hover .shine {
    transform: translateX(100%);
    transition: transform 0.8s;
  }
</style>
