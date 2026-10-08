# Product Requirements Document (PRD)

## Chesswise — Personalized AI Chess Coach & Tactical Mastery Engine

**Document ID:** PRD-CW-01  
**Version:** 1.0  
**Status:** Ready for Review  
**Date:** 2026-10-08  
**Track:** Generative AI & Full Stack Development

---

## 1. Product Vision

> Build the most personalized, grounded, and observable AI chess coaching platform in the digital chess ecosystem — one that translates every player's real game blunders into structured diagnostic intelligence, plain-English coaching explanations, and a closed-loop spaced-repetition training regimen that systematically cures weaknesses.

---

## 2. Product Goals

| Goal                               | Description                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Evidence-Grounded Coaching**     | Stockfish evaluations and deterministic tactic classifiers serve as immutable ground truth; LLM explanations never hallucinate chess moves or eval scores |
| **Personalized Training Loop**     | Every puzzle, drill, and training session is dynamically generated from the player's own historical mistakes rather than static curated databases         |
| **Algorithmic Accuracy**           | Tactical motifs (forks, pins, skewers, back-rank mates) are identified mathematically through deterministic board-state analysis before AI generation     |
| **High Reliability & Scalability** | Decouple client-side play (WASM engine) from deep server-side analysis via BullMQ + Redis job queues with zero single-point-of-failure                    |
| **Longitudinal Skill Tracking**    | Dynamically update a multidimensional skill radar vector (Tactics, Openings, Middlegame, Endgames) after every analyzed game                              |
| **Auditability & Human Agency**    | Retain an immutable audit trail of prompt versions, engine depths, and allow coaches and players to override recommendations with permanent reasoning     |

---

## 3. Features

### Feature Priority (MoSCoW)

#### Must Have

| Feature ID | Feature                                   | Description                                                                                                           |
| ---------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| F-001      | User Authentication & Profile Persistence | Secure email/password and Google OAuth authentication with persistent sessions via Supabase and PostgreSQL            |
| F-002      | Interactive 2D & 3D Chessboard            | Interactive chessboard supporting moves, legal move highlights, undo/flip, sound effects, and 2D/3D visual modes      |
| F-003      | Multi-Platform Game Import                | Ingest games via manual PGN paste, file upload, or automated API fetch from Chess.com and Lichess archives            |
| F-004      | Asynchronous Stockfish Analysis Pipeline  | Server-side deep game analysis executed asynchronously through BullMQ and Redis queues                                |
| F-005      | Deterministic Tactic Classifier           | Algorithmic detection of exact tactical motifs (fork, pin, skewer, discovered attack, hanging piece) from engine data |
| F-006      | Move Quality & Annotation Classification  | Classify every move using standard chess annotation glyphs (`!!`, `!`, `!?`, `?!`, `?`, `??`) based on centipawn loss |
| F-007      | Interactive Game Report UI                | Full breakdown showing overall and phase-based accuracy, eval-swing timeline graph, and move-by-move cards            |
| F-008      | Grounded AI Mistake Explanations          | Zod-validated LLM explanations translating structured engine output into clear conversational coaching                |
| F-009      | Personalized Blunder Puzzle Generator     | Dynamically construct playable tactical puzzles directly from the player's own analyzed blunders                      |
| F-010      | Spaced-Repetition Scheduling (SM-2)       | SuperMemo-2 algorithm scheduling reviews based on individual puzzle solve performance                                 |
| F-011      | Tactical Skill Radar Profile              | Dynamic multi-axis radar chart measuring proficiency across opening, tactics, calculation, and endgames               |
| F-012      | Daily Training Queue                      | Personalized daily workout queue surfacing due spaced-repetition puzzles and weakest-skill drills                     |
| F-013      | Production Sound Effects                  | High-fidelity chess sound effects for normal moves, captures, checks, game completion, and alerts                     |
| F-014      | Audit Trail & Decision Logging            | Immutable logging of analysis parameters, model versions, prompt templates, and user overrides                        |

#### Should Have

