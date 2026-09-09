# ADR 001: Provider-Managed Fixed Session Windows (3–5 Hours) for Court Access

## Status
Accepted

## Context
Community pickleball play requires coordinating shared court access, paddle rack queueing, and matchmaking among multiple players at venue facilities. We needed to define how courts are scheduled and made available for play.

## Decision
Court access and matchmaking operations are strictly gated by **Provider-Managed Fixed Sessions (lasting 3–5 hours)** rather than individual player-level hourly bookings. The Court Provider has sole authority over scheduling, opening, and closing these play windows.

## Why
1. **Community Open-Play Model**: Wordcomm operates on a high-throughput paddle-rack queue rotation system within designated community play blocks, rather than private 1-hour court reservations.
2. **Facility Constraints**: Court providers lease facilities in dedicated multi-hour blocks (3–5 hours). Enforcing strict provider-managed boundaries prevents out-of-window gameplay and maintains facility compliance.

## Consequences
- Matchmaking, paddle rack queuing, and live court dispatching are active only during an open `PlaySession`.
- Individual players cannot create ad-hoc court reservations; they check into provider-scheduled sessions.
