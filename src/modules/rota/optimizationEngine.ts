/**
 * =============================================================================
 * ROTA OPTIMIZATION ENGINE
 * =============================================================================
 * Constraint-based scheduling algorithm with fairness optimization
 * Uses weighted scoring to balance equity metrics with user preferences
 * =============================================================================
 */

import type {
  RotaUser,
  ShiftType,
  ShiftTypeConfig,
  ShiftPreference,
  RotaSchedule,
  ShiftAssignment,
  GenerationLogEntry,
  FairnessMetrics,
  PreferenceMetrics,
  UserFairnessMetric,
  UserPreferenceScore,
  PreferenceLevel
} from './types';

// =============================================================================
// CONFIGURATION
// =============================================================================

interface OptimizationConfig {
  equityWeight: number;      // 0-1, how much to prioritize fairness
  preferenceWeight: number;  // 0-1, how much to prioritize preferences
  maxIterations: number;     // Maximum optimization iterations
  minRestHours: number;      // Default minimum rest between shifts
  allowOvertime: boolean;    // Allow exceeding max shifts
}

const DEFAULT_CONFIG: OptimizationConfig = {
  equityWeight: 0.6,
  preferenceWeight: 0.4,
  maxIterations: 1000,
  minRestHours: 10,
  allowOvertime: false
};

// =============================================================================
// OPTIMIZATION ENGINE CLASS
// =============================================================================

export class RotaOptimizationEngine {
  private config: OptimizationConfig;
  private log: GenerationLogEntry[] = [];
  
  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Generate optimal schedule for a month
   */
  generateSchedule(
    users: RotaUser[],
    preferences: ShiftPreference[],
    shiftRequirements: ShiftRequirement[],
    month: number,
    year: number,
    department: string
  ): RotaSchedule {
    this.log = [];
    this.logInfo(`Starting schedule generation for ${month}/${year}`);
    this.logInfo(`Users: ${users.length}, Requirements: ${shiftRequirements.length}`);
    
    // Step 1: Initialize empty schedule
    const assignments: ShiftAssignment[] = [];
    
    // Step 2: Get all dates in month
    const dates = this.getDatesInMonth(month, year);
    this.logInfo(`Processing ${dates.length} days`);
    
    // Step 3: Build user availability map
    const availability = this.buildAvailabilityMap(users, dates, preferences);
    
    // Step 4: Calculate initial fairness scores
    const fairnessScores = this.calculateFairnessScores(users);
    
    // Step 5: Process each shift requirement
    for (const requirement of shiftRequirements) {
      for (const date of dates) {
        if (this.shouldScheduleShift(requirement, date)) {
          const assignment = this.assignShift(
            requirement.shiftType,
            date,
            users,
            preferences,
            availability,
            fairnessScores,
            assignments
          );
          
          if (assignment) {
            assignments.push(assignment);
            this.updateAvailability(availability, assignment);
            this.updateFairnessScores(fairnessScores, assignment);
          }
        }
      }
    }
    
    // Step 6: Optimize assignments (swap to improve scores)
    const optimizedAssignments = this.optimizeAssignments(
      assignments,
      users,
      preferences,
      availability
    );
    
    // Step 7: Calculate final metrics
    const fairnessMetrics = this.calculateFinalFairnessMetrics(optimizedAssignments, users);
    const preferenceMetrics = this.calculatePreferenceMetrics(optimizedAssignments, preferences, users);
    
    this.logInfo(`Schedule generated: ${optimizedAssignments.length} assignments`);
    this.logInfo(`Fairness score: ${fairnessMetrics.overallScore.toFixed(1)}%`);
    this.logInfo(`Preference fulfillment: ${preferenceMetrics.overallFulfillment.toFixed(1)}%`);
    
    return {
      id: `schedule-${year}-${month}-${Date.now()}`,
      month,
      year,
      department,
      status: 'draft',
      assignments: optimizedAssignments,
      generatedAt: new Date(),
      generatedBy: 'system',
      generationLog: this.log,
      fairnessMetrics,
      preferenceMetrics,
      satisfactionScores: []
    };
  }
  
