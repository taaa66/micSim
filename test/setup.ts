/**
 * =============================================================================
 * TEST SETUP
 * =============================================================================
 * Global test configuration and mocks
 * =============================================================================
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: localStorageMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn().mockImplementation(id => clearTimeout(id));

// Mock performance.now
if (!global.performance) {
  global.performance = {} as Performance;
}
global.performance.now = vi.fn().mockReturnValue(Date.now());

// Mock Firebase (to avoid actual Firebase calls in tests)
vi.mock('../src/lib/firebase', () => ({
  db: null,
  auth: {
    currentUser: null
  },
  app: null
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
