# ADR 004: Session Room Gating and Mandatory Initial Configuration

## Status
Accepted

## Context
In the host tooling release, all operational features (Session Roster management, FIFO Paddle Rack enqueuing, live Court scorekeeping, and Matchmaking dispatch) need a clear domain boundary and initialization lifecycle. Without a configured session room, running live matches and managing queues lacks venue context, court counts, and scoring parameters.

## Decision
All host management tooling is **strictly gated behind an active, configured Session Room (`SessionRoom`)**. The Host must schedule and configure the room with:
1. Court Provider Name
2. Physical Location / Address
3. Date & Rental Time Window (3–5 hours)
4. Allocated Court Count
5. Target Winning Score (defaults to **12 points**, with 2-point win margin)

Until the room is configured and started, management views display a Room Setup wizard / status gate.

## Why
1. **Operational Completeness**: Match dispatching and court scorekeeping require known court quantities and winning score rules upfront.
2. **Venue Compliance**: Recording the provider, location, and rental duration ensures accurate auditability and prevents unmanaged phantom matches.
3. **Scoring Consistency**: Defaulting winning score to 12 points establishes standard club session game lengths across all allocated courts.

## Consequences
- The application root or host workspace checks if an active `SessionRoom` exists; if not, it prompts the host to configure or schedule one before unlocking operational tabs.
- Default `gamePoint` across all match instances is initialized to 12 (derived from the room configuration).
