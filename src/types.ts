export type SkillTier = 'Novice' | 'Intermediate' | 'Advanced' | 'Pro';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'streak' | 'matches' | 'paddle';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; total: number };
}

export interface PaddleConfig {
  faceColor: string; // hex or preset name
  faceColorName: string;
  gripColor: string;
  edgeGuardColor: string;
  pattern: 'carbon-weave' | 'honeycomb' | 'classic' | 'retro-lines';
  avatarUrl: string;
  paddleBrandName: string;
  surfaceFinish: 'matte' | 'textured-grit' | 'carbon';
}

export interface Player {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  duprRating: number;
  skillTier: SkillTier;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  paddleConfig: PaddleConfig;
  badges: Badge[];
  isCurrentUser?: boolean;
  preferredPlayStyle?: 'Aggressive Kitchen Play' | 'Tactical Dink Master' | 'Power Smasher' | 'All-Rounder';
  queueJoinedAt?: number;
}

export interface PaddleRackSlot {
  slotNumber: number;
  player: Player | null;
  mode: 'doubles' | 'singles';
  isCallingNext?: boolean;
}

export interface Court {
  id: string;
  name: string;
  type: 'Center Court' | 'Standard Court' | 'Challenge Court';
  status: 'available' | 'in-progress' | 'finishing';
  teamA: Player[];
  teamB: Player[];
  scoreA: number;
  scoreB: number;
  gamePoint: number;
  timeStarted?: number;
}

export interface MatchmakingMatch {
  id: string;
  courtId: string;
  courtName: string;
  mode: 'doubles' | 'singles';
  teamA: Player[];
  teamB: Player[];
  matchDate: string;
  scoreA?: number;
  scoreB?: number;
  winnerTeam?: 'A' | 'B';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  current: number;
  target: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

export interface PlaySchedule {
  id: string;
  providerId: string;
  hostPlayerId: string;
  title: string;
  allocatedCourtIds: string[];
  startTime: string;
  endTime: string;
  durationHours: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  maxCapacity?: number;
}

export type AuthRole = 'host' | 'player';

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  role: AuthRole;
  isHost: boolean;
}

