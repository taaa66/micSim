/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - SCORING ALGORITHMS (V14.0)
 * =============================================================================
 * Complex mathematical algorithms for performance scoring, tremor calculation,
 * and Vector Race/Nano-Grip computations.
 * =============================================================================
 */

import { SCORING, CORE_GAMES } from '../../core/constants';
import type { IPointerData } from '../../core/models';

// =============================================================================
// TREMOR CALCULATION ALGORITHMS
// =============================================================================

/**
 * Calculate Root Mean Square (RMS) deviation from a set of points
 * Used for tremor measurement in Tremor Shield game
 */
export function calculateRMS(points: Array<{ x: number; y: number }>): number {
  if (points.length < 2) return 0;

  // Calculate centroid
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  // Calculate squared deviations
  const squaredDeviations = points.map(p => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    return dx * dx + dy * dy;
  });

  // Return RMS
  const meanSquared = squaredDeviations.reduce((a, b) => a + b, 0) / squaredDeviations.length;
  return Math.sqrt(meanSquared);
}

/**
 * Convert pixel deviation to microns
 */
export function pixelsToMicrons(pixels: number): number {
  return pixels * CORE_GAMES.TREMOR_SHIELD.PIXEL_TO_MICRON;
}

/**
 * Apply moving average smoothing to point data
 */
export function movingAverageSmooth(
  points: IPointerData[],
  windowSize: number = SCORING.SMOOTHING_WINDOW
): IPointerData[] {
  if (points.length < windowSize) return points;

  const smoothed: IPointerData[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(points.length, i + halfWindow + 1);
    const window = points.slice(start, end);

    smoothed.push({
      ...points[i],
      x: window.reduce((sum, p) => sum + p.x, 0) / window.length,
      y: window.reduce((sum, p) => sum + p.y, 0) / window.length
    });
  }

  return smoothed;
}

/**
 * Calculate tremor residuals (difference between raw and smoothed)
 */
export function calculateTremorResiduals(
  raw: IPointerData[],
  smoothed: IPointerData[]
): number[] {
  if (raw.length !== smoothed.length) {
    throw new Error('Raw and smoothed arrays must have same length');
  }

  return raw.map((r, i) => {
    const s = smoothed[i];
    const dx = r.x - s.x;
    const dy = r.y - s.y;
    return Math.sqrt(dx * dx + dy * dy);
  });
}

// =============================================================================
// VELOCITY CALCULATION
// =============================================================================

/**
 * Calculate velocities between consecutive points
 */
export function calculateVelocities(points: IPointerData[]): number[] {
  if (points.length < 2) return [];

  const velocities: number[] = [];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dt = curr.timestamp - prev.timestamp;
    
    if (dt > 0) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      velocities.push(distance / dt); // pixels per millisecond
    } else {
      velocities.push(0);
    }
  }

  return velocities;
}

/**
 * Calculate average velocity
 */
export function averageVelocity(velocities: number[]): number {
  if (velocities.length === 0) return 0;
  return velocities.reduce((a, b) => a + b, 0) / velocities.length;
}

// =============================================================================
// ANGLE CALCULATION (Vector Race)
// =============================================================================

/**
 * Calculate angle from tilt values
 */
export function calculateTiltAngle(tiltX: number, tiltY: number): number {
  // Primary control is X tilt for Vector Race
  return tiltX;
}

/**
 * Calculate angle deviation from target
 */
export function calculateAngleDeviation(current: number, target: number): number {
  return Math.abs(current - target);
}

/**
 * Check if angle is within combo zone
 */
export function isInComboZone(deviation: number): boolean {
  return deviation <= CORE_GAMES.VECTOR_RACE.IDEAL_ANGLE_TOLERANCE;
}

/**
 * Check if angle causes wall collision
 */
export function isWallCollision(deviation: number, trackWidth: number): boolean {
  return deviation > trackWidth + CORE_GAMES.VECTOR_RACE.WALL_TOLERANCE;
}

// =============================================================================
// GRIP CALCULATION (Nano-Grip Gauntlet)
// =============================================================================

/**
 * Calculate distance from point to grip zone center
 */
export function distanceToGripZone(
  point: { x: number; y: number },
  zone: { x: number; y: number; radius: number }
): number {
  const dx = point.x - zone.x;
  const dy = point.y - zone.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point is within grip zone tolerance
 */
export function isInGripZone(
  point: { x: number; y: number },
  zone: { x: number; y: number; radius: number }
): boolean {
  const distance = distanceToGripZone(point, zone);
  return distance <= zone.radius + CORE_GAMES.NANO_GRIP.GRIP_TOLERANCE_PX;
}

/**
 * Calculate grip accuracy percentage
 */
export function calculateGripAccuracy(
  activeZones: number,
  totalZones: number
): number {
  if (totalZones === 0) return 0;
  return (activeZones / totalZones) * 100;
}

// =============================================================================
// SCORING & GRADING
// =============================================================================

/**
 * Calculate combo multiplier based on combo count
 */
export function calculateComboMultiplier(combo: number): number {
  if (combo >= SCORING.COMBO_TIER_4) return 3.0;
  if (combo >= SCORING.COMBO_TIER_3) return 2.5;
  if (combo >= SCORING.COMBO_TIER_2) return 2.0;
  if (combo >= SCORING.COMBO_TIER_1) return 1.5;
  return 1.0;
}

/**
 * Determine grade from percentage score
 */
export function calculateGrade(percentage: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= SCORING.GRADE_S_MIN) return 'S';
  if (percentage >= SCORING.GRADE_A_MIN) return 'A';
  if (percentage >= SCORING.GRADE_B_MIN) return 'B';
  if (percentage >= SCORING.GRADE_C_MIN) return 'C';
  if (percentage >= SCORING.GRADE_D_MIN) return 'D';
  return 'F';
}

/**
 * Calculate skill transfer bonus
 * Core game scores provide bonus to related surgical modules
 */
export function calculateSkillTransferBonus(
  gameId: string,
  gameScore: number,
  maxScore: number
): number {
  const percentage = (gameScore / maxScore) * 100;
  
  // Base transfer rate: 15% of game performance
  const transferRate = 0.15;
  
  // Bonus scales with performance
  if (percentage >= 90) return transferRate * 1.5;
  if (percentage >= 70) return transferRate * 1.2;
  if (percentage >= 50) return transferRate;
  return transferRate * 0.5;
}

// =============================================================================
// STATISTICAL HELPERS
// =============================================================================

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate percentile value
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) return sorted[lower];
  
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}
