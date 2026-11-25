# LANDLORD NextGen — checkpoint 01

Branch: nextgen-remake. The original main branch is preserved.

Implemented:
- Explicit GLSL ES 3.00 conversion for WebGL2, with WebGL1 support retained.
- Dynamic shadow framebuffer settings: low off, balanced 512, high 1024, cinematic 2048; texel-correct PCF.
- Third-person camera collision sweep.
- PWA installation and offline asset caching for the original seven-world game.
- Browser smoke test for WebGL, all seven realm gateways, map interaction and offline reload.

Pending: review CI results; full PBR texture pipeline, glTF assets, animation overhaul, spatial audio, input stress test, profiling on real mobile hardware. No AAA quality claim until measured.

## Checkpoint 02
- Spatially partition static geometry and frustum-cull both main and shadow passes; preserve all collision geometry.
- Report visible chunks, submitted triangles, and actual draw calls.
- Three local unit tests on the chunk algorithm passed before integration.
- HRTF audio for combat events, one master audio bus, haptic feedback toggle, removed M-key audio conflict.
- Offline navigation uses the active version cache to avoid mixing HTML and JavaScript across releases.
- Browser and hardware verification pending.

## Test runner optimization
Use Chrome and ChromeDriver preinstalled on GitHub Ubuntu 24.04, eliminating external npm/browser installation. Fixed master mute handling. Browser test still needs a passing run.

## Checkpoint 03 — cinematic GPU renderer
Previous verified baseline: 5c111222, run 45328001276 passed desktop/mobile WebGL, seven realm gateway checks and offline reload. Added framebuffer bloom (threshold, downsampled separable Gaussian blur, composite), color grading, texture loading/mipmaps from original local assets, procedural GGX specular and corrected terrain winding. Low quality bypasses bloom. CI must verify shader/framebuffer health and capture browser screenshots. This is not a full authored PBR material set or HDR pipeline.

## Checkpoint 04 — responsiveness and combat
- Independent left/right touch owners, pointer capture for actions, cancel/lost-capture cleanup, no third-touch pause, clear controls on map.
- Localized sword-animation hit-stop without delaying dash, movement or physics; directional camera impact; melee vertical/obstacle checks.
- Particle budgets and adaptive internal resolution keep the user's selected graphics preset; graphics changes no longer regenerate the world or reset destructibles.
- Expanded real Chrome regression checks for four quality presets, persistent destructibles, dash, attack, triple jump, air dash and emulated three-finger input.

## Checkpoint 05 — visual iteration after screenshot review
- Reviewed actual checkpoint 03 screenshots (run 45328542646): faceted bright armor, tiled road and hidden numeric HUD needed improvement.
- Smooth vertex normals on ellipsoids and articulated limbs; corrected cone and crystal side normals; darker layered armor, helmet, cape stitching; bevelled terrain-conforming cobblestones.
- Lower overexposure and lantern intensity; separate world texture influence from character materials.
- Compact HUD now displays HP, mana, Essence, level, Seals and Relics, with reduced-motion support.
- Capture browser screenshots after chapter splash is gone; browser verification pending.

## Checkpoint 06 — seven guardian silhouettes and spatial environment
- Dedicated procedural models for seven existing guardians, including a multi-legged Weaver, Reaper blade, Thornheart antlers, Cinder King crown and floating Storm/Ashbound crystals. Preserve boss logic and original names.
- Distinct regular humanoid silhouettes and distance-dependent mesh detail; no authored GLB assets yet.
- HRTF looping water ambience anchored to the actual wetland positions; fades when paused or leaving the biome.
- Regression suite visits all seven worlds using actual map/flight travel, checks renderer errors after transitions and confirms spatial emitter initialization.

## Regression repair — geometry merge
Checkpoint 05 run 45328984390 failed waiting for visible geometry. Detailed mesh arrays can exceed JavaScript's function-argument limit when spread into Array.push; replaced 22 bulk spreads with bounded per-element appends. Added immediate frame-error diagnostics to the browser suite and camera reset on realm teleport. The repair is subject to the next CI run, not yet verified.

## Checkpoint 07 — depth-aware cinematic effects and instanced combat particles
- Previous geometry-merge repair passed the full Chrome regression step in run 45329308307.
- Depth texture-backed screen-space contact occlusion on High/Ultra; portal bloom shafts on High/Ultra with approximate depth gating. This is a screen-space approximation, not ray-traced volumetric lighting.
- Procedural derivative-based bump detail and roughness modulation from existing textures.
- WebGL2 billboard particle batching in a single instanced draw, with CPU mesh fallback. Regression checks for particle frames and AO preset switching.
- This new revision requires CI verification. No real-device FPS or authored AAA asset claims.

