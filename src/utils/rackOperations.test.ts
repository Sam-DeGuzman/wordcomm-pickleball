// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { Player } from '../types';
import {
  movePlayerInRack,
  insertPlayerAtPriorityDeck,
  removePlayerFromRack,
} from './rackOperations';

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

describe('rackOperations', () => {
  const playerA = createMockPlayer('p-1', 'Player Alpha');
  const playerB = createMockPlayer('p-2', 'Player Bravo');
  const playerC = createMockPlayer('p-3', 'Player Charlie');
  const playerD = createMockPlayer('p-4', 'Player Delta');
  const playerE = createMockPlayer('p-5', 'Player Echo');

  describe('movePlayerInRack', () => {
    it('moves a player forward in the queue (e.g. index 0 to index 2)', () => {
      const initial = [playerA, playerB, playerC, playerD];
      const result = movePlayerInRack(initial, 0, 2);

      expect(result).toHaveLength(4);
      expect(result.map((p) => p.id)).toEqual(['p-2', 'p-3', 'p-1', 'p-4']);
      expect(initial.map((p) => p.id)).toEqual(['p-1', 'p-2', 'p-3', 'p-4']); // immutability check
    });

    it('moves a player backward in the queue (e.g. index 3 to index 1)', () => {
      const initial = [playerA, playerB, playerC, playerD];
      const result = movePlayerInRack(initial, 3, 1);

      expect(result).toHaveLength(4);
      expect(result.map((p) => p.id)).toEqual(['p-1', 'p-4', 'p-2', 'p-3']);
    });

    it('handles moving player to the same index without changing order', () => {
      const initial = [playerA, playerB, playerC];
      const result = movePlayerInRack(initial, 1, 1);

      expect(result.map((p) => p.id)).toEqual(['p-1', 'p-2', 'p-3']);
    });

    it('returns original array when fromIndex is out of bounds (< 0 or >= length)', () => {
      const initial = [playerA, playerB, playerC];
      expect(movePlayerInRack(initial, -1, 1)).toEqual(initial);
      expect(movePlayerInRack(initial, 5, 1)).toEqual(initial);
    });

    it('returns original array when toIndex is out of bounds (< 0 or >= length)', () => {
      const initial = [playerA, playerB, playerC];
      expect(movePlayerInRack(initial, 1, -1)).toEqual(initial);
      expect(movePlayerInRack(initial, 1, 10)).toEqual(initial);
    });

    it('preserves total count and element identities correctly', () => {
      const initial = [playerA, playerB, playerC, playerD, playerE];
      const result = movePlayerInRack(initial, 4, 0);

      expect(result).toHaveLength(5);
      expect(result[0]).toBe(playerE);
      expect(result[1]).toBe(playerA);
      expect(result[2]).toBe(playerB);
      expect(result[3]).toBe(playerC);
      expect(result[4]).toBe(playerD);
    });
  });

  describe('insertPlayerAtPriorityDeck', () => {
    it('inserts a new player at index 0 (slot 1 Priority Deck)', () => {
      const initial = [playerA, playerB, playerC];
      const result = insertPlayerAtPriorityDeck(initial, playerD);

      expect(result).toHaveLength(4);
      expect(result[0]).toBe(playerD);
      expect(result.map((p) => p.id)).toEqual(['p-4', 'p-1', 'p-2', 'p-3']);
      expect(initial).toHaveLength(3); // immutability check
    });

    it('promotes an existing player already in the queue to index 0, deduplicating them', () => {
      const initial = [playerA, playerB, playerC, playerD];
      const result = insertPlayerAtPriorityDeck(initial, playerC);

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('p-3');
      expect(result.map((p) => p.id)).toEqual(['p-3', 'p-1', 'p-2', 'p-4']);
    });

    it('handles promoting a player already at index 0 correctly without duplicates', () => {
      const initial = [playerA, playerB, playerC];
      const result = insertPlayerAtPriorityDeck(initial, playerA);

      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id)).toEqual(['p-1', 'p-2', 'p-3']);
    });
  });

  describe('removePlayerFromRack', () => {
    it('removes a specific player by ID from the queue', () => {
      const initial = [playerA, playerB, playerC, playerD];
      const result = removePlayerFromRack(initial, 'p-2');

      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id)).toEqual(['p-1', 'p-3', 'p-4']);
      expect(initial).toHaveLength(4); // immutability check
    });

    it('returns unchanged list if player ID is not found', () => {
      const initial = [playerA, playerB];
      const result = removePlayerFromRack(initial, 'p-999');

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual(['p-1', 'p-2']);
    });

    it('removes head and tail elements cleanly', () => {
      const initial = [playerA, playerB, playerC];
      const withoutHead = removePlayerFromRack(initial, 'p-1');
      expect(withoutHead.map((p) => p.id)).toEqual(['p-2', 'p-3']);

      const withoutTail = removePlayerFromRack(initial, 'p-3');
      expect(withoutTail.map((p) => p.id)).toEqual(['p-1', 'p-2']);
    });
  });
});
