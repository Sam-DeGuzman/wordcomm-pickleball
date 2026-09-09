# ADR 003: Single Shared FIFO Paddle Rack for Multi-Court Open Play Sessions

## Status
Accepted

## Context
In open-play pickleball facilities with multiple allocated courts (e.g. 4+ courts), we evaluated whether to maintain a dedicated paddle queue per individual court or a single shared FIFO queue across all session courts.

## Decision
All courts allocated to an active `PlaySchedule` are served by a **single shared FIFO Paddle Rack queue**.
- When any allocated court transitions to `available`, the top 4 players from the priority deck (slots 1–4) of the shared rack queue are dispatched onto that court (Team Alpha: slots 1 & 2; Team Bravo: slots 3 & 4).
- Players place their paddle at the end of the single shared queue upon arrival or after completing a match.

## Why
1. **Equal Wait Times & High Throughput**: A single shared queue guarantees fair rotation and maximum court utilization across the facility; fast-finishing courts do not sit idle while a separate per-court queue backs up.
2. **True to Real-World Open Play**: Standard pickleball community open play utilizes one physical rack rail for all open courts.
3. **Simpler Mental Model**: Players check their overall position in line rather than guessing which individual court line will move fastest.

## Consequences
- The Paddle Rack represents the global session queue, not court-specific sub-queues.
- The Session Host can reorder this single global queue or pull specific players for custom court matches as needed.
