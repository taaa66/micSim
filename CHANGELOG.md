# Changelog

All notable changes to OphthalmoSim+ are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [14.0.0] - 2024-12-02 — "Precision Protocol"

### Added

#### OKAP Rapid-Fire Knowledge Module
- **20 knowledge games** organized into 5 clinical categories
- **Universal game engine** with 15-second timer, streak bonuses, and grade system (S/A/B/C/D)
- **6 fully implemented games**:
  - O1: Vergence Shift Machine (equation completion)
  - N3: The CN III Norm (true/false rapid-fire)
  - N4: Who Moves Whom? (EOM multiple choice)
  - P1: MoA - Who Against Whom? (drug classification)
  - C1: The ISNT Series (sequencing)
  - E2: Chemical Burn Protocol (emergency sequencing)
- **Question banks** with 100+ clinically validated questions
- **5 game mechanics**: Equation completion, two-column sort, true/false, multiple choice, sequencing

#### Platform Enhancements
- OKAP Games Hub with module-based navigation
- Real-time scoring with speed bonuses and streak multipliers
- Progress tracking integrated with analytics system
- Bilingual architecture (English primary, Hebrew support removed for consistency)

### Changed
- Unified LTR (left-to-right) layout across all components
- Enhanced README with comprehensive stakeholder documentation
- Improved Firebase authentication with retry logic for race conditions

### Fixed
- Firebase registration race condition causing "user already exists" errors
- User profile creation verification before login completion
- CSS selector cleanup for unused Hebrew-specific styles

---

## [13.0.0] - 2024-11 — "Kinetic Apex"

### Added
- Apex League competitive ranking system
- Real-time leaderboards with allocation voting
- Trace line animations with GPU acceleration
- Enhanced visual feedback system

### Changed
- Migrated to Svelte 5 with runes
- Improved 60fps performance across all modules
- Zero-scroll mandate for tablet optimization

---

## [12.0.0] - 2024-10 — "Kinetic UI"

### Added
- GPU-accelerated animations throughout
- Sub-250ms transition requirements
- Performance monitoring dashboard

### Changed
- Complete CSS architecture overhaul
- Touch input optimization for iPad

---

## [11.0.0] - 2024-09 — "Core Games"

### Added
- **Tremor Shield**: Hand stability training game
- **Vector Race**: Directional precision game
- **Nano-Grip Gauntlet**: Force modulation game
- Gamification scoring system
- Achievement badges

---

## [10.0.0] - 2024-08 — "Zero Scroll"

### Added
- Viewport-locked design for tablets
- Safe area inset support
- Responsive breakpoint system

### Changed
- Complete layout restructure for no-scroll experience
- Footer and header optimization

---

## [9.0.0] - 2024-07 — "Analytics Integration"

### Added
- Session recording and playback
- Performance analytics dashboard
- Progress tracking over time
- Export functionality for research

---

## [8.0.0] - 2024-06 — "Authentication"

### Added
- Firebase Authentication integration
- User profiles with progress persistence
- Multi-device sync
- Secure credential storage

---

## [7.0.0] - 2024-05 — "Simulation Expansion"

### Added
- Hydrodissection Control module
- Suture Tension Trainer
- Corneal Arc Cutter
- Enhanced metrics for all simulators

---

## [6.0.0] - 2024-04 — "Metrics Framework"

### Added
- Standardized performance metrics
- Real-time feedback overlays
- Historical comparison charts
- Benchmark calibration system

---

## [5.0.0] - 2024-03 — "Core Simulators"

### Added
- Capsulorhexis Trainer
- Corneal Tunnel Formation
- Corneal Suture Placement
- Gas/Liquid Injection
- Micro-Tremor Control
- Tissue Grasping Trainer
- Needle Angle Trainer

---

## [4.0.0] - 2024-02 — "Foundation"

### Added
- Svelte application architecture
- Component library foundation
- Build and deployment pipeline
- Testing framework setup

---

## Versioning Philosophy

- **Major versions** (X.0.0): Significant feature additions or architectural changes
- **Minor versions** (0.X.0): New modules or enhancements within existing features
- **Patch versions** (0.0.X): Bug fixes and minor improvements

---

## Upcoming

See [README.md](README.md#product-roadmap) for planned features and timeline.
