<!--
  =============================================================================
  LOADING SKELETON COMPONENT
  =============================================================================
  Animated placeholder for loading states
  =============================================================================
-->

<script lang="ts">
  // Props
  export let variant: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' = 'text';
  export let width: string = '100%';
  export let height: string = 'auto';
  export let lines: number = 1;
  export let animated: boolean = true;
  export let className: string = '';
</script>

{#if variant === 'text'}
  <div class="skeleton-container {className}">
    {#each Array(lines) as _, i}
      <div 
        class="skeleton skeleton-text" 
        class:animated
        style="width: {i === lines - 1 && lines > 1 ? '70%' : width}; height: {height === 'auto' ? '1em' : height};"
      ></div>
    {/each}
  </div>
{:else if variant === 'circular'}
  <div 
    class="skeleton skeleton-circular {className}" 
    class:animated
    style="width: {width}; height: {width};"
  ></div>
{:else if variant === 'avatar'}
  <div 
    class="skeleton skeleton-circular {className}" 
    class:animated
    style="width: 48px; height: 48px;"
  ></div>
{:else if variant === 'rectangular'}
  <div 
    class="skeleton skeleton-rectangular {className}" 
    class:animated
    style="width: {width}; height: {height};"
  ></div>
{:else if variant === 'card'}
  <div class="skeleton-card {className}">
    <div class="skeleton skeleton-rectangular" class:animated style="height: 140px;"></div>
    <div class="skeleton-card-content">
      <div class="skeleton skeleton-text" class:animated style="width: 80%;"></div>
      <div class="skeleton skeleton-text" class:animated style="width: 60%;"></div>
      <div class="skeleton skeleton-text" class:animated style="width: 40%;"></div>
    </div>
  </div>
{/if}

<style>
  .skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .skeleton {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    background-size: 200% 100%;
    border-radius: 4px;
  }
  
  .skeleton.animated {
    animation: shimmer 1.5s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  .skeleton-text {
    height: 1em;
    border-radius: 4px;
  }
  
  .skeleton-circular {
    border-radius: 50%;
  }
  
  .skeleton-rectangular {
    border-radius: 8px;
  }
  
  .skeleton-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .skeleton-card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