| Feature ID | Feature                               | Description                                                                                                    |
| ---------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| F-015      | Game-Scoped AI Coach Chat             | Conversational interface grounded strictly in the current game's engine evaluations and move history           |
| F-016      | Global Historical RAG Coach Chat      | Vector-indexed retrieval (pgvector) answering broad questions across a player's complete game archive          |
| F-017      | Interactive "What-If" Branch Explorer | Sandbox board allowing players to explore alternative lines with live engine evaluation                        |
| F-018      | Live Whisper Coach                    | Contextual, non-intrusive coaching hints offered during unrated practice games against AI                      |
| F-019      | Opening Repertoire Builder & Guardian | Repertoire tree manager that identifies and alerts players at the exact move they deviate from known lines     |
| F-020      | Mirror Bot Opponent                   | Customized AI bot configured to simulate the player's specific tactical blind spots and blunder tendencies     |
| F-021      | Coach & Team Management Dashboard     | Coach portal to inspect student skill profiles, view recent blunders, and assign targeted homework puzzle sets |
| F-022      | Gamification & Progression System     | XP rewards, level progression, daily training streaks, and tactical mastery achievement badges                 |

#### Could Have

| Feature ID | Feature                              | Description                                                                                         |
| ---------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| F-023      | Real-Time Peer Sparring              | WebSocket-based live matchmaking for unrated peer-to-peer training matches                          |
| F-024      | Tournament Opponent Scouting Reports | Aggregate statistical breakdown and weakness report generated from an opponent's public PGN history |
| F-025      | Audio Voice-Narrated Game Recaps     | Text-to-speech audio narration summarizing pivotal turning points in an analyzed game               |
| F-026      | OTB Scoresheet Photo Ingestion       | Computer vision pipeline converting physical handwritten scoresheet photos into digital PGNs        |
| F-027      | Subscription Billing (Dodo Payments) | Tiered subscription billing infrastructure supporting Free, Plus, Pro, and Coach plans              |

#### Won't Have (MVP)

| Feature ID | Feature                                     | Description                                                                           |
| ---------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| F-028      | Native iOS / Android Applications           | Mobile apps planned for v2; MVP is fully responsive web                               |
| F-029      | Live Webcam Physical Board Tracking         | Computer vision tracking of live over-the-board physical chess sets                   |
| F-030      | Self-Hosted Stockfish Kubernetes Cluster    | Multi-node autoscaling cluster; MVP uses dedicated worker processes with Redis queues |
| F-031      | Blockchain / Web3 Tournament Certifications | Out of scope for core educational coaching product                                    |

---

## 4. User Stories

### Epic 1: Player Authentication & Game Ingestion

**US-001**

```
As a chess player,
I want to create an account and authenticate securely via email or Google OAuth,
so that my game history, skill radar, and training progress are permanently saved.
```

**Acceptance Criteria:**

- [ ] User can sign up and log in via email/password or one-click Google OAuth
- [ ] Authentication session tokens persist across browser refreshes via secure HTTP-only cookies
- [ ] Database automatically provisions a synchronized user profile record upon initial Supabase sign-in
- [ ] Unauthenticated users attempting to access protected dashboard routes are redirected to `/login`

---

**US-002**

```
As a chess player,
I want to play practice games against an engine with selectable difficulty levels in 2D or 3D,
so that I can test my skills in an engaging, production-grade interface.
```

**Acceptance Criteria:**

- [ ] Board renders in both 2D SVG mode and interactive 3D WebGL mode with rank and file labels
- [ ] Player can select difficulty tiers (Beginner ~600, Casual ~900, Club ~1400, Advanced ~1800, Master ~2200)
- [ ] Legal move dots, piece animations, turn indicators, and sound effects execute with zero perceived lag (< 50ms)
- [ ] Game conclusion states (checkmate, stalemate, draw) are detected immediately and surface an "Analyze Game" prompt

---

**US-003**

```
As a player,
I want to import games by uploading PGN files, pasting PGN text, or fetching my Chess.com / Lichess archives,
so that I can study my real competitive match history without manual data entry.
```

**Acceptance Criteria:**

- [ ] PGN parser validates headers and move syntax, returning clear error messages for corrupted files
- [ ] Username fetch queries official Chess.com and Lichess public APIs, retrieving up to 20 recent games
- [ ] Games from monthly archives are ordered reverse-chronologically so the most recent matches import first
- [ ] Imported games automatically appear in the user's "My Games" tab with status indicators

---

### Epic 2: Engine Analysis & Deterministic Diagnostics

**US-004**

```
As a player,
I want my games analyzed asynchronously by Stockfish without freezing my browser,
so that every move receives centipawn evaluations and win-rate probabilities.
```

**Acceptance Criteria:**

- [ ] Game analysis job is enqueued to BullMQ and processed by dedicated background workers
- [ ] If Redis is unreachable, the API gracefully stores the game in `QUEUED` state without timing out
- [ ] Engine evaluates every ply to a minimum depth of 16 (Free tier) or depth 20+ (Pro tier)
- [ ] Overall accuracy percentage and phase-split accuracy (Opening, Middlegame, Endgame) are computed

