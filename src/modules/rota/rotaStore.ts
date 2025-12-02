/**
 * =============================================================================
 * ROTA STORE
 * =============================================================================
 * Svelte store for rota state management
 * =============================================================================
 */

import { writable, derived, get } from 'svelte/store';
import type {
  RotaUser,
  RotaSchedule,
  ShiftPreference,
  SwapListing,
  ShiftAssignment,
  ShiftType
} from './types';
import { RotaOptimizationEngine, type ShiftRequirement } from './optimizationEngine';
import { validateSwap, createSwapListing, processSwapAcceptance } from './swapService';

// =============================================================================
// STORES
// =============================================================================

// Current user
export const currentRotaUser = writable<RotaUser | null>(null);

// All users in department
export const rotaUsers = writable<RotaUser[]>([]);

// Current month's schedule
export const currentSchedule = writable<RotaSchedule | null>(null);

// User's preferences for current month
export const userPreferences = writable<ShiftPreference | null>(null);

// Swap marketplace listings
export const swapListings = writable<SwapListing[]>([]);

// Selected month/year for viewing
export const selectedMonth = writable<number>(new Date().getMonth() + 1);
export const selectedYear = writable<number>(new Date().getFullYear());

// UI state
export const isLoading = writable<boolean>(false);
export const error = writable<string | null>(null);

// =============================================================================
// DERIVED STORES
// =============================================================================

// Current user's assignments
export const myAssignments = derived(
  [currentSchedule, currentRotaUser],
  ([$schedule, $user]) => {
    if (!$schedule || !$user) return [];
    return $schedule.assignments.filter(a => 
      a.primaryUserId === $user.id || a.backupUserId === $user.id
    );
  }
);

// Next upcoming shift
export const nextShift = derived(myAssignments, ($assignments) => {
  const now = new Date();
  const upcoming = $assignments
    .filter(a => new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] || null;
});

// User's fairness score
export const myFairnessScore = derived(
  [currentSchedule, currentRotaUser],
  ([$schedule, $user]) => {
    if (!$schedule || !$user) return null;
    const metric = $schedule.fairnessMetrics.userMetrics.find(m => m.userId === $user.id);
    return metric?.fairnessScore ?? null;
  }
);

// Available swaps (not from current user)
export const availableSwaps = derived(
  [swapListings, currentRotaUser],
  ([$listings, $user]) => {
    if (!$user) return [];
    return $listings.filter(l => 
      l.userId !== $user.id && 
      l.status === 'available' &&
      new Date(l.expiresAt) > new Date()
    );
  }
);

// My swap listings
export const mySwapListings = derived(
  [swapListings, currentRotaUser],
  ([$listings, $user]) => {
    if (!$user) return [];
    return $listings.filter(l => l.userId === $user.id);
  }
);

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Initialize rota module with mock data
 */
export async function initializeRota(userId: string): Promise<void> {
  isLoading.set(true);
  error.set(null);
  
  try {
    // Load mock users
    const mockUsers = generateMockUsers();
    rotaUsers.set(mockUsers);
    
    // Set current user
    const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
    currentRotaUser.set(user);
    
    // Generate schedule for current month
    const month = get(selectedMonth);
    const year = get(selectedYear);
    await generateSchedule(month, year);
    
    // Load mock swap listings
    swapListings.set(generateMockSwapListings(get(currentSchedule)!, mockUsers));
    
  } catch (e) {
    error.set(e instanceof Error ? e.message : 'Failed to initialize rota');
  } finally {
    isLoading.set(false);
  }
}

/**
 * Generate schedule for a month
 */
export async function generateSchedule(month: number, year: number): Promise<void> {
  isLoading.set(true);
  
  try {
    const users = get(rotaUsers);
    const preferences = users.map(u => generateMockPreferences(u.id, month, year));
    
    const requirements: ShiftRequirement[] = [
      { shiftType: 'general_oncall', count: 1 },
      { shiftType: 'clinic_duty', count: 1, daysOfWeek: [1, 2, 3, 4, 5] },
      { shiftType: 'or_assist', count: 1, daysOfWeek: [1, 2, 3, 4] },
      { shiftType: 'weekend_oncall', count: 1, onlyWeekends: true },
      { shiftType: 'night_shift', count: 1 },
    ];
    
    const engine = new RotaOptimizationEngine({
      equityWeight: 0.6,
      preferenceWeight: 0.4
    });
    
    const schedule = engine.generateSchedule(
      users,
      preferences,
      requirements,
      month,
      year,
      'Ophthalmology'
    );
    
    currentSchedule.set(schedule);
    
  } catch (e) {
    error.set(e instanceof Error ? e.message : 'Failed to generate schedule');
  } finally {
    isLoading.set(false);
  }
}

