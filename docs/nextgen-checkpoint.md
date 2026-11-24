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
