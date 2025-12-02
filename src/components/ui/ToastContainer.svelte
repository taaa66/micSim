<!--
  =============================================================================
  TOAST CONTAINER COMPONENT
  =============================================================================
  Renders all active toast notifications
  =============================================================================
-->

<script lang="ts">
  import { toasts } from '../../stores/toast';
  import Toast from './Toast.svelte';
  
  // Props
  export let position: 'top' | 'bottom' | 'top-right' | 'bottom-right' = 'top-right';
</script>

<div class="toast-container toast-container-{position}">
  {#each $toasts as toast (toast.id)}
    <Toast
      message={toast.message}
      type={toast.type}
      duration={0}
      {position}
      dismissible={toast.dismissible}
      onClose={() => toasts.remove(toast.id)}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }
  
  .toast-container :global(.toast) {
    position: relative;
    pointer-events: auto;
  }
  
  .toast-container-top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }
  
  .toast-container-bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    flex-direction: column-reverse;
  }
  
  .toast-container-top-right {
    top: 20px;
    right: 20px;
    align-items: flex-end;
  }
  
  .toast-container-bottom-right {
    bottom: 20px;
    right: 20px;
    align-items: flex-end;
    flex-direction: column-reverse;
  }
  
  @media (max-width: 480px) {
    .toast-container {
      left: 10px;
      right: 10px;
      transform: none;
    }
    
    .toast-container :global(.toast) {
      width: 100%;
    }
  }
</style>
