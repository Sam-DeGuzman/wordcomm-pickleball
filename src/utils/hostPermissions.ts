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
