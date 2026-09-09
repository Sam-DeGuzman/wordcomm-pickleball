# Context: Player & Identity (Host Tooling Phase)

## Purpose
Governs player profiles, nickname identification, skill benchmarking (DUPR ratings and tiers), and visual paddle representation managed directly by the Session Host.

> **Phase Notice: Host Tooling Focus**
> In this phase, player accounts, self-service check-in, and gamification progression (XP, levels, badges, quests, streak tracking) are **parked**. The host directly provisions and manages paddle profiles for participants in the session roster.

---

## Ubiquitous Language & Core Entities

### `Player` / `PaddleProfile`
The core participant representation in a host-managed session.
- **Attributes**:
  - `id`: string (unique identifier)
  - `nickname`: string (host-facing / display name)
  - `duprRating`: number (e.g. 3.50, range 1.00 – 8.00)
  - `skillTier`: `'Novice' | 'Intermediate' | 'Advanced' | 'Pro'` (derived from or assigned alongside DUPR rating)
  - `paddleColor`: string (hex color or preset accent for quick rack / court visual identification)
  - `avatarUrl`?: string (optional avatar or generated initials badge)

### `SkillTier` Mapping & Dual-Precision Presets
Standardized skill classification synchronized with DUPR rating ranges:
- **Novice**: `< 3.0` (Default preset: `2.50`)
- **Intermediate**: `3.0 – 3.99` (Default preset: `3.50`)
- **Advanced**: `4.0 – 4.99` (Default preset: `4.50`)
- **Pro**: `5.0+` (Default preset: `5.50`)

### `SessionRoster`
The complete pool of active participant paddle profiles participating in a given session, whether currently in the rack queue, on a court, or resting.
- **Attributes**: `sessionId`: string, `players`: `Player[]`
- **Host Operations**:
  - Add walk-in player (specifying nickname, DUPR/tier, paddle color).
  - Edit player nickname, DUPR rating, or paddle color.
  - Quick-enqueue player into the paddle rack.
  - Remove player from roster.

### `PaddleColorPalette`
A curated high-contrast palette of solid colors for instantaneous visual differentiation on the digital rack and physical courts:
- Volt Yellow (`#F4E022`)
- Vibrant Coral / Orange (`#E07137`)
- Cyan Blue (`#06B6D4`)
- Emerald Green (`#10B981`)
- Electric Pink (`#EC4899`)
- Royal Purple (`#8B5CF6`)
- Slate Black (`#334155`)
- Crimson Red (`#EF4444`)

---


## Parked Domain Concepts (Reserved for Future Reactivation)
The following domain entities and attributes are parked in the host-tooling phase and must not clutter the host operational workflows:
- **Progression**: `level`, `xp`, `xpToNextLevel`, `streakDays`
- **Gamification**: `Badge`, `Quest` (daily/weekly missions)
- **Deep Gear Customization**: Multi-layer paddle textures (`surfaceFinish`, `pattern`, `edgeGuardColor`, `paddleBrandName`)
- **Self-Service Actions**: Player self-check-in / personal account management

---

## Domain Invariants

1. **Host-Managed Lifecycle**: Paddle profiles are created, edited, and removed directly by the Session Host without requiring downstream player account authentication.
2. **DUPR & Skill Tier Alignment**: Every paddle profile must carry a valid DUPR rating or default to Novice baseline (e.g., `2.50` / `Novice`) to support balanced match dispatching.
3. **Rack Ready**: A paddle profile must have a valid nickname and paddle color indicator before it can be enqueued into the `PaddleRack`.
