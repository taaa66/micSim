/**
 * ScoringEngine.js
 * Standardized scoring functions for Micro-Sim Ophthalmology Trainer
 */

/**
 * Calculate Euclidean distance between two points
 */
export function euclideanDistance(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function standardDeviation(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Calculate instantaneous velocity between successive points
 * @param {Array} points - Array of {x, y, timeStamp}
 * @returns {Array} Array of velocity values (px/ms)
 */
export function calculateVelocities(points) {
  const velocities = [];
  for (let i = 1; i < points.length; i++) {
    const dist = euclideanDistance(points[i], points[i - 1]);
    const dt = points[i].timeStamp - points[i - 1].timeStamp;
    velocities.push(dt > 0 ? dist / dt : 0);
  }
  return velocities;
}

/**
 * Moving average filter for path smoothing
 * @param {Array} points - Array of {x, y, ...}
 * @param {number} windowSize - Filter window (default 3)
 * @returns {Array} Smoothed points
 */
export function movingAverageSmooth(points, windowSize = 3) {
  if (points.length < windowSize) return [...points];
  const smoothed = [];
  const half = Math.floor(windowSize / 2);
  
  for (let i = 0; i < points.length; i++) {
    let sumX = 0, sumY = 0, count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(points.length - 1, i + half); j++) {
      sumX += points[j].x;
      sumY += points[j].y;
      count++;
    }
    smoothed.push({
      ...points[i],
      x: sumX / count,
      y: sumY / count
    });
  }
  return smoothed;
}

/**
 * Calculate tremor residuals (raw - smoothed)
 * @param {Array} rawPoints
 * @param {Array} smoothedPoints
 * @returns {Array} Array of residual magnitudes
 */
export function calculateTremorResiduals(rawPoints, smoothedPoints) {
  const residuals = [];
  const len = Math.min(rawPoints.length, smoothedPoints.length);
  for (let i = 0; i < len; i++) {
    residuals.push(euclideanDistance(rawPoints[i], smoothedPoints[i]));
  }
  return residuals;
}

/**
 * Path Accuracy Score
 * Compares actual path to ideal/target path
 * @param {Array} actualPoints - User's drawn points
 * @param {Array} idealPoints - Target path points
 * @returns {number} Score 0-100
 */
export function scorePathAccuracy(actualPoints, idealPoints) {
  if (!actualPoints.length || !idealPoints.length) return 0;
  
  let totalDistance = 0;
  for (const actual of actualPoints) {
    let minDist = Infinity;
    for (const ideal of idealPoints) {
      const d = euclideanDistance(actual, ideal);
      if (d < minDist) minDist = d;
    }
    totalDistance += minDist;
  }
  
  const avgDistance = totalDistance / actualPoints.length;
  // Normalize: 0px deviation = 100, 50px+ deviation = 0
  return Math.max(0, Math.min(100, 100 - avgDistance * 2));
}

/**
 * Speed Uniformity Score
 * Lower velocity standard deviation = higher score
 * @param {Array} velocities - Array of velocity values
 * @returns {number} Score 0-100
 */
export function scoreSpeedUniformity(velocities) {
  if (velocities.length < 2) return 100;
  const sigma = standardDeviation(velocities);
  // Normalize: σ=0 → 100, σ≥1 → 0
  return Math.max(0, Math.min(100, 100 - sigma * 100));
}

/**
 * Pressure Uniformity Score
 * @param {Array} pressures - Array of pressure values (0-1)
 * @returns {number} Score 0-100
 */
export function scorePressureUniformity(pressures) {
  if (pressures.length < 2) return 100;
  const sigma = standardDeviation(pressures);
  // Normalize: σ=0 → 100, σ≥0.3 → 0
  return Math.max(0, Math.min(100, 100 - sigma * 333));
}

/**
 * Tremor Score
 * Based on high-frequency residual movement
 * @param {Array} residuals - Tremor residual magnitudes
 * @param {number} duration - Task duration in ms
 * @returns {number} Score 0-100
 */
export function scoreTremor(residuals, duration) {
  if (!residuals.length || duration <= 0) return 100;
  const totalTremor = residuals.reduce((a, b) => a + b, 0);
  const normalizedTremor = (totalTremor / duration) * 1000; // per second
  // Normalize: 0 tremor → 100, 50+ tremor/sec → 0
  return Math.max(0, Math.min(100, 100 - normalizedTremor * 2));
}

/**
 * Radius Uniformity Score (for circular paths like Capsulorhexis)
 * @param {Array} points - Path points
 * @param {{x: number, y: number}} center - Circle center
 * @returns {number} Score 0-100
 */
export function scoreRadiusUniformity(points, center) {
  if (points.length < 3) return 0;
  const radii = points.map(p => euclideanDistance(p, center));
  const sigma = standardDeviation(radii);
  // Normalize: σ=0 → 100, σ≥30 → 0
  return Math.max(0, Math.min(100, 100 - sigma * 3.33));
}

/**
 * Check if point is outside boundary (Run-Out detection)
 * @param {Object} point - {x, y}
 * @param {{x: number, y: number}} center
 * @param {number} maxRadius
 * @returns {boolean}
 */
export function isRunOut(point, center, maxRadius) {
  return euclideanDistance(point, center) > maxRadius;
}

/**
 * Tilt Angle Score
 * @param {Array} tilts - Array of {tiltX, tiltY}
 * @param {number} targetTiltX
 * @param {number} targetTiltY
 * @param {number} toleranceDeg - Tolerance in degrees
 * @returns {number} Score 0-100
 */
export function scoreTiltAccuracy(tilts, targetTiltX, targetTiltY, toleranceDeg = 5) {
  if (!tilts.length) return 100;
  let withinTolerance = 0;
  for (const t of tilts) {
    const deviationX = Math.abs((t.tiltX || 0) - targetTiltX);
    const deviationY = Math.abs((t.tiltY || 0) - targetTiltY);
    if (deviationX <= toleranceDeg && deviationY <= toleranceDeg) {
      withinTolerance++;
    }
  }
  return (withinTolerance / tilts.length) * 100;
}

/**
 * Reaction Time Score
 * @param {number} reactionTimeMs - Time from stimulus to response
 * @param {number} targetMs - Target reaction time
 * @returns {number} Score 0-100
 */
export function scoreReactionTime(reactionTimeMs, targetMs = 500) {
  if (reactionTimeMs <= 0) return 0;
  if (reactionTimeMs <= targetMs) return 100;
  // Penalty for slower reaction
  return Math.max(0, 100 - ((reactionTimeMs - targetMs) / targetMs) * 100);
}

/**
 * Symmetry Score for suture placement
 * @param {Object} entryPoint - Actual entry {x, y}
 * @param {Object} exitPoint - Actual exit {x, y}
 * @param {Object} idealEntry - Target entry {x, y}
 * @param {Object} idealExit - Target exit {x, y}
 * @returns {number} Score 0-100
 */
export function scoreSymmetry(entryPoint, exitPoint, idealEntry, idealExit) {
  const entryError = euclideanDistance(entryPoint, idealEntry);
  const exitError = euclideanDistance(exitPoint, idealExit);
  const avgError = (entryError + exitError) / 2;
  // 0 error → 100, 20px error → 0
  return Math.max(0, Math.min(100, 100 - avgError * 5));
}

/**
 * Generate ideal circular path points
 * @param {{x: number, y: number}} center
 * @param {number} radius
 * @param {number} numPoints
 * @returns {Array}
 */
export function generateCirclePath(center, radius, numPoints = 100) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    });
  }
  return points;
}

