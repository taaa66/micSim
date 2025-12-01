# System Architecture Overview (V14.0)

## Introduction

The Ophthalmic Simulator is an enterprise-grade web application designed for microsurgery training with a focus on kinetic UI, native-like responsiveness, and gamification through the Apex League system.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │Dashboard │  │ Reports  │  │CoreGames │  │   Apex League    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       Component Layer                            │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────┐│
│  │ Common │  │Kinetic │  │Modules │  │  Apex  │  │   Layout   ││
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   API/HTTP   │  │    State     │  │   Math Algorithms    │  │
│  │  WebSocket   │  │   (Stores)   │  │  (Scoring, Tremor)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                         Core Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │    Models    │  │  Constants   │  │      Utilities       │  │
│  │ (TypeScript) │  │ (Immutable)  │  │ (Math, DOM, Timing)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── core/                 # Immutability Zone
│   ├── models/          # TypeScript interfaces
│   ├── constants/       # Unchanging values
│   └── utils/           # Pure utility functions
├── services/            # Business Logic
│   ├── api/            # HTTP/WebSocket
│   ├── state/          # Svelte stores
│   └── math/           # Algorithms
├── components/          # UI Components
│   ├── common/         # Generic (Button, Modal)
│   ├── kinetic/        # Animations (TraceLine, ProgressRing)
│   ├── modules/        # 11 Training Modules
│   ├── apex/           # Apex League
│   └── layout/         # Shell, TopBar, ViewportGuard
├── views/               # Page Containers
│   ├── Dashboard/
│   ├── Reports/
│   └── CoreGames/
└── pwa/                 # PWA Support
```

## Key Requirements

### V10.0 - Native-Like Responsiveness
- Zero-Scroll Mandate: No scrollbars on 768x1024 viewport
- iOS Safe Area support
- Touch-optimized interactions

### V12.0 - Kinetic UI
- DCS Trace Line transitions < 250ms
- GPU acceleration (translateZ(0))
- 60fps target for all animations

### V11.0 - Non-Regression Anchoring
- Unit tests for `determineAllocation()`
- E2E tests for Zero-Scroll Mandate
- Performance tests for kinetic transitions

## Environment Configuration

| Environment | API URL | Features |
|------------|---------|----------|
| Development | localhost:3000 | Debug overlays, mock data |
| QA | qa.ophthalmo-sim.com | Performance logging |
| Production | api.ophthalmo-sim.com | Minified, service worker |
