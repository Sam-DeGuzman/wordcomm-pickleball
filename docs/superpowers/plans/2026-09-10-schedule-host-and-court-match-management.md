# Schedule Host & Arbitrary Court Match Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Session Host domain model and UI controls for Wordcomm Pickleball schedules, granting the designated host arbitrary authority to manage court matches, reorder the paddle queue, dispatch custom pairings, and track/override live scores.

**Architecture:** Extend the domain models with `PlaySchedule` and `SessionHost` permissions. Implement a Session Host context and action handlers that allow designated hosts to override standard FIFO rack queuing, arbitrarily dispatch custom lineups to courts, edit live scores/game points directly, and conclude/reset matches, with visual indicators and role switching for testing.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons, Bun Test.

## Global Constraints

- Must strictly adhere to `docs/UBIQUITOUS_LANGUAGE.md`, `docs/contexts/scheduling/CONTEXT.md`, and `docs/contexts/court-operations/CONTEXT.md`.
- Session windows are strictly bounded between 3 and 5 hours.
- Exactly one primary `SessionHost` (registered `Player`) per active `PlaySchedule`.
- Automated FIFO rack and DUPR matchmaking continue to function for regular players, while the Session Host possesses unilateral override authority.
- All code must pass `bun test` and `npm run lint` (`tsc --noEmit`).

---

### Task 1: Domain Types, Initial Schedule Data, and Host Permission Helpers

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/initialData.ts`
- Create: `src/utils/hostPermissions.ts`
- Test: `src/utils/hostPermissions.test.ts`

**Interfaces:**
- Consumes: `Player`, `Court`, `PaddleConfig` from `src/types.ts`
- Produces: `PlaySchedule`, `HostSessionState`, `isSessionHost(player, schedule)`, `canManageCourt(player, schedule)`

- [ ] **Step 1: Write the failing unit tests for host permissions and schedule invariants**

```typescript
// src/utils/hostPermissions.test.ts
import { describe, expect, it } from 'bun:test';
import { isSessionHost, validateScheduleDuration } from './hostPermissions';
import { PlaySchedule, Player } from '../types';

