import kaboom from "https://unpkg.com/kaboom@3000.1.17/dist/kaboom.mjs";

// Initialize Kaboom
// We set a fixed resolution so it scales nicely on any screen
kaboom({
    width: 800,
    height: 450,
    background: [17, 17, 17], // Dark gray/black
    letterbox: true // Keeps aspect ratio intact
});

// Load a simple bean sprite built into Kaboom for testing
loadBean();

// Load the music track
// Make sure this file exists relative to where index.html is served from
loadSound("why_we_lose", "why_we_lose.mp3");

// Define the main game scene
scene("game", () => {
    // Set the gravity multiplier
    setGravity(2200);

    // --- AUDIO ENGINE (PHASE 2) ---
    // Start the music
    const music = play("why_we_lose", {
        volume: 0.5,
        loop: false
    });

    // "Why We Lose" is typically 174 BPM. 
    // This helps us calculate exactly when a beat happens.
    const BPM = 174;
    const SECONDS_PER_BEAT = 60 / BPM;
    
    let songPosition = 0; // The actual time of the music in seconds
    let lastBeatIndex = -1; // To track when a new beat hits

    // --- GAME STATE & UI (PHASE 4) ---
    let score = 0;
    let combo = 0;
    let hp = 100;

    const uiText = add([
        text(`Score: ${score}\nCombo: x${combo}\nHP: ${hp}`, { size: 24 }),
        pos(24, 24),
        fixed(),
    ]);

    function updateUI() {
        uiText.text = `Score: ${score}\nCombo: x${combo}\nHP: ${hp}`;
    }

    // Debug Text UI
    const debugText = add([
        text("Time: 0\nBeat: 0", { size: 14 }),
        pos(24, 110),
        fixed(),
        opacity(0.5) // Made slightly transparent so it doesn't distract
    ]);

    // --- DEV TOOLS ---
    let godMode = false;
    let isFastForward = false;

    // God mode button
    const btnGodMode = add([
        rect(120, 30, { radius: 4 }),
        pos(width() - 140, 10),
        color(80, 80, 80),
        area(),
        fixed(),
        "dev_btn"
    ]);
    const txtGodMode = add([ text("God: OFF", { size: 16 }), pos(width() - 130, 17), fixed() ]);

    btnGodMode.onClick(() => {
        godMode = !godMode;
        txtGodMode.text = `God: ${godMode ? "ON" : "OFF"}`;
        btnGodMode.color = godMode ? rgb(50, 150, 50) : rgb(80, 80, 80);
    });

    // Fast Forward button
    const btnSpeed = add([
        rect(120, 30, { radius: 4 }),
        pos(width() - 140, 50),
        color(80, 80, 80),
        area(),
        fixed(),
        "dev_btn"
    ]);
    const txtSpeed = add([ text("Speed: 1x", { size: 16 }), pos(width() - 130, 57), fixed() ]);

    btnSpeed.onClick(() => {
        isFastForward = !isFastForward;
        let speedMult = isFastForward ? 2 : 1;
        
        debug.timeScale = speedMult; // Kaboom's built in core time speeder!
        if (music) music.speed = speedMult; // Fast forward audio pitch/speed
        
        txtSpeed.text = `Speed: ${speedMult}x`;
        btnSpeed.color = isFastForward ? rgb(150, 150, 50) : rgb(80, 80, 80);
    });

    // Make Dev buttons change color cursor on hover so we know they are clickable
    onHover("dev_btn", (b) => { setCursor("pointer"); });
    onHoverEnd("dev_btn", (b) => { setCursor("default"); });

    // A visual indicator that pulses on the beat
    const beatIndicator = add([
        circle(20),
        pos(width() - 50, 50),
        color(255, 0, 0),
        fixed(),
        opacity(0)
    ]);

    // Update the song position exactly to the audio playback time
    onUpdate(() => {
        // We use music.time() because it is tied to the DSP (Digital Signal Processing) time
        // rather than game frames (dt), which prevents drifting if the game lags!
        if (music) {
            songPosition = music.time();
            
            // Calculate which beat we are currently on
            const currentBeatIndex = Math.floor(Math.max(0, songPosition) / SECONDS_PER_BEAT);
            
            // If we hit a NEW beat this frame, trigger a pulse!
            if (currentBeatIndex > lastBeatIndex) {
                lastBeatIndex = currentBeatIndex;
                
                // Visual Juice: Pulse the beat indicator
                beatIndicator.radius = 30; // Grow
                beatIndicator.opacity = 1;
                
                // Tween it back down
                tween(30, 20, Math.min(0.2, SECONDS_PER_BEAT / 2), (r) => beatIndicator.radius = r, easings.easeOutQuad);
                tween(1, 0, Math.min(0.4, SECONDS_PER_BEAT * 0.8), (o) => beatIndicator.opacity = o, easings.easeOutQuad);
            }
            
            // Update Debug Text
            debugText.text = `Time: ${songPosition.toFixed(2)}s\nBeat: ${currentBeatIndex}`;
        }
    });
    // --- END AUDIO ENGINE ---

    // 1. Add the Player
    const player = add([
        sprite("bean"), // Use the built-in bean sprite
        pos(150, 80),   // X, Y starting position
        area(),         // Gives the player a collision hitbox
        body(),         // Applies physics (gravity, jumping)
        color(255, 100, 100) // Tint it red!
    ]);

    // 2. Add the Floor
    add([
        rect(width(), 1000), // Huge rectangle so we never see the bottom void when camera pans up
        pos(0, height() - 48), // Positioned at the bottom
        area(), // Hitbox
        body({ isStatic: true }), // Static body means gravity doesn't pull it down
        color(50, 50, 50)
    ]);

    // 3. Controls & State
    const JUMP_FORCE = 760;
    const DASH_DISTANCE = 90;
    const DASH_DURATION = 0.18;
    const BASE_X = 150; // Where the player normally sits
    const LEVEL_STEP = 40;
    
    let hasDoubleJumped = false;
    let isDashing = false;
    let isSliding = false;
    let dashEndsAt = 0;
    const dashedThroughObstacles = new Set(); // Simplified to just permanent "tagged" safety

    // Jump & Double Jump
    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
            hasDoubleJumped = false;
        } else if (!hasDoubleJumped) {
            // A slightly lighter double jump looks and feels better
            player.jump(JUMP_FORCE * 0.85); 
            hasDoubleJumped = true;
            
            // Add a little visual flair for the double jump
            add([
                rect(20, 5),
                pos(player.pos.x, player.pos.y + 20),
                color(255, 255, 255),
                opacity(1),
                lifespan(0.2, { fade: 0.2 }), // Fades out over 0.2 seconds
            ]);
        }
    });

    // Dash (true passthrough, no breaking)
    onKeyPress("j", () => {
        if (!isDashing) {
            isDashing = true;
            dashEndsAt = time() + DASH_DURATION;
            player.color = rgb(100, 200, 255);
            
            tween(player.pos.x, player.pos.x + DASH_DISTANCE, DASH_DURATION, (p) => player.pos.x = p, easings.easeOutQuad);
            
            wait(DASH_DURATION, () => {
                isDashing = false;
                player.color = rgb(255, 100, 100); 
            });
        }
    });

    // Slide / Crouch (Hold to slide indefinitely but risk dying!)
    let slideHoldTime = 0;

    onKeyDown("s", () => {
        // Triggers every frame S is held down
        if (player.isGrounded() && !isSliding) {
            isSliding = true;
            // Squash the player visually to half height
            player.scale = vec2(1, 0.5);
            // Move it down slightly so it stays on the floor when squashed
            player.pos.y += 16;
        }
    });

    onKeyRelease("s", () => {
        if (isSliding) {
            player.scale = vec2(1, 1);
            player.pos.y -= 16;
            isSliding = false;
            slideHoldTime = 0; // Reset slide acceleration
        }
    });

    // Update Loop: Movement, Screen Edge Death, & Base Return
    player.onUpdate(() => {
        // If player goes completely off the left or right edge, DIE and restart!
        if (!godMode && (player.pos.x < -20 || player.pos.x > width() + 20)) {
            music.paused = true; // Stop the old music before restarting
            debug.timeScale = 1; // Reset time so we don't restart in 2x speed
            go("game"); // Restart the scene
        }

        if (isSliding) {
            // Give the player a 0.8s grace period before they start drifting backward
            slideHoldTime += dt();
            if (slideHoldTime > 0.8) {
                let driftTime = slideHoldTime - 0.8;
                let driftSpeed = 50 + (driftTime * 250); 
                player.pos.x -= driftSpeed * dt();
            }
        } else if (!isDashing) {
            // Slowly drift back to the safe resting position from either direction
            const RETURN_SPEED = 150;
            if (player.pos.x > BASE_X) {
                player.pos.x -= RETURN_SPEED * dt(); 
                if (player.pos.x < BASE_X) player.pos.x = BASE_X;
            } else if (player.pos.x < BASE_X) {
                player.pos.x += RETURN_SPEED * dt(); 
                if (player.pos.x > BASE_X) player.pos.x = BASE_X;
            }
        }
    });

    // Handle resetting double jump when hitting the ground
    player.onGround(() => {
        hasDoubleJumped = false;
    });

    // --- CHART & EVENT SYSTEM (PHASE 3) ---
    // Instead of moving the player right, we spawn obstacles that move left at a set speed
    const RUN_SPEED = 320;
    const SPAWN_X = width() + 50; // Just offscreen to the right
    const TRAVEL_DISTANCE = SPAWN_X - BASE_X; // Distance from spawn to the player's hit zone
    const TRAVEL_TIME = TRAVEL_DISTANCE / RUN_SPEED; // How many seconds it takes to reach the player

    // --- LEVEL GENERATOR (HYBRID SYSTEM) ---
    // Seeded RNG so the layout is EXACTLY the same every try!
    let levelSeed = 42; // Change this number to generate a completely new level layout
    let randSeed = levelSeed;
    function seededRandom() {
        let x = Math.sin(randSeed++) * 10000;
        return x - Math.floor(x);
    }

    // We define clean, tested patterns that feel good to play. 
    // They are now entirely relative to the section's "floor elevation".
    const patternPools = {
        easy: [
            { duration: 4, events: [{ offset: 0, type: "spike" }, { offset: 2, type: "spike" }] },
            { duration: 4, events: [{ offset: 0, type: "spike" }, { offset: 2, type: "block" }] },
            { duration: 4, events: [{ offset: 0, type: "wall" }] }
        ],
        medium: [
            { duration: 4, events: [{ offset: 0, type: "spike" }, { offset: 1, type: "spike" }] },
            { duration: 4, events: [{ offset: 0, type: "wall" }, { offset: 2, type: "block" }] },
            { duration: 4, events: [{ offset: 0, type: "spike" }, { offset: 1.5, type: "block" }] }
        ],
        hard: [
            { duration: 4, events: [{ offset: 0, type: "spike" }, { offset: 1, type: "spike" }, { offset: 2, type: "wall" }] },
            { duration: 4, events: [{ offset: 0, type: "wall" }, { offset: 1, type: "wall" }, { offset: 2, type: "block" }] },
            { duration: 4, events: [{ offset: 0, type: "spike" }, { offset: 1, type: "wall" }, { offset: 2, type: "spike" }] }
        ]
    };

    // Manual Section Mapping: This controls the pacing of the entire track.
    // 'elevation' defines how many 'blocks' high the main floor gets raised.
    const songSections = [
        { startBeat: 16, endBeat: 32, intensity: "easy", elevation: 0 },
        { startBeat: 32, endBeat: 64, intensity: "hard", elevation: 0 }, 
        { startBeat: 64, endBeat: 68, intensity: "easy", elevation: 0 }, // Break
        { startBeat: 68, endBeat: 96, intensity: "medium", elevation: 1 }, // Floor raises by 1 block (40px)
        { startBeat: 96, endBeat: 128, intensity: "medium", elevation: 2 }, // Floor raises by 2 blocks (80px)
        { startBeat: 128, endBeat: 164, intensity: "hard", elevation: 0 }  // Floor drops back down to normal for final drop
    ];

    function generateChart() {
        randSeed = levelSeed; // Reset the seed at the start of generation 
        let chart = [];
        
        songSections.forEach(section => {
            // 1. If this section has an elevated floor, spawn a solid terrain block spanning the whole section!
            if (section.elevation > 0) {
                chart.push({
                    beat: section.startBeat,
                    type: "terrain",
                    elevation: section.elevation,
                    length: section.endBeat - section.startBeat
                });
            }

            let currentBeat = section.startBeat;
            const pool = patternPools[section.intensity];
            
            // 2. Fill the section with random patterns
            while (currentBeat < section.endBeat - 2) { 
                const randomPattern = pool[Math.floor(seededRandom() * pool.length)];
                
                if (currentBeat + randomPattern.duration > section.endBeat) break;
                
                randomPattern.events.forEach(ev => {
                    chart.push({
                        beat: currentBeat + ev.offset,
                        type: ev.type,
                        // We add the section's elevation to the obstacle, so it sits perfectly on the raised floor!
                        elevation: section.elevation + (ev.elevation || 0),
                        length: ev.length || 1 
                    });
                });
                
                currentBeat += randomPattern.duration;
            }
        });
        
        return chart.map(event => ({
            ...event,
            targetTime: event.beat * SECONDS_PER_BEAT,
            spawned: false
        }));
    }

    const levelChart = generateChart();

    // Obstacle spawner logic
    onUpdate(() => {
        if (!music) return;
        
        // Check our chart to see if anything needs to be spawned right now
        levelChart.forEach(event => {
            // An obstacle must be spawned early by exactly the TRAVEL_TIME
            // so it arrives at the player precisely on the targetTime
            if (!event.spawned && songPosition >= (event.targetTime - TRAVEL_TIME)) {
                event.spawned = true;
                spawnObstacle(event.type, event.elevation, event.length);
            }
        });
    });

    const FLOOR_Y = height() - 48; // Where the ground is

    function spawnObstacle(type, elevation = 0, length = 1) {
        let obs;
        // Calculate the base Y level for this obstacle. 
        // Elevation 1 = 120 pixels up in the air
        const base_y = FLOOR_Y - (elevation * LEVEL_STEP);
        let realWidth = 40;

        if (type === "spike") {
            // Red box you must jump over
            obs = add([
                rect(40, 40),
                pos(SPAWN_X, base_y - 40), 
                color(255, 50, 50),
                area(), 
                "obstacle" // Tag for hit detection
            ]);
        } else if (type === "terrain") {
            // A solid block that acts as the new floor
            // Calculated pixel width to exactly match the intended song beat duration
            const tWidth = (RUN_SPEED * (length * SECONDS_PER_BEAT)) + 40; 
            const tHeight = elevation * LEVEL_STEP;
            realWidth = tWidth;
            obs = add([
                rect(tWidth, tHeight),
                pos(SPAWN_X, FLOOR_Y - tHeight),
                color(40, 40, 50), // Distinct dark grey
                area(),
                body({ isStatic: true }), // Player physically runs on top of this!
                "terrain",
                { curElevation: elevation, realWidth: tWidth }
            ]);
        } else if (type === "block") {
            // Green box hovering in the air to slide under
            obs = add([
                rect(40, 80),
                pos(SPAWN_X, base_y - 125), 
                color(50, 255, 50),
                area(),
                "obstacle"
            ]);
        } else if (type === "wall") {
            // Blue tall wall to dash through
            obs = add([
                rect(40, 160),
                pos(SPAWN_X, base_y - 160), 
                color(50, 100, 255),
                area(),
                "obstacle",
                "wall" 
            ]);
        }

        if (obs) {
            let passed = false; // Track if we dodged it safely
            if (!obs.realWidth) obs.realWidth = realWidth;

            // Move the obstacle left constantly
            obs.onUpdate(() => {
                obs.move(-RUN_SPEED, 0);

                // Scoring logic (only apply to dangerous obstacles, not safe platforms)
                if (obs.is("obstacle") && !passed && !obs.hit && obs.pos.x < player.pos.x - 40) {
                    passed = true;
                    // Increase Score!
                    combo++;
                    score += 100 * combo;
                    
                    // Juice! Show points floating up from the player
                    add([
                        text(`+${100 * combo}`, { size: 16 }),
                        pos(player.pos.x, player.pos.y - 40),
                        color(255, 255, 0), // Yellow text
                        move(UP, 50),
                        lifespan(0.5, { fade: 0.2 })
                    ]);
                    
                    updateUI();
                }

                // Garbage collect when entirely offscreen left (checks right edge!)
                if (obs.pos.x + obs.realWidth < -500) destroy(obs);
            });
        }
    }

    // --- COLLISION LOGIC (PHASE 4) ---
    player.onCollideUpdate("obstacle", (obs) => {
        if (godMode) return; // Dev tools ignore damage!
        
        if (isDashing) {
            dashedThroughObstacles.add(obs);
            return; 
        }

        // If this obstacle was touched during a dash, ignore it entirely for the rest of its life.
        // This guarantees that if you dashed *at all* while intersecting it, it can never hurt you afterwards.
        if (dashedThroughObstacles.has(obs)) return;
        
        if (obs.hit) return; // Prevent double-counting the same hit
        
        // Mark as hit so we don't get points for it
        obs.hit = true;
        
        // Take Damage & Break Combo!
        hp -= 25;
        combo = 0;
        updateUI();

        shake(12); // Juice! Shake the camera heavily
        player.color = rgb(255, 255, 255); // Flash white
        wait(0.1, () => player.color = rgb(255, 100, 100)); // Restore color

        // If dead, restart the scene
        if (hp <= 0) {
            music.paused = true;
            debug.timeScale = 1; // Reset time so we don't respawn fast
            go("game"); 
        }
    });

    // Background visual flair - a simple line to show movement speed
    loop(0.5, () => {
        const bgLine = add([
            rect(40, 4),
            pos(width(), height() - 70),
            color(80, 80, 80),
            move(LEFT, 320), // Move left at 320 px/s (our run speed from the spec!)
            offscreen({ destroy: true }) // Delete when it goes off screen to save memory
        ]);
        // Push it behind the player
        bgLine.z = -1;
    });

    // Camera: keep horizontal view fixed, only move vertically with section elevation.
    const CAM_LERP = 15;
    onUpdate(() => {
        let activeElevation = 0;
        
        // Scan active terrain to track the physical ground physically beneath/ahead of the player
        for (const t of get("terrain")) {
            // Anticipate 150px ahead to slightly lock in the height right before making a jump onto it
            if (player.pos.x + 150 >= t.pos.x && player.pos.x <= t.pos.x + t.realWidth) {
                activeElevation = Math.max(activeElevation, t.curElevation);
            }
        }
        
        const targetCamY = (height() / 2) - (activeElevation * LEVEL_STEP);
        const nextCamY = lerp(camPos().y, targetCamY, Math.min(1, CAM_LERP * dt()));
        camPos(width() / 2, nextCamY);
    });
});

// Start the game!
go("game");