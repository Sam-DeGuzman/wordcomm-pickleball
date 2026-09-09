# Context: Court Operations & Matchmaking

## Purpose
Governs real-time court utilization, live score tracking, FIFO paddle rack queuing, match dispatching, and session host arbitration.

---

## Ubiquitous Language & Core Entities

### `Court`
A physical pickleball playing area with live status and assigned player lineups.
- **Attributes**:
  - `id`: string
  - `name`: string (e.g., 'Center Court', 'Standard Court 1')
  - `type`: `'Center Court' | 'Standard Court' | 'Challenge Court'`
  - `status`: `'available' | 'in-progress' | 'finishing'`
  - `teamA`: `Player[]`
  - `teamB`: `Player[]`
  - `scoreA`: number
  - `scoreB`: number
  - `gamePoint`: number (default 11)
  - `timeStarted`?: number (timestamp)

### `PaddleRack` / `PaddleRackQueue`
A single shared FIFO queue per session serving all allocated courts in the active schedule.
- **Queue Mechanics**:
  - Waiting players place customized paddles in linear slots.
  - Slots 1–4 are designated as **Priority Deck** (Court Ready).
  - Slots 1 & 2 form Team Alpha; Slots 3 & 4 form Team Bravo.
  - When *any* allocated court becomes `'available'`, the top 4 paddles are dispatched and remaining queued players advance.

### `SessionHost` Operations
The assigned host for the active `PlaySchedule` holds arbitrary operational authority:
- **Queue Arbitration**: Can reorder, insert, or pull paddles from the rack.
- **Arbitrary Match Dispatch**: Can bypass FIFO to assemble custom pairings (2v2 or 1v1) and force-dispatch to any designated court.
- **Score Management & Correction**: Can increment points, correct score miscounts, override game points, and officially record/award XP.
- **Court Reset / Termination**: Can terminate or reset court matches mid-game.

---

## Domain Invariants

1. **Active Session Prerequisite**: Court matches and rack queuing can only operate when the parent `PlaySchedule` is in `'active'` status.
2. **Shared Central Queue**: One central rack queue feeds all available courts in the session by default.
3. **Host Override Supremacy**: Automated FIFO dispatch and self-service player actions can be arbitrarily overridden, corrected, or canceled at any time by the designated `SessionHost`.
4. **Standard Match Victory**: By default, matches conclude when a team reaches `gamePoint` (typically 11) with a minimum 2-point margin, after which the host or players can record the match.
