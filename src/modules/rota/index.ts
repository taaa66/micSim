/**
 * =============================================================================
 * ROTA MODULE - INDEX
 * =============================================================================
 * Main entry point for the Rota Management System
 * =============================================================================
 */

// Types
export * from './types';

// Services
export { RotaOptimizationEngine } from './optimizationEngine';
export type { ShiftRequirement } from './optimizationEngine';
export { validateSwap, createSwapListing, processSwapAcceptance } from './swapService';

// Store
export {
  currentRotaUser,
  rotaUsers,
  currentSchedule,
  userPreferences,
  swapListings,
  selectedMonth,
  selectedYear,
  isLoading,
  error,
  myAssignments,
  nextShift,
  myFairnessScore,
  availableSwaps,
  mySwapListings,
  initializeRota,
  generateSchedule,
  submitPreferences,
  listShiftForSwap,
  acceptSwap,
  cancelSwapListing,
  submitSatisfactionScore
} from './rotaStore';

// Components
export { default as RotaHub } from './components/RotaHub.svelte';
export { default as RotaCalendar } from './components/RotaCalendar.svelte';
export { default as PreferenceInput } from './components/PreferenceInput.svelte';
export { default as SwapMarketplace } from './components/SwapMarketplace.svelte';
