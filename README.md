# Rhythm Game (Flavourtown)

A 2D rhythm-based auto-runner built for the Hack Club Flavourtown event. Inspired by the platforming of *Geometry Dash* and the boss chaos of *Just Shapes & Beats*.

## Current State
We've completed the core engine (Phases 1-4)!
- **Engine:** Kaboom.js (HTML5 Canvas)
- **Audio Sync:** Perfect synchronization using Web Audio DSP time (`music.time()`) to handle the 174 BPM track without frame-lag drift.
- **Mechanics:** Jump, double jump, dash (with permanent obstacle-passthrough for fair play), and an anti-spam "drift-and-die" slide.
- **Level Generation:** A hybrid procedural system that stitches hand-crafted level chunks together, tied to the song's energy drops.

## How to Play / Run Locally
Due to CORS restrictions with audio files in the browser, you must run a simple local web server.

1. Clone the repository.
2. Open your terminal in the project directory.
3. Run `python -m http.server 8000` (or your preferred local server).
4. Go to `http://localhost:8000` in your browser.

## Next Up
Phase 5: The Boss. Preparing for a full 2D bullet hell experience!