/**
 * Generate ideal straight path points
 * @param {Object} start - {x, y}
 * @param {Object} end - {x, y}
 * @param {number} numPoints
 * @returns {Array}
 */
export function generateLinePath(start, end, numPoints = 50) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    points.push({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t
    });
  }
  return points;
}

// ============================================
// CAPSULORHEXIS-SPECIFIC SCORING FUNCTIONS
// ============================================

/**
 * Configurable Capsulorhexis parameters
 */
export const CAPSULORHEXIS_CONFIG = {
  easy: {
    runOutTolerancePx: 45,      // ~1.8mm at typical scale
    radiusTolerancePercent: 20,
    completionOverlapPercent: 70
  },
  normal: {
    runOutTolerancePx: 30,      // ~1.5mm
    radiusTolerancePercent: 15,
    completionOverlapPercent: 80
  },
  hard: {
    runOutTolerancePx: 20,      // ~1.0mm
    radiusTolerancePercent: 10,
    completionOverlapPercent: 90
  }
};

/**
 * Check for precise run-out with deviation measurement
 * @param {Object} point - Current point {x, y}
 * @param {{x: number, y: number}} center - Circle center
 * @param {number} targetRadius - Target circle radius
 * @param {number} tolerancePx - Maximum allowed deviation in pixels
 * @returns {{isRunOut: boolean, deviation: number, deviationMm: number}}
 */
