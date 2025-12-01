# Ophthalmic Surgical Simulator (V14.0)

Enterprise-grade surgical training application with gamification elements for fine motor skill development.

## 🎯 Overview

- **11 Surgical Training Modules** - From micro-tremor control to capsulorhexis
- **3 Core Games** - Gamified motor skill training (Tremor Shield, Vector Race, Nano-Grip)
- **Apex League** - Competitive rankings and allocation voting
- **Kinetic UI** - 60fps animations with GPU acceleration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (accessible on local network)
npm run dev

# Build for production
npm run build:prod

# Run tests
npm test
```

## 📁 Project Structure (V14.0)

```
ophthalmo-sim/
├── src/                    # Source Code
│   ├── core/               # Immutability Zone (models, constants)
│   ├── services/           # API, State, Math algorithms
│   ├── components/         # UI Components
│   │   ├── common/         # Generic (Buttons, Modals)
│   │   ├── kinetic/        # Animations
│   │   ├── apex/           # Apex League
│   │   ├── games/          # Core Games
│   │   └── sims/           # Simulation Trainers
│   └── views/              # Page Containers
├── config/                 # Configuration
│   ├── environments/       # dev.json, qa.json, prod.json
│   ├── build/              # Vite production config
│   └── nginx/              # Server configuration
├── test/                   # Testing Suite
│   ├── unit/               # Unit tests (Vitest)
│   ├── e2e/                # E2E tests (Playwright)
│   └── performance/        # Performance tests
├── docs/                   # Documentation
└── assets/                 # Static assets
```

## Core Games (Gamification)

| Game | Target Skill | Metric |
|------|--------------|--------|
| Tremor Shield | Tremor Reduction | RMS Deviation (μm) |
| Vector Race | Angle Precision | Angle Deviation (°) |
| Nano-Grip Gauntlet | Grip Optimization | Grip Accuracy (%) |

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (network accessible) |
| `npm run build` | Build for production |
| `npm run build:qa` | Build for QA environment |
| `npm run build:prod` | Production build with optimizations |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:perf` | Run performance tests |

## Configuration

### Environment Variables

Create `.env` files for each environment:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=15000
VITE_ENVIRONMENT=development
```

### Zero-Scroll Mandate (V10.0)

The application is designed to fit within viewport bounds without scrollbars on:
- iPad (768×1024)
- iPad Pro (834×1194)
- Desktop (1920×1080)

### Kinetic UI (V12.0)

- Trace line transitions: ≤250ms
- Target frame rate: 60fps
- GPU acceleration enabled

## Testing Anchor Points

| Test | File | Requirement |
|------|------|-------------|
| Allocation Logic | `test/unit/allocation.test.ts` | All edge cases for `determineAllocation()` |
| Zero-Scroll | `test/e2e/zero-scroll.test.ts` | No scrollbars on 768×1024 viewport |
| Trace Line | `test/performance/trace-line.test.ts` | Transition under 250ms |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - Full system architecture
- [CSS Manifest](docs/CSS-MANIFEST.md) - V13.0 styling specifications
- [API Spec](docs/API-SPEC.md) - API documentation

## Tech Stack

- **Framework**: Svelte 5
- **Build**: Vite 7
- **Testing**: Vitest + Playwright
- **Styling**: CSS with GPU acceleration
- **State**: Svelte Stores

## Device Support

- iPad (iOS 12+)
- Desktop browsers (Chrome, Safari, Firefox)
- Touch and stylus input

---

**Version**: 14.0.0  
**Codename**: Enterprise Deployment Hierarchy
