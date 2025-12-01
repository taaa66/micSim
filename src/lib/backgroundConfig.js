/**
 * Background Image Configuration
 * 
 * This file defines the background images for each simulator module.
 * Replace the placeholder paths with your hyper-realistic surgical images.
 * 
 * Recommended image specifications:
 * - Resolution: 1920x1200 or higher (16:10 aspect ratio)
 * - Format: JPEG for photos, PNG for graphics with transparency
 * - File size: < 500KB for optimal loading
 * - Content: Microscopic surgical views with appropriate lighting
 */

export const backgroundImages = {
  // Capsulorhexis: Close-up view of lens capsule through microscope
  // Ideal: Shows anterior capsule membrane with subtle texture
  capsulorhexis: '/assets/images/capsulorhexis-background.jpg',

  // Corneal Tunnel: Cross-sectional or surface view of cornea
  // Ideal: Shows corneal layers with depth perception
  cornealTunnel: '/assets/images/corneal-tunnel-background.jpg',

  // Corneal Suture: Clean corneal surface with visible tissue texture
  // Ideal: Shows suture entry/exit zone context
  cornealSuture: '/assets/images/corneal-suture-background.jpg',

  // Gas/Liquid Injection: Anterior chamber view
  // Ideal: Shows injection site with fluid dynamics potential
  gasInjection: '/assets/images/gas-injection-background.jpg',

  // Reflex/Floaters: Red reflex view through dilated pupil
  // Ideal: Shows retinal background with possible floater shadows
  redReflex: '/assets/images/red-reflex-background.jpg'
};

/**
 * Fallback gradient backgrounds when images are not available
 * These provide a clinical aesthetic while waiting for real images
 */
export const fallbackGradients = {
  capsulorhexis: 'radial-gradient(ellipse at center, #2a4a55 0%, #1a2a30 60%, #0d1518 100%)',
  cornealTunnel: 'linear-gradient(135deg, #1e3a40 0%, #2a4a55 50%, #1a2a30 100%)',
  cornealSuture: 'radial-gradient(ellipse at center, #2a4a55 0%, #1e3540 70%, #0d1518 100%)',
  gasInjection: 'radial-gradient(ellipse at 60% 50%, #1a3545 0%, #0d1f28 60%, #050a0d 100%)',
  redReflex: 'radial-gradient(ellipse at center, #4a2020 0%, #2a1515 50%, #150a0a 100%)'
};

/**
 * Get background URL with fallback
 * @param {string} moduleId - The simulator module identifier
 * @returns {string} The image URL or fallback gradient
 */
export function getBackgroundUrl(moduleId) {
  return backgroundImages[moduleId] || null;
}

/**
 * Get fallback gradient for a module
 * @param {string} moduleId - The simulator module identifier
 * @returns {string} CSS gradient string
 */
export function getFallbackGradient(moduleId) {
  return fallbackGradients[moduleId] || fallbackGradients.capsulorhexis;
}
