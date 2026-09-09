// @ts-ignore
import { describe, expect, it } from 'bun:test';

import { isSessionHost, validateScheduleDuration } from './hostPermissions';
import { Player, PlaySchedule } from '../types';

describe('hostPermissions', () => {
  const mockHostPlayer: Player = {
    id: 'usr_host',
    name: 'Host Player',
    handle: '@host',
    avatarUrl: 'https://example.com/avatar.jpg',
    duprRating: 4.0,
    skillTier: 'Intermediate',
    level: 10,
    xp: 1000,
    xpToNextLevel: 2000,
    streakDays: 3,
    matchesPlayed: 10,
    wins: 5,
    losses: 5,
    paddleConfig: {
      faceColor: '#1F5B73',
      faceColorName: 'Petrol Blue',
      gripColor: '#E07137',
      edgeGuardColor: '#F4E022',
      pattern: 'honeycomb',
      avatarUrl: 'https://example.com/avatar.jpg',
      paddleBrandName: 'Wordcomm',
      surfaceFinish: 'carbon',
    },
    badges: [],
  };

  const mockNonHostPlayer: Player = {
    ...mockHostPlayer,
    id: 'usr_guest',
    handle: '@guest',
  };

  const mockActiveSchedule: PlaySchedule = {
    id: 'sched_1',
    providerId: 'provider_1',
    hostPlayerId: 'usr_host',
    title: 'Morning Session',
    allocatedCourtIds: ['c1', 'c2'],
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    durationHours: 4,
    status: 'active',
    maxCapacity: 16,
  };

  describe('isSessionHost', () => {
    it('returns true when player is the host of an active session', () => {
      expect(isSessionHost(mockHostPlayer, mockActiveSchedule)).toBe(true);
    });

    it('returns false when player is not the host of the session', () => {
      expect(isSessionHost(mockNonHostPlayer, mockActiveSchedule)).toBe(false);
    });

    it('returns false when schedule status is not active (e.g. scheduled, completed, cancelled)', () => {
      const scheduledSchedule: PlaySchedule = { ...mockActiveSchedule, status: 'scheduled' };
      const completedSchedule: PlaySchedule = { ...mockActiveSchedule, status: 'completed' };
      const cancelledSchedule: PlaySchedule = { ...mockActiveSchedule, status: 'cancelled' };

      expect(isSessionHost(mockHostPlayer, scheduledSchedule)).toBe(false);
      expect(isSessionHost(mockHostPlayer, completedSchedule)).toBe(false);
      expect(isSessionHost(mockHostPlayer, cancelledSchedule)).toBe(false);
    });

    it('returns false when player is null or undefined', () => {
      expect(isSessionHost(null, mockActiveSchedule)).toBe(false);
      expect(isSessionHost(undefined, mockActiveSchedule)).toBe(false);
    });

    it('returns false when schedule is null or undefined', () => {
      expect(isSessionHost(mockHostPlayer, null)).toBe(false);
      expect(isSessionHost(mockHostPlayer, undefined)).toBe(false);
    });

    it('returns false when both player and schedule are null or undefined', () => {
      expect(isSessionHost(null, null)).toBe(false);
      expect(isSessionHost(undefined, undefined)).toBe(false);
    });
  });

  describe('validateScheduleDuration', () => {
    it('returns true for durations between 3 and 5 hours inclusive', () => {
      expect(validateScheduleDuration(3)).toBe(true);
      expect(validateScheduleDuration(3.5)).toBe(true);
      expect(validateScheduleDuration(4)).toBe(true);
      expect(validateScheduleDuration(4.5)).toBe(true);
      expect(validateScheduleDuration(5)).toBe(true);
    });

    it('returns false for durations under 3 hours', () => {
      expect(validateScheduleDuration(0)).toBe(false);
      expect(validateScheduleDuration(1)).toBe(false);
      expect(validateScheduleDuration(2.99)).toBe(false);
      expect(validateScheduleDuration(-1)).toBe(false);
    });

    it('returns false for durations over 5 hours', () => {
      expect(validateScheduleDuration(5.01)).toBe(false);
      expect(validateScheduleDuration(6)).toBe(false);
      expect(validateScheduleDuration(10)).toBe(false);
    });
  });
});
