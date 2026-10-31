"""Fetch immutable local Latin preview fonts and their upstream OFL licenses.

Run deliberately when changing the study's font list. Runtime never downloads
fonts. Preserve sources and hashes so a selected pairing can be reproduced.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import re
import urllib.parse
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parent
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
# We use one intended display weight per family and a regular body weight.
HEADINGS = [
 ('Fraunces',600),('Libre Baskerville',700),('Bitter',700),('Oswald',600),('Archivo Black',400),('Bevan',400),('Arvo',700),('Newsreader',600),('Bungee',400),('Playfair Display',600),
 ('Space Grotesk',600),('Syne',600),('Chivo',600),('Barlow Condensed',600),('Outfit',600),('Urbanist',600),('Sora',600),('Exo 2',600),('Noto Sans HK',600),('Unbounded',500),
 ('Cormorant Garamond',600),('Noto Serif SC',600),('Marcellus',400),('Forum',400),('EB Garamond',600),('Cormorant SC',600),('Cinzel',600),('Bodoni Moda',600),('Noto Serif TC',600),('GFS Didot',400),
 ('Prata',400),('El Messiri',600),('Lora',600),('Noto Naskh Arabic',600),('Bellefair',400),('Amiri',700),('DM Serif Display',400),('Yeseva One',400),('Aref Ruqaa',700),('Spectral',600),
 ('Alegreya',700),('Rokkitt',600),('Josefin Slab',600),('Bree Serif',400),('Vollkorn',600),('Alegreya SC',700),('DM Serif Text',400),('Zilla Slab',600),('Literata',600),('Bricolage Grotesque',600),
 ('Rye',400),('Cinzel Decorative',700),('Major Mono Display',400),('Dela Gothic One',400),('Limelight',400),('Oi',400),('Orbitron',600),('Almendra Display',400),('Monoton',400),('Fascinate',400)
]
BODIES = ['Source Sans 3','Public Sans','IBM Plex Sans','Barlow','Atkinson Hyperlegible','Work Sans','Nunito Sans','Libre Franklin','DM Sans','Lato','Noto Sans','Manrope','Figtree','Inter','Karla','Josefin Sans']

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}), timeout=45) as response:
        return response.read()

def fetch(item):
    family,weight=item
    slug=re.sub('[^a-z0-9]','',family.lower())
    dest=ROOT/'fonts'/f'{slug}-{weight}.woff2'
    license_path=ROOT/'fonts'/'licenses'/f'{slug}.txt'
    css_url='https://fonts.googleapis.com/css2?family='+urllib.parse.quote_plus(family)+f':wght@{weight}&display=swap'
    css=get(css_url).decode()
    blocks=re.findall(r'/\* ([^*]+) \*/\s*(@font-face\s*\{[^}]+\})',css)
    latin=[block for label,block in blocks if label.strip()=='latin']
    if not latin:
        # Some single-script families have an unlabelled, full font response.
        latin=re.findall(r'@font-face\s*\{[^}]+\}',css) if not blocks else []
    if len(latin)!=1: raise ValueError(f'{family}: expected one Latin block, found {len(latin)}')
    source=re.search(r'url\(([^)]+)\)',latin[0]).group(1)
    font=get(source)
    if font[:4]!=b'wOF2': raise ValueError(f'{family}: not WOFF2')
    license_url=f'https://raw.githubusercontent.com/google/fonts/main/ofl/{slug}/OFL.txt'
    try:
        license_data=get(license_url)
    except urllib.error.HTTPError as error:
        raise ValueError(f'{family}: license not available at {license_url}') from error
    if b'OPEN FONT LICENSE' not in license_data: raise ValueError(f'{family}: unexpected license')
    dest.write_bytes(font)
    license_path.write_bytes(license_data)
    face=f"@font-face {{ font-family: '{family}'; font-style: normal; font-weight: {weight}; font-display: swap; src: url('./fonts/{dest.name}') format('woff2'); }}"
    return {'family':family,'weight':weight,'file':f'fonts/{dest.name}','bytes':len(font),'sha256':hashlib.sha256(font).hexdigest(),'source':source,'cssSource':css_url,'license':f'fonts/licenses/{slug}.txt','licenseSource':license_url},face

if __name__=='__main__':
    (ROOT/'fonts'/'licenses').mkdir(parents=True,exist_ok=True)
    def attempt(item):
        try: return fetch(item)
        except Exception as error:
            print(f'FAILED {item}: {error}',flush=True)
            return None
    with ThreadPoolExecutor(max_workers=8) as pool:
        results=list(pool.map(attempt,HEADINGS+[(f,400) for f in BODIES]))
    if any(result is None for result in results):
        raise SystemExit('Font acquisition incomplete; fix failed families and rerun.')
    (ROOT/'fonts.css').write_text('/* Local Latin preview subsets; see fonts-manifest.json and fonts/licenses. */\n'+'\n'.join(face for _,face in results)+'\n',encoding='utf-8')
    (ROOT/'fonts-manifest.json').write_text(json.dumps([record for record,_ in results],indent=2)+'\n',encoding='utf-8')
    (ROOT/'font-weights.js').write_text('window.STUDY_FONT_WEIGHTS = '+json.dumps(dict(HEADINGS))+ ';\n',encoding='utf-8')
    print(f'{len(results)} local font files, {sum(record["bytes"] for record,_ in results):,} bytes; licenses and source hashes recorded.')
