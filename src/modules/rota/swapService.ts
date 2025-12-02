/**
 * =============================================================================
 * SWAP SERVICE
 * =============================================================================
 * Handles shift swap marketplace and validation
 * =============================================================================
 */

import type {
  RotaUser,
  ShiftAssignment,
  SwapListing,
  SwapValidation,
  SwapValidationError,
  SwapValidationWarning,
  ShiftType,
  RotaSchedule
} from './types';

// =============================================================================
// SWAP VALIDATION
// =============================================================================

export function validateSwap(
  listing: SwapListing,
  acceptingUser: RotaUser,
  acceptingUserAssignment: ShiftAssignment | null,
  allAssignments: ShiftAssignment[],
  allUsers: RotaUser[]
): SwapValidation {
  const errors: SwapValidationError[] = [];
  const warnings: SwapValidationWarning[] = [];
  
  const listingUser = allUsers.find(u => u.id === listing.userId);
  if (!listingUser) {
    errors.push({ code: 'USER_NOT_FOUND', message: 'Listing user not found' });
    return { isValid: false, errors, warnings };
  }
  
  // 1. Check seniority/qualification
  const shiftConfig = getShiftConfig(listing.shiftType);
  if (!shiftConfig.allowedSeniority.includes(acceptingUser.seniority)) {
    errors.push({
      code: 'SENIORITY_MISMATCH',
      message: `Your seniority level (${acceptingUser.seniority}) is not eligible for ${shiftConfig.name}`
    });
  }
  
  // 2. Check certifications
  for (const cert of shiftConfig.requiredCertifications) {
    if (!acceptingUser.certifications.includes(cert)) {
      errors.push({
        code: 'MISSING_CERTIFICATION',
        message: `Missing required certification: ${cert}`,
        field: 'certifications'
      });
    }
  }
  
  // 3. Check limitations
  if (acceptingUser.limitations.includes(listing.shiftType)) {
    errors.push({
      code: 'USER_LIMITATION',
      message: `You have a limitation preventing ${shiftConfig.name} shifts`
    });
  }
  
  // 4. Check approved leave
  for (const leave of acceptingUser.approvedLeave) {
    if (listing.date >= leave.start && listing.date <= leave.end) {
      errors.push({
        code: 'ON_LEAVE',
        message: `You are on approved leave on ${listing.date.toDateString()}`
      });
    }
  }
  
  // 5. Check rest period constraints
  const acceptingUserAssignments = allAssignments.filter(
    a => a.primaryUserId === acceptingUser.id && a.id !== acceptingUserAssignment?.id
  );
  
  for (const assignment of acceptingUserAssignments) {
    const hoursDiff = Math.abs(listing.date.getTime() - assignment.date.getTime()) / (1000 * 60 * 60);
    const requiredRest = Math.max(acceptingUser.minRestHours, shiftConfig.minRestAfter);
    
    if (hoursDiff < requiredRest && hoursDiff > 0) {
      errors.push({
        code: 'REST_PERIOD_VIOLATION',
        message: `Swap would violate ${requiredRest}-hour rest period. You have a shift ${hoursDiff.toFixed(1)} hours away.`
      });
    }
  }
  
  // 6. Check max shifts per month
  const monthAssignments = acceptingUserAssignments.filter(a =>
    a.date.getMonth() === listing.date.getMonth() &&
    a.date.getFullYear() === listing.date.getFullYear()
  );
  
  if (monthAssignments.length >= acceptingUser.maxShiftsPerMonth) {
    errors.push({
      code: 'MAX_SHIFTS_EXCEEDED',
      message: `Accepting this swap would exceed your maximum shifts per month (${acceptingUser.maxShiftsPerMonth})`
    });
  }
  
  // 7. If it's a swap (not just taking), validate the reverse
  if (acceptingUserAssignment) {
    const reverseConfig = getShiftConfig(acceptingUserAssignment.shiftType);
    
    if (!reverseConfig.allowedSeniority.includes(listingUser.seniority)) {
      errors.push({
        code: 'REVERSE_SENIORITY_MISMATCH',
        message: `${listingUser.name}'s seniority is not eligible for your ${reverseConfig.name} shift`
      });
    }
    
    for (const cert of reverseConfig.requiredCertifications) {
      if (!listingUser.certifications.includes(cert)) {
        errors.push({
          code: 'REVERSE_MISSING_CERTIFICATION',
          message: `${listingUser.name} is missing certification: ${cert}`
        });
      }
    }
  }
  
  // Warnings (non-blocking)
  if (isWeekend(listing.date)) {
    warnings.push({
      code: 'WEEKEND_SHIFT',
      message: 'This is a weekend shift - consider the impact on your work-life balance'
    });
  }
  
  if (isHoliday(listing.date)) {
    warnings.push({
      code: 'HOLIDAY_SHIFT',
      message: 'This is a holiday shift'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// =============================================================================
// SWAP MARKETPLACE OPERATIONS
// =============================================================================

export function createSwapListing(
  assignment: ShiftAssignment,
  user: RotaUser,
  reason?: string,
  preferredDates?: Date[],
  willingToSwapFor?: ShiftType[]
): SwapListing {
  const expiresAt = new Date(assignment.date);
  expiresAt.setDate(expiresAt.getDate() - 1); // Expires day before shift
  
  return {
    id: `swap-${assignment.id}-${Date.now()}`,
    assignmentId: assignment.id,
    userId: user.id,
    userName: user.name,
    date: assignment.date,
    shiftType: assignment.shiftType,
    listedAt: new Date(),
    expiresAt,
    reason,
    preferredDates,
    willingToSwapFor,
    status: 'available',
    interestedUsers: []
  };
}

export function processSwapAcceptance(
  listing: SwapListing,
  acceptingUser: RotaUser,
  schedule: RotaSchedule,
  offeredAssignmentId?: string
): { success: boolean; updatedSchedule: RotaSchedule; message: string } {
  // Find the original assignment
  const assignmentIndex = schedule.assignments.findIndex(a => a.id === listing.assignmentId);
  if (assignmentIndex === -1) {
    return { success: false, updatedSchedule: schedule, message: 'Assignment not found' };
  }
  
  const updatedAssignments = [...schedule.assignments];
  const originalAssignment = updatedAssignments[assignmentIndex];
  
  // Update the assignment
  updatedAssignments[assignmentIndex] = {
    ...originalAssignment,
    primaryUserId: acceptingUser.id,
    originalUserId: originalAssignment.primaryUserId,
    status: 'swapped',
    swapHistory: [
      ...originalAssignment.swapHistory,
      {
        id: `swap-record-${Date.now()}`,
        timestamp: new Date(),
        fromUserId: listing.userId,
        toUserId: acceptingUser.id,
        status: 'approved',
        approvedBy: 'system'
      }
    ]
  };
  
  // If it's a mutual swap, update the offered assignment too
  if (offeredAssignmentId) {
    const offeredIndex = updatedAssignments.findIndex(a => a.id === offeredAssignmentId);
    if (offeredIndex !== -1) {
      const offeredAssignment = updatedAssignments[offeredIndex];
      updatedAssignments[offeredIndex] = {
        ...offeredAssignment,
        primaryUserId: listing.userId,
        originalUserId: acceptingUser.id,
        status: 'swapped',
        swapHistory: [
          ...offeredAssignment.swapHistory,
          {
            id: `swap-record-${Date.now()}-reverse`,
            timestamp: new Date(),
            fromUserId: acceptingUser.id,
            toUserId: listing.userId,
            status: 'approved',
            approvedBy: 'system'
          }
        ]
      };
    }
  }
  
  return {
    success: true,
    updatedSchedule: {
      ...schedule,
      assignments: updatedAssignments
    },
    message: 'Swap completed successfully'
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getShiftConfig(shiftType: ShiftType) {
  const configs: Record<ShiftType, any> = {
    general_oncall: {
      name: 'General On-Call', allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: [], minRestAfter: 10
    },
    senior_backup: {
      name: 'Senior Backup', allowedSeniority: ['PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: ['senior_qualified'], minRestAfter: 10
    },
    clinic_duty: {
      name: 'Clinic Duty', allowedSeniority: ['PGY1', 'PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: [], minRestAfter: 8
    },
    or_assist: {
      name: 'OR Assist', allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: ['or_trained'], minRestAfter: 10
    },
    emergency_cover: {
      name: 'Emergency Cover', allowedSeniority: ['PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: ['emergency_trained'], minRestAfter: 12
    },
    weekend_oncall: {
      name: 'Weekend On-Call', allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: [], minRestAfter: 12
    },
    night_shift: {
      name: 'Night Shift', allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: [], minRestAfter: 12
    },
    holiday_cover: {
      name: 'Holiday Cover', allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
      requiredCertifications: [], minRestAfter: 12
    }
  };
  return configs[shiftType];
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date: Date): boolean {
  const holidays = [
    '2025-01-01', '2025-04-13', '2025-04-19', '2025-05-01',
    '2025-06-02', '2025-09-23', '2025-10-02', '2025-10-07', '2025-12-25'
  ];
  const dateStr = date.toISOString().split('T')[0];
  return holidays.includes(dateStr);
}

export default {
  validateSwap,
  createSwapListing,
  processSwapAcceptance
};
