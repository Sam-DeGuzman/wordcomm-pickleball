# ADR 002: Designated Player as Session Host with Arbitrary Match and Queue Management Authority

## Status
Accepted

## Context
During scheduled community pickleball sessions (3–5 hours), multiple courts operate simultaneously under a high-throughput paddle-rack queue rotation system. While automated FIFO queuing and DUPR matchmaking handle standard rotation, real-world community play requires human arbitration to handle player disputes, emergency substitutions, custom showcase matches, score corrections, and queue promotions/ejections. We needed to define who manages these operations on the ground and their exact authority boundary.

## Decision
1. **Designated Player as Host**: Every active `PlaySchedule` is assigned a designated registered `Player` (Member) as **`SessionHost`** (`hostPlayerId`). The Court Provider designates this host when configuring the schedule.
2. **Unilateral Arbitration Authority**: For the duration of that active schedule, the Session Host holds arbitrary override authority over:
   - **Queue Management**: Moving players arbitrarily in the paddle rack queue, promoting players directly to the Priority Deck (slot #1), or removing players from the queue.
   - **Match Dispatch**: Arbitrarily assigning and dispatching custom player pairings directly to any available court (bypassing automated FIFO dispatch).
   - **Live Score & Match Overrides**: Directly adjusting live match scores, changing target game points (11, 15, 21), substituting on-court players mid-game with bench players, and declaring match winners or resetting games.

## Why
1. **On-the-Ground Coordination**: A venue court provider cannot actively referee every simultaneous court; appointing a trusted club member as the session host delegates administrative authority effectively to the court floor.
2. **Dispute Resolution & Flexibility**: Disputed points, injuries, uneven player skill mismatches, and time-constrained matches need immediate, flexible human arbitration rather than rigid automation.
3. **Preserving Self-Service for Standard Members**: Standard members interact with automated FIFO queuing and live scoring transparently without needing administrative complexity, while the host acts as the arbitration fallback.

## Consequences
- The application UI must distinguish between Session Host mode and regular Member mode, providing administrative action overlays to the host.
- Domain operations (`rackOperations`, `courtOperations`, `hostPermissions`) must be pure and support both automated workflows and host overrides.
- Inactive or concluded schedules immediately revoke host arbitration capabilities.