/**
 * Submit user preferences
 */
export async function submitPreferences(preferences: ShiftPreference): Promise<void> {
  isLoading.set(true);
  
  try {
    userPreferences.set(preferences);
    // In production, save to Firebase
    console.log('Preferences submitted:', preferences);
  } catch (e) {
    error.set(e instanceof Error ? e.message : 'Failed to submit preferences');
  } finally {
    isLoading.set(false);
  }
}

/**
 * List a shift for swap
 */
export async function listShiftForSwap(
  assignmentId: string,
  reason?: string,
  preferredDates?: Date[],
  willingToSwapFor?: ShiftType[]
): Promise<void> {
  const schedule = get(currentSchedule);
  const user = get(currentRotaUser);
  
  if (!schedule || !user) {
    error.set('No schedule or user found');
    return;
  }
  
  const assignment = schedule.assignments.find(a => a.id === assignmentId);
  if (!assignment) {
    error.set('Assignment not found');
    return;
  }
  
  const listing = createSwapListing(assignment, user, reason, preferredDates, willingToSwapFor);
  
  swapListings.update(listings => [...listings, listing]);
}

/**
 * Accept a swap listing
 */
export async function acceptSwap(
  listingId: string,
  offeredAssignmentId?: string
): Promise<{ success: boolean; message: string }> {
  const listings = get(swapListings);
  const schedule = get(currentSchedule);
  const user = get(currentRotaUser);
  const users = get(rotaUsers);
  
  if (!schedule || !user) {
    return { success: false, message: 'No schedule or user found' };
  }
  
  const listing = listings.find(l => l.id === listingId);
  if (!listing) {
    return { success: false, message: 'Listing not found' };
  }
  
  // Get offered assignment if provided
  const offeredAssignment = offeredAssignmentId 
    ? schedule.assignments.find(a => a.id === offeredAssignmentId)
    : null;
  
  // Validate swap
  const validation = validateSwap(
    listing,
    user,
    offeredAssignment || null,
    schedule.assignments,
    users
  );
  
  if (!validation.isValid) {
    return { 
      success: false, 
      message: validation.errors.map(e => e.message).join('; ')
    };
  }
  
  // Process swap
  const result = processSwapAcceptance(listing, user, schedule, offeredAssignmentId);
  
  if (result.success) {
    currentSchedule.set(result.updatedSchedule);
    
    // Update listing status
    swapListings.update(listings => 
      listings.map(l => l.id === listingId ? { ...l, status: 'completed' as const } : l)
    );
  }
  
  return { success: result.success, message: result.message };
}

/**
 * Cancel a swap listing
 */
export async function cancelSwapListing(listingId: string): Promise<void> {
  swapListings.update(listings =>
    listings.map(l => l.id === listingId ? { ...l, status: 'cancelled' as const } : l)
  );
}

/**
 * Submit satisfaction score
 */
export async function submitSatisfactionScore(score: number, feedback?: string): Promise<void> {
  const schedule = get(currentSchedule);
  const user = get(currentRotaUser);
  
  if (!schedule || !user) return;
  
  currentSchedule.update(s => {
    if (!s) return s;
    return {
      ...s,
      satisfactionScores: [
        ...s.satisfactionScores,
        { userId: user.id, score, feedback, submittedAt: new Date() }
      ]
    };
  });
}

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

