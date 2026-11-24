// ALL Create by LamberthRumpaidus
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [name,options] of [['desktop',{viewport:{width:1280,height:720}}],['mobile',{...devices['Pixel 7']}]]) {
  const context=await browser.newContext(options);
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.Landlord3D,null,{timeout:90000});
  const title=await page.evaluate(()=>Landlord3D.getStatus());
  assert.equal(title.renderer,'gpu',name+' must initialize WebGL');
  assert.equal(title.seals.length,7);
  await page.locator('#play').click();
  await page.waitForFunction(()=>Landlord3D.getStatus().state==='playing');
  const checks=await page.evaluate(()=>Landlord3D.runRealmChecks());
  assert.equal(checks.length,7);
  assert.ok(checks.every(c=>c.middlePassable),JSON.stringify(checks));
  const start=await page.evaluate(()=>Landlord3D.getStatus());
  assert.equal(start.player.hp,100);
  await page.waitForFunction(()=>Landlord3D.getStatus().visibleChunks>0);
  const renderStats=await page.evaluate(()=>Landlord3D.getStatus());
  assert.ok(renderStats.submittedTriangles>0);
  await page.evaluate(()=>Landlord3D.openMap());
  await page.waitForFunction(()=>Landlord3D.getStatus().state==='map');
  await page.evaluate(()=>Landlord3D.openMap());
  await page.waitForFunction(()=>Landlord3D.getStatus().state==='playing');
  await page.waitForFunction(()=>document.documentElement.dataset.offline==='ready',null,{timeout:120000});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:30000});
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.Landlord3D,null,{timeout:90000});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({name,renderer:title.renderer,realms:checks.length,wildlife:start.wildlifeCount,offlineReload:true,visibleChunks:renderStats.visibleChunks,submittedTriangles:renderStats.submittedTriangles,errors}));
  await context.close();
 }
}finally{await browser.close()}
