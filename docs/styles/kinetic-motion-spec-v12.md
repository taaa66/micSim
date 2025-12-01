# Kinetic Motion Specification V12.0

## Overview

This specification defines the motion design system for the Ophthalmic Simulator, ensuring smooth, performant animations that enhance the user experience without compromising responsiveness.

---

## Performance Requirements

### DCS Trace Line
- **Maximum Duration**: 250ms
- **Easing**: `cubic-bezier(0.33, 1, 0.68, 1)`
- **GPU Acceleration**: Required

### Frame Rate Target
- **Minimum**: 55fps average
- **Target**: 60fps constant
- **During Gameplay**: >50fps

---

## Animation Categories

### 1. Micro-Interactions (50-150ms)

**Usage**: Button presses, toggles, immediate feedback

```css
.micro-interaction {
  transition: all 50ms ease-out;
}

.button:active {
  transform: scale(0.98);
  transition-duration: 50ms;
}
```

### 2. State Transitions (150-300ms)

**Usage**: Panel openings, tab switches, navigation

```css
.state-transition {
  transition: all 300ms cubic-bezier(0.33, 1, 0.68, 1);
}

.panel-enter {
  animation: slideIn 300ms cubic-bezier(0.33, 1, 0.68, 1);
}
```

### 3. Kinetic Elements (≤250ms)

**Usage**: Trace lines, progress indicators, live data

```css
.kinetic-element {
  /* GPU acceleration - REQUIRED */
  transform: translateZ(0);
  will-change: transform;
  
  /* Max 250ms transition */
  transition: all 250ms cubic-bezier(0.33, 1, 0.68, 1);
}
```

### 4. Elastic Animations (400ms)

**Usage**: Playful feedback, success states, gamification

```css
.elastic {
  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-bounce {
  animation: bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## GPU Acceleration Guidelines

### Required Elements

All elements that animate `transform` or `opacity` MUST use GPU acceleration:

```css
.animated {
  /* Layer promotion */
  transform: translateZ(0);
  
  /* Paint optimization */
  backface-visibility: hidden;
  
  /* Performance hint */
  will-change: transform;
  
  /* Optional: 3D context */
  perspective: 1000px;
}
```

### When to Apply

1. **Always**: Module cards, progress rings, trace lines
2. **On Hover**: Interactive elements about to animate
3. **Never**: Static content, text-only elements

### Memory Considerations

```css
/* Remove after animation completes */
.animation-complete {
  will-change: auto;
}
```

---

## Trace Line Implementation

The DCS Trace Line is the most performance-critical animation.

### SVG Implementation

```svelte
<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  
  // MUST complete in ≤250ms
  const progress = tweened(0, {
    duration: 250, // MAX
    easing: cubicOut
  });
</script>

<svg style="transform: translateZ(0); will-change: contents;">
  <line
    x1={start.x}
    y1={start.y}
    x2={lerp(start.x, end.x, $progress)}
    y2={lerp(start.y, end.y, $progress)}
  />
</svg>
```

### Performance Validation

```typescript
function validateTraceLinePerformance() {
  const start = performance.now();
  
  // Animate trace line...
  
  const duration = performance.now() - start;
  
  if (duration > 250) {
    console.warn(`[V12.0 VIOLATION] Trace line: ${duration}ms > 250ms`);
  }
}
```

---

## Progress Ring Animation

### Smooth Value Changes

```svelte
<script>
  import { tweened } from 'svelte/motion';
  
  const progress = tweened(0, {
    duration: 300,
    easing: cubicOut
  });
  
  // Circumference calculation
  $: dashOffset = circumference - ($progress / 100) * circumference;
</script>

<circle
  stroke-dasharray={circumference}
  stroke-dashoffset={dashOffset}
  style="transition: stroke-dashoffset 300ms cubic-bezier(0.33, 1, 0.68, 1);"
/>
```

---

## Staggered Animations

For lists and grids, stagger entry animations:

```typescript
function getStaggerDelay(index: number): number {
  const BASE_DELAY = 50; // ms
  const MAX_DELAY = 500; // ms
  
  return Math.min(index * BASE_DELAY, MAX_DELAY);
}
```

```svelte
{#each items as item, i}
  <div
    style="animation-delay: {getStaggerDelay(i)}ms;"
    class="stagger-item"
  >
    {item}
  </div>
{/each}
```

---

## Performance Testing

### Automated Tests

```typescript
test('trace line under 250ms', async () => {
  const start = performance.now();
  
  await traceLine.animate();
  
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(250);
});
```

### Manual Validation

1. Open DevTools Performance tab
2. Start recording
3. Trigger animation
4. Verify no frame drops (red bars)
5. Check GPU usage in Layers panel