function generateMockUsers(): RotaUser[] {
  return [
    {
      id: 'user-1',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@hospital.org',
      role: 'trainee',
      seniority: 'PGY3',
      department: 'Ophthalmology',
      mandatoryShiftsPerMonth: 6,
      maxShiftsPerMonth: 10,
      minRestHours: 10,
      certifications: ['or_trained'],
      limitations: [],
      approvedLeave: [],
      historicalShifts: [],
      fairnessScore: 85,
      weekendShiftCount6Months: 4,
      holidayShiftCount6Months: 1,
      totalShiftCount6Months: 32
    },
    {
      id: 'user-2',
      name: 'Dr. Michael Torres',
      email: 'michael.torres@hospital.org',
      role: 'trainee',
      seniority: 'PGY4',
      department: 'Ophthalmology',
      mandatoryShiftsPerMonth: 5,
      maxShiftsPerMonth: 8,
      minRestHours: 10,
      certifications: ['or_trained', 'senior_qualified'],
      limitations: [],
      approvedLeave: [],
      historicalShifts: [],
      fairnessScore: 78,
      weekendShiftCount6Months: 5,
      holidayShiftCount6Months: 2,
      totalShiftCount6Months: 35
    },
    {
      id: 'user-3',
      name: 'Dr. Emily Watson',
      email: 'emily.watson@hospital.org',
      role: 'trainee',
      seniority: 'PGY2',
      department: 'Ophthalmology',
      mandatoryShiftsPerMonth: 7,
      maxShiftsPerMonth: 12,
      minRestHours: 10,
      certifications: [],
      limitations: [],
      approvedLeave: [],
      historicalShifts: [],
      fairnessScore: 92,
      weekendShiftCount6Months: 3,
      holidayShiftCount6Months: 0,
      totalShiftCount6Months: 28
    },
    {
      id: 'user-4',
      name: 'Dr. James Park',
      email: 'james.park@hospital.org',
      role: 'trainee',
      seniority: 'PGY3',
      department: 'Ophthalmology',
      mandatoryShiftsPerMonth: 6,
      maxShiftsPerMonth: 10,
      minRestHours: 10,
      certifications: ['or_trained', 'emergency_trained'],
      limitations: [],
      approvedLeave: [],
      historicalShifts: [],
      fairnessScore: 81,
      weekendShiftCount6Months: 4,
      holidayShiftCount6Months: 1,
      totalShiftCount6Months: 30
    },
    {
      id: 'user-5',
      name: 'Dr. Lisa Anderson',
      email: 'lisa.anderson@hospital.org',
      role: 'supervisor',
      seniority: 'Attending',
      department: 'Ophthalmology',
      mandatoryShiftsPerMonth: 4,
      maxShiftsPerMonth: 6,
      minRestHours: 12,
      certifications: ['or_trained', 'senior_qualified', 'emergency_trained'],
      limitations: [],
      approvedLeave: [],
      historicalShifts: [],
      fairnessScore: 88,
      weekendShiftCount6Months: 2,
      holidayShiftCount6Months: 1,
      totalShiftCount6Months: 20
    },
    {
      id: 'user-6',
      name: 'Dr. Robert Kim',
      email: 'robert.kim@hospital.org',
      role: 'supervisor',
      seniority: 'Consultant',
      department: 'Ophthalmology',
      mandatoryShiftsPerMonth: 3,
      maxShiftsPerMonth: 5,
      minRestHours: 12,
      certifications: ['or_trained', 'senior_qualified', 'emergency_trained'],
      limitations: [],
      approvedLeave: [],
      historicalShifts: [],
      fairnessScore: 90,
      weekendShiftCount6Months: 2,
      holidayShiftCount6Months: 0,
      totalShiftCount6Months: 18
    }
  ];
}

function generateMockPreferences(userId: string, month: number, year: number): ShiftPreference {
  return {
    id: `pref-${userId}-${month}-${year}`,
    userId,
    month,
    year,
    datePreferences: [],
    dayPreferences: [
      { dayOfWeek: 5, preference: 'must_avoid', reason: 'Family time' },
      { dayOfWeek: 6, preference: 'highly_preferred' }
    ],
    shiftTypePreferences: [
      { shiftType: 'clinic_duty', preference: 'highly_preferred' },
      { shiftType: 'night_shift', preference: 'indifferent' }
    ],
    notes: '',
    submittedAt: new Date(),
    lastModified: new Date()
  };
}

function generateMockSwapListings(schedule: RotaSchedule, users: RotaUser[]): SwapListing[] {
  if (!schedule.assignments.length) return [];
  
  const listings: SwapListing[] = [];
  
  // Create a few sample listings
  const sampleAssignments = schedule.assignments.slice(5, 8);
  
  for (const assignment of sampleAssignments) {
    const user = users.find(u => u.id === assignment.primaryUserId);
    if (user) {
      listings.push(createSwapListing(
        assignment,
        user,
        'Personal commitment',
        undefined,
        undefined
      ));
    }
  }
  
  return listings;
}

export default {
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
};
