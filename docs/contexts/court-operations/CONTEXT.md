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
  - `gamePoint`: number (default **12**, configured by parent `SessionRoom`)
  - `timeStarted`?: number (timestamp)

### `PaddleRack` / `PaddleRackQueue`
A single shared FIFO queue per session serving all allocated courts in the active schedule.
- **Queue Mechanics**:
  - Waiting players place customized paddles in linear slots.
  - Slots 1–4 are designated as **Priority Deck** (Court Ready).
  - Slots 1 & 2 form Team Alpha; Slots 3 & 4 form Team Bravo.
  - When *any* allocated court becomes `'available'`, the top 4 paddles are dispatched and remaining queued players advance.

### `RestingRoster`
The set of registered session participants who are not currently enqueued in the `PaddleRack` or active on a `Court`.
- **States & Transitions**:
  - `resting`: Player is in the resting roster (taking a break, observing, or between rotations).
  - `queued`: Player has their paddle positioned in a slot in the `PaddleRack`.
  - `on-court`: Player is actively playing in an in-progress match on a designated `Court`.
- **Operations**:
  - Host can transition a player from `resting` -> `queued` (enqueue into rack).
  - Host can pull a player from `queued` -> `resting` (remove paddle from rack).

### `SessionHost` Operations
The assigned host for the active `SessionRoom` holds arbitrary operational authority:
- **Queue Arbitration**: Can reorder, insert, or pull paddles from the rack to the resting roster.
- **Arbitrary Match Dispatch**: Can bypass FIFO to assemble custom pairings (2v2 or 1v1) and force-dispatch to any designated court.
- **Score Management & Correction**: Can increment points, correct score miscounts, override game points, and record official results.
- **Match Conclusion & Re-Queue Flow**: Upon match completion, players automatically rotate to the tail of the `PaddleRack` unless flagged by the host to return to the `RestingRoster`.
- **Court Reset / Termination**: Can terminate or reset court matches mid-game.

---

## Domain Invariants

1. **Active Configured Room Prerequisite**: Court matches and rack queuing can only operate when the parent `SessionRoom` is in `'active'` / configured status.
2. **Shared Central Queue**: One central rack queue feeds all available courts in the session by default.
3. **Participant State Mutex**: A participant can only occupy exactly one state at any given instant: `resting`, `queued` (in a single slot), or `on-court` (on a single court).
4. **Post-Match Rotation & Rest Policy**: Concluding a match automatically re-enqueues participating paddles to the back of the `PaddleRack` in FIFO order, with an explicit host option to transition designated players to `resting`.
5. **Host Override Supremacy**: Automated FIFO dispatch and queue movements can be arbitrarily overridden, corrected, or canceled at any time by the designated `SessionHost`.
6. **Standard Match Victory**: By default, matches conclude when a team reaches `gamePoint` (**12 points** by default) with a minimum 2-point margin, after which the host records the final score.