  /**
   * Assign a single shift using weighted scoring
   */
  private assignShift(
    shiftType: ShiftType,
    date: Date,
    users: RotaUser[],
    preferences: ShiftPreference[],
    availability: Map<string, Set<string>>,
    fairnessScores: Map<string, number>,
    existingAssignments: ShiftAssignment[]
  ): ShiftAssignment | null {
    const shiftConfig = this.getShiftConfig(shiftType);
    
    // Get eligible users
    const eligibleUsers = users.filter(user => 
      this.isUserEligible(user, shiftType, date, availability, existingAssignments)
    );
    
    if (eligibleUsers.length === 0) {
      this.logWarning(`No eligible users for ${shiftType} on ${date.toDateString()}`);
      return null;
    }
    
    // Score each user
    const scoredUsers = eligibleUsers.map(user => {
      const preferenceScore = this.getUserPreferenceScore(user, date, shiftType, preferences);
      const equityScore = this.getUserEquityScore(user, fairnessScores);
      
      const totalScore = 
        (preferenceScore * this.config.preferenceWeight) +
        (equityScore * this.config.equityWeight);
      
      return { user, preferenceScore, equityScore, totalScore };
    });
    
    // Sort by total score (highest first)
    scoredUsers.sort((a, b) => b.totalScore - a.totalScore);
    
    const selected = scoredUsers[0];
    
    this.logDecision(
      `Assigned ${shiftType} on ${date.toDateString()} to ${selected.user.name}`,
      {
        preferenceScore: selected.preferenceScore,
        equityScore: selected.equityScore,
        totalScore: selected.totalScore,
        alternatives: scoredUsers.slice(1, 4).map(s => s.user.name)
      }
    );
    
    // Create assignment
    const assignment: ShiftAssignment = {
      id: `assign-${date.getTime()}-${shiftType}-${selected.user.id}`,
      date,
      shiftType,
      primaryUserId: selected.user.id,
      status: 'assigned',
      swapHistory: [],
      assignmentReason: this.generateAssignmentReason(selected),
      preferenceScore: selected.preferenceScore,
      equityScore: selected.equityScore
    };
    
    // Assign backup if required
    if (shiftConfig.requiresBackup) {
      const backupUsers = scoredUsers.filter(s => s.user.id !== selected.user.id);
      if (backupUsers.length > 0) {
        assignment.backupUserId = backupUsers[0].user.id;
      }
    }
    
    return assignment;
  }
  
