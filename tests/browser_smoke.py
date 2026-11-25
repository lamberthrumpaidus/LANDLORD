# ALL Create by LamberthRumpaidus
"""Dependency-free Chrome WebDriver smoke test on GitHub's Ubuntu runner."""
import base64
import contextlib
import json
import os
import pathlib
import shutil
import subprocess
import time
import urllib.request
import urllib.error

ROOT=pathlib.Path(__file__).resolve().parents[1]
PORT=9515
SITE='http://127.0.0.1:8000/'
WD=f'http://127.0.0.1:{PORT}'

def request(method,path,payload=None):
    body=None if payload is None else json.dumps(payload).encode()
    req=urllib.request.Request(WD+path,data=body,method=method,headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=150) as result:
            return json.load(result).get('value')
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f'{method} {path}: {exc.read().decode()}') from exc

def wait(fn,timeout=90):
    deadline=time.monotonic()+timeout
    while time.monotonic()<deadline:
        value=fn()
        if value:
            return value
        time.sleep(.4)
    raise AssertionError('Wait timed out')

@contextlib.contextmanager
def session(mobile):
    options={'args':['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--window-size=1280,720']}
    browser=shutil.which('google-chrome') or shutil.which('chromium')
    if browser:
        options['binary']=browser
    if mobile:
        options['mobileEmulation']={'deviceMetrics':{'width':412,'height':915,'pixelRatio':2.625,'touch':True,'mobile':True},'userAgent':'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'}
    value=request('POST','/session',{'capabilities':{'alwaysMatch':{'browserName':'chrome','pageLoadStrategy':'eager','goog:chromeOptions':options}}})
    path='/session/'+value['sessionId']
    try:
        yield path
    finally:
        request('DELETE',path)

