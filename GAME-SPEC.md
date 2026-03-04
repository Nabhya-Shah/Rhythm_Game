# Rhythm Game Design Spec

## Elevator Pitch
A musical side-scroller auto-runner inspired by Geometry Dash and Just Shapes & Beats, where obstacles and gameplay sync to the music. During boss sequences, the camera shifts to dramatic third-person views with over-the-top attacks and vivid effects. After boss battles, quick rhythm minigames (FNF-like) use directional inputs to move your character to the beat, impacting the rest of the level.

## Core Loop
- **Auto-run phase:** Dodge rhythm-synced obstacles and hit musical interactables for bonuses.
- **Boss phase:** Camera changes; face bosses with synchronized attack patterns and brief vulnerability windows on beat.
- **Mini rhythm game:** Short sequence using directional inputs (à la FNF) to resolve boss encounters or gain post-battle bonuses.
- **Back to run:** Level changes based on minigame success; repeat as needed until the end.

## Controls
- Jump: Space or K
- Dash/Double-jump: J
- Slide/Crouch: S or Down Arrow
- Attack/Interact: L or Enter
- Pause: Esc
- Rhythm minigame: Arrow keys (or ASDF)
- All controls remappable.

## Movement and Physics
- Auto-run speed: ~320 px/s
- Gravity: ~2200 px/s²
- Jump velocity: ~760 px/s
- Dash: Short horizontal boost
- Slide: Brief duration (0.35s)
- Notes travel ~1600 ms before reaching hit zone.

## Audio & Timing
- Charts use ms timestamps, with BPM and offsets for authoring.
- Hit windows: Perfect ±50ms, Great ±100ms, Good ±160ms, Miss >±160ms.
- Manual latency calibration + tap-to-sound test.

## Event/Chart System
Events in JSON:
- Obstacles: {time_ms, type:"obstacle", subtype, ...}
- Triggers: {time_ms, type:"trigger", effect, lane}
- Boss cues: {time_ms, type:"boss_start", boss_id, phase_index}
- Camera modes: {time_ms, type:"camera", mode, duration_ms}
- Minigame: {time_ms, type:"minigame_start", length_ms, pattern_ref}

## Obstacle & Trigger Placement
- Major obstacles on downbeats, minor/syncopated ones offbeat.
- Triggers sync to strong beats; hitting boosts/damages or changes level state.

## Boss Design
- Phased patterns, attacks appear on beat, require rhythm-based inputs.
- Vulnerability windows: perform minisequences to deal damage.
- Difficulty set by timing windows, attack rate, vulnerability length, etc.

## Rhythm Minigame Section
- Switches to 4 lanes/arrow inputs.
- Short 10–20 beat sequence; accuracy yields bonuses or boss damage.
- Outcome affects post-boss gameplay.

## Progression & Outcomes
- Performance in run and minigame combine for score/boss defeat.
- Run phase actions modify boss phase difficulty, minigame results award buffs.

## Visuals & Feedback
- Particles, camera shakes, and color grading for phases.
- Fast, readable transitions between modes.

## UI/HUD Elements
- Timer, BPM, HP/shield (player/boss), score/combo, calibration/output indicators, minigame overlays while active.

## Accessibility
- Colorblind mode, reduced motion, adjustable hit windows, audio cues, assist mode.

## Replay/Testing
- Inputs timestamped for deterministic replay.
- QA includes sync checks, input/physics validation, boss sequence consistency, minigame scoring/ranking reproducibility, accessibility toggles, and difficulty/playtest tuning.

## Sample Timeline
1. Run phase (0–30s): obstacles/triggers.
2. Boss encounter (30–45s): camera shift, timed attacks.
3. Rhythm minigame (45–53s): FNF-like.
4. Back to run (54s+): outcomes impact level or concluding sequence.

## Minimal Deliverable
- One level (40–60s): run phase, boss, minigame, HUD, calibration, chart sample, playtest notes.