describe('hostPermissions', () => {
  const mockHost: Player = {
    id: 'user_host_1',
    name: 'Alex Rivera',
    handle: '@arivera',
    avatarUrl: '',
    duprRating: 4.25,
    skillTier: 'Pro',
    level: 14,
    xp: 2800,
    xpToNextLevel: 3500,
    streakDays: 5,
    matchesPlayed: 42,
    wins: 29,
    losses: 13,
    paddleConfig: {} as any,
    badges: [],
  };

  const mockPlayer: Player = {
    ...mockHost,
    id: 'user_player_2',
    name: 'Jordan Lee',
  };

  const mockSchedule: PlaySchedule = {
    id: 'sched_101',
    providerId: 'prov_wordcomm_facility',
    hostPlayerId: 'user_host_1',
    title: 'Wordcomm Saturday Open Play',
    allocatedCourtIds: ['court_1', 'court_2', 'court_3', 'court_4'],
    startTime: '2026-09-10T08:00:00Z',
    endTime: '2026-09-10T12:00:00Z',
    durationHours: 4,
    status: 'active',
  };

  it('correctly identifies if a player is the designated session host', () => {
    expect(isSessionHost(mockHost, mockSchedule)).toBe(true);
    expect(isSessionHost(mockPlayer, mockSchedule)).toBe(false);
    expect(isSessionHost(null, mockSchedule)).toBe(false);
  });

  it('validates session duration invariant between 3 and 5 hours', () => {
    expect(validateScheduleDuration(3)).toBe(true);
    expect(validateScheduleDuration(4.5)).toBe(true);
    expect(validateScheduleDuration(5)).toBe(true);
    expect(validateScheduleDuration(2.5)).toBe(false);
    expect(validateScheduleDuration(5.5)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/utils/hostPermissions.test.ts`
Expected: FAIL with "Cannot find module './hostPermissions'"

- [ ] **Step 3: Implement domain types, initial schedule data, and helper functions**

Update `src/types.ts`:
```typescript
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
```

Create `src/utils/hostPermissions.ts`:
```typescript
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
```

Update `src/data/initialData.ts` to export `INITIAL_SCHEDULE`:
```typescript
export const INITIAL_SCHEDULE: PlaySchedule = {
  id: 'sched_wordcomm_morning',
  providerId: 'provider_wordcomm_hq',
  hostPlayerId: CURRENT_USER.id, // Current user defaults to Session Host
  title: 'Wordcomm Saturday Championship Open Play',
  allocatedCourtIds: ['court_center', 'court_std_1', 'court_challenge', 'court_std_2'],
  startTime: new Date(Date.now() - 3600 * 1000).toISOString(),
  endTime: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
  durationHours: 4.5,
  status: 'active',
  maxCapacity: 32,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test src/utils/hostPermissions.test.ts`
Expected: PASS (2 tests passed)

- [ ] **Step 5: Run typecheck**

Run: `bun run lint`
Expected: PASS with 0 errors

---

### Task 2: Host Session Banner and Schedule Status Bar

**Files:**
- Create: `src/components/SessionHostBanner.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/SessionHostBanner.test.ts`

**Interfaces:**
- Consumes: `PlaySchedule`, `Player`, `isSessionHost`
- Produces: `SessionHostBanner` component displaying active schedule, duration remaining, host status pill, and role-toggle for previewing host vs player views.

- [ ] **Step 1: Write unit tests for SessionHostBanner formatters**

```typescript
// src/components/SessionHostBanner.test.ts
import { describe, expect, it } from 'bun:test';
import { formatScheduleRemainingTime } from '../utils/hostPermissions';

describe('formatScheduleRemainingTime', () => {
  it('calculates remaining session time accurately', () => {
    const futureEndTime = new Date(Date.now() + 90 * 60 * 1000).toISOString();
    const formatted = formatScheduleRemainingTime(futureEndTime);
    expect(formatted).toContain('remaining');
  });

  it('handles expired sessions', () => {
    const pastEndTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const formatted = formatScheduleRemainingTime(pastEndTime);
    expect(formatted).toBe('Session Concluded');
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/components/SessionHostBanner.test.ts`
Expected: FAIL with "formatScheduleRemainingTime is not a function"

- [ ] **Step 3: Implement formatScheduleRemainingTime and SessionHostBanner**

Add `formatScheduleRemainingTime` to `src/utils/hostPermissions.ts`:
```typescript
export function formatScheduleRemainingTime(endTimeIso: string): string {
  const end = new Date(endTimeIso).getTime();
  const now = Date.now();
  const diffMs = end - now;
  if (diffMs <= 0) return 'Session Concluded';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}
```

Create `src/components/SessionHostBanner.tsx`:
```tsx
import React from 'react';
import { PlaySchedule, Player } from '../types';
import { Shield, Clock, Crown, UserCheck, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { formatScheduleRemainingTime } from '../utils/hostPermissions';

interface SessionHostBannerProps {
  schedule: PlaySchedule;
  hostPlayer: Player;
  currentUser: Player;
  isHost: boolean;
  onToggleHostRole: () => void;
}

export const SessionHostBanner: React.FC<SessionHostBannerProps> = ({
  schedule,
  hostPlayer,
  currentUser,
  isHost,
  onToggleHostRole,
}) => {
  const remaining = formatScheduleRemainingTime(schedule.endTime);

  return (
    <div className="bg-gradient-to-r from-[#142333] via-[#101A26] to-[#16212E] border-b border-[#22354A] px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F4E022] text-[#0B0E14] font-black shadow-md flex-shrink-0">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Outfit'] font-black text-xs sm:text-sm text-white uppercase tracking-wide">
                {schedule.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/40 uppercase">
                {schedule.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-[#F4E022]" /> {schedule.durationHours}h Block ({remaining})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#E07137]" /> Host: <strong className="text-white">{hostPlayer.name}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Host Mode Indicator & Role Simulation Switcher */}
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-['Outfit'] font-bold ${
            isHost 
              ? 'bg-[#1F5B73]/60 border-[#F4E022] text-[#F4E022]' 
              : 'bg-[#121822] border-[#222E3E] text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHost ? 'Session Host (Arbitration Active)' : 'Member View (Read Only)'}</span>
          </div>

          <button
            onClick={onToggleHostRole}
            className="px-2.5 py-1 rounded-xl bg-[#1A2534] hover:bg-[#223144] border border-[#2D4057] text-slate-300 hover:text-white text-[11px] font-['Outfit'] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Toggle between Host view and regular Player view"
          >
            {isHost ? (
              <>
                <ToggleRight className="w-4 h-4 text-[#F4E022]" />
                <span className="hidden sm:inline">Simulate Member</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Assume Host Role</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/components/SessionHostBanner.test.ts`
Expected: PASS

---

### Task 3: Host Arbitrary Queue Management in PaddleRack

**Files:**
- Modify: `src/components/PaddleRack.tsx`
- Modify: `src/App.tsx`
- Test: `src/utils/rackOperations.test.ts`
- Create: `src/utils/rackOperations.ts`

**Interfaces:**
- Consumes: `rackPlayers`, `isHost`
- Produces: `movePlayerInRack(players, fromIndex, toIndex)`, `insertPlayerAtPriorityDeck(players, player)`, `removePlayerFromRack(players, playerId)`

- [ ] **Step 1: Write failing unit tests for arbitrary rack queue operations**

```typescript
// src/utils/rackOperations.test.ts
import { describe, expect, it } from 'bun:test';
import {
  movePlayerInRack,
  insertPlayerAtPriorityDeck,
  removePlayerFromRack,
} from './rackOperations';
import { Player } from '../types';

describe('rackOperations', () => {
  const p1 = { id: 'p1', name: 'Player 1' } as Player;
  const p2 = { id: 'p2', name: 'Player 2' } as Player;
  const p3 = { id: 'p3', name: 'Player 3' } as Player;
  const p4 = { id: 'p4', name: 'Player 4' } as Player;
  const p5 = { id: 'p5', name: 'Player 5' } as Player;

  it('moves player arbitrarily to any slot', () => {
    const initial = [p1, p2, p3, p4, p5];
    const moved = movePlayerInRack(initial, 4, 0); // Move p5 to front (slot 1)
    expect(moved[0].id).toBe('p5');
    expect(moved[1].id).toBe('p1');
    expect(moved.length).toBe(5);
  });

  it('inserts player directly into priority deck (slot 1)', () => {
    const initial = [p1, p2, p3];
    const newPlayer = { id: 'p_vip', name: 'VIP Player' } as Player;
    const result = insertPlayerAtPriorityDeck(initial, newPlayer);
    expect(result[0].id).toBe('p_vip');
    expect(result.length).toBe(4);
  });

  it('removes specific player arbitrarily by host', () => {
    const initial = [p1, p2, p3];
    const result = removePlayerFromRack(initial, 'p2');
    expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/utils/rackOperations.test.ts`
Expected: FAIL with "Cannot find module './rackOperations'"

- [ ] **Step 3: Implement rackOperations and update PaddleRack UI**

Create `src/utils/rackOperations.ts`:
```typescript
import { Player } from '../types';

export function movePlayerInRack(
  players: Player[],
  fromIndex: number,
  toIndex: number
): Player[] {
  if (fromIndex < 0 || fromIndex >= players.length) return players;
  if (toIndex < 0 || toIndex >= players.length) return players;
  const result = [...players];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function insertPlayerAtPriorityDeck(
  players: Player[],
  player: Player
): Player[] {
  const filtered = players.filter((p) => p.id !== player.id);
  return [player, ...filtered];
}

export function removePlayerFromRack(
  players: Player[],
  playerId: string
): Player[] {
  return players.filter((p) => p.id !== playerId);
}
```

Update `src/components/PaddleRack.tsx`:
- Accept `isHost: boolean` and host handler props: `onMovePlayer(fromIdx, toIdx)`, `onHostRemovePlayer(playerId)`, `onHostForcePriority(playerId)`.
- When `isHost === true`, display host quick-actions on each paddle / lineup item (Move Left / Right buttons, "Promote to Slot 1", "Eject from Rack").
- Add a "Host Arbitrary Lineup Dispatch" button to launch custom match pairing.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/utils/rackOperations.test.ts`
Expected: PASS

---

### Task 4: Host Arbitrary Court Match Management & Score Overrides in CourtsView

**Files:**
- Modify: `src/components/CourtsView.tsx`
- Create: `src/components/HostCourtModal.tsx`
- Modify: `src/App.tsx`
- Test: `src/utils/courtOperations.test.ts`
- Create: `src/utils/courtOperations.ts`

**Interfaces:**
- Consumes: `Court`, `Player`, `isHost`
- Produces: `overrideCourtScore(court, scoreA, scoreB)`, `swapCourtPlayer(court, oldPlayerId, newPlayer)`, `setCourtGamePoint(court, targetScore)`, `forceEndCourtMatch(court, winnerTeam)`

- [ ] **Step 1: Write unit tests for court score adjustments and host overrides**

```typescript
// src/utils/courtOperations.test.ts
import { describe, expect, it } from 'bun:test';
import {
  overrideCourtScore,
  setCourtGamePoint,
  swapCourtPlayer,
  forceEndCourtMatch,
} from './courtOperations';
import { Court, Player } from '../types';

describe('courtOperations', () => {
  const pA1 = { id: 'a1', name: 'Player A1' } as Player;
  const pA2 = { id: 'a2', name: 'Player A2' } as Player;
  const pB1 = { id: 'b1', name: 'Player B1' } as Player;
  const pB2 = { id: 'b2', name: 'Player B2' } as Player;

  const mockCourt: Court = {
    id: 'court_1',
    name: 'Center Court',
    type: 'Center Court',
    status: 'in-progress',
    teamA: [pA1, pA2],
    teamB: [pB1, pB2],
    scoreA: 5,
    scoreB: 4,
    gamePoint: 11,
  };

  it('allows host to arbitrarily set custom score numbers', () => {
    const updated = overrideCourtScore(mockCourt, 10, 8);
    expect(updated.scoreA).toBe(10);
    expect(updated.scoreB).toBe(8);
  });

  it('allows host to change target game point to 15 or 21', () => {
    const updated = setCourtGamePoint(mockCourt, 15);
    expect(updated.gamePoint).toBe(15);
  });

  it('allows host to swap a player on court mid-match', () => {
    const subPlayer = { id: 'sub_1', name: 'Substitute Player' } as Player;
    const updated = swapCourtPlayer(mockCourt, 'a2', subPlayer);
    expect(updated.teamA.some((p) => p.id === 'sub_1')).toBe(true);
    expect(updated.teamA.some((p) => p.id === 'a2')).toBe(false);
  });

  it('allows host to force-conclude match with declared winner', () => {
    const ended = forceEndCourtMatch(mockCourt, 'A');
    expect(ended.scoreA).toBe(mockCourt.gamePoint);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun test src/utils/courtOperations.test.ts`
Expected: FAIL with "Cannot find module './courtOperations'"

- [ ] **Step 3: Implement courtOperations and HostCourtModal in CourtsView**

Create `src/utils/courtOperations.ts`:
```typescript
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
  return {
    ...court,
    teamB: court.teamB.map((p) => (p.id === oldPlayerId ? newPlayer : p)),
  };
}

export function forceEndCourtMatch(court: Court, winnerTeam: 'A' | 'B'): Court {
  return {
    ...court,
    scoreA: winnerTeam === 'A' ? court.gamePoint : Math.min(court.scoreA, court.gamePoint - 2),
    scoreB: winnerTeam === 'B' ? court.gamePoint : Math.min(court.scoreB, court.gamePoint - 2),
  };
}
```

Create `src/components/HostCourtModal.tsx` and integrate into `src/components/CourtsView.tsx`:
- Provide a "Host Manage Court" button on each court card when `isHost === true`.
- Modal enables the Host to:
  1. Manually adjust Score A and Score B via direct inputs or +/- step buttons.
  2. Change match format / target game points (11, 15, 21).
  3. Swap players with bench/rack members.
  4. Force-end or clear court with one click.

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test src/utils/courtOperations.test.ts`
Expected: PASS

---

### Task 5: Integration, Verification, and Build Validation

**Files:**
- Modify: `src/App.tsx`
- Verify all components and tests

- [ ] **Step 1: Wire all host handlers in `src/App.tsx`**
  - Integrate `schedule` state initialized with `INITIAL_SCHEDULE`.
  - Maintain `isHost` state derived from `isSessionHost(currentUser, schedule)`.
  - Wire `SessionHostBanner`, host rack manipulation handlers, and host court management handlers.

- [ ] **Step 2: Run all unit test suites**

Run: `bun test`
Expected: All tests PASS with 0 failures

- [ ] **Step 3: Run TypeScript compiler check**

Run: `bun run lint`
Expected: PASS with 0 errors

- [ ] **Step 4: Run Vite production build**

Run: `bun run build`
Expected: PASS with output generated in `dist/`
