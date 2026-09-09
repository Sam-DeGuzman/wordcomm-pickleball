# Context: Scheduling & Venue Management

## Purpose
Governs the physical facility access, provider-level court bookings, and community session timeframes.

---

## Ubiquitous Language & Core Entities

### `CourtProvider`
The organization or facility administrator controlling the venue and courts.
- **Attributes**: `id`, `name`, `contactInfo`, `venueAddress`, `operatingRules`.
- **Role**: Sole authority on creating, modifying, and enforcing court rental windows.

### `CourtRental` / `PlaySchedule` (`PlaySession`)
A bounded time window dedicated to community pickleball play.
- **Attributes**:
  - `id`: Unique identifier
  - `providerId`: ID of managing Court Provider
  - `hostPlayerId`: Player ID of the designated Session Host
  - `allocatedCourtIds`: Array of Court IDs reserved for this session
  - `startTime`: Timestamp (ISO string or unix epoch)
  - `endTime`: Timestamp (ISO string or unix epoch)
  - `durationHours`: Number bounded between 3 and 5 hours
  - `status`: `'scheduled' | 'active' | 'completed' | 'cancelled'`
  - `maxCapacity`: Optional maximum number of players permitted

---

## Domain Invariants

1. **Strict Duration Range**: Community play sessions are strictly bounded to **3 to 5 hours**. Sessions outside this window violate provider constraints.
2. **Provider Authority**: Players cannot unilaterally schedule or extend court time; all sessions are managed strictly by the Court Provider.
3. **Session Host Assignment**: Every `PlaySchedule` must have a designated `hostPlayerId` (a valid registered Player) assigned by the Court Provider / scheduling admin prior to becoming `'active'`.
4. **Queue & Court Gating**: Matchmaking and Paddle Rack operations are active only when an associated `CourtRental` status is `'active'`.

---

## Architectural Decisions
- [ADR 001: Provider-Managed Fixed Session Windows (3–5 Hours) for Court Access](../../adrs/001-provider-managed-session-windows.md)