## Checkpoint 08 — visual revision from real screenshots
The verified screenshot showed cartoon-like skeletons with oversized glowing eyes and repetitive cobbles. Replaced the skeleton with articulated bone anatomy, rib cage, hollow eye sockets, corroded weapon, remnants of armor and distance-dependent detail. Added continuous compacted foundation to the road and reduced emission clipping with height-dependent valley fog. Added screenshot capture for all six remaining realms to the desktop CI route. Pending verification.

## Checkpoint 09 — explicit environment materials
Used the original repository's bamboo bark, leaf and water texture maps in the WebGL2 renderer, in addition to moss and stone. Static mesh vertices encode a material identifier in the existing emission attribute without increasing stride. Bamboo stems and leaf fans use distinct sampling; wetland water uses animated dual flow sampling, roughness and grazing-angle highlights. Software rendering decodes emission separately and WebGL1 retains the two-texture fallback. Five-texture loading is required by the WebGL2 regression suite. Pending CI.

## Checkpoint 10 — durable offline save mirror
Added IndexedDB progress snapshots with serialized writes, startup recovery when localStorage is absent, and ordered reset/tombstone handling. Existing saves are compatible and localStorage remains a synchronous copy. The browser regression removes localStorage before offline reload and requires IndexedDB to restore the destroyed crate flag. PWA settings report a waiting update without forcing a mid-game version change. Pending CI.

## Checkpoint 11 — interactive world atlas
Checkpoint 10 passed both browser profiles, all seven desktop world transitions and IndexedDB recovery (run 45330096984). Added independent atlas viewport, cursor-anchored scroll zoom, drag, pinch, keyboard navigation, recenter, discovered enemy markers and a reusable fog buffer. Fixed stale index in fallback map rendering. Added two viewport unit tests and actual Chrome mouse/touch gesture regressions. Awaiting CI.

## Checkpoint 12 — fair melee and telegraph
Enemy attack direction is locked at wind-up. Shared combat geometry rules reject strikes outside vertical reach, cone or unobstructed line. Directional ground telegraphs follow the locked attack heading. Wildlife contact is also checked; loot cannot magnetize to a player far above ground. Main and side portals reset camera anchor and vertical velocity. Three pure rules tests plus browser checks for altitude, direction and actual gateway obstruction. Pending CI.

## Checkpoint 13 — realm identity art pass
Added seven actual world-space landmarks: ferryman watchtower, heartroot tree, colossal rib remains, funeral bell towers, Cinder Citadel, suspended islands, and eclipse crown. Added distinct sky treatments for every realm and preserve the original road and portals. New geometry is counted and checked during real Chrome startup. Realm screenshots now wait for the intro title to clear. These are handcrafted procedural models, not imported AAA assets. Pending CI.

## Atlas visual polish
Reviewed actual desktop and mobile screenshots from successful run 45330774866. Replaced the unsupported recenter glyph with a native inline SVG crosshair. Keep fog-of-war intact.

## Checkpoint 14 — frame-time instrumentation and UI optimization
Checkpoint 12 passed CI run 45330899309. Corrected the FPS and adaptive-resolution input to use observed wall-clock frame intervals rather than the simulation's clamped delta. Added bounded CPU frame-stage profiling (mean, p50, p95, maximum) and tab visibility reset. HUD writes run once per frame rather than once per simulation substep. Added two unit tests and CI timing output; these headless software-GL timings are not real phone or GPU benchmarks. Pending CI.

## Checkpoint 15 — reduce CPU mesh work
Checkpoint 14 passed 10 unit tests and both Chrome profiles. Profiling measured mesh-stage means of 40.16 ms desktop and 38.93 ms mobile emulation (software GL; not physical-device results). Cached sphere topology avoids repeated trigonometry and degenerate polar triangles; transforms vertices/normals once per unique grid point. Added conservative dynamic actor frustum culling, keeping nearby shadow casters, and distance/preset tessellation while preserving gameplay/AI. Added 3 unit tests and browser counters. Pending CI.

## Checkpoint 16 — preset-aware shading and single dynamic upload
LOW skips procedural 3D noise; MEDIUM uses dominant-axis projection and five shadow samples; HIGH/ULTRA keep triplanar near-field materials, bump detail, nine-tap shadows and additional mineral/lichen detail. Procedural fine detail fades with distance. Dynamic vertex buffer is uploaded once per frame and reused for the shadow and main passes. Browser regression requires one upload per frame. Pending CI.

