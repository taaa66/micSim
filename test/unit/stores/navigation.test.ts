/**
 * =============================================================================
 * NAVIGATION STORE TESTS
 * =============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  navigationState,
  currentView,
  previousView,
  canGoBack,
  breadcrumbs,
  navigateTo,
  goBack,
  goToDashboard,
  setParams,
  clearParams
} from '../../../src/stores/navigation';

describe('Navigation Store', () => {
  beforeEach(() => {
    // Reset to dashboard
    goToDashboard();
  });

  describe('Initial State', () => {
    it('should start at dashboard', () => {
      expect(get(currentView)).toBe('dashboard');
    });

    it('should have no previous view initially', () => {
      expect(get(previousView)).toBeNull();
    });

    it('should not be able to go back initially', () => {
      expect(get(canGoBack)).toBe(false);
    });

    it('should have dashboard in breadcrumbs', () => {
      const crumbs = get(breadcrumbs);
      expect(crumbs.length).toBeGreaterThan(0);
      expect(crumbs[0].view).toBe('dashboard');
    });
  });

  describe('navigateTo', () => {
    it('should change current view', () => {
      navigateTo('analytics');
      expect(get(currentView)).toBe('analytics');
    });

    it('should set previous view', () => {
      navigateTo('analytics');
      expect(get(previousView)).toBe('dashboard');
    });

    it('should enable go back', () => {
      navigateTo('analytics');
      expect(get(canGoBack)).toBe(true);
    });

    it('should update breadcrumbs', () => {
      navigateTo('analytics');
      const crumbs = get(breadcrumbs);
      expect(crumbs.some(c => c.view === 'analytics')).toBe(true);
    });

    it('should accept navigation params', () => {
      navigateTo('sim', { simId: 'capsulorhexis' });
      const state = get(navigationState);
      expect(state.params.simId).toBe('capsulorhexis');
    });
  });

  describe('goBack', () => {
    it('should return to previous view', () => {
      navigateTo('analytics');
      goBack();
      expect(get(currentView)).toBe('dashboard');
    });

    it('should not go back from dashboard', () => {
      goBack();
      expect(get(currentView)).toBe('dashboard');
    });

    it('should handle multiple navigations', () => {
      navigateTo('analytics');
      navigateTo('sim');
      goBack();
      expect(get(currentView)).toBe('analytics');
    });
  });

  describe('goToDashboard', () => {
    it('should always go to dashboard', () => {
      navigateTo('analytics');
      navigateTo('sim');
      goToDashboard();
      expect(get(currentView)).toBe('dashboard');
    });

    it('should clear navigation history', () => {
      navigateTo('analytics');
      goToDashboard();
      expect(get(canGoBack)).toBe(false);
    });
  });

  describe('Parameters', () => {
    it('should set params', () => {
      setParams({ key: 'value' });
      const state = get(navigationState);
      expect(state.params.key).toBe('value');
    });

    it('should clear params', () => {
      setParams({ key: 'value' });
      clearParams();
      const state = get(navigationState);
      expect(Object.keys(state.params).length).toBe(0);
    });

    it('should merge params', () => {
      setParams({ a: 1 });
      setParams({ b: 2 });
      const state = get(navigationState);
      expect(state.params.a).toBe(1);
      expect(state.params.b).toBe(2);
    });
  });

  describe('Breadcrumbs', () => {
    it('should build correct breadcrumb trail', () => {
      navigateTo('core-games');
      navigateTo('game');
      
      const crumbs = get(breadcrumbs);
      expect(crumbs.length).toBe(3);
      expect(crumbs[0].view).toBe('dashboard');
      expect(crumbs[1].view).toBe('core-games');
      expect(crumbs[2].view).toBe('game');
    });

    it('should have correct labels', () => {
      navigateTo('analytics');
      const crumbs = get(breadcrumbs);
      const analyticsCrumb = crumbs.find(c => c.view === 'analytics');
      expect(analyticsCrumb?.label).toBeDefined();
    });
  });
});
