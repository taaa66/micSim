/**
 * =============================================================================
 * HARDWARE ACCELERATION BUILD PLUGIN (V14.0)
 * =============================================================================
 * Vite/Rollup plugin to inject GPU acceleration styles globally.
 * Ensures translateZ(0) is applied to kinetic elements in production.
 * =============================================================================
 */

/**
 * GPU Acceleration CSS to inject
 */
const GPU_ACCEL_CSS = `
/* GPU Acceleration - Auto-injected by build */
.gpu-accelerated,
[data-kinetic],
.kinetic-element {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Animation performance hints */
.kinetic-transition {
  transition-property: transform, opacity;
  transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
}

/* Trace Line optimization - V12.0 */
.trace-line {
  transform: translateZ(0);
  will-change: contents;
}

/* Prevent layout thrashing */
.contain-layout {
  contain: layout;
}

.contain-paint {
  contain: paint;
}

.contain-strict {
  contain: strict;
}
`;

/**
 * Vite plugin for hardware acceleration
 */
export function hardwareAccelPlugin(options = {}) {
  const { enabled = true, injectCSS = true } = options;

  return {
    name: 'hardware-accel',
    
    transformIndexHtml(html) {
      if (!enabled || !injectCSS) {
        return html;
      }

      // Inject GPU acceleration CSS into head
      const styleTag = `<style id="gpu-accel-styles">${GPU_ACCEL_CSS}</style>`;
      return html.replace('</head>', `${styleTag}\n</head>`);
    },

    transform(code, id) {
      if (!enabled) {
        return null;
      }

      // Add GPU acceleration hints to Svelte components
      if (id.endsWith('.svelte') && code.includes('class="')) {
        // This is a simplified example - real implementation would use AST parsing
        return null;
      }

      return null;
    }
  };
}

/**
 * Rollup plugin version
 */
export function hardwareAccelRollupPlugin(options = {}) {
  return hardwareAccelPlugin(options);
}

export default hardwareAccelPlugin;
