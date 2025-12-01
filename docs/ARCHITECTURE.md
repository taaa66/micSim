# Ophthalmic Simulator - Architecture Documentation (V14.0)

## Overview

The Ophthalmic Surgical Simulator is an enterprise-grade training application designed for surgical skill development. This document outlines the architectural foundations, file structure, and deployment hierarchy.

---

## File Structure Hierarchy

```
ophthalmo-sim/
├── src/                          # Primary Source Code
│   ├── core/                     # Immutability Zone
│   │   ├── models/               # TypeScript interfaces & data models
│   │   │   └── index.ts          # IModuleData, ISurgeonProfile, etc.
│   │   └── constants/            # Unchanging values
│   │       └── index.ts          # API endpoints, colors, kinetic config
│   │
│   ├── services/                 # Asynchronous Logic & Data Handling
│   │   ├── api/                  # HTTP/WebSocket communication
│   │   │   └── apex-api.ts       # Apex League API wrapper
│   │   ├── state/                # Global state management
│   │   │   └── stores.ts         # Svelte stores
│   │   └── math/                 # Complex algorithms
│   │       └── scoring-algorithms.ts
│   │
│   ├── components/               # Reusable UI Components
│   │   ├── common/               # Generic components (Buttons, Modals)
│   │   ├── kinetic/              # Animation & visualization
│   │   ├── modules/              # 11 Module Segments
│   │   ├── apex/                 # Apex League sub-components
│   │   ├── games/                # Core Games components
│   │   └── sims/                 # Simulation trainers
│   │
│   ├── views/                    # Top-level Page Containers
│   │   ├── Dashboard/            # Main simulator view
│   │   ├── Reports/              # Report generation
│   │   └── CoreGames/            # Gamification hub
│   │
│   ├── lib/                      # Utility libraries
│   ├── assets/                   # Component-specific assets
│   ├── App.svelte                # Root component
│   ├── app.css                   # Global styles
│   └── main.js                   # Entry point
│
├── config/                       # Configuration Files
│   ├── environments/             # Environment-specific settings
│   │   ├── dev.json              # Development config
│   │   ├── qa.json               # QA/Staging config
│   │   └── prod.json             # Production config
│   ├── build/                    # Build process scripts
│   │   └── vite.config.prod.js   # Production Vite config
│   └── nginx/                    # Server configuration
│       └── nginx.conf            # CORS, caching, SSL
│
├── test/                         # Testing Suite
│   ├── unit/                     # Unit tests
│   │   └── allocation.test.ts    # Allocation logic tests
│   ├── e2e/                      # End-to-End tests
│   │   └── zero-scroll.test.ts   # Zero-Scroll Mandate tests
│   └── performance/              # Performance tests
│       └── trace-line.test.ts    # Kinetic fidelity tests
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # This file
│   ├── CSS-MANIFEST.md           # V13.0 CSS specifications
│   └── API-SPEC.md               # API documentation
│
├── assets/                       # Static Assets (root level)
│   ├── images/                   # Optimized images
│   ├── fonts/                    # Web fonts
│   └── models/                   # 3D models for simulation
│
├── dist/                         # Build Output (generated)
│   ├── index.html                # Entry point
│   ├── app.[hash].js             # Minified JS bundle
│   ├── styles.[hash].css         # Minified CSS bundle
│   ├── assets/                   # Optimized assets
│   └── service-worker.js         # PWA service worker
│
├── public/                       # Static files (copied to dist)
├── index.html                    # Dev entry point
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Dev Vite configuration
└── svelte.config.js              # Svelte configuration
```

---

## Core Architectural Principles

### 1. Separation of Concerns

- **src/core/**: Immutable data contracts and constants
- **src/services/**: Business logic and external communication
- **src/components/**: Presentation layer
- **src/views/**: Page-level containers

### 2. Kinetic UI (V12.0)

All animations must adhere to:
- **Trace Line Max**: 250ms transition time
- **Target FPS**: 60fps
- **GPU Acceleration**: `translateZ(0)` on animated elements

### 3. Zero-Scroll Mandate (V10.0)

The application must fit within viewport bounds without scrollbars on:
- iPad (768x1024)
- iPad Pro (834x1194)
- Desktop (1920x1080)

### 4. Native-Like Responsiveness (V10.0)

- Safe area inset support for iOS
- Touch-optimized interactions
- PWA capabilities via service worker

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Views     │  │ Components  │  │   Kinetic Layer     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     State Management                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Svelte Stores (services/state)          │    │
│  │  • currentModuleContext  • apexRankings              │    │
│  │  • allocationData        • motorControlRankings      │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   API Layer  │  │  Math Engine │  │  WebSocket       │   │
│  │  (apex-api)  │  │  (scoring)   │  │  (real-time)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  REST API    │  │  WebSocket   │  │  Local Storage   │   │
│  │  Server      │  │  Server      │  │  (offline)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Module System

### Surgical Modules (11 total)

| # | Module | Code | Skills Trained |
|---|--------|------|----------------|
| 1 | Micro-Tremor Control | MT-CTRL | Tremor Suppression, Stability |
| 2 | Tissue Grasping | T-GRASP | Grasping Force, Pressure Control |
| 3 | Needle Angle | N-ANGLE | Angle Control, Depth Control |
| 4 | Corneal Tunnel | C-TUNEL | Path Accuracy, Depth Control |
| 5 | Capsulorhexis | CCC | Path Accuracy, Force Control |
| 6 | Hydrodissection | H-DISS | Flow Control, Pressure Sensing |
| 7 | Suture Tension | S-TENS | Tension Control, Consistency |
| 8 | Suture Placement | S-PLACE | Angle Control, Depth Uniformity |
| 9 | Gas/Liquid Injection | FL-INJK | Flow Rate, Pressure Control |
| 10 | Reflex/Reaction | RLX-RCT | Reaction Time, Correction Accuracy |
| 11 | Corneal Arc | ARC-CUT | Path Precision, Slip Prevention |

### Core Games (Gamification V14.0)

| Game | Code | Target Skill | Metric |
|------|------|--------------|--------|
| Tremor Shield | TRM-SHD | Tremor Reduction | RMS Deviation (μm) |
| Vector Race | VEC-RCE | Angle Precision | Angle Deviation (°) |
| Nano-Grip Gauntlet | NAN-GRP | Grip Optimization | Grip Accuracy (%) |

---

## Testing Strategy

### Unit Tests (test/unit/)
- **Anchor Point**: `allocation.test.ts` - All edge cases for `determineAllocation()`

### E2E Tests (test/e2e/)
- **Anchor Point**: `zero-scroll.test.ts` - Zero-Scroll Mandate verification on 768x1024

### Performance Tests (test/performance/)
- **Anchor Point**: `trace-line.test.ts` - DCS Trace Line under 250ms

---

## Deployment

### Environment Switching

```bash
# Development
npm run dev

# QA Build
npm run build:qa

# Production Build
npm run build:prod
```

### Flat Deployment Output

The `dist/` directory contains:
- `index.html` - Single entry point
- `app.[hash].js` - Minified JS bundle
- `styles.[hash].css` - Minified CSS bundle
- `assets/` - Optimized images and fonts
- `service-worker.js` - PWA caching

---

## Version History

| Version | Feature |
|---------|---------|
| V10.0 | Native-Like Responsiveness |
| V11.0 | Non-Regression Anchoring |
| V12.0 | Kinetic UI |
| V13.0 | CSS Manifest |
| V14.0 | File Structure & Deployment Hierarchy |
