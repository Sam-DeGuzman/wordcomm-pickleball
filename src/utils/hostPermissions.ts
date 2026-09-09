import { PlaySchedule, Player } from '../types';

export function isSessionHost(
  player: Player | null | undefined,
  schedule: PlaySchedule | null | undefined
): boolean {
  if (!player || !schedule) return false;
  return player.id === schedule.hostPlayerId && schedule.status === 'active';
}

export function validateScheduleDuration(durationHours: number): boolean {
  return durationHours >= 3 && durationHours <= 5;
}

export function formatScheduleRemainingTime(endTimeIso: string): string {
  const end = new Date(endTimeIso).getTime();
  const now = Date.now();
  const diffMs = end - now;
  if (diffMs <= 0 || isNaN(diffMs)) return 'Session Concluded';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${mins}m remaining`;
  }
  return `${mins}m remaining`;
}