def run(mobile):
    with session(mobile) as sid:
        def js(script,*args):
            return request('POST',sid+'/execute/sync',{'script':script,'args':args})
        def cdp(cmd,params=None):
            return request('POST',sid+'/goog/cdp/execute',{'cmd':cmd,'params':params or {}})
        cdp('Page.addScriptToEvaluateOnNewDocument',{'source':"window.__landlordErrors=[];window.addEventListener('error',e=>{if(e.message)window.__landlordErrors.push(e.message)});window.addEventListener('unhandledrejection',e=>window.__landlordErrors.push(String(e.reason)));"})
        request('POST',sid+'/url',{'url':SITE+'?visual-test=1'})
        wait(lambda:js('return !!window.Landlord3D'))
        title=js('return Landlord3D.getStatus()')
        assert title['renderer']=='gpu',title
        assert js('return Landlord3D.getBuildInfo().checkpoint')==40
        assert len(title['seals'])==7,title
        assert len(title['landmarks'])==7 and all(p['triangles']>100 for p in title['landmarks']),title['landmarks']
        spectacle=js('return Landlord3D.getSpectacleReport()')
        assert len(spectacle['entryArt'])==7 and all(x['triangles']>100 for x in spectacle['entryArt']),spectacle
        assert spectacle['portalShader']
        out=ROOT/'test-results';out.mkdir(exist_ok=True)
        wait(lambda:js("if(window.__landlordErrors.length)throw Error(window.__landlordErrors.join('; '));return Landlord3D.getStatus().visibleChunks>0"))
        (out/('title-mobile.png' if mobile else 'title-desktop.png')).write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        # Actual click dispatch through WebDriver so WebAudio receives a user gesture.
        el=request('POST',sid+'/element',{'using':'css selector','value':'#play'})
        key=el['element-6066-11e4-a52e-4f735466cecf']
        request('POST',sid+'/element/'+key+'/click',{})
        wait(lambda:js("return Landlord3D.getStatus().state==='playing'"))
        checks=js('return Landlord3D.runRealmChecks()')
        assert len(checks)==7 and all(c['middlePassable'] for c in checks),checks
        assert js("return !Landlord3D.combatContact({x:0,y:0,z:10,angle:0},{x:0,y:12,z:11},5)")
        assert js("return !Landlord3D.combatContact({x:0,y:0,z:10,angle:0},{x:3,y:0,z:10},5)")
        assert js("const g=Landlord3D.portalPoint(0);return !Landlord3D.combatContact({x:g.x-12,y:1,z:g.z-4,angle:0},{x:g.x-12,y:1,z:g.z+4},10)")
        def rendered_frame():
            errors=js('return window.__landlordErrors')
            if errors:
                raise AssertionError('Frame failure: '+json.dumps(errors[:4]))
            return js('return Landlord3D.getStatus().visibleChunks>0')
        wait(rendered_frame)
        status=js('return Landlord3D.getStatus()')
        assert status['player']['hp']>0,status
        assert status['submittedTriangles']>0,status
        assert status['dynamicMesh']['triangles']>0 and status['dynamicMesh']['culled']>0,status
        assert status['dynamicMesh']['uploads']==1,status
        assert status['particleInstancing'],status
        assert js('return typeof LandlordEnemyModels.skeleton===\'function\'')
        wait(lambda:js('return Landlord3D.getStatus().materialTextures===5'),60)
        wait(lambda:js('return Landlord3D.getStatus().postFX.frames>0'),60)
        assert not js('return Landlord3D.gpuErrors()'),'WebGL error after post-processing'
        # Capture the actual rendered game after the chapter intro has cleared.
        wait(lambda:js('return Landlord3D.getStatus().splashTime<=0'),45)
        assert js("return getComputedStyle(document.getElementById('hpText')).display!=='none'&&document.getElementById('bones').getBoundingClientRect().width>0")
        out=ROOT/'test-results'
        out.mkdir(exist_ok=True)
        (out/('mobile.png' if mobile else 'desktop.png')).write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        status=js('return Landlord3D.getStatus()')
        perf=js('return Landlord3D.getPerformanceReport()')
        assert perf['samples']>0 and perf['frame']['p95']>0 and perf['mesh']['mean']>=0,perf
        print(json.dumps({'profileTiming':'mobile' if mobile else 'desktop','measurement':perf,'dynamicMesh':status['dynamicMesh']}),flush=True)
        rig=js('return Landlord3D.getAnimationReport()')
        assert rig['frames']>0 and len(rig['legs'])==2 and rig['armor']=='eclipse-plate',rig
        assert all(abs(x)<2 for v in rig['cape'] for x in v),rig
        assert len(set(rig['enemyClips']))==7,rig
        assert all(abs(v['upper']-.85)<1e-5 and abs(v['lower']-.80)<1e-5 for v in rig['legs']),rig
        assert 'flightLean' in rig['body'] and 'dashTrail' in rig
        assert rig['surface']=='continuous-limbs-split-mantle'
        assert len(rig['choreography'])==10,rig
        assert rig['transparentMotionFX']>=0,rig
        # Quality changes must not reset destructible objects or the current journey.
        js('Landlord3D.damageCrate(0,100)')
        assert js('return Landlord3D.breakableSpots()[0].dead')
        wait(lambda:js('return Landlord3D.getStatus().particleFrames>0'))
        graphics_reports={}
        for preset,shadow in [('low',0),('balanced',512),('high',1024),('cinematic',3072)]:
            js("document.querySelector('[data-graphics='+arguments[0]+']').click()",preset)
            assert js("return document.querySelector('[data-graphics='+arguments[0]+']').classList.contains('selected')",preset)
            assert js("return localStorage.getItem('rubaka3d-quality')")==preset
            wait(lambda:js('return Landlord3D.getStatus().shadowResolution')==shadow)
            if preset=='low':
                wait(lambda:js('return !Landlord3D.getStatus().postFX.active'))
            else:
                wait(lambda:js('return Landlord3D.getStatus().postFX.active'))
            assert js('return Landlord3D.getStatus().postFX.ambientOcclusion')==(preset in ('high','cinematic'))
            assert js('return Landlord3D.breakableSpots()[0].dead')
            if preset=='low':
                wait(lambda:js('return Landlord3D.getGraphicsReport().grassInstances===0'))
            else:
                wait(lambda:js('return Landlord3D.getGraphicsReport().grassInstances>0'))
            graphics_reports[preset]=js('return Landlord3D.getGraphicsReport()')
        assert graphics_reports['cinematic']['locked'] and graphics_reports['cinematic']['adaptiveFactor']==1,graphics_reports
        assert graphics_reports['cinematic']['grassInstances']>graphics_reports['high']['grassInstances'],graphics_reports
        assert graphics_reports['cinematic']['resolution'][0]>graphics_reports['low']['resolution'][0]*1.5,graphics_reports
        print(json.dumps({'graphicsProfiles':'mobile' if mobile else 'desktop','reports':graphics_reports}),flush=True)
        js("Landlord3D.setGraphicsQuality('balanced')")
        assert not js('return Landlord3D.gpuErrors()'),'WebGL error after quality switching'
        if mobile:
            size=js('return [innerWidth,innerHeight]')
            w,h=size
            action=js("const r=document.querySelector('[data-mobile-action=dash]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:3}")
            left={'x':w*.2,'y':h*.65,'id':1}
            right={'x':w*.75,'y':h*.35,'id':2}
            cdp('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[left,right]})
            wait(lambda:js('return Landlord3D.getStatus().touchContacts===2'))
            left['y']-=30
            right['x']-=24
            yaw=js('return Landlord3D.getStatus().cameraYaw')
            cdp('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[left,right]})
            wait(lambda:js('return Landlord3D.controls.getInput().walking'))
            assert js('return Landlord3D.getStatus().cameraYaw')!=yaw
            serial=js('return Landlord3D.instantState().dashSerial')
            cdp('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[left,right,action]})
            wait(lambda:js('return Landlord3D.instantState().dashSerial')>serial)
            assert js("return Landlord3D.getStatus().state==='playing'&&Landlord3D.getStatus().touchContacts===2&&Landlord3D.getStatus().actionContacts===1")
            cdp('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]})
            wait(lambda:js('return Landlord3D.getStatus().touchContacts===0&&Landlord3D.getStatus().actionContacts===0'))
            assert not js('return Landlord3D.controls.getInput().walking')
        serial=js('return Landlord3D.instantState().dashSerial')
        assert js('return Landlord3D.dash()')
        assert js('return Landlord3D.instantState().dashSerial')==serial+1
        assert js('return Landlord3D.getSpectacleReport().impactCount')>0
        js('Landlord3D.attack()')
        assert js('return Landlord3D.attackInfo().attackTime')>0
        (out/('attack-mobile.png' if mobile else 'attack-desktop.png')).write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        js('Landlord3D.jump();Landlord3D.jump();Landlord3D.jump()')
        assert js('return Landlord3D.instantState().flying')
        assert js('return Landlord3D.dash()')
        # Compare map projection with the actual game movement at four camera headings.
        for yaw in [0,1.5707963267948966,3.141592653589793,4.71238898038469]:
            js('Landlord3D.controls.setOrbit(arguments[0])',yaw)
            wait(lambda:js('const d=Landlord3D.getMapOrientation().drawn;return d&&Math.abs(d.yaw-arguments[0])<1e-6',yaw))
            drawn=js('return Landlord3D.getMapOrientation().drawn')
            assert abs(drawn['forward']['x'])<1e-6 and abs(drawn['forward']['y']+1)<1e-6,drawn
            assert abs(drawn['right']['x']-1)<1e-6 and abs(drawn['right']['y'])<1e-6,drawn
            if not mobile:
                (out/f'map-direction-{round(yaw*180/3.141592653589793):03d}.png').write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
            for x,z,expected in [(0,1,(0,-1)),(1,0,(1,0)),(0,-1,(0,1)),(-1,0,(-1,0))]:
                result=js('const d=Landlord3D.controls.cameraMove({x:arguments[0],z:arguments[1]});return Landlord3D.mapProject(d.x,d.z)',x,z)
                assert abs(result['x']-expected[0])<1e-6 and abs(result['y']-expected[1])<1e-6,result
        js('Landlord3D.controls.setOrbit(0.7)')
        # Verify key state is cleared when the atlas opens; simulation stays paused.
        js("window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'}))")
        assert js('return Landlord3D.controls.getInput().walking')
        # Exercise the interactive atlas before the rendered world transitions.
        js('Landlord3D.openMap()')
        wait(lambda:js("return Landlord3D.getStatus().state==='map'"))
        assert not js('return Landlord3D.controls.getInput().walking')
        paused=js('return Landlord3D.getStatus().gameTime')
        assert abs(js('return Landlord3D.getMapOrientation().viewport.yaw')-.7)<1e-6
        js("document.getElementById('atlasOrientation').click()")
        assert js('return Landlord3D.getMapOrientation().atlasNorthUp')
        js("document.getElementById('atlasOrientation').click()")
        assert abs(js('return Landlord3D.getMapOrientation().viewport.yaw')-.7)<1e-6
        js("document.getElementById('atlasZoomIn').click()")
        assert js('return Landlord3D.getMapOrientation().viewport.zoom')>1
        js("document.getElementById('atlasCenter').click()")
        assert js('return Landlord3D.getMapOrientation().viewport.zoom')==1
        rect=js("const r=document.getElementById('bigMap').getBoundingClientRect();return {x:r.x+r.width*.5,y:r.y+r.height*.45}")
        if mobile:
            points=[{'x':rect['x']-35,'y':rect['y'],'id':11},{'x':rect['x']+35,'y':rect['y'],'id':12}]
            cdp('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points})
            points[0]['x']-=25;points[1]['x']+=25
            cdp('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':points})
            wait(lambda:js('return Landlord3D.getMapOrientation().viewport.zoom')>1)
            cdp('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            wait(lambda:js('return Landlord3D.getMapOrientation().viewport.contacts')==0)
        else:
            cdp('Input.dispatchMouseEvent',{'type':'mouseWheel','x':rect['x'],'y':rect['y'],'deltaX':0,'deltaY':-200})
            wait(lambda:js('return Landlord3D.getMapOrientation().viewport.zoom')>1)
            before=js('return Landlord3D.getMapOrientation().viewport.x')
            cdp('Input.dispatchMouseEvent',{'type':'mousePressed','x':rect['x'],'y':rect['y'],'button':'left','buttons':1,'clickCount':1})
            cdp('Input.dispatchMouseEvent',{'type':'mouseMoved','x':rect['x']+35,'y':rect['y'],'button':'left','buttons':1})
            cdp('Input.dispatchMouseEvent',{'type':'mouseReleased','x':rect['x']+35,'y':rect['y'],'button':'left','buttons':0,'clickCount':1})
            wait(lambda:js('return Landlord3D.getMapOrientation().viewport.x')!=before)
        assert js('return Landlord3D.getStatus().gameTime')==paused
        (out/('atlas-mobile.png' if mobile else 'atlas-desktop.png')).write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        js('Landlord3D.openMap()')
        # Independently establish travel precondition; flight may legitimately end after earlier collisions.
        js('Landlord3D.visualCapture.begin();const p=Landlord3D.getStatus().player;Landlord3D.visualCapture.placeFlight(p.x,p.z,Landlord3D.getFlightReport().ground+35);Landlord3D.visualCapture.end()')
        assert js('return Landlord3D.getFlightReport().flying')
        routes=js('return Landlord3D.getRealmRoutes()')
        assert len(routes)==7 and len(set(tuple(r['grid']) for r in routes))==7,routes
        assert any(r['direction']=="back" for r in routes) and any(r['direction'] in ("left","right") for r in routes),routes
        # Exercise the rendered world transitions in the actual game.
        visited=[0]
        if not mobile:
            for realm in range(1,7):
                js('Landlord3D.openMap()')
                wait(lambda:js("return Landlord3D.getStatus().state==='map'"))
                before=js('return Landlord3D.getStatus().postFX.frames')
                assert js('return Landlord3D.getFlightReport().flying'),js('return Landlord3D.getFlightReport()')
                assert js('return Landlord3D.travelRealm(arguments[0])',realm),realm
                wait(lambda:js('return Landlord3D.getStatus().zone')==realm)
                wait(lambda:js('return Landlord3D.getStatus().postFX.frames')>before)
                assert js('return Landlord3D.getStatus().visited[arguments[0]]',realm)
                assert not js('return Landlord3D.gpuErrors()')
                visited.append(realm)
                assert js("return document.getElementById('sky').dataset.realm")==str(realm)
                wait(lambda:js('return Landlord3D.getStatus().splashTime<=0'),60)
                (out/f'realm-{realm+1:02d}.png').write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
            # Return to the first realm; ensure travel remains reversible.
            js('Landlord3D.openMap()')
            assert js('return Landlord3D.travelRealm(0)')
            wait(lambda:js('return Landlord3D.getStatus().zone===0'))
        # Test real keyboard/touch landing input and a collision with a real gate post.
        js('Landlord3D.visualCapture.begin()')
        start=js('return Landlord3D.getStatus().player')
        js('Landlord3D.testSetPosition(arguments[0],arguments[1])',start['x'],start['z'])
        ground=js('return Landlord3D.getFlightReport().ground')
        js('Landlord3D.visualCapture.placeFlight(arguments[0],arguments[1],arguments[2])',start['x'],start['z'],ground+12)
        if mobile:
            rect=js("const b=document.querySelector('.btn-descend'),r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,visible:!b.hidden,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.btn-descend')===b}")
            assert rect['visible'] and rect['hit'],rect
            cdp('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':rect['x'],'y':rect['y'],'id':91}]})
            cdp('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else:
            js("const code=Landlord3D.controls.getBindings().descend;window.dispatchEvent(new KeyboardEvent('keydown',{code}));window.dispatchEvent(new KeyboardEvent('keyup',{code}))")
        assert js('return Landlord3D.getFlightReport().landing')
        js('Landlord3D.jump();Landlord3D.jump();Landlord3D.jump()')
        assert js('return Landlord3D.getFlightReport().flying&&!Landlord3D.getFlightReport().landing')
        js("const code=Landlord3D.controls.getBindings().descend;window.dispatchEvent(new KeyboardEvent('keydown',{code}));window.dispatchEvent(new KeyboardEvent('keyup',{code}))")
        landed=js('return Landlord3D.visualCapture.advance(2)')
        assert not landed['flying'] and landed['grounded'] and landed['reason']=='landing',landed
        gate=js('return Landlord3D.runRealmChecks()[0].gate')
        # Select an actual unobstructed approach to the existing right gate column.
        approach=js("""const g=arguments[0],x=g.x+12;Landlord3D.testSetPosition(x,g.z);const hit=Landlord3D.collisionAt(x,g.z,Landlord3D.getFlightReport().ground);
        if(!hit)return null;const y=Math.max(hit.minY+.35,Landlord3D.getFlightReport().ground+1);
        for(let d=3;d<=18;d+=.25){const z=g.z-d;if(!Landlord3D.collisionAt(x,z,y)&&Landlord3D.collisionAt(x,g.z,y))return {x,z,y};}return null;""",gate)
        assert approach,gate
        roof=js("""const g=arguments[0],x=g.x+12;Landlord3D.testSetPosition(x,g.z);const ground=Landlord3D.getFlightReport().ground;let top=null;for(let y=ground;y<ground+35;y+=.2)if(Landlord3D.collisionAt(x,g.z,y))top=y;return top===null?null:{x,z:g.z,y:top+2,ground};""",gate)
        assert roof,gate
        js('Landlord3D.visualCapture.placeFlight(arguments[0].x,arguments[0].z,arguments[0].y)',roof)
        js("const code=Landlord3D.controls.getBindings().descend;window.dispatchEvent(new KeyboardEvent('keydown',{code}));window.dispatchEvent(new KeyboardEvent('keyup',{code}))")
        rooftop=js('return Landlord3D.visualCapture.advance(2)')
        assert rooftop['grounded'] and not rooftop['flying'] and rooftop['y']>roof['ground']+.3,rooftop
        js('Landlord3D.visualCapture.placeFlight(arguments[0].x,arguments[0].z,arguments[0].y);Landlord3D.controls.setOrbit(0);Landlord3D.setCameraPitch(.32);Landlord3D.dash()',approach)
        crash=js('return Landlord3D.visualCapture.advance(.35)')
        assert not crash['flying'] and crash['reason']=='collision' and crash['collisions']>0,crash
        settled=js('return Landlord3D.visualCapture.advance(3)')
        assert settled['grounded'] and not settled['flying'],settled
        js('Landlord3D.visualCapture.end()')
        print(json.dumps({'flightRegression':'mobile' if mobile else 'desktop','landing':landed,'collision':crash,'settled':settled,'roof':rooftop}),flush=True)
        wait(lambda:js('return LandlordAudio.ambientEmitter'),30)
        js('Landlord3D.openMap()')
        wait(lambda:js("return Landlord3D.getStatus().state==='map'"))
        js('Landlord3D.openMap()')
        wait(lambda:js("return Landlord3D.getStatus().state==='playing'"))
        wait(lambda:js("return document.documentElement.dataset.offline==='ready'&&!!navigator.serviceWorker.controller"),120)
        assert not js('return window.__landlordErrors'),js('return window.__landlordErrors')
        wait(lambda:js("return LandlordSaveStore.status().mirror==='ready'&&LandlordSaveStore.status().writes>0"))
        request('POST',sid+'/execute/async',{'script':'const done=arguments[arguments.length-1];LandlordSaveStore.flush().then(()=>done(true));','args':[]})
        js("localStorage.removeItem('landlord-openrealms-save-v1')")
        cdp('Network.enable')
        cdp('Network.emulateNetworkConditions',{'offline':True,'latency':0,'downloadThroughput':0,'uploadThroughput':0})
        request('POST',sid+'/refresh',{})
        wait(lambda:js('return !!window.Landlord3D'))
        wait(lambda:js('return LandlordSaveStore.status().initialized&&LandlordSaveStore.has()'))
        assert js("return JSON.parse(LandlordSaveStore.getRaw()).brokenCrates[0]")
        assert not js('return window.__landlordErrors'),js('return window.__landlordErrors')
        print(json.dumps({'profile':'mobile' if mobile else 'desktop','renderer':title['renderer'],'realms':len(checks),'wildlife':status['wildlifeCount'],'submittedTriangles':status['submittedTriangles'],'visibleChunks':status['visibleChunks'],'postFX':status['postFX'],'textures':status['materialTextures'],'qualitySwitches':4,'visitedRealms':visited,'ambientEmitter':True,'combatInput':True,'multiTouch':mobile,'offlineReload':True,'indexedDBRecovery':True,'errors':[]}),flush=True)

if __name__=='__main__':
    driver=shutil.which('chromedriver') or str(pathlib.Path(os.environ['CHROMEWEBDRIVER'])/'chromedriver')
    with subprocess.Popen(['python3','-m','http.server','8000','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL) as server, subprocess.Popen([driver,'--port='+str(PORT)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL) as chrome:
        try:
            def ready():
                try:
                    return request('GET','/status').get('ready')
                except (OSError,RuntimeError):
                    return False
            wait(ready,20)
            run(False)
            run(True)
        finally:
            chrome.terminate()
            server.terminate()