  /**
   * Check if user is eligible for a shift
   */
  private isUserEligible(
    user: RotaUser,
    shiftType: ShiftType,
    date: Date,
    availability: Map<string, Set<string>>,
    existingAssignments: ShiftAssignment[]
  ): boolean {
    const shiftConfig = this.getShiftConfig(shiftType);
    const dateKey = date.toISOString().split('T')[0];
    
    // Check seniority
    if (!shiftConfig.allowedSeniority.includes(user.seniority)) {
      return false;
    }
    
    // Check certifications
    for (const cert of shiftConfig.requiredCertifications) {
      if (!user.certifications.includes(cert)) {
        return false;
      }
    }
    
    // Check limitations
    for (const limitation of user.limitations) {
      if (limitation === shiftType) {
        return false;
      }
    }
    
    // Check approved leave
    for (const leave of user.approvedLeave) {
      if (date >= leave.start && date <= leave.end) {
        return false;
      }
    }
    
    // Check availability (not already assigned that day)
    const userAvailability = availability.get(user.id);
    if (userAvailability && !userAvailability.has(dateKey)) {
      return false;
    }
    
    // Check rest period constraints
    const recentAssignments = existingAssignments.filter(a => 
      a.primaryUserId === user.id || a.backupUserId === user.id
    );
    
    for (const assignment of recentAssignments) {
      const hoursDiff = Math.abs(date.getTime() - assignment.date.getTime()) / (1000 * 60 * 60);
      const requiredRest = Math.max(user.minRestHours, shiftConfig.minRestAfter);
      
      if (hoursDiff < requiredRest) {
        return false;
      }
    }
    
    // Check max shifts per month
    if (!this.config.allowOvertime) {
      const monthAssignments = existingAssignments.filter(a =>
        a.primaryUserId === user.id &&
        a.date.getMonth() === date.getMonth() &&
        a.date.getFullYear() === date.getFullYear()
      );
      
      if (monthAssignments.length >= user.maxShiftsPerMonth) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Calculate user's preference score for a specific shift
   */
  private getUserPreferenceScore(
    user: RotaUser,
    date: Date,
    shiftType: ShiftType,
    preferences: ShiftPreference[]
  ): number {
    const userPref = preferences.find(p => p.userId === user.id);
    if (!userPref) return 0;
    
    let score = 0;
    const dateStr = date.toISOString().split('T')[0];
    
    // Check date-specific preferences
    const datePref = userPref.datePreferences.find(
      dp => dp.date.toISOString().split('T')[0] === dateStr
    );
    if (datePref) {
      score += this.getPreferenceWeight(datePref.preference) * 2; // Date prefs weighted higher
    }
    
    // Check day-of-week preferences
    const dayPref = userPref.dayPreferences.find(
      dp => dp.dayOfWeek === date.getDay()
    );
    if (dayPref) {
      score += this.getPreferenceWeight(dayPref.preference);
    }
    
    // Check shift type preferences
    const typePref = userPref.shiftTypePreferences.find(
      tp => tp.shiftType === shiftType
    );
    if (typePref) {
      score += this.getPreferenceWeight(typePref.preference);
    }
    
    // Normalize to 0-100
    return Math.max(0, Math.min(100, 50 + score));
  }
  
  /**
   * Calculate user's equity score (higher = should get more shifts)
   */
  private getUserEquityScore(
    user: RotaUser,
    fairnessScores: Map<string, number>
  ): number {
    const score = fairnessScores.get(user.id) || 50;
    return score;
  }
  
  /**
   * Calculate initial fairness scores based on historical data
   */
  private calculateFairnessScores(users: RotaUser[]): Map<string, number> {
    const scores = new Map<string, number>();
    
    // Calculate average shift load
    const avgShifts = users.reduce((sum, u) => sum + u.totalShiftCount6Months, 0) / users.length;
    const avgWeekends = users.reduce((sum, u) => sum + u.weekendShiftCount6Months, 0) / users.length;
    const avgHolidays = users.reduce((sum, u) => sum + u.holidayShiftCount6Months, 0) / users.length;
    
    for (const user of users) {
      // Users with fewer historical shifts get higher scores (should get more)
      const shiftDeviation = (avgShifts - user.totalShiftCount6Months) / (avgShifts || 1);
      const weekendDeviation = (avgWeekends - user.weekendShiftCount6Months) / (avgWeekends || 1);
      const holidayDeviation = (avgHolidays - user.holidayShiftCount6Months) / (avgHolidays || 1);
      
      // Weighted combination
      const score = 50 + (shiftDeviation * 30) + (weekendDeviation * 15) + (holidayDeviation * 15);
      
      scores.set(user.id, Math.max(0, Math.min(100, score)));
    }
    
    return scores;
  }
  
  /**
   * Update fairness scores after an assignment
   */
  private updateFairnessScores(
    scores: Map<string, number>,
    assignment: ShiftAssignment
  ): void {
    const currentScore = scores.get(assignment.primaryUserId) || 50;
    const shiftConfig = this.getShiftConfig(assignment.shiftType);
    
    // Reduce score based on shift weight (they got a shift, so less priority next time)
    const reduction = shiftConfig.weight * 5;
    scores.set(assignment.primaryUserId, Math.max(0, currentScore - reduction));
  }
  
  /**
   * Build availability map for all users
   */
  private buildAvailabilityMap(
    users: RotaUser[],
    dates: Date[],
    preferences: ShiftPreference[]
  ): Map<string, Set<string>> {
    const availability = new Map<string, Set<string>>();
    
    for (const user of users) {
      const availableDates = new Set<string>();
      
      for (const date of dates) {
        const dateKey = date.toISOString().split('T')[0];
        
        // Check if not on leave
        const onLeave = user.approvedLeave.some(
          leave => date >= leave.start && date <= leave.end
        );
        
        if (!onLeave) {
          availableDates.add(dateKey);
        }
      }
      
      availability.set(user.id, availableDates);
    }
    
    return availability;
  }
  
  /**
   * Update availability after assignment
   */
  private updateAvailability(
    availability: Map<string, Set<string>>,
    assignment: ShiftAssignment
  ): void {
    const dateKey = assignment.date.toISOString().split('T')[0];
    const userAvail = availability.get(assignment.primaryUserId);
    
    if (userAvail) {
      userAvail.delete(dateKey);
    }
  }
  
  /**
   * Optimize assignments through swapping
   */
  private optimizeAssignments(
    assignments: ShiftAssignment[],
    users: RotaUser[],
    preferences: ShiftPreference[],
    availability: Map<string, Set<string>>
  ): ShiftAssignment[] {
    let improved = true;
    let iterations = 0;
    let currentAssignments = [...assignments];
    
    while (improved && iterations < this.config.maxIterations) {
      improved = false;
      iterations++;
      
      // Try swapping pairs of assignments
      for (let i = 0; i < currentAssignments.length; i++) {
        for (let j = i + 1; j < currentAssignments.length; j++) {
          const a1 = currentAssignments[i];
          const a2 = currentAssignments[j];
          
          // Skip if same user
          if (a1.primaryUserId === a2.primaryUserId) continue;
          
          // Calculate current total score
          const currentScore = a1.preferenceScore + a1.equityScore + 
                              a2.preferenceScore + a2.equityScore;
          
          // Calculate swapped scores
          const user1 = users.find(u => u.id === a1.primaryUserId)!;
          const user2 = users.find(u => u.id === a2.primaryUserId)!;
          
          const swappedScore1 = this.getUserPreferenceScore(user1, a2.date, a2.shiftType, preferences);
          const swappedScore2 = this.getUserPreferenceScore(user2, a1.date, a1.shiftType, preferences);
          const swappedTotal = swappedScore1 + swappedScore2 + a1.equityScore + a2.equityScore;
          
          // Swap if improvement
          if (swappedTotal > currentScore + 10) { // Threshold to avoid tiny swaps
            // Validate swap
            if (this.validateSwap(a1, a2, users, currentAssignments)) {
              // Perform swap
              const temp = a1.primaryUserId;
              currentAssignments[i] = { ...a1, primaryUserId: a2.primaryUserId, preferenceScore: swappedScore2 };
              currentAssignments[j] = { ...a2, primaryUserId: temp, preferenceScore: swappedScore1 };
              
              improved = true;
              this.logDecision(`Optimization swap: ${user1.name} <-> ${user2.name}`, {
                improvement: swappedTotal - currentScore
              });
            }
          }
        }
      }
    }
    
    this.logInfo(`Optimization completed after ${iterations} iterations`);
    return currentAssignments;
  }
  
  /**
   * Validate a proposed swap
   */
  private validateSwap(
    a1: ShiftAssignment,
    a2: ShiftAssignment,
    users: RotaUser[],
    allAssignments: ShiftAssignment[]
  ): boolean {
    const user1 = users.find(u => u.id === a1.primaryUserId)!;
    const user2 = users.find(u => u.id === a2.primaryUserId)!;
    
    // Check if user1 can do a2's shift
    const config2 = this.getShiftConfig(a2.shiftType);
    if (!config2.allowedSeniority.includes(user1.seniority)) return false;
    for (const cert of config2.requiredCertifications) {
      if (!user1.certifications.includes(cert)) return false;
    }
    
    // Check if user2 can do a1's shift
    const config1 = this.getShiftConfig(a1.shiftType);
    if (!config1.allowedSeniority.includes(user2.seniority)) return false;
    for (const cert of config1.requiredCertifications) {
      if (!user2.certifications.includes(cert)) return false;
    }
    
    // Check rest periods would still be valid
    // (simplified - full implementation would check all adjacent shifts)
    
    return true;
  }
  
  /**
   * Calculate final fairness metrics
   */
  private calculateFinalFairnessMetrics(
    assignments: ShiftAssignment[],
    users: RotaUser[]
  ): FairnessMetrics {
    const userMetrics: UserFairnessMetric[] = [];
    
    for (const user of users) {
      const userAssignments = assignments.filter(a => a.primaryUserId === user.id);
      const weekendAssignments = userAssignments.filter(a => this.isWeekend(a.date));
      const holidayAssignments = userAssignments.filter(a => this.isHoliday(a.date));
      const nightAssignments = userAssignments.filter(a => a.shiftType === 'night_shift');
      
      userMetrics.push({
        userId: user.id,
        userName: user.name,
        totalShifts: userAssignments.length,
        weekendShifts: weekendAssignments.length,
        holidayShifts: holidayAssignments.length,
        nightShifts: nightAssignments.length,
        fairnessScore: user.fairnessScore,
        deviationFromAverage: 0, // Calculated below
        comparedTo6MonthAverage: 0
      });
    }
    
    // Calculate averages and deviations
    const avgTotal = userMetrics.reduce((s, m) => s + m.totalShifts, 0) / userMetrics.length;
    const avgWeekend = userMetrics.reduce((s, m) => s + m.weekendShifts, 0) / userMetrics.length;
    const avgHoliday = userMetrics.reduce((s, m) => s + m.holidayShifts, 0) / userMetrics.length;
    
    for (const metric of userMetrics) {
      metric.deviationFromAverage = ((metric.totalShifts - avgTotal) / (avgTotal || 1)) * 100;
    }
    
    // Calculate variance
    const shiftVariance = this.calculateVariance(userMetrics.map(m => m.totalShifts));
    const weekendVariance = this.calculateVariance(userMetrics.map(m => m.weekendShifts));
    const holidayVariance = this.calculateVariance(userMetrics.map(m => m.holidayShifts));
    const nightVariance = this.calculateVariance(userMetrics.map(m => m.nightShifts));
    
    // Overall score (lower variance = higher score)
    const maxVariance = 10;
    const overallScore = Math.max(0, 100 - (
      (shiftVariance / maxVariance * 40) +
      (weekendVariance / maxVariance * 30) +
      (holidayVariance / maxVariance * 20) +
      (nightVariance / maxVariance * 10)
    ));
    
    return {
      overallScore,
      userMetrics,
      shiftVariance,
      weekendVariance,
      holidayVariance,
      nightShiftVariance: nightVariance
    };
  }
  
  /**
   * Calculate preference fulfillment metrics
   */
  private calculatePreferenceMetrics(
    assignments: ShiftAssignment[],
    preferences: ShiftPreference[],
    users: RotaUser[]
  ): PreferenceMetrics {
    let mustHaveFulfilled = 0;
    let mustHaveTotal = 0;
    let highlyPreferredFulfilled = 0;
    let highlyPreferredTotal = 0;
    let mustAvoidViolations = 0;
    let mustAvoidTotal = 0;
    
    const userScores: UserPreferenceScore[] = [];
    
    for (const user of users) {
      const userPref = preferences.find(p => p.userId === user.id);
      const userAssignments = assignments.filter(a => a.primaryUserId === user.id);
      
      let userMustHavesMet = 0;
      let userMustHavesTotal = 0;
      let userMustAvoidsViolated = 0;
      
      if (userPref) {
        // Check date preferences
        for (const datePref of userPref.datePreferences) {
          const dateStr = datePref.date.toISOString().split('T')[0];
          const hasAssignment = userAssignments.some(
            a => a.date.toISOString().split('T')[0] === dateStr
          );
          
          if (datePref.preference === 'must_have') {
            mustHaveTotal++;
            userMustHavesTotal++;
            if (hasAssignment) {
              mustHaveFulfilled++;
              userMustHavesMet++;
            }
          } else if (datePref.preference === 'highly_preferred') {
            highlyPreferredTotal++;
            if (hasAssignment) highlyPreferredFulfilled++;
          } else if (datePref.preference === 'must_avoid') {
            mustAvoidTotal++;
            if (hasAssignment) {
              mustAvoidViolations++;
              userMustAvoidsViolated++;
            }
          }
        }
      }
      
      const fulfillmentScore = userMustHavesTotal > 0 
        ? (userMustHavesMet / userMustHavesTotal) * 100 
        : 100;
      
      userScores.push({
        userId: user.id,
        userName: user.name,
        fulfillmentScore,
        mustHavesMet: userMustHavesMet,
        mustHavesTotal: userMustHavesTotal,
        mustAvoidsViolated: userMustAvoidsViolated
      });
    }
    
    const overallFulfillment = mustHaveTotal > 0
      ? ((mustHaveFulfilled / mustHaveTotal) * 60) +
        ((highlyPreferredTotal > 0 ? highlyPreferredFulfilled / highlyPreferredTotal : 1) * 30) +
        ((mustAvoidTotal > 0 ? 1 - (mustAvoidViolations / mustAvoidTotal) : 1) * 10)
      : 100;
    
    return {
      overallFulfillment,
      mustHaveFulfilled,
      mustHaveTotal,
      highlyPreferredFulfilled,
      highlyPreferredTotal,
      mustAvoidViolations,
      mustAvoidTotal,
      userPreferenceScores: userScores
    };
  }
  
  // =============================================================================
  // HELPER METHODS
  // =============================================================================
  
  private getDatesInMonth(month: number, year: number): Date[] {
    const dates: Date[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month - 1, day));
    }
    
    return dates;
  }
  
