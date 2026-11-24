# LANDLORD NextGen — checkpoint 01

Branch: nextgen-remake. The original main branch is preserved.

Implemented:
- Explicit GLSL ES 3.00 conversion for WebGL2, with WebGL1 support retained.
- Dynamic shadow framebuffer settings: low off, balanced 512, high 1024, cinematic 2048; texel-correct PCF.
- Third-person camera collision sweep.
- PWA installation and offline asset caching for the original seven-world game.
- Browser smoke test for WebGL, all seven realm gateways, map interaction and offline reload.

Pending: review CI results; full PBR texture pipeline, glTF assets, animation overhaul, spatial audio, input stress test, profiling on real mobile hardware. No AAA quality claim until measured.
