// @ts-ignore
import { describe, it, expect } from 'bun:test';
import {
  CURRENT_USER,
  INITIAL_PLAYERS,
  INITIAL_COURTS,
  INITIAL_SCHEDULE,
} from './data/initialData';
import { isSessionHost, validateScheduleDuration, formatScheduleRemainingTime } from './utils/hostPermissions';
import {
  movePlayerInRack,
  insertPlayerAtPriorityDeck,
  removePlayerFromRack,
} from './utils/rackOperations';
import {
  overrideCourtScore,
  setCourtGamePoint,
  swapCourtPlayer,
  forceEndCourtMatch,
} from './utils/courtOperations';
import { Court, Player, PlaySchedule } from './types';

describe('App Integration - Session Host & Court Management Workflows', () => {
  describe('Session Host Permissions and Lifecycle', () => {
    it('grants host permissions to the designated host for an active schedule', () => {
      expect(isSessionHost(CURRENT_USER, INITIAL_SCHEDULE)).toBe(true);
    });

    it('denies host permissions to other players in the same active schedule', () => {
      const nonHostPlayer = INITIAL_PLAYERS[1];
      expect(isSessionHost(nonHostPlayer, INITIAL_SCHEDULE)).toBe(false);
    });

    it('denies host permissions when schedule is completed or cancelled', () => {
      const completedSchedule: PlaySchedule = { ...INITIAL_SCHEDULE, status: 'completed' };
      const cancelledSchedule: PlaySchedule = { ...INITIAL_SCHEDULE, status: 'cancelled' };

      expect(isSessionHost(CURRENT_USER, completedSchedule)).toBe(false);
      expect(isSessionHost(CURRENT_USER, cancelledSchedule)).toBe(false);
    });

    it('validates schedule duration within standard 3 to 5 hour limits', () => {
      expect(validateScheduleDuration(INITIAL_SCHEDULE.durationHours)).toBe(true);
      expect(validateScheduleDuration(2)).toBe(false);
      expect(validateScheduleDuration(6)).toBe(false);
    });

    it('computes human-readable remaining time for session', () => {
      const futureTime = new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString();
      const formatted = formatScheduleRemainingTime(futureTime);
      expect(formatted).toContain('2h');
      expect(formatted).toContain('remaining');
    });
  });

  describe('Rack Queue Management Integration', () => {
    it('manages player queue ordering and allows host to reorder players', () => {
      let queue: Player[] = [
        INITIAL_PLAYERS[0], // currentUser
        INITIAL_PLAYERS[1], // Marcus
        INITIAL_PLAYERS[2], // Sofia
        INITIAL_PLAYERS[3], // Devon
        INITIAL_PLAYERS[4], // Elena
      ];

      // Host moves Devon (index 3) to Priority Slot 1 (index 0) via movePlayerInRack
      queue = movePlayerInRack(queue, 3, 0);
      expect(queue[0].id).toBe(INITIAL_PLAYERS[3].id);
      expect(queue[1].id).toBe(INITIAL_PLAYERS[0].id);
      expect(queue.length).toBe(5);

      // Host moves player at index 1 to index 4
      queue = movePlayerInRack(queue, 1, 4);
      expect(queue[4].id).toBe(INITIAL_PLAYERS[0].id);
    });

    it('promotes player to Priority Deck (slot #1) and deduplicates', () => {
      let queue: Player[] = [
        INITIAL_PLAYERS[0],
        INITIAL_PLAYERS[1],
        INITIAL_PLAYERS[2],
      ];

      // Promote existing player Sofia (index 2) to Slot 1
      queue = insertPlayerAtPriorityDeck(queue, INITIAL_PLAYERS[2]);
      expect(queue[0].id).toBe(INITIAL_PLAYERS[2].id);
      expect(queue.length).toBe(3);
      expect(queue.filter((p) => p.id === INITIAL_PLAYERS[2].id).length).toBe(1);

      // Insert new bench player Elena (not in queue) to Slot 1
      queue = insertPlayerAtPriorityDeck(queue, INITIAL_PLAYERS[4]);
      expect(queue[0].id).toBe(INITIAL_PLAYERS[4].id);
      expect(queue[1].id).toBe(INITIAL_PLAYERS[2].id);
      expect(queue.length).toBe(4);
    });

    it('allows host to eject a player from the queue', () => {
      let queue: Player[] = [...INITIAL_PLAYERS.slice(0, 5)];
      const playerToRemove = queue[2];

      queue = removePlayerFromRack(queue, playerToRemove.id);
      expect(queue.some((p) => p.id === playerToRemove.id)).toBe(false);
      expect(queue.length).toBe(4);
    });

    it('simulates full flow: host reorders rack, then dispatches top 4 paddles to court', () => {
      let queue: Player[] = [...INITIAL_PLAYERS.slice(0, 6)]; // 6 players
      let courts: Court[] = [...INITIAL_COURTS];

      // Host promotes Jordan (p6) to Slot 1
      queue = insertPlayerAtPriorityDeck(queue, INITIAL_PLAYERS[5]);
      expect(queue[0].id).toBe(INITIAL_PLAYERS[5].id);

      // Top 4 players take the next open court (c2)
      const next4 = queue.slice(0, 4);
      const remainingRack = queue.slice(4);

      const targetCourtIndex = courts.findIndex((c) => c.id === 'c2');
      expect(targetCourtIndex).toBeGreaterThanOrEqual(0);

      const updatedCourt: Court = {
        ...courts[targetCourtIndex],
        status: 'in-progress',
        teamA: [next4[0], next4[1]],
        teamB: [next4[2], next4[3]],
        scoreA: 0,
        scoreB: 0,
        timeStarted: Date.now(),
      };

      courts[targetCourtIndex] = updatedCourt;

      expect(remainingRack.length).toBe(2);
      expect(courts[targetCourtIndex].status).toBe('in-progress');
      expect(courts[targetCourtIndex].teamA[0].id).toBe(INITIAL_PLAYERS[5].id);
    });
  });

  describe('Host Court Arbitration Integration', () => {
    it('allows host to override live scores on an active match', () => {
      let court = INITIAL_COURTS[0]; // Center Court 1 (Live) 8 - 9
      expect(court.scoreA).toBe(8);
      expect(court.scoreB).toBe(9);

      // Host arbitrates: sets score to 10 - 10
      court = overrideCourtScore(court, 10, 10);
      expect(court.scoreA).toBe(10);
      expect(court.scoreB).toBe(10);
    });

    it('allows host to change match game points (11 -> 15)', () => {
      let court = INITIAL_COURTS[0];
      court = setCourtGamePoint(court, 15);
      expect(court.gamePoint).toBe(15);
    });

    it('allows host to substitute an injured on-court player with a bench player', () => {
      let court = INITIAL_COURTS[0];
      const initialTeamAIds = court.teamA.map((p) => p.id);
      const subPlayer = INITIAL_PLAYERS[5]; // Jordan Brooks

      // Substitute player in Team A
      court = swapCourtPlayer(court, initialTeamAIds[0], subPlayer);
      expect(court.teamA[0].id).toBe(subPlayer.id);
      expect(court.teamA[1].id).toBe(initialTeamAIds[1]);
    });

    it('allows host to force-end a disputed match with score clamping', () => {
      let court = INITIAL_COURTS[0]; // gamePoint = 11, scoreA = 8, scoreB = 9
      // Host declares Team A winner
      court = forceEndCourtMatch(court, 'A');

      expect(court.scoreA).toBe(11);
      expect(court.scoreB).toBe(9); // Clamped to at most 11 - 2 = 9

      // Check win-by-2 condition
      const isGameOver =
        (court.scoreA >= court.gamePoint || court.scoreB >= court.gamePoint) &&
        Math.abs(court.scoreA - court.scoreB) >= 2;
      expect(isGameOver).toBe(true);
    });
  });
});
