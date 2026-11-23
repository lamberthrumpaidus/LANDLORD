#!/usr/bin/env python3
# Create by LamberthRumpaidus
"""Rebuild the deployed runtime safely from ordered source fragments.

The original game uses one shared closure. Splitting source while preserving declaration
order avoids introducing timing bugs. Edit the fragments, then run python tools/build.py.
"""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parts=sorted((root/'src/source').glob('*.part.js'))
assert len(parts)==5, 'Expected five ordered source fragments'
content='// Create by LamberthRumpaidus | Generated offline runtime\n'+''.join(p.read_text(encoding='utf8') for p in parts)
out=root/'src/js/runtime/game.js'
out.write_text(content,encoding='utf8')
print('LANDLORD runtime rebuilt:',out,'bytes',out.stat().st_size)
