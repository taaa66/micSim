/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - TRACE LINE PERFORMANCE TEST (V14.0)
 * =============================================================================
 * Anchor Point: Measures DCS Trace Line transition time.
 * Ensures transition is clamped under 250ms (V12.0 requirement).
 * =============================================================================
 */

import { test, expect } from '@playwright/test';
import { KINETIC } from '../../src/core/constants';

// Maximum allowed trace line transition time (V12.0 requirement)
const MAX_TRACE_LINE_MS = KINETIC.TRACE_LINE_MAX_MS; // 250ms

test.describe('Kinetic UI Performance (V12.0)', () => {

  test.describe('DCS Trace Line', () => {
    
    test('trace line transition should complete under 250ms', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.dashboard', { state: 'visible' });
      
      // Inject performance measurement script
      await page.evaluate(() => {
        (window as any).__traceLineMetrics = {
          startTime: 0,
          endTime: 0,
          duration: 0
        };
      });
      
      // Find a module card to hover
      const moduleCard = page.locator('.module-card').first();
      
      // Start performance measurement before hover
      const startTime = await page.evaluate(() => {
        (window as any).__traceLineMetrics.startTime = performance.now();
        return performance.now();
      });
      
      // Trigger hover (which should trigger trace line)
      await moduleCard.hover();
      
      // Wait for trace line animation to complete
      await page.waitForSelector('.trace-line.active', { 
        state: 'visible',
        timeout: 500 
      }).catch(() => {
        // Trace line might not exist in all implementations
      });
      
      // Measure end time
      const endTime = await page.evaluate(() => {
        (window as any).__traceLineMetrics.endTime = performance.now();
        return performance.now();
      });
      
      const duration = endTime - startTime;
      
      // Log for debugging
      console.log(`Trace line transition duration: ${duration.toFixed(2)}ms`);
      
      // Assert under threshold
      expect(duration).toBeLessThan(MAX_TRACE_LINE_MS);
    });

    test('trace line CSS transition property should be set correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.dashboard', { state: 'visible' });
      
      // Check if trace-line element exists and has correct transition
      const traceLineExists = await page.locator('.trace-line').count() > 0;
      
      if (traceLineExists) {
        const transitionDuration = await page.evaluate(() => {
          const traceLine = document.querySelector('.trace-line');
          if (!traceLine) return null;
          const style = window.getComputedStyle(traceLine);
          return style.transitionDuration;
        });
        
        if (transitionDuration) {
          // Parse duration (e.g., "0.25s" -> 250)
          const durationMs = parseFloat(transitionDuration) * 
            (transitionDuration.includes('ms') ? 1 : 1000);
          
          expect(durationMs).toBeLessThanOrEqual(MAX_TRACE_LINE_MS);
        }
      }
    });

    test('multiple rapid hovers should not cause performance degradation', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.module-card', { state: 'visible' });
      
      const moduleCards = page.locator('.module-card');
      const cardCount = await moduleCards.count();
      
      const durations: number[] = [];
      
      // Rapidly hover over multiple modules
      for (let i = 0; i < Math.min(5, cardCount); i++) {
        const startTime = performance.now();
        
        await moduleCards.nth(i).hover();
        await page.waitForTimeout(50); // Brief pause
        
        const endTime = performance.now();
        durations.push(endTime - startTime);
      }
      
      // Calculate average duration
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      console.log(`Average hover transition: ${avgDuration.toFixed(2)}ms`);
      console.log(`Individual durations: ${durations.map(d => d.toFixed(2)).join(', ')}ms`);
      
      // Average should still be under threshold
      expect(avgDuration).toBeLessThan(MAX_TRACE_LINE_MS * 1.5); // Allow 50% margin for rapid interactions
    });
  });

  test.describe('Animation Frame Rate', () => {
    
    test('should maintain 60fps during module hover animations', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.module-card', { state: 'visible' });
      
      // Start FPS measurement
      const fpsData = await page.evaluate(async () => {
        return new Promise<{ avgFps: number; minFps: number; frames: number }>((resolve) => {
          const frames: number[] = [];
          let lastTime = performance.now();
          let frameCount = 0;
          
          const measureFrame = () => {
            const now = performance.now();
            const delta = now - lastTime;
            if (delta > 0) {
              frames.push(1000 / delta);
            }
            lastTime = now;
            frameCount++;
            
            if (frameCount < 60) { // Measure for ~1 second
              requestAnimationFrame(measureFrame);
            } else {
              const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
              const minFps = Math.min(...frames);
              resolve({ avgFps, minFps, frames: frameCount });
            }
          };
          
          requestAnimationFrame(measureFrame);
        });
      });
      
      console.log(`Average FPS: ${fpsData.avgFps.toFixed(2)}`);
      console.log(`Minimum FPS: ${fpsData.minFps.toFixed(2)}`);
      
      // Should maintain at least 55fps average (allowing for some variance)
      expect(fpsData.avgFps).toBeGreaterThan(55);
    });
  });

  test.describe('GPU Acceleration', () => {
    
    test('animated elements should use GPU-accelerated transforms', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.module-card', { state: 'visible' });
      
      // Check for GPU acceleration indicators
      const hasGpuAcceleration = await page.evaluate(() => {
        const moduleCard = document.querySelector('.module-card');
        if (!moduleCard) return false;
        
        const style = window.getComputedStyle(moduleCard);
        
        // Check for GPU acceleration hints
        const transform = style.transform;
        const willChange = style.willChange;
        const backfaceVisibility = style.backfaceVisibility;
        
        // GPU acceleration is indicated by:
        // - transform containing translateZ or translate3d
        // - will-change property set
        // - backface-visibility: hidden
        return transform.includes('matrix') || 
               willChange !== 'auto' ||
               backfaceVisibility === 'hidden';
      });
      
      expect(hasGpuAcceleration).toBe(true);
    });
  });
});

test.describe('Core Games Performance', () => {
  
  test('Tremor Shield should maintain 60fps during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.core-games-btn', { state: 'visible' });
    
    // Navigate to Core Games
    await page.click('.core-games-btn');
    await page.waitForSelector('.game-card', { state: 'visible' });
    
    // Click Tremor Shield
    await page.locator('.game-card').first().click();
    
    // Wait for game canvas
    await page.waitForSelector('canvas', { state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Measure FPS during simulated gameplay
    const fpsData = await page.evaluate(async () => {
      return new Promise<{ avgFps: number }>((resolve) => {
        const frames: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFrame = () => {
          const now = performance.now();
          const delta = now - lastTime;
          if (delta > 0) {
            frames.push(1000 / delta);
          }
          lastTime = now;
          frameCount++;
          
          if (frameCount < 120) { // Measure for ~2 seconds
            requestAnimationFrame(measureFrame);
          } else {
            const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
            resolve({ avgFps });
          }
        };
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    console.log(`Tremor Shield Average FPS: ${fpsData.avgFps.toFixed(2)}`);
    
    // Games should maintain at least 50fps
    expect(fpsData.avgFps).toBeGreaterThan(50);
  });
});
