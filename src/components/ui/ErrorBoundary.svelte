<!--
  =============================================================================
  ERROR BOUNDARY COMPONENT
  =============================================================================
  Catches and displays errors gracefully with recovery options
  =============================================================================
-->

<script lang="ts">
  import { onMount } from 'svelte';
  
  // Props
  export let fallback: string = 'משהו השתבש';
  export let showDetails: boolean = false;
  export let onError: ((error: Error) => void) | null = null;
  export let onRetry: (() => void) | null = null;
  
  // State
  let hasError = false;
  let error: Error | null = null;
  let errorInfo: string = '';
  
  // Handle errors from children
  function handleError(event: ErrorEvent) {
    hasError = true;
    error = event.error || new Error(event.message);
    errorInfo = event.message;
    
    if (onError && error) {
      onError(error);
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error);
    }
    
    // Prevent default error handling
    event.preventDefault();
  }
  
  // Handle unhandled promise rejections
  function handleRejection(event: PromiseRejectionEvent) {
    hasError = true;
    error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    errorInfo = error.message;
    
    if (onError) {
      onError(error);
    }
    
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Unhandled rejection:', error);
    }
    
    event.preventDefault();
  }
  
  // Reset error state
  function reset() {
    hasError = false;
    error = null;
    errorInfo = '';
    
    if (onRetry) {
      onRetry();
    }
  }
  
  // Reload page
  function reload() {
    window.location.reload();
  }
  
  // Go back to dashboard
  function goHome() {
    window.location.href = '/';
  }
  
  onMount(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });
</script>

{#if hasError}
  <div class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{fallback}</h2>
      <p class="error-message">
        אירעה שגיאה בלתי צפויה. אנא נסה שוב.
      </p>
      
      {#if showDetails && error}
        <details class="error-details">
          <summary>פרטי השגיאה</summary>
          <pre>{error.name}: {error.message}</pre>
          {#if error.stack}
            <pre class="stack-trace">{error.stack}</pre>
          {/if}
        </details>
      {/if}
      
      <div class="error-actions">
        <button class="btn-retry" on:click={reset}>
          🔄 נסה שוב
        </button>
        <button class="btn-reload" on:click={reload}>
          ↻ רענן דף
        </button>
        <button class="btn-home" on:click={goHome}>
          🏠 חזור לדף הבית
        </button>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
    z-index: 9999;
    padding: 20px;
  }
  
  .error-content {
    max-width: 500px;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 16px;
    padding: 40px;
    backdrop-filter: blur(10px);
  }
  
  .error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  .error-title {
    font-size: 1.5rem;
    color: #ef4444;
    margin: 0 0 12px 0;
    font-weight: 600;
  }
  
  .error-message {
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 24px 0;
    line-height: 1.6;
  }
  
  .error-details {
    text-align: left;
    margin-bottom: 24px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 12px;
  }
  
  .error-details summary {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  
  .error-details pre {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.75rem;
    color: #ef4444;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 8px 0;
  }
  
  .stack-trace {
    color: rgba(255, 255, 255, 0.5) !important;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .error-actions button {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }
  
  .btn-retry {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
  }
  
  .btn-retry:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  .btn-reload {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .btn-reload:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  .btn-home {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .btn-home:hover {
    background: rgba(16, 185, 129, 0.3);
  }
  
  @media (max-width: 480px) {
    .error-content {
      padding: 24px;
    }
    
    .error-icon {
      font-size: 3rem;
    }
    
    .error-title {
      font-size: 1.25rem;
    }
    
    .error-actions {
      flex-direction: column;
    }
    
    .error-actions button {
      width: 100%;
    }
  }
</style>
