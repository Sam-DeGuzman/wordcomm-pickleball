// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { Court, Player } from '../types';
import {
  overrideCourtScore,
  setCourtGamePoint,
  swapCourtPlayer,
  forceEndCourtMatch,
} from './courtOperations';

const createMockPlayer = (id: string, name: string): Player => ({
  id,
  name,
  handle: `@${id}`,
  avatarUrl: `https://example.com/avatar/${id}.png`,
  duprRating: 3.5,
  skillTier: 'Intermediate',
  level: 5,
  xp: 1200,
  xpToNextLevel: 1500,
  streakDays: 3,
  matchesPlayed: 10,
  wins: 6,
  losses: 4,
  paddleConfig: {
    faceColor: '#F4E022',
    faceColorName: 'Volt Yellow',
    gripColor: '#000000',
    edgeGuardColor: '#1F5B73',
    pattern: 'carbon-weave',
    avatarUrl: `https://example.com/avatar/${id}.png`,
    paddleBrandName: 'Wordcomm Pro',
    surfaceFinish: 'carbon',
  },
  badges: [],
});

const createMockCourt = (overrides?: Partial<Court>): Court => ({
  id: 'court-1',
  name: 'Center Court',
  type: 'Center Court',
  status: 'in-progress',
  teamA: [createMockPlayer('p-1', 'Player 1'), createMockPlayer('p-2', 'Player 2')],
  teamB: [createMockPlayer('p-3', 'Player 3'), createMockPlayer('p-4', 'Player 4')],
  scoreA: 5,
  scoreB: 7,
  gamePoint: 11,
  timeStarted: 1700000000000,
  ...overrides,
});

describe('courtOperations', () => {
  describe('overrideCourtScore', () => {
    it('sets custom scores correctly', () => {
      const court = createMockCourt({ scoreA: 5, scoreB: 7 });
      const result = overrideCourtScore(court, 9, 10);

      expect(result.scoreA).toBe(9);
      expect(result.scoreB).toBe(10);
      expect(court.scoreA).toBe(5); // immutability check
    });

    it('clamps negative scores to zero', () => {
      const court = createMockCourt({ scoreA: 5, scoreB: 7 });
      const result = overrideCourtScore(court, -3, -1);

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });

    it('allows 0 as a valid score', () => {
      const court = createMockCourt({ scoreA: 5, scoreB: 7 });
      const result = overrideCourtScore(court, 0, 0);

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });
  });

  describe('setCourtGamePoint', () => {
    it('updates gamePoint to 11, 15, or 21', () => {
      const court = createMockCourt({ gamePoint: 11 });

      const to15 = setCourtGamePoint(court, 15);
      expect(to15.gamePoint).toBe(15);

      const to21 = setCourtGamePoint(court, 21);
      expect(to21.gamePoint).toBe(21);
    });

    it('clamps game point to minimum of 1 for non-positive values', () => {
      const court = createMockCourt({ gamePoint: 11 });

      const zero = setCourtGamePoint(court, 0);
      expect(zero.gamePoint).toBe(1);

      const negative = setCourtGamePoint(court, -5);
      expect(negative.gamePoint).toBe(1);
    });
  });

  describe('swapCourtPlayer', () => {
    const playerA1 = createMockPlayer('p-1', 'Player 1');
    const playerA2 = createMockPlayer('p-2', 'Player 2');
    const playerB1 = createMockPlayer('p-3', 'Player 3');
    const playerB2 = createMockPlayer('p-4', 'Player 4');
    const subPlayer = createMockPlayer('sub-1', 'Substitute Player');

    it('swaps a player in Team A', () => {
      const court = createMockCourt({
        teamA: [playerA1, playerA2],
        teamB: [playerB1, playerB2],
      });

      const result = swapCourtPlayer(court, 'p-1', subPlayer);

      expect(result.teamA[0].id).toBe('sub-1');
      expect(result.teamA[1].id).toBe('p-2');
      expect(result.teamB).toEqual(court.teamB);
      expect(court.teamA[0].id).toBe('p-1'); // immutability check
    });

    it('swaps a player in Team B', () => {
      const court = createMockCourt({
        teamA: [playerA1, playerA2],
        teamB: [playerB1, playerB2],
      });

      const result = swapCourtPlayer(court, 'p-4', subPlayer);

      expect(result.teamB[1].id).toBe('sub-1');
      expect(result.teamB[0].id).toBe('p-3');
      expect(result.teamA).toEqual(court.teamA);
    });

    it('returns unchanged court if oldPlayerId is not found in either team', () => {
      const court = createMockCourt({
        teamA: [playerA1, playerA2],
        teamB: [playerB1, playerB2],
      });

      const result = swapCourtPlayer(court, 'non-existent-id', subPlayer);

      expect(result).toEqual(court);
    });
  });

  describe('forceEndCourtMatch', () => {
    it('sets victorious score for Team A when Team A is declared winner', () => {
      const court = createMockCourt({
        gamePoint: 11,
        scoreA: 8,
        scoreB: 6,
      });

      const result = forceEndCourtMatch(court, 'A');

      expect(result.scoreA).toBe(11);
      expect(result.scoreB).toBe(6); // kept as 6 since 6 <= 11 - 2
    });

    it('clamps opponent score down to gamePoint - 2 when Team A is declared winner and opponent score was higher', () => {
      const court = createMockCourt({
        gamePoint: 11,
        scoreA: 5,
        scoreB: 10,
      });

      const result = forceEndCourtMatch(court, 'A');

      expect(result.scoreA).toBe(11);
      expect(result.scoreB).toBe(9); // clamped down to 11 - 2 = 9
    });

    it('sets victorious score for Team B when Team B is declared winner', () => {
      const court = createMockCourt({
        gamePoint: 11,
        scoreA: 7,
        scoreB: 8,
      });

      const result = forceEndCourtMatch(court, 'B');

      expect(result.scoreB).toBe(11);
      expect(result.scoreA).toBe(7); // kept as 7 since 7 <= 11 - 2
    });

    it('clamps opponent score down to gamePoint - 2 when Team B is declared winner and opponent score was higher', () => {
      const court = createMockCourt({
        gamePoint: 15,
        scoreA: 14,
        scoreB: 10,
      });

      const result = forceEndCourtMatch(court, 'B');

      expect(result.scoreB).toBe(15);
      expect(result.scoreA).toBe(13); // clamped down to 15 - 2 = 13
    });

    it('handles winning declaration when opponent score is 0', () => {
      const court = createMockCourt({
        gamePoint: 11,
        scoreA: 0,
        scoreB: 0,
      });

      const result = forceEndCourtMatch(court, 'A');

      expect(result.scoreA).toBe(11);
      expect(result.scoreB).toBe(0);
    });
  });
});
