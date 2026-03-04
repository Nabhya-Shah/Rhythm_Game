# Rhythm Game Design Spec

## Elevator Pitch
A musical 2D side-scroller auto-runner inspired by Geometry Dash and Just Shapes & Beats, where obstacles, enemy attacks, and gameplay perfectly sync to the music. Boss sequences keep the 2D perspective but ramp up the intensity with screen shakes, dynamic zooms, and bullet-hell-style rhythmic dodging that heavily relies on your core movement mechanics.

## Core Loop
- **Auto-run phase:** Dodge rhythm-synced obstacles, jump over gaps, and hit musical interactables for bonuses.
- **Boss phase:** High-intensity 2D bullet hell. Face bosses with synchronized rhythmic attack patterns and brief vulnerability windows to counter-attack on beat.
- **Back to run:** Level pacing adjusts dynamically; repeat as needed until the end.

## Controls
- Jump: Space or K
- Dash/Double-jump: J
- Slide/Crouch: S or Down Arrow
- Attack/Interact/Counter: L or Enter
- Pause: Esc
- All controls remappable.

## Movement and Physics
- Auto-run speed: ~320 px/s
- Gravity: ~2200 px/s²
- Jump velocity: ~760 px/s
- Dash: Short horizontal boost
- Slide: Brief duration (0.35s)
- Notes/Obstacles travel ~1600 ms before reaching hit zone.

## Audio & Timing
- Charts use ms timestamps, with BPM and offsets for authoring.
- Hit/Dodge windows: Perfect ±50ms, Great ±100ms, Good ±160ms, Miss >±160ms.
- Manual latency calibration + tap-to-sound test.

## Event/Chart System
Events in JSON:
- Obstacles: {time_ms, type:"obstacle", subtype, ...}
- Triggers: {time_ms, type:"trigger", effect, lane}
- Boss cues: {time_ms, type:"boss_start", boss_id, phase_index}
- Camera FX: {time_ms, type:"camera_fx", effect:"shake|zoom|pan", duration_ms}

## Obstacle & Trigger Placement
- Major obstacles on downbeats, minor/syncopated ones offbeat.
- Triggers sync to strong beats; hitting boosts/damages or changes level state.

## Boss Design
- Phased bullet-hell patterns inspired by Just Shapes & Beats.
- Attacks telegraph on upbeat, resolve on downbeat.
- Vulnerability windows: dodge successfully to build charge, then use 'Attack' to punish the boss.
- Difficulty set by timing windows, attack rate, and layering of obstacles.

## Progression & Outcomes
- Performance directly impacts score and visual juice.
- Missing beats reduces player health; hitting zero resets the sequence or level.

## Visuals & Feedback
- Lots of particles, screen shakes, color flashes, and vignette pulsing on the beat.
- Vivid, fast transitions during phase changes.

## UI/HUD Elements
- Timer, BPM, HP/shield (player/boss), score/combo, calibration/output indicators.

## Accessibility
- Colorblind mode, reduced motion, adjustable hit windows, audio cues, assist mode.

## Replay/Testing
- Inputs timestamped for deterministic replay.
- QA includes sync checks, input/physics validation, boss sequence consistency, accessibility toggles, and difficulty tuning.

## Sample Timeline
1. Run phase (0-30s): Standard platforming, dodge obstacles/triggers.
2. Boss encounter (30-50s): Boss appears on-screen, 2D bullet-hell rhythm patterns.
3. Defeat/Victory transition (50-54s): Big visual explosion.
4. Back to run (54s+): Outcomes impact score.

## Minimal Deliverable
- One level (40-60s): run phase, 1 boss phase, HUD, calibration menu, chart sample, playtest notes.
