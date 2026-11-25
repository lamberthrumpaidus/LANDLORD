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
        quality_report={}
        for preset in ['low','balanced','high','cinematic']:
            js("document.querySelector('[data-graphics='+arguments[0]+']').click()",preset)
            js('Landlord3D.visualCapture.step(0)')
            quality_report[preset]=js('return Landlord3D.getGraphicsReport()')
            assert not js('return Landlord3D.gpuErrors()')
            (out/f'quality-{preset}.png').write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        (out/'quality-report.json').write_text(json.dumps(quality_report,indent=2))
        js("Landlord3D.setGraphicsQuality('balanced')")
        # Each image is an actual rendered frame from the same game and same camera.
        # Fixed 1/24 simulation second per frame avoids confusing slow headless software GL with animation timing.
        for i in range(120):
            if i==0:key('keydown','KeyW')
            if i==18:key('keyup','KeyW')
            if i==22:js('Landlord3D.attack()')
            if i==28:js('Landlord3D.attack()')
            if i==36:js('Landlord3D.attack()')
            if i==48:js('Landlord3D.jump()')
            if i==58:js('Landlord3D.dash()')
            if i==70:key('keydown','KeyD')
            if i==80:key('keyup','KeyD')
            if i==82:js('Landlord3D.jump();Landlord3D.jump();Landlord3D.jump()')
            if i==86:key('keydown','KeyW')
            if i==96:js('Landlord3D.dash()')
            if i==112:key('keyup','KeyW')
            state=js('return Landlord3D.visualCapture.step(1/24)')
            assert state and state['state']['frames']>0,state
            assert not js('return Landlord3D.gpuErrors()')
            motion=js('return Landlord3D.getAnimationReport()')
            assert all(abs(v['upper']-.85)<1e-5 and abs(v['lower']-.80)<1e-5 for v in motion['legs']),motion['legs']
            report.append({'frame':i,'simulationSeconds':round((i+1)/24,4),'transparentFXTriangles':motion['transparentMotionFX'],'choreography':motion['choreography'],**state})
            (out/f'frame-{i:03d}.png').write_bytes(base64.b64decode(request('GET',sid+'/screenshot')))
        (out/'pose-report.json').write_text(json.dumps(report,indent=2))
        assert any(x['state']['mode']=='run' for x in report), 'No actual run pose captured'
        assert any(x['attack']['progress']>0 for x in report), 'No actual attack pose captured'
        assert any(x['state']['mode'] in ('rise','fall','dash') for x in report), 'No actual air/dash pose captured'
        assert any(x['state']['mode']=='flight' and x['state']['body']['flightLean']>.5 for x in report), 'No forward flight pose captured'
        assert any(x['state']['dashTrail']>1 for x in report), 'No temporal dash ribbon captured'
        assert any(x['state']['style']['sprint']>.5 for x in report), 'No expressive sprint pose captured'
        assert any(x['transparentFXTriangles']>0 for x in report), 'No translucent effects captured'
        assert any(abs(x['choreography']['shift'])>.06 for x in report), 'No full-body attack displacement captured'
        js('Landlord3D.visualCapture.end()')
    if shutil.which('ffmpeg'):
        def pixels(preset):
            return subprocess.check_output(['ffmpeg','-loglevel','error','-i',str(out/f'quality-{preset}.png'),'-vf','scale=160:100:flags=area','-f','rawvideo','-pix_fmt','rgb24','-'])
        images={q:pixels(q) for q in ['low','balanced','high','cinematic']}
        def difference(a,b):
            # Mean absolute RGB-channel difference in the real browser screenshots (0–255 scale).
            assert len(a)==len(b)==160*100*3
            return sum(abs(x-y) for x,y in zip(a,b))/len(a)
        diffs={'LOW_vs_ULTRA':difference(images['low'],images['cinematic']),'HIGH_vs_ULTRA':difference(images['high'],images['cinematic'])}
        (out/'quality-pixel-difference.json').write_text(json.dumps(diffs,indent=2))
        assert diffs['LOW_vs_ULTRA']>1 and diffs['HIGH_vs_ULTRA']>.25,diffs
        subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','24','-i',str(out/'frame-%03d.png'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'LANDLORD-animation-preview.mp4')],check=True)
    (out/'README.txt').write_text('Actual Chrome-rendered frames, fixed simulation steps at 24 frames/s. This is a controlled animation replay, NOT a measured real-time performance recording.\n')

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
