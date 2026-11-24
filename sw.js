/* ALL Create by LamberthRumpaidus */
const CACHE='landlord-nextgen-20261124-18';
const CORE=[
  "index.html",
  "manifest.webmanifest",
  "src/js/platform/offline.js",
  "src/js/platform/SaveStore.js",
  "src/js/ui/WorldAtlas.js",
  "src/js/engine/CombatRules.js",
  "src/js/engine/RealmArt.js",
  "src/js/engine/FrameProfiler.js",
  "src/js/engine/MeshBudget.js",
  "src/css/realm-art.css",
  "src/css/atlas.css",
  "src/js/engine/GeometryChunks.js",
  "src/js/engine/MaterialLibrary.js",
  "src/js/engine/CinematicPipeline.js",
  "src/js/engine/BossModels.js",
  "src/js/engine/ParticleBatch.js",
  "src/js/engine/EnemyModels.js",
  "assets/branding/landlord-icon.png",
  "assets/branding/landlord-portal-logo.png",
  "assets/creator-banner.png",
  "assets/logo/lr-original.png",
  "assets/lr-credit-logo-v2.png",
  "assets/night-sky.webp",
  "assets/scene/night-sky.webp",
  "assets/textures/bamboo_bark_1p5k.png",
  "assets/textures/bamboo_leaves_1p5k.png",
  "assets/textures/ground_moss_1p5k.png",
  "assets/textures/sakura_petals_1p5k.png",
  "assets/textures/stone_path_1p5k.png",
  "assets/textures/water_soft_1p5k.png",
  "src/css/base.css",
  "src/css/brand-menu.css",
  "src/css/final.css",
  "src/css/sonic-hd.css",
  "src/css/nextgen-hud.css",
  "src/js/audio/soundscape.js",
  "src/js/runtime/game.js",
  "src/js/ui/mobile-safe-area.js",
  "src/js/visual/cinematic-fx.js"
];
const url=p=>new URL(p,self.registration.scope).href;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // Atomic installation: a failed required asset keeps the previous worker active.
  try{await cache.addAll(CORE.map(p=>new Request(url(p),{cache:'reload'})));}catch(error){await caches.delete(CACHE);throw error;}
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('landlord-nextgen-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(url('index.html'))||fetch(req);})());return;
 }
 if(!CORE.some(p=>url(p)===req.url))return;
 event.respondWith((async()=>await (await caches.open(CACHE)).match(req)||fetch(req))());
});
