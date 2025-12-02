/**
 * =============================================================================
 * LAZY LOADING UTILITIES
 * =============================================================================
 * Dynamic component loading for better initial load performance
 * =============================================================================
 */

// =============================================================================
// TYPES
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = any;

export interface LazyLoadOptions {
  /** Delay before loading (ms) */
  delay?: number;
  /** Timeout for loading (ms) */
  timeout?: number;
  /** Retry attempts on failure */
  retries?: number;
  /** Preload on hover/focus */
  preload?: boolean;
}

export interface LazyComponentState {
  loading: boolean;
  error: Error | null;
  component: AnyComponent | null;
}

// =============================================================================
// LAZY LOAD FUNCTION
// =============================================================================

/**
 * Create a lazy-loaded component wrapper
 * @param loader - Dynamic import function
 * @param options - Loading options
 */
export function lazyLoad<T>(
  loader: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): () => Promise<T> {
  const { delay = 0, timeout = 10000, retries = 2 } = options;
  
  let cachedComponent: T | null = null;
  let loadPromise: Promise<T> | null = null;
  
  async function load(): Promise<T> {
    // Return cached component if available
    if (cachedComponent) {
      return cachedComponent;
    }
    
    // Return existing promise if loading
    if (loadPromise) {
      return loadPromise;
    }
    
    loadPromise = (async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Optional delay
          if (delay > 0 && attempt === 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Load with timeout
          const result = await Promise.race([
            loader(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Component load timeout')), timeout)
            )
          ]);
          
          cachedComponent = result.default;
          return cachedComponent;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(`Lazy load attempt ${attempt + 1} failed:`, lastError.message);
          
          // Wait before retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
      
      throw lastError || new Error('Failed to load component');
    })();
    
    return loadPromise;
  }
  
  return load;
}

// =============================================================================
// PRELOAD UTILITIES
// =============================================================================

/**
 * Preload a component on idle
 */
export function preloadOnIdle(loader: () => Promise<unknown>): void {
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      loader().catch(() => {});
    });
  } else {
    setTimeout(() => {
      loader().catch(() => {});
    }, 200);
  }
}

/**
 * Preload a component on visibility
 */
export function preloadOnVisible(
  element: HTMLElement,
  loader: () => Promise<unknown>
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loader().catch(() => {});
        observer.disconnect();
      }
    },
    { rootMargin: '100px' }
  );
  
  observer.observe(element);
  
  return () => observer.disconnect();
}

// =============================================================================
// COMPONENT LOADERS
// =============================================================================

// Simulation components (heavy, load on demand)
export const lazyCapsulorhexis = lazyLoad(
  () => import('../components/sims/CapsulorhexisTrainer.svelte')
);

export const lazyCornealTunnel = lazyLoad(
  () => import('../components/sims/CornealTunnelFormation.svelte')
);

export const lazyCornealSuture = lazyLoad(
  () => import('../components/sims/CornealSuturePlacement.svelte')
);

export const lazyGasInjection = lazyLoad(
  () => import('../components/sims/GasLiquidInjection.svelte')
);

export const lazyReflexFloaters = lazyLoad(
  () => import('../components/sims/ReflexFloatersReaction.svelte')
);

export const lazyTissueGrasping = lazyLoad(
  () => import('../components/sims/TissueGraspingTrainer.svelte')
);

export const lazyNeedleAngle = lazyLoad(
  () => import('../components/sims/NeedleAngleTrainer.svelte')
);

export const lazyMicroTremor = lazyLoad(
  () => import('../components/sims/MicroTremorControl.svelte')
);

export const lazyCornealArc = lazyLoad(
  () => import('../components/sims/CornealArcCutter.svelte')
);

export const lazySutureTension = lazyLoad(
  () => import('../components/sims/SutureTensionTrainer.svelte')
);

export const lazyHydrodissection = lazyLoad(
  () => import('../components/sims/HydrodissectionControl.svelte')
);

// Game components
export const lazyTremorShield = lazyLoad(
  () => import('../components/games/TremorShield.svelte')
);

export const lazyVectorRace = lazyLoad(
  () => import('../components/games/VectorRace.svelte')
);

export const lazyNanoGrip = lazyLoad(
  () => import('../components/games/NanoGripGauntlet.svelte')
);

// Analytics (heavy charts)
export const lazyAnalytics = lazyLoad(
  () => import('../components/analytics/AnalyticsDashboard.svelte')
);

// Rota module
export const lazyRotaHub = lazyLoad(
  () => import('../modules/rota/components/RotaHub.svelte')
);

// =============================================================================
// SIMULATION LOADER MAP
// =============================================================================

export const lazySimComponents: Record<string, () => Promise<AnyComponent>> = {
  'capsulorhexis': lazyCapsulorhexis,
  'corneal-tunnel': lazyCornealTunnel,
  'corneal-suture': lazyCornealSuture,
  'gas-injection': lazyGasInjection,
  'reflex-floaters': lazyReflexFloaters,
  'tissue-grasping': lazyTissueGrasping,
  'needle-angle': lazyNeedleAngle,
  'micro-tremor': lazyMicroTremor,
  'corneal-arc': lazyCornealArc,
  'suture-tension': lazySutureTension,
  'hydrodissection': lazyHydrodissection
};

export const lazyGameComponents: Record<string, () => Promise<AnyComponent>> = {
  'tremor-shield': lazyTremorShield,
  'vector-race': lazyVectorRace,
  'nano-grip': lazyNanoGrip
};

export default {
  lazyLoad,
  preloadOnIdle,
  preloadOnVisible,
  lazySimComponents,
  lazyGameComponents
};
