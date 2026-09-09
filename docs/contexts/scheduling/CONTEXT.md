# Context: Scheduling & Venue Management

## Purpose
Governs the physical facility access, provider-level court bookings, and community session timeframes.

---

## Ubiquitous Language & Core Entities

### `CourtProvider`
The organization or facility administrator controlling the venue and courts.
- **Attributes**: `id`, `name`, `contactInfo`, `venueAddress`, `operatingRules`.
- **Role**: Sole authority on creating, modifying, and enforcing court rental windows.

### `SessionRoom` (`PlaySessionRoom` / `CourtRental`)
The operational room container for an open-play pickleball session. All management tooling requires an active, configured room.
- **Attributes**:
  - `id`: string
  - `providerName`: string (Court Provider / Venue operator name)
  - `location`: string (physical venue address / court facility)
  - `date`: string (session date, e.g. `YYYY-MM-DD`)
  - `startTime`: string (rental start time, e.g. `18:00`)
  - `endTime`: string (rental end time, e.g. `21:00` or 3–5 hour window)
  - `courtCount`: number / `allocatedCourts`: `Court[]` (physical courts reserved for the room)
  - `winningScore`: number (target game score for matches, **defaults to 12**)
  - `status`: `'unconfigured' | 'scheduled' | 'active' | 'completed'`
  - `hostId`: string (designated host)

---

## Domain Invariants

1. **Room Configuration Gating**: All host management features (`SessionRoster`, `PaddleRack`, `CourtsView`, `Matchmaker`) are strictly gated and inaccessible until a `SessionRoom` is scheduled and configured.
2. **Strict Duration Range**: Community play sessions are strictly bounded to **3 to 5 hours** per provider window.
3. **Winning Score Default**: The default winning target score for courts within a configured room is **12 points** (with minimum 2-point win margin).
4. **Provider & Location Binding**: A room must explicitly record the Court Provider name and physical venue location upon scheduling.


---

## Architectural Decisions
- [ADR 001: Provider-Managed Fixed Session Windows (3–5 Hours) for Court Access](../../adrs/001-provider-managed-session-windows.md)
- [ADR 004: Session Room Gating and Mandatory Initial Configuration](../../adrs/004-session-room-gating-and-configuration.md)


