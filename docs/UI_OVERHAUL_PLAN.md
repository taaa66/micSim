# OphthalmoSim+ 2028 UI/UX Overhaul Plan

## 1. Design & Aesthetic Principles

### Core Principles
1.  **Clinical Precision**: Aesthetically minimal, high-contrast, and data-driven. Every pixel serves a clinical or educational purpose.
2.  **Immersive Fluidity**: "Seamless Interaction" means no hard cuts. Transitions guide the user's mental model from dashboard to simulation.
3.  **Contextual Adaptation**: The interface morphs based on the device (Mobile vs Desktop) and user state (Learning vs Testing).

### Visual Language (Medical Teal 2028)
*   **Primary**: `#14B8A6` (Teal-500) - Trust, Innovation.
*   **Background**: `#0F172A` (Slate-900) - Deep, non-distracting dark mode.
*   **Typography**:
    *   Headings: `Space Grotesk` (Technical)
    *   Body: `Inter` (Legible)
    *   Data: `JetBrains Mono` (Precise)

## 2. Layout & Responsiveness

### Grid System
*   **Base**: 12-column CSS Grid.
*   **Desktop**: Fixed Sidebar (64px/240px) + Fluid Content Area.
*   **Mobile**: Stacked layout with Bottom Navigation Bar (Quick Access).

### Strategy
*   **Desktop First**: Rich dashboard with radial visualization.
*   **Mobile Adaptation**: Radial view simplifies to a swipeable list or compact radial. Complex tables transform into "Card Views".

## 3. Animations & Interactivity

### Key Interactions
1.  **Module Entry**: Zoom-in transition (Scale 1 -> 1.5 + Fade Out) -> Simulation Load.
2.  **Success State**: Micro-interaction checkmark animation + Subtle confetti burst.
3.  **Hover Effects**: Magnetic pull on buttons (using simple physics) to increase tactile feel.

### Technology
*   **Engine**: Svelte Built-in Transitions (`svelte/transition`) & Motion (`svelte/motion`).
*   **Why**: Zero-runtime overhead, hardware accelerated, seamless integration with state.

## 4. Accessibility (A11Y) & Performance

### A11Y Checklist
*   [ ] **WCAG AAA Contrast**: Ensure Teal text on Dark background is > 7:1.
*   [ ] **Reduced Motion**: Respect `prefers-reduced-motion` media query globally.
*   [ ] **Focus Management**: Implement Focus Traps for all Modals.
*   [ ] **ARIA**: Comprehensive labelling for all icon-only buttons.

### Performance
*   **Target**: 60fps on low-end mobile devices.
*   **Technique**: Use `transform` and `opacity` ONLY for animations to avoid Layout Thrashing.

## 5. Implementation Plan

### Phase 1: Foundations (Current)
*   Define Design Tokens (CSS Variables).
*   Implement Global Reset & Typography.
*   **Status**: Started (app.css updated).

### Phase 2: Component Library (Atomic)
*   Create `ModernButton`, `GlassCard`, `InputField`.
*   Replace existing specialized components with these generic atoms.

### Phase 3: Layout Refactor
*   Implement the new Sidebar/BottomNav structure.
*   Refactor `RadialDashboard` to use the new Grid system.

### Phase 4: "The Polish"
*   Add "Shared Element Transitions" between routes.
*   Implement advanced sound design (UI Audio).
