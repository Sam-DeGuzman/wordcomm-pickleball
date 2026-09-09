# 🏓 Wordcomm Pickleball

> **The next-generation community open-play management, FIFO paddle rack queuing, and live court arbitration platform.**

Wordcomm Pickleball is a high-performance web application designed for pickleball clubs, facilities, and open-play sessions. It streamlines court operations with physical FIFO paddle-rack emulation, DUPR-balanced matchmaking, live match scoreboards, and on-the-ground Session Host arbitration.

---

## 🚀 Key Features

### 1. ⏱️ Provider-Managed Play Sessions & Session Host Banner
- **Bounded Session Windows**: Automated 3–5 hour session windows managed by the Court Provider ([ADR 001](./docs/adrs/001-provider-managed-session-windows.md)).
- **Session Host Banner**: Real-time remaining session countdown, active court status, designated host badge, and an interactive **Host Role Switcher** (`Simulate Member` vs `Assume Host Role`) for effortless testing and previewing.

### 2. 🏸 Single Shared FIFO Paddle Rack
- **Priority Deck (Slots 1–4)**: Clear visual representation of the next 4 players queued for the next available court.
- **Physical Rack Rail & Lineup Views**: Dual viewing modes for checking queue positions and upcoming matchups.
- **Session Host Queue Arbitration**: Designated hosts can reorder players, jump a paddle to Slot 1 Priority Deck, or eject players ([ADR 002](./docs/adrs/002-session-host-arbitrary-court-and-queue-management.md), [ADR 003](./docs/adrs/003-single-shared-fifo-paddle-rack-multi-court.md)).

### 3. 🏟️ Live Court Operations & Score Tracking
- **Multi-Court Overview**: Center Court, Standard Courts, and Challenge Courts with visual net & kitchen layouts.
- **Host Court Arbitration Modal**:
  - Direct numeric score adjustment with rapid +/- point steppers.
  - Game Point format switching (11, 15, 21 pts).
  - Mid-game bench player substitutions.
  - One-click instant winner declaration with score margin clamping.

### 4. ⚖️ DUPR-Balanced Matchmaker & Gamification
- **DUPR Rating Balance**: Automatic skill balancing across teams to create competitive games.
- **XP, Levels, and Badges**: Level progression, win streaks, and custom paddle customizations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React
- **Build Tool**: Vite 6
- **Test Runner**: Bun Test (`bun test`)
- **Backend**: Express (Node.js/Bun) with Firebase JWKS authentication

---

## 🏁 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) (v18+)

### Installation

```bash
# Clone the repository
git clone git@github.com:Sam-DeGuzman/wordcomm-pickleball.git
cd wordcomm-pickleball

# Install dependencies
bun install   # or npm install
```

### Development Server

```bash
bun run dev   # or npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run all unit and integration tests
bun test

# Run TypeScript typecheck
bun run lint

# Build for production
bun run build
```

---

## 📚 Architecture & Domain Documentation

- **[Ubiquitous Language](./docs/UBIQUITOUS_LANGUAGE.md)**: Canonical definitions of terms like `SessionHost`, `PaddleRack`, `PlaySchedule`, and `Court`.
- **[Context Map](./docs/CONTEXT_MAP.md)**: Inter-relationships between Scheduling, Court Operations, and Player Identity.
- **[Bounded Contexts](./docs/contexts/)**:
  - [Scheduling & Venue](./docs/contexts/scheduling/CONTEXT.md)
  - [Court Operations & Matchmaking](./docs/contexts/court-operations/CONTEXT.md)
  - [Player Identity & Gamification](./docs/contexts/player-identity/CONTEXT.md)
- **[Architecture Decision Records (ADRs)](./docs/adrs/)**:
  - [ADR 001: Provider-Managed Fixed Session Windows (3–5 Hours)](./docs/adrs/001-provider-managed-session-windows.md)
  - [ADR 002: Designated Player as Session Host with Arbitrary Match and Queue Management Authority](./docs/adrs/002-session-host-arbitrary-court-and-queue-management.md)
  - [ADR 003: Single Shared FIFO Paddle Rack for Multi-Court Open Play Sessions](./docs/adrs/003-single-shared-fifo-paddle-rack-multi-court.md)
- **[Agent & Developer Guidelines](./AGENTS.md)**: Standards and conventions for working on this codebase.

---

## 📄 License

MIT © Wordcomm Pickleball
