import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages - change 'micro-sim-svelte' to your repo name if different
  base: '/micro-sim-svelte/',
  
  plugins: [svelte()],
  
  // Development server configuration
  server: {
    host: '0.0.0.0',      // Bind to all network interfaces (critical for iPad access)
    port: 5173,
    strictPort: true,
    cors: true,           // Allow cross-origin requests
    
    // Additional headers for iOS/iPad compatibility
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
    
    // Watch for file changes
    watch: {
      usePolling: false,
    },
  },
  
  // Preview server (for production builds)
  preview: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
  },
  
  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    // Ensure assets are inlined or properly referenced
    assetsInlineLimit: 4096,
  },
  
  // Optimize deps for faster dev server start
  optimizeDeps: {
    include: ['svelte'],
  },
})
