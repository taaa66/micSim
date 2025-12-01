/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - ZERO-SCROLL MANDATE E2E TEST (V14.0)
 * =============================================================================
 * Anchor Point: Verifies Zero-Scroll Mandate on 768x1024 viewport.
 * Confirms absence of scrollbars upon load (V10.0 requirement).
 * =============================================================================
 */

import { test, expect, type Page } from '@playwright/test';

// Target viewport for Zero-Scroll Mandate
const VIEWPORT = {
  width: 768,
  height: 1024
};

test.describe('Zero-Scroll Mandate (V10.0)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport to iPad dimensions
    await page.setViewportSize(VIEWPORT);
  });

  test('should not display scrollbars on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to fully load
    await page.waitForSelector('.dashboard', { state: 'visible' });
    
    // Check for horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
    
    // Check for vertical scrollbar
    const hasVerticalScroll = await page.evaluate(() => {
      return document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    
    expect(hasVerticalScroll).toBe(false);
  });

  test('should maintain zero-scroll after Apex panel opens', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard', { state: 'visible' });
    
    // Apex panel should be visible by default
    await page.waitForSelector('.apex-panel', { state: 'visible' });
    
    // Verify no scroll
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth ||
             document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    
    expect(hasScroll).toBe(false);
  });

  test('should maintain zero-scroll when hovering modules', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.module-card', { state: 'visible' });
    
    // Hover over first module
    const firstModule = page.locator('.module-card').first();
    await firstModule.hover();
    
    // Wait for any hover animations
    await page.waitForTimeout(300);
    
    // Verify no scroll
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth ||
             document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    
    expect(hasScroll).toBe(false);
  });

  test('should maintain zero-scroll with detail panel open', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.module-card', { state: 'visible' });
    
    // Click on a module to open detail panel
    await page.locator('.module-card').first().click();
    
    // Wait for detail panel
    await page.waitForSelector('.detail-panel', { state: 'visible' });
    
    // Verify no scroll
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth ||
             document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    
    expect(hasScroll).toBe(false);
  });

  test('should fit all content within viewport bounds', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dashboard', { state: 'visible' });
    
    // Get all major elements and verify they're within viewport
    const elements = ['.header', '.main-container', '.footer', '.apex-panel'];
    
    for (const selector of elements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        const box = await element.boundingBox();
        if (box) {
          // Element should be within viewport
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.y).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(VIEWPORT.width);
          expect(box.y + box.height).toBeLessThanOrEqual(VIEWPORT.height);
        }
      }
    }
  });

  test('should handle safe-area-insets correctly', async ({ page }) => {
    // Simulate iOS safe area insets
    await page.addStyleTag({
      content: `
        :root {
          --sat: 47px;  /* Safe area top (notch) */
          --sab: 34px;  /* Safe area bottom (home indicator) */
          --sal: 0px;
          --sar: 0px;
        }
        @supports (padding: env(safe-area-inset-top)) {
          :root {
            --sat: env(safe-area-inset-top, 47px);
            --sab: env(safe-area-inset-bottom, 34px);
          }
        }
      `
    });
    
    await page.goto('/');
    await page.waitForSelector('.dashboard', { state: 'visible' });
    
    // Verify no scroll even with safe area simulation
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth ||
             document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });
    
    expect(hasScroll).toBe(false);
  });
});

test.describe('Zero-Scroll on Different Viewports', () => {
  
  const viewports = [
    { name: 'iPad Portrait', width: 768, height: 1024 },
    { name: 'iPad Landscape', width: 1024, height: 768 },
    { name: 'iPad Pro 11"', width: 834, height: 1194 },
    { name: 'Desktop HD', width: 1920, height: 1080 },
    { name: 'MacBook Pro 14"', width: 1512, height: 982 }
  ];

  for (const viewport of viewports) {
    test(`should have no scroll on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForSelector('.dashboard', { state: 'visible' });
      
      const hasScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth ||
               document.documentElement.scrollHeight > document.documentElement.clientHeight;
      });
      
      expect(hasScroll).toBe(false);
    });
  }
});