export function checkRunOutPrecise(point, center, targetRadius, tolerancePx) {
  const currentRadius = euclideanDistance(point, center);
  const deviation = Math.abs(currentRadius - targetRadius);
  const deviationMm = deviation / 25; // Approximate: 25px ≈ 1mm at standard scale
  
  return {
    isRunOut: deviation > tolerancePx,
    deviation,
    deviationMm: Math.round(deviationMm * 100) / 100,
    direction: currentRadius > targetRadius ? 'outside' : 'inside'
  };
}

/**
 * Check if path forms a closed loop
 * @param {Array} points - Array of path points
 * @param {number} overlapPercent - Required overlap percentage (0-100)
 * @returns {{isClosed: boolean, overlapRatio: number, startPoint: Object, endPoint: Object}}
 */
export function checkLoopClosure(points, overlapPercent = 80) {
  if (points.length < 10) {
    return { isClosed: false, overlapRatio: 0, startPoint: null, endPoint: null };
  }
  
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const distToStart = euclideanDistance(endPoint, startPoint);
  
  // Calculate path length
  let pathLength = 0;
  for (let i = 1; i < points.length; i++) {
    pathLength += euclideanDistance(points[i], points[i - 1]);
  }
  
  // Check if end is close enough to start (within threshold)
  const closureThreshold = pathLength * (1 - overlapPercent / 100);
  const isClosed = distToStart <= closureThreshold;
  
  // Calculate actual overlap ratio
  const overlapRatio = Math.max(0, Math.min(100, (1 - distToStart / Math.max(pathLength * 0.2, 1)) * 100));
  
  return {
    isClosed,
    overlapRatio: Math.round(overlapRatio),
    distToStart,
    startPoint,
    endPoint
  };
}

/**
 * Calculate average radius of drawn path
 * @param {Array} points - Path points
 * @param {{x: number, y: number}} center - Circle center
 * @returns {{avgRadius: number, minRadius: number, maxRadius: number}}
 */
export function calculatePathRadius(points, center) {
  if (points.length === 0) {
    return { avgRadius: 0, minRadius: 0, maxRadius: 0 };
  }
  
  const radii = points.map(p => euclideanDistance(p, center));
  const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
  const minRadius = Math.min(...radii);
  const maxRadius = Math.max(...radii);
  
  return { avgRadius, minRadius, maxRadius };
}

/**
 * Validate Capsulorhexis completion
 * @param {Array} points - Drawn path points
 * @param {{x: number, y: number}} center - Target center
 * @param {number} targetRadius - Target radius
 * @param {Object} config - Difficulty configuration
 * @returns {{success: boolean, reason: string, scores: Object}}
 */
export function validateCapsulorhexisCompletion(points, center, targetRadius, config) {
  // Check minimum points
  if (points.length < 20) {
    return {
      success: false,
      reason: 'Path too short. Continue drawing to complete the circle.',
      scores: null
    };
  }
  
  // Check loop closure
  const closure = checkLoopClosure(points, config.completionOverlapPercent);
  if (!closure.isClosed) {
    return {
      success: false,
      reason: `Loop not closed. Overlap: ${closure.overlapRatio}% (need ${config.completionOverlapPercent}%)`,
      scores: null
    };
  }
  
  // Check radius accuracy
  const { avgRadius } = calculatePathRadius(points, center);
  const radiusDeviation = Math.abs(avgRadius - targetRadius) / targetRadius * 100;
  
  if (radiusDeviation > config.radiusTolerancePercent) {
    return {
      success: false,
      reason: `Radius deviation: ${Math.round(radiusDeviation)}% (max ${config.radiusTolerancePercent}%)`,
      scores: null
    };
  }
  
  // Success!
  return {
    success: true,
    reason: 'Capsulorhexis complete!',
    scores: {
      closureOverlap: closure.overlapRatio,
      radiusAccuracy: Math.round(100 - radiusDeviation),
      avgRadius: Math.round(avgRadius)
    }
  };
}

/**
 * Find the exact point of run-out failure
 * @param {Array} points - Path points
 * @param {{x: number, y: number}} center - Circle center
 * @param {number} targetRadius - Target radius
 * @param {number} tolerancePx - Tolerance in pixels
 * @returns {{index: number, point: Object, deviation: number} | null}
 */
export function findRunOutPoint(points, center, targetRadius, tolerancePx) {
  for (let i = 0; i < points.length; i++) {
    const result = checkRunOutPrecise(points[i], center, targetRadius, tolerancePx);
    if (result.isRunOut) {
      return {
        index: i,
        point: points[i],
        deviation: result.deviation,
        deviationMm: result.deviationMm,
        direction: result.direction
      };
    }
  }
  return null;
}
