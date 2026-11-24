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