  private getShiftConfig(shiftType: ShiftType): ShiftTypeConfig {
    // Import from types
    const SHIFT_TYPES_MAP: Record<ShiftType, ShiftTypeConfig> = {
      general_oncall: {
        id: 'general_oncall', name: 'General On-Call', shortName: 'On-Call',
        color: '#3b82f6', icon: '📞', duration: 12, requiresBackup: true,
        requiredCertifications: [], allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 10, weight: 1.0
      },
      senior_backup: {
        id: 'senior_backup', name: 'Senior Backup', shortName: 'Backup',
        color: '#8b5cf6', icon: '🛡️', duration: 12, requiresBackup: false,
        requiredCertifications: ['senior_qualified'], allowedSeniority: ['PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 10, weight: 0.8
      },
      clinic_duty: {
        id: 'clinic_duty', name: 'Clinic Duty', shortName: 'Clinic',
        color: '#10b981', icon: '🏥', duration: 8, requiresBackup: false,
        requiredCertifications: [], allowedSeniority: ['PGY1', 'PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 8, weight: 0.5
      },
      or_assist: {
        id: 'or_assist', name: 'OR Assist', shortName: 'OR',
        color: '#f59e0b', icon: '🔬', duration: 10, requiresBackup: false,
        requiredCertifications: ['or_trained'], allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 10, weight: 0.7
      },
      emergency_cover: {
        id: 'emergency_cover', name: 'Emergency Cover', shortName: 'ER',
        color: '#ef4444', icon: '🚨', duration: 12, requiresBackup: true,
        requiredCertifications: ['emergency_trained'], allowedSeniority: ['PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 12, weight: 1.2
      },
      weekend_oncall: {
        id: 'weekend_oncall', name: 'Weekend On-Call', shortName: 'Wknd',
        color: '#6366f1', icon: '📅', duration: 24, requiresBackup: true,
        requiredCertifications: [], allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 12, weight: 1.5
      },
      night_shift: {
        id: 'night_shift', name: 'Night Shift', shortName: 'Night',
        color: '#1e3a5f', icon: '🌙', duration: 12, requiresBackup: true,
        requiredCertifications: [], allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 12, weight: 1.3
      },
      holiday_cover: {
        id: 'holiday_cover', name: 'Holiday Cover', shortName: 'Holiday',
        color: '#ec4899', icon: '🎄', duration: 24, requiresBackup: true,
        requiredCertifications: [], allowedSeniority: ['PGY2', 'PGY3', 'PGY4', 'Fellow', 'Attending', 'Consultant'],
        minRestAfter: 12, weight: 2.0
      }
    };
    
    return SHIFT_TYPES_MAP[shiftType];
  }
  
  private shouldScheduleShift(requirement: ShiftRequirement, date: Date): boolean {
    // Check if this shift type should be scheduled on this date
    if (requirement.daysOfWeek && !requirement.daysOfWeek.includes(date.getDay())) {
      return false;
    }
    
    if (requirement.excludeHolidays && this.isHoliday(date)) {
      return false;
    }
    
    if (requirement.onlyHolidays && !this.isHoliday(date)) {
      return false;
    }
    
    if (requirement.onlyWeekends && !this.isWeekend(date)) {
      return false;
    }
    
    return true;
  }
  
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }
  
  private isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS_2025.some(h => h.toISOString().split('T')[0] === dateStr);
  }
  
  private getPreferenceWeight(preference: PreferenceLevel): number {
    const weights: Record<PreferenceLevel, number> = {
      must_have: 50,
      highly_preferred: 25,
      indifferent: 0,
      must_avoid: -50
    };
    return weights[preference];
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }
  
  private generateAssignmentReason(selected: { user: RotaUser; preferenceScore: number; equityScore: number }): string {
    const reasons: string[] = [];
    
    if (selected.equityScore > 60) {
      reasons.push('Balancing shift load');
    }
    if (selected.preferenceScore > 70) {
      reasons.push('Matches user preference');
    }
    if (selected.equityScore < 40) {
      reasons.push('Despite high historical load');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Best available option';
  }
  
  // =============================================================================
  // LOGGING METHODS
  // =============================================================================
  
  private logInfo(message: string, details?: Record<string, any>): void {
    this.log.push({ timestamp: new Date(), level: 'info', message, details });
  }
  
  private logWarning(message: string, details?: Record<string, any>): void {
    this.log.push({ timestamp: new Date(), level: 'warning', message, details });
  }
  
  private logDecision(message: string, details?: Record<string, any>): void {
    this.log.push({ timestamp: new Date(), level: 'decision', message, details });
  }
  
  private logConstraint(message: string, details?: Record<string, any>): void {
    this.log.push({ timestamp: new Date(), level: 'constraint', message, details });
  }
}

// =============================================================================
// ADDITIONAL TYPES
// =============================================================================

export interface ShiftRequirement {
  shiftType: ShiftType;
  count: number; // How many of this shift per applicable day
  daysOfWeek?: number[]; // 0-6, undefined = all days
  onlyWeekends?: boolean;
  onlyHolidays?: boolean;
  excludeHolidays?: boolean;
}

// Holiday list
const HOLIDAYS_2025: Date[] = [
  new Date('2025-01-01'),
  new Date('2025-04-13'),
  new Date('2025-04-19'),
  new Date('2025-05-01'),
  new Date('2025-06-02'),
  new Date('2025-09-23'),
  new Date('2025-10-02'),
  new Date('2025-10-07'),
  new Date('2025-12-25'),
];

export default RotaOptimizationEngine;
