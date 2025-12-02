/**
 * =============================================================================
 * STORES INDEX
 * =============================================================================
 * Central export for all Svelte stores
 * =============================================================================
 */

// User Store
export {
  user,
  isUserLoading,
  userError,
  isAuthenticated,
  userRole,
  displayName,
  isAdmin,
  isSupervisor,
  userStats,
  userLevel,
  levelProgress,
  setUser,
  clearUser,
  setUserLoading,
  setUserError,
  updateUserStats,
  incrementPracticeCount,
  addAchievement,
  getCurrentUser,
  getUserId,
  hasRole,
  hasMinRole
} from './user';

export type { UserRole, UserStats, UserProfile } from './user';

// Simulation Store
export {
  currentSimulation,
  activeSession,
  simulationResults,
  isSimulationLoading,
  isSimulationActive,
  simulationProgress,
  elapsedTime,
  performanceMetrics,
  resultsBySimulation,
  recentResults,
  startSimulation,
  pauseSimulation,
  resumeSimulation,
  updateSessionMetrics,
  advancePhase,
  completeSimulation,
  cancelSimulation,
  loadResults,
  clearResults,
  getResultsForSimulation,
  getBestResult,
  getAverageScore
} from './simulation';

export type { SimulationConfig, SimulationResult, SimulationSession } from './simulation';

// Navigation Store
export {
  navigationState,
  currentView,
  previousView,
  navigationParams,
  canGoBack,
  breadcrumbs,
  navigateTo,
  goBack,
  goToDashboard,
  setParams,
  clearParams,
  navigate
} from './navigation';

export type { ViewName, NavigationState, BreadcrumbItem } from './navigation';

// Toast Store
export {
  toasts,
  hasToasts,
  toastCount
} from './toast';

export type { Toast, ToastType, ToastOptions } from './toast';
