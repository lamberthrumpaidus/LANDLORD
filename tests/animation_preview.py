# ALL Create by LamberthRumpaidus
"""Capture actual LANDLORD frames at fixed simulation intervals; not a real-time FPS test."""
import base64, json, os, pathlib, shutil, subprocess
from browser_smoke import ROOT, SITE, PORT, request, wait, session

def capture():
    out=ROOT/'animation-preview'
    out.mkdir(exist_ok=True)
    with session(False) as sid:
        def js(script,*args):
            return request('POST',sid+'/execute/sync',{'script':script,'args':args})
        request('POST',sid+'/window/rect',{'width':960,'height':600})
        request('POST',sid+'/url',{'url':SITE+'?visual-test=1'})
        wait(lambda:js('return !!window.Landlord3D?.visualCapture'))
        assert js('return Landlord3D.getStatus().renderer')=='gpu'
        el=request('POST',sid+'/element',{'using':'css selector','value':'#play'})
        request('POST',sid+'/element/'+el['element-6066-11e4-a52e-4f735466cecf']+'/click',{})
        wait(lambda:js("return Landlord3D.getStatus().state==='playing'"))
        wait(lambda:js('return Landlord3D.getStatus().splashTime<=0'),60)
        wait(lambda:js('return Landlord3D.getStatus().materialTextures===5'),60)
        js("Landlord3D.setGraphicsQuality('balanced');Landlord3D.controls.setOrbit(0.35);Landlord3D.setCameraPitch(0.18);Landlord3D.visualCapture.begin()")
        key=lambda type,code:js("window.dispatchEvent(new KeyboardEvent(arguments[0],{code:arguments[1]}))",type,code)
        report=[]
        # Each image is an actual rendered frame from the same game and same camera.
        # Fixed 1/12 simulation second per frame avoids confusing slow headless software GL with animation timing.
        for i in range(36):
            if i==0:key('keydown','KeyW')
            if i==9:key('keyup','KeyW')
            if i==11:js('Landlord3D.attack()')
            if i==14:js('Landlord3D.attack()')
            if i==18:js('Landlord3D.attack()')
            if i==24:js('Landlord3D.jump()')
            if i==29:js('Landlord3D.dash()')
            state=js('return Landlord3D.visualCapture.step(1/12)')
            assert state and state['state']['frames']>0,state
            assert not js('return Landlord3D.gpuErrors()')
            report.append({'frame':i,'simulationSeconds':round((i+1)/12,4),**state})
            (out/f'frame-{i:03d}.png').write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        (out/'pose-report.json').write_text(json.dumps(report,indent=2))
        assert any(x['state']['mode']=='run' for x in report), 'No actual run pose captured'
        assert any(x['attack']['progress']>0 for x in report), 'No actual attack pose captured'
        assert any(x['state']['mode'] in ('rise','fall','dash') for x in report), 'No actual air/dash pose captured'
        js('Landlord3D.visualCapture.end()')
    if shutil.which('ffmpeg'):
        subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','12','-i',str(out/'frame-%03d.png'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'LANDLORD-animation-preview.mp4')],check=True)
    (out/'README.txt').write_text('Actual Chrome-rendered frames, fixed simulation steps at 12 frames/s. This is a controlled animation replay, NOT a measured real-time performance recording.\n')

if __name__=='__main__':
    driver=shutil.which('chromedriver') or str(pathlib.Path(os.environ['CHROMEWEBDRIVER'])/'chromedriver')
    with subprocess.Popen(['python3','-m','http.server','8000','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL) as server, subprocess.Popen([driver,'--port='+str(PORT)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL) as chrome:
        try:
            def ready():
                try:return request('GET','/status').get('ready')
                except (OSError,RuntimeError):return False
            wait(ready,20)
            capture()
        finally:
            chrome.terminate()
            server.terminate()
