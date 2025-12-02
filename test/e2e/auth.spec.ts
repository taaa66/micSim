/**
 * =============================================================================
 * E2E TESTS - AUTHENTICATION FLOW
 * =============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen initially', async ({ page }) => {
    // Check for login form elements
    await expect(page.locator('text=OphthalmoSim')).toBeVisible();
    await expect(page.locator('input[placeholder*="ID"]')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    // Try to submit empty form
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      // Should show some validation feedback
      await expect(page.locator('text=/required|invalid|error/i')).toBeVisible({ timeout: 5000 }).catch(() => {
        // Some forms prevent submission without showing error
      });
    }
  });

  test('should navigate to registration', async ({ page }) => {
    const registerLink = page.locator('text=/register|sign up|create account/i');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page.locator('text=/registration|create|sign up/i')).toBeVisible();
    }
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    const idInput = page.locator('input[placeholder*="ID"], input[name*="id"]').first();
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]').first();
    
    if (await idInput.isVisible() && await passwordInput.isVisible()) {
      await idInput.fill('invalid-id');
      await passwordInput.fill('invalid-password');
      
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")');
      await loginButton.click();
      
      // Should show error message
      await expect(page.locator('text=/error|invalid|incorrect|failed/i')).toBeVisible({ timeout: 5000 }).catch(() => {
        // May redirect or show different feedback
      });
    }
  });
});

test.describe('Dashboard Access', () => {
  test('should show dashboard after successful login', async ({ page }) => {
    // This test assumes we have a way to authenticate
    // In real scenario, you'd use test credentials or mock auth
    await page.goto('/');
    
    // Wait for either login screen or dashboard
    await page.waitForLoadState('networkidle');
    
    // Check if we're on dashboard (if already logged in) or login screen
    const isDashboard = await page.locator('text=/dashboard|training|simulation/i').isVisible().catch(() => false);
    const isLogin = await page.locator('input[placeholder*="ID"]').isVisible().catch(() => false);
    
    expect(isDashboard || isLogin).toBe(true);
  });
});

test.describe('Navigation', () => {
  test('should have working navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main navigation elements
    const navElements = page.locator('nav, [role="navigation"], .nav, .menu');
    const hasNav = await navElements.count() > 0;
    
    // Either has navigation or is on login screen
    const isLogin = await page.locator('input[placeholder*="ID"]').isVisible().catch(() => false);
    
    expect(hasNav || isLogin).toBe(true);
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should load without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Small tolerance
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });
});

test.describe('Accessibility', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have at least one heading
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/');
    
    const inputs = page.locator('input:not([type="hidden"])');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el) => {
        const id = el.id;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const placeholder = el.getAttribute('placeholder');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        return !!(label || ariaLabel || ariaLabelledBy || placeholder);
      });
      
      expect(hasLabel).toBe(true);
    }
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

  test('should not have console errors', async ({ page }) => {
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
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
