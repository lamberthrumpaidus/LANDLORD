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
        request('POST',sid+'/url',{'url':SITE})
        wait(lambda:js('return !!window.Landlord3D'))
        title=js('return Landlord3D.getStatus()')
        assert title['renderer']=='gpu',title
        assert len(title['seals'])==7,title
        # Actual click dispatch through WebDriver so WebAudio receives a user gesture.
        el=request('POST',sid+'/element',{'using':'css selector','value':'#play'})
        key=el['element-6066-11e4-a52e-4f735466cecf']
        request('POST',sid+'/element/'+key+'/click',{})
        wait(lambda:js("return Landlord3D.getStatus().state==='playing'"))
        checks=js('return Landlord3D.runRealmChecks()')
        assert len(checks)==7 and all(c['middlePassable'] for c in checks),checks
        def rendered_frame():
            errors=js('return window.__landlordErrors')
            if errors:
                raise AssertionError('Frame failure: '+json.dumps(errors[:4]))
            return js('return Landlord3D.getStatus().visibleChunks>0')
        wait(rendered_frame)
        status=js('return Landlord3D.getStatus()')
        assert status['player']['hp']>0,status
        assert status['submittedTriangles']>0,status
        assert status['particleInstancing'],status
        wait(lambda:js('return Landlord3D.getStatus().materialTextures===2'),60)
        wait(lambda:js('return Landlord3D.getStatus().postFX.frames>0'),60)
        assert not js('return Landlord3D.gpuErrors()'),'WebGL error after post-processing'
        # Capture the actual rendered game after the chapter intro has cleared.
        wait(lambda:js('return Landlord3D.getStatus().splashTime<=0'),45)
        assert js("return getComputedStyle(document.getElementById('hpText')).display!=='none'&&document.getElementById('bones').getBoundingClientRect().width>0")
        out=ROOT/'test-results'
        out.mkdir(exist_ok=True)
        (out/('mobile.png' if mobile else 'desktop.png')).write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        status=js('return Landlord3D.getStatus()')
        # Quality changes must not reset destructible objects or the current journey.
        js('Landlord3D.damageCrate(0,100)')
        assert js('return Landlord3D.breakableSpots()[0].dead')
        wait(lambda:js('return Landlord3D.getStatus().particleFrames>0'))
        for preset,shadow in [('low',0),('balanced',512),('high',1024),('cinematic',2048)]:
            js('return Landlord3D.setGraphicsQuality(arguments[0])',preset)
            wait(lambda:js('return Landlord3D.getStatus().shadowResolution')==shadow)
            if preset=='low':
                wait(lambda:js('return !Landlord3D.getStatus().postFX.active'))
            else:
                wait(lambda:js('return Landlord3D.getStatus().postFX.active'))
            assert js('return Landlord3D.getStatus().postFX.ambientOcclusion')==(preset in ('high','cinematic'))
            assert js('return Landlord3D.breakableSpots()[0].dead')
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
        js('Landlord3D.attack()')
        assert js('return Landlord3D.attackInfo().attackTime')>0
        js('Landlord3D.jump();Landlord3D.jump();Landlord3D.jump()')
        assert js('return Landlord3D.instantState().flying')
        assert js('return Landlord3D.dash()')
        # Exercise the rendered world transitions in the actual game.
        visited=[0]
        if not mobile:
            for realm in range(1,7):
                js('Landlord3D.openMap()')
                wait(lambda:js("return Landlord3D.getStatus().state==='map'"))
                before=js('return Landlord3D.getStatus().postFX.frames')
                js('Landlord3D.travelRealm(arguments[0])',realm)
                wait(lambda:js('return Landlord3D.getStatus().zone')==realm)
                wait(lambda:js('return Landlord3D.getStatus().postFX.frames')>before)
                assert js('return Landlord3D.getStatus().visited[arguments[0]]',realm)
                assert not js('return Landlord3D.gpuErrors()')
                visited.append(realm)
            # Return to the first realm; ensure travel remains reversible.
            js('Landlord3D.openMap();Landlord3D.travelRealm(0)')
            wait(lambda:js('return Landlord3D.getStatus().zone===0'))
        wait(lambda:js('return LandlordAudio.ambientEmitter'),30)
        js('Landlord3D.openMap()')
        wait(lambda:js("return Landlord3D.getStatus().state==='map'"))
        js('Landlord3D.openMap()')
        wait(lambda:js("return Landlord3D.getStatus().state==='playing'"))
        wait(lambda:js("return document.documentElement.dataset.offline==='ready'&&!!navigator.serviceWorker.controller"),120)
        assert not js('return window.__landlordErrors'),js('return window.__landlordErrors')
        cdp('Network.enable')
        cdp('Network.emulateNetworkConditions',{'offline':True,'latency':0,'downloadThroughput':0,'uploadThroughput':0})
        request('POST',sid+'/refresh',{})
        wait(lambda:js('return !!window.Landlord3D'))
        assert not js('return window.__landlordErrors'),js('return window.__landlordErrors')
        print(json.dumps({'profile':'mobile' if mobile else 'desktop','renderer':title['renderer'],'realms':len(checks),'wildlife':status['wildlifeCount'],'submittedTriangles':status['submittedTriangles'],'visibleChunks':status['visibleChunks'],'postFX':status['postFX'],'textures':status['materialTextures'],'qualitySwitches':4,'visitedRealms':visited,'ambientEmitter':True,'combatInput':True,'multiTouch':mobile,'offlineReload':True,'errors':[]}),flush=True)

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
