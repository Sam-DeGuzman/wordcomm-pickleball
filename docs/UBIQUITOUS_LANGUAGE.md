# Ubiquitous Language

This glossary establishes the canonical domain vocabulary for **Wordcomm Pickleball**. All code, conversations, and documentation must adhere to these terms.

---

## 1. Scheduling & Venue Management

### **Court Provider**
*The venue operator, facility management, or club host that owns/leases physical pickleball courts and dictates venue availability.*
- **Invariants**: Strictly controls available operational windows, pricing, and court allocation. Players and community organizers cannot arbitrarily create or extend court time outside the provider's authorized window.

### **Court Rental / Play Session (`PlaySession` / `CourtSchedule`)**
*A designated community play time block lasting between 3 to 5 hours, booked or authorized through the Court Provider.*
- **Scope**: During a Court Rental window, community members can check in, enqueue in the paddle rack, and play matches on allocated courts.
- **Invariants**:
  - Duration is bounded strictly (typically 3–5 hours).
  - Managed and enforced strictly by the Court Provider.
  - Controls the operational state of associated courts (e.g. courts are only active for club matches during an active session).
  - Every active schedule is assigned exactly one primary **Session Host**.

### **Session Host (`SessionHost`)**
*A designated registered Player (Member) assigned to direct and moderate a specific `PlaySession` / `CourtSchedule`.*
- **Scope**: Elevated operational control over court matches, rack dispatching, and score tracking during that session's active window.
- **Invariants**:
  - Must be an active registered `Player`.
  - Authority is active strictly within their assigned `PlaySession` duration.
  - Can manually override rack dispatch, adjust court match lineups, and input/correct match scores.

---

## 2. Court & Match Operations

### **Court**
*A physical pickleball playing area (e.g., Center Court, Standard Court, Challenge Court) with net and Non-Volley Zone (NVZ / Kitchen).*
- **States**: `available` (open for next queued match), `in-progress` (live match currently underway), `finishing` (game point / match concluding).
- **Types**: `Center Court` (high-visibility/live broadcast), `Standard Court` (regular club play), `Challenge Court` (king-of-the-hill / winner stays).

### **Paddle Rack (`PaddleStack` / `RackQueue`)**
*The physical/digital FIFO queue where players place their customized paddles to reserve their spot for the next available court.*
- **Dispatch**: When a court frees up, the next 4 (doubles) or 2 (singles) paddles are called and dispatched to that court.

### **Match (`MatchmakingMatch`)**
*A game played to a target score (e.g., 11 points, win by 2) between Team A and Team B in singles (1v1) or doubles (2v2) format.*

---

## 3. Player & Progression

### **Player / Member**
*A registered club member holding a DUPR rating, skill tier, progression level, and customized paddle.*

### **DUPR Rating**
*Dynamic Universal Pickleball Rating (e.g., 3.84) used for skill benchmarking, matchmaking balance, and club ranking.*

### **Skill Tier**
*Categorical grouping based on rating:* `Novice`, `Intermediate`, `Advanced`, `Pro`.

### **Paddle Configuration (`PaddleConfig`)**
*The personalized equipment specs of a player's paddle (face color, grip wrap, edge guard, pattern, surface texture).*
