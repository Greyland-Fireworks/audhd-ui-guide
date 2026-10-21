"""Build the skills-only plugin using Python's standard library. Run from any directory."""
import hashlib
import json
import re
import shutil
import struct
import subprocess
import unicodedata
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'plugin/plugin.json').read_text(encoding='utf-8'))
assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', manifest['name'])
assert re.fullmatch(r'\d+\.\d+\.\d+', manifest['version'])
assert manifest['$schema'] == 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json'
interface = manifest['extensions']['com.openai']['interface']
for field, limit in [('displayName', 30), ('shortDescription', 30),
                     ('developerName', 80), ('longDescription', 4000)]:
    assert isinstance(interface[field], str) and 0 < len(interface[field]) <= limit, field
assert interface['category'] == 'Developer Tools'
prompts = interface['defaultPrompt']
assert len(prompts) <= 3 and len(set(prompts)) == len(prompts)
assert all(0 < len(p) <= 128 and '\n' not in p and '@' not in p for p in prompts)

# Explicit public-source allowlist: retains runnable examples and their validation
# assets without shipping checkout metadata, local profiles or installed dependencies.
tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
root_files = {
    'SKILL.md', 'GUIDE.md', 'PREFERENCES.md', 'README_JSON.md', 'README.md',
    'REVIEW_TEMPLATE.md', 'EXAMPLES.md', 'SKILL_EVALUATIONS.md',
    'EVALUATION_INPUTS.md', 'EVALUATION_RUBRIC.md', 'CONTRIBUTING.md',
    'LICENSE', 'LICENSE-CODE', 'LICENSE_SCOPE.md', 'PRIVACY.md', 'preferences.example.json',
    'audhd_uiux_icon_v2.svg', 'audhd_uiux_icon_256.png',
    'audhd_uiux_icon_2048.png', 'agents/openai.yaml',
    'package.json', 'package-lock.json', 'playwright.config.js',
    'scripts/check-docs.js',
    'examples/unlock-to-edit/index.html', 'examples/unlock-to-edit/app.js',
    'examples/unlock-to-edit/check.mjs', 'examples/unlock-to-edit/README.md',
    'references/evaluations/2026-10-20-readiness/README.md',
    'references/evaluations/2026-10-20-readiness/supplied-review.zip',
    *{f'references/evaluations/2026-10-20-readiness/{case}-response.txt'
      for case in ['E03', 'E07', 'E08', 'E26', 'E34', 'E35']},
}
sources = sorted(root_files | {p for p in tracked if
                 p.startswith(('references/', 'preferences/', 'examples/', 'tests/browser/'))})
output = ROOT / 'output/openai'
package = output / 'audhd-ui-plugin'
assert package.resolve().is_relative_to((ROOT / 'output').resolve())
if package.exists():
    shutil.rmtree(package)
skill = package / 'skills/audhd-ui-guide'
skill.mkdir(parents=True)
for name in sources:
    source = ROOT / name
    assert not source.is_symlink(), name
    target = skill / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())
shutil.copyfile(ROOT / 'plugin/plugin.json', package / 'plugin.json')
(package / 'assets').mkdir()
for name in ['audhd_uiux_icon_256.png', 'audhd_uiux_icon_2048.png']:
    shutil.copyfile(ROOT / name, package / 'assets' / name)
for name in ['LICENSE', 'LICENSE-CODE', 'LICENSE_SCOPE.md', 'PRIVACY.md']:
    shutil.copyfile(ROOT / name, package / name)

entry = (skill / 'SKILL.md').read_text(encoding='utf-8')
front = re.match(r'\A---\r?\n(.*?)\r?\n---\r?\n', entry, re.S)
assert front, 'Missing front matter'
# This skill deliberately uses only two plain scalar YAML fields.
fields = dict(line.split(': ', 1) for line in front[1].splitlines())
assert set(fields) == {'name', 'description'} and fields['name'] == skill.name
assert all(fields.values()) and ': ' not in fields['description']

files = sorted(p for p in package.rglob('*') if p.is_file())
for path in files:
    if path.suffix in {'.md', '.txt', '.json', '.yaml', '.js', '.mjs', '.jsx', '.svelte', '.html', '.css', '.py'}:
        text = path.read_text(encoding='utf-8')
        assert not re.search(r'\b[A-Z]:[\\/]|/Users/|/home/|-----BEGIN .*PRIVATE KEY|\bsk-[A-Za-z0-9]{20,}', text), path
    if path.suffix == '.md':
        for link in re.findall(r'\[[^\]\n]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)', text):
            parsed = urlsplit(link.strip('<>'))
            if parsed.scheme or not parsed.path:
                continue
            target = (path.parent / unquote(parsed.path)).resolve()
            assert target.is_relative_to(package.resolve()) and target.exists(), (path, link)
# The generated skill interface uses a flat mapping of JSON-compatible quoted
# strings. Fail on other layouts rather than silently dropping its icon checks.
agent_lines = (skill / 'agents/openai.yaml').read_text(encoding='utf-8').splitlines()
assert agent_lines[0] == 'interface:'
agent_interface = {}
for line in agent_lines[1:]:
    match = re.fullmatch(r'  (\w+): (".*")', line)
    assert match, 'Keep agents/openai.yaml as a flat, quoted interface mapping'
    agent_interface[match[1]] = json.loads(match[2])
assert agent_interface['display_name'] and 25 <= len(agent_interface['short_description']) <= 64
icons = [(package, interface[field]) for field in ['composerIcon', 'logo']]
icons += [(skill, agent_interface[field]) for field in ['icon_small', 'icon_large']]
for base, relative_icon in icons:
    assert relative_icon.startswith('./') and '..' not in relative_icon.split('/')
    icon = (base / relative_icon).resolve()
    assert icon.is_relative_to(base.resolve()) and icon.is_file(), relative_icon
    raw = icon.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n' and len(raw) <= 5 * 1024**2
    width, height = struct.unpack('>II', raw[16:24])
    assert width == height and 48 <= width <= 4096

archive = output / f"audhd-ui-guide-{manifest['version']}.zip"
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
    for path in files:
        name = path.relative_to(package).as_posix()
        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        bundle.writestr(info, path.read_bytes())
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    names = bundle.namelist()
    assert 'plugin.json' in names and names.count('skills/audhd-ui-guide/SKILL.md') == 1
    normalized = [unicodedata.normalize('NFC', n).casefold() for n in names]
    assert len(set(normalized)) == len(names) <= 5000
    assert all('\\' not in n and not n.startswith('/') and '..' not in n.split('/')
               and len(n.split('/')) <= 20 for n in names)
    assert sum(i.file_size for i in bundle.infolist()) <= 512 * 1024**2
assert archive.stat().st_size <= 100 * 1024**2
print(f'PASS: {len(files)} files; listing limits, front matter, resource links, icons, source boundary and ZIP integrity.')
print(f'Plugin: {package}')
print(f'ZIP: {archive}')
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
archive.with_suffix('.zip.sha256').write_text(f'{digest}  {archive.name}\n', encoding='utf-8')
print(f'SHA256: {digest}')
