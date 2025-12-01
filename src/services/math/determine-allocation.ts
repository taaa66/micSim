/**
 * =============================================================================
 * DETERMINE ALLOCATION (V11.0 Non-Regression Anchor)
 * =============================================================================
 * Core allocation algorithm for Apex League duty assignment.
 * This function is a V11.0 Anchor Point - must have exhaustive test coverage.
 * =============================================================================
 */

import type { IAllocationVote } from '../../core/models';

export interface AllocationInput {
  votes: IAllocationVote[];
  currentDutyHolder?: string;
  minimumVotes?: number;
}

export interface AllocationResult {
  winner: string | null;
  winnerName: string | null;
  isTie: boolean;
  tiedCandidates: string[];
  totalVotes: number;
  winningPercentage: number;
  reason: AllocationReason;
}

export type AllocationReason =
  | 'CLEAR_WINNER'
  | 'TIE_BROKEN_BY_CURRENT_HOLDER'
  | 'TIE_UNRESOLVED'
  | 'NO_VOTES'
  | 'BELOW_MINIMUM_VOTES'
  | 'SINGLE_CANDIDATE';

/**
 * Determine allocation winner from votes
 * 
 * Algorithm:
 * 1. If no votes, return null with NO_VOTES reason
 * 2. If below minimum votes threshold, return null with BELOW_MINIMUM_VOTES
 * 3. Find candidate(s) with highest votes
 * 4. If single winner, return with CLEAR_WINNER
 * 5. If tie, check if current duty holder is among tied - they retain duty
 * 6. If tie without current holder, return TIE_UNRESOLVED
 * 
 * @param input - Allocation input with votes and optional current holder
 * @returns AllocationResult with winner and reason
 */
export function determineAllocation(input: AllocationInput): AllocationResult {
  const { votes, currentDutyHolder, minimumVotes = 1 } = input;

  // Edge case: no votes
  if (!votes || votes.length === 0) {
    return {
      winner: null,
      winnerName: null,
      isTie: false,
      tiedCandidates: [],
      totalVotes: 0,
      winningPercentage: 0,
      reason: 'NO_VOTES'
    };
  }

  // Calculate total votes
  const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0);

  // Edge case: below minimum votes
  if (totalVotes < minimumVotes) {
    return {
      winner: null,
      winnerName: null,
      isTie: false,
      tiedCandidates: [],
      totalVotes,
      winningPercentage: 0,
      reason: 'BELOW_MINIMUM_VOTES'
    };
  }

  // Edge case: single candidate
  if (votes.length === 1) {
    const candidate = votes[0];
    return {
      winner: candidate.odId,
      winnerName: candidate.odName,
      isTie: false,
      tiedCandidates: [],
      totalVotes,
      winningPercentage: 100,
      reason: 'SINGLE_CANDIDATE'
    };
  }

  // Find maximum votes
  const maxVotes = Math.max(...votes.map(v => v.votes));

  // Find all candidates with max votes
  const topCandidates = votes.filter(v => v.votes === maxVotes);

  // Clear winner case
  if (topCandidates.length === 1) {
    const winner = topCandidates[0];
    return {
      winner: winner.odId,
      winnerName: winner.odName,
      isTie: false,
      tiedCandidates: [],
      totalVotes,
      winningPercentage: (maxVotes / totalVotes) * 100,
      reason: 'CLEAR_WINNER'
    };
  }

  // Tie case
  const tiedIds = topCandidates.map(c => c.odId);
  
  // Check if current holder is among tied candidates
  if (currentDutyHolder && tiedIds.includes(currentDutyHolder)) {
    const winner = topCandidates.find(c => c.odId === currentDutyHolder)!;
    return {
      winner: winner.odId,
      winnerName: winner.odName,
      isTie: true,
      tiedCandidates: tiedIds,
      totalVotes,
      winningPercentage: (maxVotes / totalVotes) * 100,
      reason: 'TIE_BROKEN_BY_CURRENT_HOLDER'
    };
  }

  // Unresolved tie
  return {
    winner: null,
    winnerName: null,
    isTie: true,
    tiedCandidates: tiedIds,
    totalVotes,
    winningPercentage: (maxVotes / totalVotes) * 100,
    reason: 'TIE_UNRESOLVED'
  };
}

/**
 * Validate allocation vote data
 */
export function validateAllocationVotes(votes: IAllocationVote[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(votes)) {
    errors.push('Votes must be an array');
    return { valid: false, errors };
  }

  const seenIds = new Set<string>();
  
  for (let i = 0; i < votes.length; i++) {
    const vote = votes[i];
    
    if (!vote.odId) {
      errors.push(`Vote at index ${i} missing odId`);
    }
    
    if (!vote.odName) {
      errors.push(`Vote at index ${i} missing odName`);
    }
    
    if (typeof vote.votes !== 'number' || vote.votes < 0) {
      errors.push(`Vote at index ${i} has invalid vote count`);
    }
    
    if (seenIds.has(vote.odId)) {
      errors.push(`Duplicate odId: ${vote.odId}`);
    }
    seenIds.add(vote.odId);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
