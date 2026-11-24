# ALL Create by LamberthRumpaidus
"""Dependency-free Chrome WebDriver smoke test on GitHub's Ubuntu runner."""
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
        wait(lambda:js('return Landlord3D.getStatus().visibleChunks>0'))
        status=js('return Landlord3D.getStatus()')
        assert status['player']['hp']>0,status
        assert status['submittedTriangles']>0,status
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
        print(json.dumps({'profile':'mobile' if mobile else 'desktop','renderer':title['renderer'],'realms':len(checks),'wildlife':status['wildlifeCount'],'submittedTriangles':status['submittedTriangles'],'visibleChunks':status['visibleChunks'],'offlineReload':True,'errors':[]}),flush=True)

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
