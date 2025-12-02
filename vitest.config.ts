import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/unit/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,svelte}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'node_modules/**'
      ]
    },
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      $lib: '/src/lib',
      $stores: '/src/stores',
      $components: '/src/components'
    }
  }
});
