# ALL Create by LamberthRumpaidus
"""Pack exact PWA runtime files, without source history or development dependencies."""
import json, pathlib, re, zipfile, os
root=pathlib.Path(__file__).resolve().parents[1]
worker=(root/'sw.js').read_text(encoding='utf-8')
paths=json.loads(re.search(r'const CORE=(\[[\s\S]*?\]);',worker).group(1))
paths=sorted(set(paths+['sw.js']))
out=root/'preview-dist'
out.mkdir(exist_ok=True)
with zipfile.ZipFile(out/'LANDLORD-playable-preview.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
    for path in paths:
        file=root/path
        if not file.is_file():raise FileNotFoundError(path)
        z.write(file,path)
    z.writestr('BUILD.txt','LANDLORD — Motion / Checkpoint 40\nRevision: '+os.environ.get('GITHUB_SHA','local')+'\n')
    z.writestr('START-LANDLORD.cmd','@echo off\r\ncd /d "%~dp0"\r\nstart "" http://localhost:8000/\r\npy -m http.server 8000 --bind 127.0.0.1\r\n')
    z.writestr('PLAY.txt','Extract ZIP. Windows: install Python if necessary, then run START-LANDLORD.cmd. Other platforms: python3 -m http.server 8000 --bind 127.0.0.1, open http://localhost:8000/. Use local HTTP instead of file:// for service worker and texture loading. No npm install required.\n')
print('Packaged',len(paths),'runtime files')
