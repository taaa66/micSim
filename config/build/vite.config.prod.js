/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - VITE PRODUCTION BUILD CONFIGURATION (V14.0)
 * =============================================================================
 * Purpose: Production-optimized build with hardware acceleration, minification,
 *          and flat deployment output structure.
 * =============================================================================
 */

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// Hardware Acceleration Toggle (V14.0 Requirement)
const FORCE_GPU_ACCELERATION = true;

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        // Production optimizations
        dev: false,
        css: 'injected'
      }
    }),
    // Custom plugin to inject GPU acceleration
    FORCE_GPU_ACCELERATION && {
      name: 'gpu-acceleration-injector',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `<style>
            /* GPU Acceleration - V14.0 Hardware Acceleration Toggle */
            * { 
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
            }
          </style>
          </head>`
        );
      }
    }
  ].filter(Boolean),

  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@components': resolve(__dirname, '../../src/components'),
      '@views': resolve(__dirname, '../../src/views'),
      '@services': resolve(__dirname, '../../src/services'),
      '@core': resolve(__dirname, '../../src/core'),
      '@assets': resolve(__dirname, '../../assets')
    }
  },

  // Build configuration - Flat deployment output
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      },
      mangle: true
    },

    // Rollup options for flat output
    rollupOptions: {
      output: {
        // Flat structure with hashed filenames
        entryFileNames: 'app.[hash].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();
          if (/css/i.test(ext)) {
            return 'styles.[hash].css';
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return 'assets/images/[name].[hash][extname]';
          }
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return 'assets/fonts/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
        
        // Manual chunks for better caching
        manualChunks: {
          'vendor': ['svelte'],
          'kinetic': [
            '../../src/components/kinetic/ProgressRing.svelte',
            '../../src/components/kinetic/TraceLine.svelte'
          ],
          'apex': [
            '../../src/components/apex/ApexLeaguePanel.svelte'
          ]
        }
      }
    },

    // Source maps disabled for production
    sourcemap: false,

    // CSS code splitting
    cssCodeSplit: false,

    // Asset inlining threshold (4kb)
    assetsInlineLimit: 4096,

    // Chunk size warning
    chunkSizeWarningLimit: 500
  },

  // CSS configuration
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        // Autoprefixer for cross-browser compatibility
        require('autoprefixer')({
          overrideBrowserslist: ['last 2 versions', 'iOS >= 12', 'Safari >= 12']
        })
      ]
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __ENVIRONMENT__: JSON.stringify('production')
  }
});
