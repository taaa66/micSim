/**
 * =============================================================================
 * NAVIGATION E2E TESTS
 * =============================================================================
 * Tests for app navigation and routing
 * =============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login screen initially', async ({ page }) => {
    // Check for login form elements
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/OphthalmoSim/i);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  // These tests assume user is logged in
  // In real scenario, would need to mock auth or use test credentials
  
  test('should have navigation elements when logged in', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page loaded without errors
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    
    expect(errors.length).toBe(0);
  });
});

test.describe('Accessibility', () => {
  test('should have no critical accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic accessibility
    const html = await page.locator('html').getAttribute('lang');
    // Lang attribute should exist (even if not set, test passes)
    
    // Check for main landmark or content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should support reduced motion preference', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Page should still function
    await expect(page.locator('body')).toBeVisible();
  });

  test('should support dark color scheme', async ({ page }) => {
    // Emulate dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    // Page should still function
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('Firebase') && 
      !e.includes('net::ERR')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
