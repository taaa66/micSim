# Module Boundaries (V14.0)

## Overview

This document defines the boundaries and responsibilities of each module in the Ophthalmic Simulator to ensure clean separation of concerns.

## Core Layer (Immutability Zone)

### `src/core/models/`
**Responsibility**: Data contracts and TypeScript interfaces

**Contains**:
- `IModuleData` - Training module structure
- `ISurgeonProfile` - User profile data
- `IApexRanking` - Apex League rankings
- `ICoreGameScore` - Game scoring interfaces

**Rules**:
- ✅ Can be imported by any layer
- ❌ Cannot import from services or components
- ❌ Should not contain business logic

### `src/core/constants/`
**Responsibility**: Immutable application-wide values

**Contains**:
- `API_ENDPOINTS` - Backend routes
- `COLORS` - CSS Manifest V13.0 palette
- `KINETIC` - Animation timing constants
- `VIEWPORT` - Zero-scroll target dimensions

**Rules**:
- ✅ Can be imported by any layer
- ❌ Values must never change at runtime

### `src/core/utils/`
**Responsibility**: Pure utility functions

**Contains**:
- `math-utils.ts` - Mathematical calculations
- `dom-utils.ts` - DOM manipulation
- `timings.ts` - Animation timing helpers

**Rules**:
- ✅ Functions must be pure (no side effects)
- ❌ Cannot access stores or state

---

## Service Layer

### `src/services/api/`
**Responsibility**: External communication

**Contains**:
- `http-client.ts` - REST API wrapper
- `websocket-client.ts` - Real-time connections
- `apex-api.ts` - Apex League endpoints

**Rules**:
- ✅ Can import from core
- ✅ Can update state stores
- ❌ Cannot import components

### `src/services/state/`
**Responsibility**: Global state management

**Contains**:
- `stores.ts` - Svelte writable/derived stores

**Key Stores**:
- `currentModuleContext` - Active training module
- `allocationData` - Apex allocation state
- `currentView` - Active view routing

**Rules**:
- ✅ Can import from core
- ❌ Cannot import components
- ❌ Cannot make API calls directly

### `src/services/math/`
**Responsibility**: Complex algorithms

**Contains**:
- `scoring-algorithms.ts` - Performance calculations
- `determine-allocation.ts` - V11.0 anchor

**Rules**:
- ✅ Must have comprehensive test coverage
- ❌ Cannot have side effects

---

## Component Layer

### `src/components/common/`
**Responsibility**: Reusable generic UI elements

**Contains**: Button, Modal, Input, Tabs, Tooltip

**Rules**:
- ❌ No business logic
- ❌ No API calls
- ✅ Accept props for customization

### `src/components/kinetic/`
**Responsibility**: Animation and visualization

**Contains**: ProgressRing, TraceLine, KineticBackground

**Rules**:
- ✅ Must use GPU acceleration
- ✅ Transitions must be < 250ms
- ❌ No business logic

### `src/components/modules/`
**Responsibility**: Training module UI

**Contains**: ModuleCard, ModuleCircle, ModuleList

**Rules**:
- ✅ Can read from module stores
- ❌ Cannot write to stores directly

### `src/components/apex/`
**Responsibility**: Apex League UI

**Contains**: Leaderboard, AllocationVoter, ExecutiveSummary

**Rules**:
- ✅ Can use Apex stores
- ✅ Can dispatch vote events

### `src/components/layout/`
**Responsibility**: Page structure

**Contains**: Shell, TopBar, ViewportGuard, SideNav

**Rules**:
- ✅ Enforces Zero-Scroll Mandate
- ✅ Manages navigation

---

## View Layer

### `src/views/*/`
**Responsibility**: Page containers that compose components

**Contains**: DashboardView, ReportsView, CoreGames views

**Rules**:
- ✅ Can compose any components
- ✅ Can access stores
- ❌ Should not contain reusable logic
