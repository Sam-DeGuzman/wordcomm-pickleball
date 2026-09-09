import { Court, Player } from '../types';

export function overrideCourtScore(
  court: Court,
  scoreA: number,
  scoreB: number
): Court {
  return {
    ...court,
    scoreA: Math.max(0, scoreA),
    scoreB: Math.max(0, scoreB),
  };
}

export function setCourtGamePoint(court: Court, targetPoint: number): Court {
  return {
    ...court,
    gamePoint: Math.max(1, targetPoint),
  };
}

export function swapCourtPlayer(
  court: Court,
  oldPlayerId: string,
  newPlayer: Player
): Court {
  const isTeamA = court.teamA.some((p) => p.id === oldPlayerId);
  if (isTeamA) {
    return {
      ...court,
      teamA: court.teamA.map((p) => (p.id === oldPlayerId ? newPlayer : p)),
    };
  }
  const isTeamB = court.teamB.some((p) => p.id === oldPlayerId);
  if (isTeamB) {
    return {
      ...court,
      teamB: court.teamB.map((p) => (p.id === oldPlayerId ? newPlayer : p)),
    };
  }
  return court;
}

export function forceEndCourtMatch(court: Court, winnerTeam: 'A' | 'B'): Court {
  return {
    ...court,
    scoreA:
      winnerTeam === 'A'
        ? court.gamePoint
        : Math.min(court.scoreA, Math.max(0, court.gamePoint - 2)),
    scoreB:
      winnerTeam === 'B'
        ? court.gamePoint
        : Math.min(court.scoreB, Math.max(0, court.gamePoint - 2)),
  };
}
