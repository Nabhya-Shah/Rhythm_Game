# Development Roadmap

## Phase 1: Engine & Core Movement (COMPLETE)
*Goal: Establish a tight, responsive 2D controller.*
- [x] Setup game engine/framework (Kaboom.js inside browser).
- [x] Implement player character with Auto-run constant speed (faked via background/object movement).
- [x] Implement Jump and gravity (snap arcs to specific distances/times).
- [x] Implement Dash and Slide mechanics.
  > Note: Had the cool idea to add a "drift-and-die" mechanic for sliding to punish holding it indefinitely! Creates a great risk/reward loop.
- [x] Tweak physics values until the platforming feels weighty and precise.

## Phase 2: Audio Engine & Sync (COMPLETE)
*Goal: The heartbeat of the game. If this drifts, the game breaks.*
- [x] Audio playback system with accurate position tracking (DSP time, not just frame time).
- [x] Calculate song_position_ms taking into account latency and offset.
- [x] Implement visual beat syncing (pulse indicator).

## Phase 3: The Charting & Event System (COMPLETE)
*Goal: Read data and spawn things.*
- [x] Define a Hybrid Procedural Level Generator (Pattern Pools).
  > Note: Realized purely random generation could create impossible jumps. Switched to a Pattern system (Easy/Medium/Hard) mapped exactly to the song's energy drops.
- [x] Spawn logic: Calculate exact spawn time based on TRAVEL_TIME.
- [x] Implement Platform/Terrain generation mapping to the drops.
  > Note: Fixed major block despawn bugs and synced the Camera vertically to mathematically anticipate upcoming physical terrain steps. 

## Phase 4: The Run Phase Core Loop (COMPLETE)
*Goal: Make the platforming reactive.*
- [x] Collision detection (Player vs Obstacles).
- [x] Invincibility frames logic.
  > Note: Tried wall-breaking and long-distance lunges, but settled on a purely fair "Permanent Passthrough Tag" for the Dash! If you dash through an obstacle, it immediately becomes 100% safe.
- [x] Scoring system (Combo multiplier and UI).
- [x] Health and fail states + Developer fast-forward/godmode UI.

## Phase 5: The Boss Phase (2D Bullet Hell)
*Goal: The Just Shapes & Beats experience.*
- [ ] Create Boss Entity (state machine for idle, attack, vulnerable).
- [ ] Implement warning telegraphs (lines/zones that appear on upbeat, strike on downbeat).
- [ ] Vulnerability windows for counter-attacks.

## Phase 6: Visuals, Polish & Juice
*Goal: Make it feel amazing.*
- [ ] Beat pulsing: Background elements/vignette throb exactly on the BPM.
- [ ] Particle systems for double jumps, dashes, and perfect hits.

## Phase 7: The Minimal Deliverable
*Goal: A complete 60-second slice.*
- [ ] Author/Refine the hybrid generation seed for Flavourtown demo.
- [ ] Bug fixing, playtesting, hit-window tweaking.
