# CSS Manifest V13.0

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#0fb89f` | Main accent, CTAs |
| Primary Bright | `#34d399` | Hover states |
| Primary Dark | `#0a7c6d` | Active states |

### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| BG Dark | `#040d10` | Main background |
| BG Medium | `#0a1a1f` | Cards, panels |
| BG Light | `#1a2a2e` | Elevated surfaces |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#ffffff` | Headlines |
| Text Secondary | `#e0f5f0` | Body text |
| Text Muted | `#7aa8a0` | Labels |
| Text Dim | `#5a7a80` | Disabled |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Gold | `#d4af37` | Achievements |
| Gold Light | `#fbbf24` | Highlights |
| Amber | `#f59e0b` | Warnings |
| Red | `#f87171` | Errors |
| Blue | `#60a5fa` | Info |
| Purple | `#a855f7` | Special |

### Grade Colors

| Grade | Hex | Threshold |
|-------|-----|-----------|
| S (Platinum) | `#E5E4E2` | ≥95% |
| A (Gold) | `#fbbf24` | ≥85% |
| B (Green) | `#34d399` | ≥70% |
| C (Blue) | `#60a5fa` | ≥50% |
| D (Red) | `#f87171` | ≥30% |
| F | `#ef4444` | <30% |

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Scale

| Size | rem | Usage |
|------|-----|-------|
| xs | 0.75rem | Labels, badges |
| sm | 0.875rem | Body text |
| base | 1rem | Default |
| lg | 1.125rem | Subheadings |
| xl | 1.25rem | Headings |
| 2xl | 1.5rem | Page titles |
| 3xl | 1.875rem | Hero text |

---

## Spacing

Using 4px base unit:

| Name | Value | Usage |
|------|-------|-------|
| 1 | 4px | Tight spacing |
| 2 | 8px | Element padding |
| 3 | 12px | Small gaps |
| 4 | 16px | Standard padding |
| 6 | 24px | Section spacing |
| 8 | 32px | Large gaps |

---

## Animation (V12.0 Kinetic)

### Timing

| Name | Duration | Usage |
|------|----------|-------|
| INSTANT | 50ms | Micro-interactions |
| FAST | 150ms | Button feedback |
| NORMAL | 300ms | Standard transitions |
| SLOW | 500ms | Page transitions |
| TRACE_LINE | 250ms | DCS trace line (MAX) |
| ELASTIC | 400ms | Bouncy effects |

### Easing

```css
/* Standard out-cubic */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);

/* Elastic bounce */
--ease-out-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth in-out */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### GPU Acceleration

```css
.kinetic-element {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

---

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| sm | 4px | Badges |
| md | 8px | Buttons |
| lg | 12px | Cards |
| full | 9999px | Pills, avatars |

---

## Shadows

```css
/* Card shadow */
box-shadow: 0 4px 6px -1px rgba(15, 184, 159, 0.1);

/* Elevated shadow */
box-shadow: 0 10px 15px -3px rgba(15, 184, 159, 0.2);

/* Glow effect */
box-shadow: 0 0 20px rgba(15, 184, 159, 0.3);
```

---

## Zero-Scroll Mandate (V10.0)

```css
html, body {
  overflow: hidden !important;
  height: 100vh !important;
  width: 100vw !important;
}

/* Safe area support */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```