---

**US-005**

```
As a player,
I want each missed opportunity to be deterministically tagged with its exact tactical motif,
so that my mistakes are categorized accurately without AI hallucination.
```

**Acceptance Criteria:**

- [ ] Tactic classifier mathematically identifies motifs (fork, pin, skewer, discovered attack, hanging piece, back-rank)
- [ ] Classification relies exclusively on board geometry and move differentials, verified against automated test suites
- [ ] Every move is labeled with standard annotation glyphs (`!!`, `!`, `!?`, `?!`, `?`, `??`) based on centipawn loss
- [ ] Tactic tags and best-move alternatives are stored directly in the structured game report

---

**US-006**

```
As a player,
I want an interactive game report screen featuring an evaluation swing graph and move list,
so that I can visually pinpoint exactly where the game swung out of my favor.
```

**Acceptance Criteria:**

- [ ] Evaluation graph plots centipawn advantage across all plies with smooth visual transitions
- [ ] Clicking any move in the move list or eval graph jumps the interactive board directly to that position
- [ ] Mistake and blunder cards clearly show the played move, the missed best move, and the associated evaluation delta
- [ ] Board coordinates, piece captures, and annotation badges match the Study-Lamp design system tokens

---

### Epic 3: Grounded AI Explanations & Coach Chat

**US-007**

```
As a player,
I want plain-language explanations of my mistakes that cite verified engine facts,
so that I understand the strategic "why" behind the numbers without invented variations.
```

**Acceptance Criteria:**

- [ ] LLM explanation prompt receives structured JSON input (eval delta, missed line, tactic tag)
- [ ] LLM output is strictly validated against a typed Zod schema prior to database persistence
- [ ] Explanation explicitly weaves the deterministic tactic label into the prose
- [ ] Automated regression tests verify that no chess moves or scores appear in prose that were not in source JSON

---

**US-008**

```
As a player,
I want to ask conversational questions to an AI coach grounded in my specific game,
so that I can clarify complex positions and explore alternative candidate plans.
```

**Acceptance Criteria:**

- [ ] Chat panel maintains conversation context bounded to the currently viewed game report
- [ ] Coach cites specific move numbers and piece coordinates when explaining concepts
- [ ] If user asks about positions outside the game scope, the coach politely redirects back to the game analysis
- [ ] Streaming response delivers first token in under 1.5 seconds

---

### Epic 4: Adaptive Training, Puzzles & Skill Profiles

**US-009**

```
As a player,
I want personalized tactical puzzles generated directly from the blunders in my analyzed games,
so that I can practice the exact positions I misplayed in competitive matches.
```

**Acceptance Criteria:**

- [ ] Every blunder (`?` or `??`) with an identifiable tactic generates a playable puzzle record
- [ ] Puzzle board starts one ply before the blunder, challenging the player to find the correct engine move
- [ ] Correct solution confirms with rewarding visual and sound feedback; incorrect tries allow retrying
- [ ] Each puzzle retains a permanent foreign key reference to the original game and move index

---

**US-010**

```
As a player,
I want my puzzles scheduled via an SM-2 spaced-repetition algorithm in a daily queue,
so that I review weaknesses right before forgetting them without repetitive over-drilling.
```

**Acceptance Criteria:**

- [ ] Successful puzzle completion updates ease factor and extends next review interval (1 day → 3 days → 7 days)
- [ ] Failed puzzle attempts reset interval to 1 day and lower ease factor
- [ ] Daily training tab displays a curated list of puzzles due for review on that calendar date
- [ ] Completing the daily queue updates the player's active daily streak counter

---

**US-011**

```
As a player,
I want a dynamic multi-axis skill radar chart representing my chess competencies,
so that I can visually track my progress across tactical and positional domains over time.
```

**Acceptance Criteria:**

- [ ] Radar chart evaluates proficiency across Opening Knowledge, Tactics, Endgame Precision, and Defense
- [ ] Ratings update automatically whenever a newly imported game completes deep analysis
- [ ] Hovering or clicking an axis displays recent blunder history associated with that category
- [ ] Radar data is strictly private to the user account unless shared via coach permission

---

### Epic 5: Coaching Tools, Auditability & Governance

**US-012**

```
As a chess coach,
I want to manage a roster of students, inspect their skill radars, and assign custom puzzle homework,
so that I can conduct data-driven coaching sessions based on empirical match evidence.
```

