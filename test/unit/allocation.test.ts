/**
 * =============================================================================
 * OPHTHALMIC SIMULATOR - ALLOCATION LOGIC UNIT TESTS (V14.0)
 * =============================================================================
 * Anchor Point: Tests for determineAllocation() logic with all edge cases.
 * Part of Non-Regression Anchoring (V11.0)
 * =============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Types for allocation testing
interface IAllocationVote {
  odId: string;
  odName: string;
  votes: number;
}

interface IAllocationResult {
  assignedTo: string;
  reason: 'majority' | 'tiebreaker' | 'default' | 'manual';
  confidence: number;
}

/**
 * Determine allocation based on votes
 * This is the core algorithm being tested
 */
function determineAllocation(
  votes: IAllocationVote[],
  minVotesRequired: number = 5
): IAllocationResult {
  // Edge case: No votes
  if (votes.length === 0) {
    return {
      assignedTo: '',
      reason: 'default',
      confidence: 0
    };
  }

  // Calculate total votes
  const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0);

  // Edge case: Not enough votes
  if (totalVotes < minVotesRequired) {
    return {
      assignedTo: '',
      reason: 'default',
      confidence: totalVotes / minVotesRequired
    };
  }

  // Sort by votes descending
  const sorted = [...votes].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];
  const runnerUp = sorted[1];

  // Check for tie
  if (runnerUp && winner.votes === runnerUp.votes) {
    // Tiebreaker: alphabetical by name
    const tiedCandidates = sorted.filter(v => v.votes === winner.votes);
    const tiebreakerWinner = tiedCandidates.sort((a, b) => 
      a.odName.localeCompare(b.odName)
    )[0];

    return {
      assignedTo: tiebreakerWinner.odId,
      reason: 'tiebreaker',
      confidence: winner.votes / totalVotes
    };
  }

  // Clear winner
  return {
    assignedTo: winner.odId,
    reason: 'majority',
    confidence: winner.votes / totalVotes
  };
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Allocation Logic - determineAllocation()', () => {
  
  describe('Basic Functionality', () => {
    it('should return the candidate with most votes', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 10 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 5 },
        { odId: 'od-3', odName: 'Dr. Chen', votes: 3 }
      ];

      const result = determineAllocation(votes);
      
      expect(result.assignedTo).toBe('od-1');
      expect(result.reason).toBe('majority');
      expect(result.confidence).toBeCloseTo(10 / 18);
    });

    it('should calculate confidence correctly', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 15 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 5 }
      ];

      const result = determineAllocation(votes);
      
      expect(result.confidence).toBe(0.75); // 15/20
    });
  });

  describe('Edge Cases - Empty/Insufficient Votes', () => {
    it('should handle empty votes array', () => {
      const result = determineAllocation([]);
      
      expect(result.assignedTo).toBe('');
      expect(result.reason).toBe('default');
      expect(result.confidence).toBe(0);
    });

    it('should handle insufficient votes (below minimum)', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 2 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 1 }
      ];

      const result = determineAllocation(votes, 5);
      
      expect(result.assignedTo).toBe('');
      expect(result.reason).toBe('default');
      expect(result.confidence).toBe(0.6); // 3/5
    });

    it('should proceed when exactly at minimum votes', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 3 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 2 }
      ];

      const result = determineAllocation(votes, 5);
      
      expect(result.assignedTo).toBe('od-1');
      expect(result.reason).toBe('majority');
    });
  });

  describe('Edge Cases - Tie Scenarios', () => {
    it('should use alphabetical tiebreaker for two-way tie', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 5 },
        { odId: 'od-2', odName: 'Dr. Chen', votes: 5 }
      ];

      const result = determineAllocation(votes);
      
      // Chen comes before Smith alphabetically
      expect(result.assignedTo).toBe('od-2');
      expect(result.reason).toBe('tiebreaker');
    });

    it('should use alphabetical tiebreaker for three-way tie', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Zeta', votes: 4 },
        { odId: 'od-2', odName: 'Dr. Alpha', votes: 4 },
        { odId: 'od-3', odName: 'Dr. Beta', votes: 4 }
      ];

      const result = determineAllocation(votes);
      
      // Alpha comes first alphabetically
      expect(result.assignedTo).toBe('od-2');
      expect(result.reason).toBe('tiebreaker');
    });

    it('should not trigger tiebreaker when winner is clear', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 6 },
        { odId: 'od-2', odName: 'Dr. Chen', votes: 5 },
        { odId: 'od-3', odName: 'Dr. Jones', votes: 5 }
      ];

      const result = determineAllocation(votes);
      
      expect(result.assignedTo).toBe('od-1');
      expect(result.reason).toBe('majority');
    });
  });

  describe('Edge Cases - Single Candidate', () => {
    it('should handle single candidate with sufficient votes', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 10 }
      ];

      const result = determineAllocation(votes);
      
      expect(result.assignedTo).toBe('od-1');
      expect(result.reason).toBe('majority');
      expect(result.confidence).toBe(1);
    });

    it('should handle single candidate with insufficient votes', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 2 }
      ];

      const result = determineAllocation(votes, 5);
      
      expect(result.assignedTo).toBe('');
      expect(result.reason).toBe('default');
    });
  });

  describe('Edge Cases - Zero Votes', () => {
    it('should handle candidates with zero votes', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 5 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 0 },
        { odId: 'od-3', odName: 'Dr. Chen', votes: 0 }
      ];

      const result = determineAllocation(votes);
      
      expect(result.assignedTo).toBe('od-1');
      expect(result.confidence).toBe(1); // 5/5
    });

    it('should handle all candidates with zero votes', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 0 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 0 }
      ];

      const result = determineAllocation(votes);
      
      expect(result.assignedTo).toBe('');
      expect(result.reason).toBe('default');
    });
  });

  describe('Custom Minimum Votes', () => {
    it('should respect custom minimum votes threshold', () => {
      const votes: IAllocationVote[] = [
        { odId: 'od-1', odName: 'Dr. Smith', votes: 8 },
        { odId: 'od-2', odName: 'Dr. Jones', votes: 2 }
      ];

      // With minimum of 15, should fail
      const result1 = determineAllocation(votes, 15);
      expect(result1.assignedTo).toBe('');
      expect(result1.reason).toBe('default');

      // With minimum of 10, should succeed
      const result2 = determineAllocation(votes, 10);
      expect(result2.assignedTo).toBe('od-1');
      expect(result2.reason).toBe('majority');
    });
  });
});
