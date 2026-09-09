# AGENTS.md — Agent & Developer Guidelines

Welcome to **Wordcomm Pickleball**. This document defines the engineering standards, architecture rules, domain boundaries, and testing workflows for AI coding agents and developers working in this repository.

---

## 1. Project Overview & Tech Stack

Wordcomm Pickleball is a high-performance community open-play management web application designed for pickleball clubs, facilities, and tournament organizers. It manages scheduled open-play sessions, shared FIFO paddle rack rotation, live court scoring, DUPR matchmaking, and session host arbitration.

### Core Stack:
- **Framework**: React 19 + TypeScript (strict mode)
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS v4 (Wordcomm dark theme palette: `#0B0E14`, `#101A26`, `#1F5B73`, `#F4E022`, `#E07137`)
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Test Runner**: Bun Test (`bun test`)
- **Type Checking**: TypeScript Compiler (`bun run lint` / `tsc --noEmit`)

---

## 2. Domain-Driven Design & Bounded Contexts

Always adhere strictly to the project's **Ubiquitous Language** and **Bounded Contexts** before writing or modifying domain logic:

- **Ubiquitous Language**: [`docs/UBIQUITOUS_LANGUAGE.md`](./docs/UBIQUITOUS_LANGUAGE.md)
- **Context Map**: [`docs/CONTEXT_MAP.md`](./docs/CONTEXT_MAP.md)
- **Scheduling Context**: [`docs/contexts/scheduling/CONTEXT.md`](./docs/contexts/scheduling/CONTEXT.md)
- **Court Operations Context**: [`docs/contexts/court-operations/CONTEXT.md`](./docs/contexts/court-operations/CONTEXT.md)
- **Player Identity Context**: [`docs/contexts/player-identity/CONTEXT.md`](./docs/contexts/player-identity/CONTEXT.md)

### Key Domain Rules:
1. **Provider-Managed Fixed Sessions (3–5 Hours)**: All court play occurs inside fixed session blocks created by the Court Provider. Individual hourly bookings are not permitted ([ADR 001](./docs/adrs/001-provider-managed-session-windows.md)).
2. **Session Host Arbitration**: Every active schedule has a designated registered `Player` as `SessionHost` (`hostPlayerId`) who holds arbitrary authority to reorder the rack queue, dispatch custom matches, override live scores, and substitute players ([ADR 002](./docs/adrs/002-session-host-arbitrary-court-and-queue-management.md)).
3. **Single Shared FIFO Paddle Rack**: One global queue serves all allocated courts in an open-play session. When any court frees up, slots 1–4 are dispatched ([ADR 003](./docs/adrs/003-single-shared-fifo-paddle-rack-multi-court.md)).

---

## 3. Architecture Decision Records (ADRs)

Consult `docs/adrs/` when making architectural choices:
- [`001-provider-managed-session-windows.md`](./docs/adrs/001-provider-managed-session-windows.md): Provider-managed 3–5 hr session blocks.
- [`002-session-host-arbitrary-court-and-queue-management.md`](./docs/adrs/002-session-host-arbitrary-court-and-queue-management.md): Session Host identity and override powers.
- [`003-single-shared-fifo-paddle-rack-multi-court.md`](./docs/adrs/003-single-shared-fifo-paddle-rack-multi-court.md): Single shared FIFO paddle queue across all session courts.

---

## 4. Code Standards & Best Practices

### A. Separation of Concerns & Pure Functions
- **Pure Domain Operations**: Place business logic, queue algorithms, score calculations, and permission checks in `src/utils/` as pure, exported functions (e.g., `rackOperations.ts`, `courtOperations.ts`, `hostPermissions.ts`).
- **React Components**: Keep UI components clean and focused on rendering and user interaction, delegating domain calculations to pure utilities.

### B. Immutability
- Never mutate state in place (e.g. `array.splice` without copying first). Always return fresh arrays/objects (`[...array]`, `array.filter(...)`, `array.map(...)`).

### C. Test-Driven Development (TDD)
- When adding domain functions or bug fixes, write failing unit tests first in `*.test.ts`.
- Run tests via `bun test` and ensure 100% pass rate before modifying UI components.

---

## 5. Standard Verification Commands

Before completing any task or committing changes, run the following three checks:

```bash
# 1. Run all unit and integration tests
bun test

# 2. Typecheck with TypeScript
bun run lint

# 3. Production build
bun run build
```

---

## 6. Directory Structure

```
├── .agents/                 # Agent skill definitions
├── docs/
│   ├── adrs/                # Architecture Decision Records
│   ├── contexts/            # Bounded Context documentation
│   ├── superpowers/         # Feature specifications and plans
│   ├── CONTEXT_MAP.md       # Bounded context relationships
│   └── UBIQUITOUS_LANGUAGE.md # Canonical terminology
├── src/
│   ├── components/          # React UI components
│   ├── data/                # Initial sample state & models
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Pure domain utilities & unit tests
│   ├── types.ts             # TypeScript domain interfaces
│   ├── App.tsx              # Main application root
│   └── AppIntegration.test.ts # End-to-end integration tests
└── server/                  # Backend endpoints & auth middlewares
```