**Acceptance Criteria:**

- [ ] Coach can invite students via email and view an aggregated classroom roster
- [ ] Coach can open a student's profile to inspect full game reports and blunder distributions
- [ ] Coach can curate a custom homework puzzle set and dispatch it directly to a student's daily queue
- [ ] Student receives a notification and sees the assigned set prioritized in their training dashboard

---

**US-013**

```
As an advanced player or coach,
I want to view the model metadata behind AI recommendations and record manual overrides,
so that human coaching authority is preserved and every AI suggestion is auditable.
```

**Acceptance Criteria:**

- [ ] Each explanation stores model identifier, prompt version, Stockfish engine depth, and timestamp
- [ ] User or coach can submit an override note disputing an AI explanation with written justification
- [ ] Overrides are immutably appended to the audit log table without overwriting raw engine evaluations
- [ ] Audit log records cannot be altered or retroactively deleted by standard user actions

---

## 5. User Flows

### Flow 1: Practice Game Play & Instant Analysis Pipeline

```
Player opens /play
→ Selects AI difficulty (e.g. Club ~1400) and board mode (2D / 3D)
→ Makes moves with real-time legal move dots & sound effects
→ Game concludes (Checkmate / Resignation / Stalemate)
→ System automatically auto-saves game in background via /api/games/import
→ UI displays "📊 View Game Report & Puzzles" button
→ User clicks button → Redirected to /report/[gameId]
→ Full eval swing chart, move annotation cards, and tactic badges render
```

### Flow 2: Multi-Platform Competitive Game Import

```
Player opens /import
→ Selects "Lichess / Chess.com" tab
→ Enters username & selects quantity (5, 10, or 20 games)
→ System fetches archive reverse-chronologically from official API
→ PGNs validated & posted to /api/games/import
→ Job enqueued in BullMQ (or saved as QUEUED if worker busy)
→ Game appears in "My Games" table with status badge
→ Stockfish worker analyzes positions → Deterministic tactic tagger runs
→ LLM generates grounded explanations → Status updates to ANALYSIS_COMPLETE
```

### Flow 3: Adaptive Spaced-Repetition Daily Puzzle Training

```
Player navigates to /train
→ Daily Training Queue loads puzzles due for review based on SM-2 algorithm
→ Board presents position originating from player's own past blunder
→ Player executes candidate move
  ├── If Correct: Green success glyph + sound effect → SM-2 interval extended
  └── If Incorrect: Red retry badge + hint option → SM-2 interval reset to 1 day
→ Player completes queue → Daily streak counter increments (+XP awarded)
→ Player skill radar profile updates with fresh performance metrics
```

### Flow 4: Grounded AI Coach Consultation (RAG)

```
Player views game report at /report/[gameId]
→ Opens AI Coach Chat sidebar
→ Types question: "Why was move 22...Nd5 considered a blunder?"
→ System retrieves structured engine record & tactic classification for ply 44
→ Server prompts LLM with strict Zod schema & ground truth constraints
→ LLM streams plain-English coaching explanation citing exact piece squares
→ Chat message displayed with verified citation badge and piece glyphs
```

---

## 6. Acceptance Criteria Summary

The Chesswise system is considered complete for the Enterprise / Academic MVP milestone when all **Must Have** requirements satisfy the following release criteria:

- [ ] **Test Coverage:** Core chess algorithms, tactic classifiers, and SM-2 calculations maintain > 90% unit test coverage.
- [ ] **Grounded LLM Output:** 100% of generated mistake explanations pass automated Zod schema validation; zero hallucinations of unrecorded moves or fabricated scores.
- [ ] **Reliable Game Import:** PGN imports from file, text, Lichess, and Chess.com archives successfully parse, validate, and store without unhandled server crashes.
- [ ] **Fail-Safe Asynchronous Queuing:** Under heavy load or temporary Redis downtime, game submissions persist in database storage and never produce 504 timeouts.
- [ ] **Full Audio-Visual Experience:** Interactive board runs smoothly in both 2D and 3D with authentic board coordinates, responsive layout, and synchronized sound effects.
- [ ] **Complete End-to-End Loop:** A blunder played in a game successfully yields an analyzed report, generates a playable puzzle, schedules into the daily training queue, and reflects on the skill radar.
- [ ] **Production Build & CI/CD:** Monorepo passes `pnpm lint`, `pnpm typecheck`, and `pnpm build` across all workspaces on every pull request to `main`.