## Checkpoint 17 — input lifecycle and overlay power budget
Release held keys, action captures and joystick when entering menus, atlas, portal travel, visibility loss and resume. Pause/map/settings render at most four world frames per second except on state/preset/resize changes; title at most about 30 FPS; gameplay remains uncapped. Fixed WebGL1-friendly shader integer comparison. Added browser regression for input clearing and frozen game time during atlas use. Pending CI.

## Checkpoint 18 — shared camera/map coordinate convention
Checkpoint 15–17 passed all CI. Actual camera right is (-cos yaw,+sin yaw), while the prior minimap projected positive world X right and rotated by -yaw. This caused left/right mirror mismatch. New shared projection uses right and forward dot products; player arrow uses yaw-heading. Minimap immediately refreshes on yaw changes and fills rotated corners. Full atlas defaults to camera-up, freezes orientation on open, offers CAM/N toggle and preserves rotated pan/pinch/zoom behavior. Unit and browser cardinal movement checks added. Pending browser CI.

## Checkpoint 19 — rendered orientation verification and compass
Instrumented the actual Canvas2D transform to validate camera forward/up and right/right at four yaw angles on both profiles. Desktop screenshots at each cardinal direction. Added north compass, visible gateway marker and offscreen gate bearing; does not imply a traversable route or bypass obstacles. Fixed rotated clipping for treasure and night tint. Pending CI.

## Checkpoint 20 — procedural articulated hero animation
Independent animation implementation: two-bone IK with fixed segment lengths for legs and arms, terrain-aware feet with stance/swing anchors and reach limits, damped blend weights for run/air/dash/flight/hurt, and an eight-node damped cape chain driven by velocity and acceleration. Teleport reset avoids stretching; combat hit timing and all gameplay mechanics remain unchanged. Three new pure animation tests plus browser bone-length assertions and attack screenshots. Procedural rig, not imported motion-capture or GPU skinning; pending CI.

## Checkpoint 21 — Eclipse Plate character art and chained attack crossfade
Replaced rounded breastplate, helmet and shoulder shapes with faceted fitted metal shells, angular faceplate, narrow visor, ridge details, bronze edging and articulated overlapping pauldrons. Added a cloth-following back insignia. Combo transitions capture the previous sword pose and blend into the next strike without resetting to idle; hit timing remains unchanged. Added crossfade endpoint and weapon normalization tests. Pending CI and visual review.

## Checkpoint 22 — seven guardian attack animation clips
Independent attack timeline for each guardian: anticipation, strike, contact and recovery. Recovery persists after damage is resolved, preventing instant pose reset. Reaper sweep, thorn cleave, weaver lunge, veil ritual, cinder slam, storm thrust and ashbound crosscut have different hand, torso and blade targets. Skeletons and humanoid enemies also use fixed-length arm IK. Existing damage timing and attack reach are preserved. Added two timeline continuity tests and browser clip checks. Pending CI.

## Checkpoint 23 — reproducible visual comparison
A local-only visual capture hook steps the real game simulation and renders actual Chrome frames. Separate CI job after full regression captures 36 frames of run, combo, jump and dash and emits a controlled 12fps replay plus pose data. This replay is not a performance benchmark. The same job packages the exact static PWA runtime and Windows local server launcher into a playable ZIP, without npm. Pending CI.

## Checkpoint 24 — cinematic spectacle overhaul
Checkpoint 23 fully passed (CI 45413442789). Replaced opaque title panel with responsive live 3D composition preserving original logo and credits. Added twin monumental entry sentinels and near-spawn lanterns to every realm, non-colliding animated portal surface (world-space shader), hit/dash/portal ground shockwaves and local dynamic illumination, smoothly blended dash FOV. Added two unit tests and title screenshots in Chrome. Existing seven-world progression, input and collision remain protected by the regression suite. Pending CI.

## Checkpoint 25 — visibly distinct graphics profiles
Checkpoint 24 passed full CI 45415135337. Main was still 27 commits behind; production synchronization must use verified commits. ULTRA locks adaptive resolution, with explicit pixel/GL safety caps, 3072 shadow texture, higher actual render size, dense instanced animated grass and biome flora, metal environment highlights and dedicated contrast/sharpen pass. LOW omits foliage and post effects; medium/high use lower budgets. Settings shows current internal resolution. CI asserts real canvas sizes, shadow sizes, foliage counts and GPU errors; visual replay captures four presets at the same controlled simulation time. Procedural art, not AAA assets. Pending CI.

