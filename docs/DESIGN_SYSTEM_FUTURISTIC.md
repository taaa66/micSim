# Futuristic Design System - SmartCar Inspired
## Visual Language Specification

Based on reference: SmartCar Dashboard by Ari Budin

---

## Typography System

### Font Stack
```css
--font-primary: 'Orbitron', 'Exo 2', 'Rajdhani', monospace;
--font-display: 'Orbitron', sans-serif;
--font-mono: 'Share Tech Mono', 'Courier New', monospace;
```

### Type Scale (Technical Precision)
```css
--text-xs: 0.625rem;   /* 10px - Metadata */
--text-sm: 0.75rem;    /* 12px - Labels */
--text-base: 0.875rem; /* 14px - Body */
--text-lg: 1rem;       /* 16px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Headings */
--text-2xl: 1.75rem;   /* 28px - Large displays */
--text-3xl: 2.5rem;    /* 40px - Hero numbers */
```

### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-bold: 700;
```

### Letter Spacing
```css
--tracking-tight: -0.02em;
--tracking-normal: 0.02em;
--tracking-wide: 0.08em;    /* Technical labels */
--tracking-wider: 0.15em;   /* Headings */
```

---

## Color Palette

### Primary (Cyan Glow)
```css
--cyan-50: #E0FFFF;
--cyan-100: #B3FFFF;
--cyan-200: #80FFFF;
--cyan-300: #4DFFFF;
--cyan-400: #00FFFF;  /* Primary accent */
--cyan-500: #00D9FF;  /* Main brand */
--cyan-600: #00B8E6;
--cyan-700: #0097CC;
--cyan-800: #007699;
--cyan-900: #005566;
```

### Background (Deep Space)
```css
--bg-space: #0A0E14;      /* Main background */
--bg-panel: #0F1419;      /* Card background */
--bg-elevated: #141A21;   /* Elevated elements */
--bg-overlay: rgba(10, 14, 20, 0.95);
```

### Semantic Colors
```css
--alert-red: #FF0040;
--alert-red-glow: rgba(255, 0, 64, 0.3);
--success-green: #00FF88;
--warning-amber: #FFB800;
--info-cyan: #00D9FF;
```

### Text Colors
```css
--text-primary: #FFFFFF;
--text-secondary: #00FFFF;
--text-muted: #4A9BA8;
--text-disabled: #2A3A48;
```

### Border & Glow
```css
--border-cyan: #00FFFF;
--border-cyan-dim: rgba(0, 255, 255, 0.3);
--glow-cyan: 0 0 10px rgba(0, 255, 255, 0.5);
--glow-cyan-strong: 0 0 20px rgba(0, 255, 255, 0.8);
```

---

## Layout System

### Spacing (Technical Grid)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
```

### Border Radius (Angular)
```css
--radius-none: 0;
--radius-sm: 2px;
--radius-base: 4px;
--radius-md: 6px;
--radius-chamfer: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
```

### Borders
```css
--border-width: 1px;
--border-width-thick: 2px;
--border-style: solid;
--border-color: var(--border-cyan);
```

---

## Component Patterns

### Panel/Card
```css
.futuristic-panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-cyan-dim);
  clip-path: polygon(
    12px 0, 100% 0, 
    100% calc(100% - 12px), 
    calc(100% - 12px) 100%, 
    0 100%, 0 12px
  );
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.05),
    0 0 10px rgba(0, 255, 255, 0.1);
}

.futuristic-panel:hover {
  border-color: var(--border-cyan);
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 20px rgba(0, 255, 255, 0.3);
}
```

### Status Indicator
```css
.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: rgba(0, 255, 255, 0.05);
  border-left: 2px solid var(--cyan-400);
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.status-indicator.alert {
  border-left-color: var(--alert-red);
  background: rgba(255, 0, 64, 0.1);
}
```

### Button (Technical)
```css
.btn-futuristic {
  background: transparent;
  border: 1px solid var(--cyan-400);
  color: var(--cyan-400);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-futuristic:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  transform: translateY(-1px);
}

.btn-futuristic:active {
  transform: translateY(0);
}
```

### Navigation Item
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--text-muted);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  letter-spacing: var(--tracking-normal);
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--cyan-400);
  border-left-color: var(--cyan-400);
  background: rgba(0, 255, 255, 0.05);
}

.nav-item.active {
  color: var(--text-primary);
  background: var(--cyan-400);
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2) 0%, transparent 100%);
  border-left-color: var(--cyan-400);
}
```

---

## Animation & Interaction

### Timing Functions
```css
--ease-technical: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-glow: cubic-bezier(0.4, 0, 0.2, 1);
```

### Durations
```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-base: 300ms;
--duration-slow: 500ms;
```

### Glow Animation
```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  }
}

.glow-element {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Scan Line Effect
```css
@keyframes scan-line {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.scan-effect::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    transparent 0%,
    rgba(0, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: scan-line 3s linear infinite;
  pointer-events: none;
}
```

---

## Icon System

### Style
- Line-based icons
- 1-2px stroke width
- Cyan color
- Technical/geometric aesthetic
- Match Feather Icons or Lucide style

### Sizes
```css
--icon-xs: 14px;
--icon-sm: 16px;
--icon-base: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

---

## Mood & Feel

**Characteristics:**
- Technical precision
- Futuristic/sci-fi
- High-tech dashboard
- Clean and minimal
- Glowing accents
- Dark theme dominant
- Information-dense but organized
- Professional/serious tone

**Avoid:**
- Rounded, soft shapes
- Warm colors
- Playful elements
- Heavy shadows
- Gradients (except subtle glows)
- Decorative patterns

---

## Implementation Priority

1. **Typography** - Switch to Orbitron/technical fonts
2. **Colors** - Apply cyan/space black palette
3. **Borders** - Add chamfered corners and cyan strokes
4. **Components** - Redesign cards, buttons, nav
5. **Animations** - Add glow effects and technical transitions

---

*Reference: SmartCar Dashboard by https://x.com/ari_budin*
