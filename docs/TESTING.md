# 🧪 Testing Documentation

## Overview

OphthalmoSim+ uses a comprehensive testing strategy with Vitest for unit tests and Playwright for E2E tests.

## Test Structure

```
test/
├── unit/                    # Unit tests (Vitest)
│   └── stores/
│       ├── user.test.ts
│       └── simulation.test.ts
├── e2e/                     # End-to-end tests (Playwright)
│   └── auth.spec.ts
├── performance/             # Performance tests
└── setup.ts                 # Global test setup
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
```

### Full Validation

```bash
# Run lint, typecheck, and unit tests
npm run validate
```

## Unit Testing with Vitest

### Configuration

See `vitest.config.ts` for full configuration.

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { user, setUser, clearUser } from '../../../src/stores/user';

describe('User Store', () => {
  beforeEach(() => {
    clearUser();
  });

  it('should set user correctly', () => {
    setUser(mockUser);
    expect(get(user)).toEqual(mockUser);
  });
});
```

### Mocking

Global mocks are configured in `test/setup.ts`:

- localStorage/sessionStorage
- matchMedia
- ResizeObserver
- IntersectionObserver
- requestAnimationFrame
- Firebase modules

### Coverage Targets

| Metric | Target |
|--------|--------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

## E2E Testing with Playwright

### Configuration

See `playwright.config.ts` for full configuration.

### Test Browsers

- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[placeholder*="ID"]')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid**: Add `data-testid` attributes for reliable selectors
2. **Wait for network**: Use `waitForLoadState('networkidle')` when needed
3. **Isolate tests**: Each test should be independent
4. **Use fixtures**: Share setup code with fixtures

## Test Categories

### Unit Tests

- **Stores**: State management logic
- **Utils**: Helper functions
- **Services**: Business logic
- **Components**: Component logic (not rendering)

### E2E Tests

- **Authentication**: Login, logout, registration
- **Navigation**: Page routing, breadcrumbs
- **Simulations**: Start, complete, results
- **OKAP Games**: Game flow, scoring
- **Rota**: Schedule viewing, swaps

### Performance Tests

- **Page Load**: < 3 seconds
- **API Response**: < 100ms
- **Frame Rate**: 60 FPS for simulations

## CI/CD Integration

Tests run automatically on:

- Push to `main` or `develop`
- Pull requests to `main`

### Pipeline Stages

1. **Lint**: ESLint checks
2. **Type Check**: TypeScript validation
3. **Unit Tests**: Vitest with coverage
4. **E2E Tests**: Playwright cross-browser
5. **Build**: Production build
6. **Security Scan**: npm audit

## Debugging Tests

### Vitest

```bash
# Run specific test file
npx vitest run test/unit/stores/user.test.ts

# Debug mode
npx vitest --inspect-brk
```

### Playwright

```bash
# Debug mode
npx playwright test --debug

# Show browser
npx playwright test --headed

# Generate report
npx playwright show-report
```

## Adding New Tests

### Checklist

- [ ] Test file in correct directory
- [ ] Descriptive test names
- [ ] Setup/teardown as needed
- [ ] Assertions are specific
- [ ] No hardcoded waits
- [ ] Handles async properly

### Naming Convention

- Unit tests: `*.test.ts`
- E2E tests: `*.spec.ts`
- Performance tests: `*.perf.ts`