## Checkpoint 26 — real graphics button and pixel comparison
Fixed the HIGH vegetation sampler to cover both shoulders. Settings shows actual render dimensions, renderer fallback and allocated shadow map instead of a promised shadow resolution. Browser regression exercises the actual settings button and persistence; controlled visual capture measures RGB differences between real browser screenshots at LOW, HIGH and ULTRA and publishes the measured values. The test does not by itself establish aesthetic quality. Main was advanced without force to previously verified checkpoint 24. New graphics revision remains on draft branch pending CI.

## Checkpoint 27 — full-body motion and aerial choreography
Checkpoint 26 passed CI 45418702856 and main was fast-forwarded to it without force. Animation pass: directional stance/swing foot targets, toe roll, contact-based footstep particles, continuous spherical weapon rotation, hip/spine inertia, upper-body counterrotation, full-body forward flight pitch, streamlined sword carry and temporal 3D dash/flight ribbons. Fixed animation capture expanded to 60 actual frames including sideways travel and triple-jump flight. Existing hit windows, speed, key bindings, map orientation and seven-world progression retained. Three additional animation tests. Pending CI, no aesthetic parity claim.

## Checkpoint 28 — animation cadence and pose transform optimization
Sprint visual cadence capped at 2.65 cycles/s with speed-adaptive stance fraction; movement speed is unchanged. Removed duplicate procedural footstep dust, retaining actual rig contact events. Affine basis and inverse-transpose normals are computed once per ellipsoid, rather than reevaluating articulated transforms for every vertex. Added cadence and affine correctness tests. Pending CI; no measured performance claim.

## Checkpoint 29 — stylized action animation and startup repair
Checkpoint 27 passed complete CI; checkpoint 28 unit tests passed but first rendered frame timed out. Fixed unbound foot transform context and enabled immediate browser error diagnostics. Added original cyclic locomotion keyframe poses, fast sprint/braking/turn blend, jump tuck and falling stretch, articulated shoulder armor, aerial dash banking and distinct sword ribbon boundaries. All gameplay speeds and instant controls unchanged. Pending browser and visual replay validation; style target is expressive action animation, not photorealism or competitor asset reproduction.

## Checkpoint 30 — visible full-body silhouette and continuous joint surfaces
Visual review of checkpoint 27 actual browser frames showed that the long cape concealed most leg motion. Replaced disconnected limb cylinder/sphere combinations with a continuous deforming two-bone ring surface and fitted plates, lengthened legs relative to torso, replaced long cape with animated split mantle, brought third-person camera closer with a small lateral offset keeping the camera axes parallel. Collision and movement speeds unchanged. CPU procedural surface deformation, not GPU skinning. Added a mesh continuity test and browser diagnostics. Pending CI. Development limit requested by user: checkpoint 35.

## Checkpoint 31 — full-body combat choreography
Three authored procedural full-body attack tracks add hip shift, body drop, torso pitch and roll, foot placement and independent guard-hand targets to the existing sword curves. Buffered combos blend from the previous whole-body pose. Contact timing, damage, movement speed and input responsiveness remain unchanged. Unit tests verify continuity and distinct contact poses. Pending CI.

## Checkpoint 32 — enemy and wildlife locomotion
Distance-driven enemy and wildlife gait advances from actual collision-resolved movement, blends toward idle when stationary, adds two-bone foot placement to humanoids and guardians, diagonal quadruped stepping, articulated bat wing joints, spider alternating legs and attack lunge poses. Gameplay AI, enemy counts and attack timing unchanged. Added movement/idle gait unit test. Pending CI.

## Checkpoint 33 — rigid body posing and sprint contact continuity
Replaced shear-based torso posing with true orthogonal rotation around the pelvis; head counter-rotation responds to camera heading without stretching neck/armor. Shortened sprint stance duty cycle and retained swing endpoint on contact rather than snapping to a new location; overreach clamps continuously. Movement and attack mechanics unchanged. Added rotation-invariance test. Pending CI.

## Checkpoint 34 — depth-tested translucent motion effects
Visual review of checkpoint 30 browser attack frame showed opaque ribbons and bright rings obscuring the character. Isolated sword/dash/impact trails in a translucent depth-tested pass, excluded from shadow casting, reduced glow intensity and skipped discontinuous sword trail segments. Kept CPU fallback and gameplay telegraphs. Pending browser validation.
