"""Run with Python; verifies concrete token pairs, not whole UI accessibility."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent

def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return sum((c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4) * w
               for c, w in zip(channels, [.2126, .7152, .0722]))

def contrast(a, b):
    low, high = sorted([luminance(a), luminance(b)])
    return (high + .05) / (low + .05)

skins = json.loads((ROOT / 'palette-data.json').read_text())
css = (ROOT / 'skins.css').read_text(encoding='utf-8')
assert len(skins) == 22 and len({s['id'] for s in skins}) == 22
assert sum(s['mode'] == 'light' for s in skins) == 11
for skin in skins:
    body = re.search(r'\[data-skin="' + skin['id'] + r'"\] \{([^}]+)\}', css)[1]
    tokens = dict(re.findall(r'--ui-([\w-]+):\s*([^;]+);', body))
    assert tokens['mode'] == skin['mode']
    for role in ['text', 'muted', 'action', 'active-accent', 'success', 'warning', 'danger', 'focus', 'control-border']:
        minimum = 3 if role in ['focus', 'control-border'] else 4.5
        for surface in ['page', 'surface', 'active-surface']:
            assert contrast(tokens[role], tokens[surface]) >= minimum, (skin['id'], role, surface)
    assert contrast(tokens['action'], tokens['on-action']) >= 4.5
    for i in range(1, 7):
        assert contrast(tokens[f'chart-series-{i}'], tokens['surface']) >= 3
    ramp = [luminance(tokens[f'chart-seq-{i}']) for i in range(1, 6)]
    assert ramp == sorted(ramp) or ramp == sorted(ramp, reverse=True), skin['id']
    assert f'data-pick="{skin["id"]}"' in (ROOT / 'preview.html').read_text(encoding='utf-8')
print('PASS: 22 skins; 11 light / 11 dark; text, controls, focus, series contrast; monotonic sequential scales; preview coverage.')
