# Gera versões de arquivo único (estilos, scripts, fontes e fotos embutidos)
# de index.html e catalogo.html. Uso: python3 tools/arquivo-unico.py [pasta]
import base64, io, json, os, re, sys
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'oficial')
os.makedirs(OUT, exist_ok=True)
MIME = {'webp': 'image/webp', 'png': 'image/png', 'jpg': 'image/jpeg', 'woff2': 'font/woff2', 'svg': 'image/svg+xml'}
cache = {}
def uri(rel):
    rel = os.path.normpath(rel)
    if rel not in cache:
        b = open(os.path.join(R, rel), 'rb').read()
        cache[rel] = f"data:{MIME[rel.rsplit('.', 1)[1]]};base64,{base64.b64encode(b).decode()}"
    return cache[rel]
def css(path):
    s = open(os.path.join(R, path)).read()
    base = os.path.dirname(path)
    return re.sub(r"url\((['\"]?)(\.\./[^)'\"]+)\1\)", lambda m: f'url("{uri(os.path.join(base, m.group(2)))}")', s)
def js(path):
    s = open(os.path.join(R, path)).read()
    s = re.sub(r"'(img/[\w/.-]+\.(?:webp|png))'", lambda m: f"'{uri(m.group(1))}'", s)
    return s.replace('</script', '<\\/script')
def cat_imgs():
    d = {}
    for f in sorted(os.listdir(f'{R}/img/catalogo')):
        im = Image.open(f'{R}/img/catalogo/{f}').convert('RGB')
        im.thumbnail((360, 450), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=64, method=6)
        d[f[:-5]] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    return 'window.ACHEI_IMG = ' + json.dumps(d) + ';'
def build(name):
    s = open(f'{R}/{name}').read()
    s = re.sub(r'<link rel="preload"[^>]*>\n?', '', s)
    s = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: f'<style>\n{css(m.group(1))}\n</style>', s)
    def scr(m):
        src = m.group(1)
        pre = f'<script>{cat_imgs()}</script>\n' if src == 'js/catalogo-data.js' else ''
        return f'{pre}<script>\n{js(src)}\n</script>'
    s = re.sub(r'<script src="([^"]+)"></script>', scr, s)
    s = re.sub(r'href="(img/[\w/.-]+\.png)"', lambda m: f'href="{uri(m.group(1))}"', s)
    s = re.sub(r'(src|content)="(img/[\w/.-]+\.(?:webp|png))"', lambda m: f'{m.group(1)}="{uri(m.group(2))}"' if m.group(1) == 'src' else m.group(0), s)
    open(f'{OUT}/{name}', 'w').write(s)
    left = re.findall(r'(?:src|href)="((?:img|css|js|fonts)/[^"]+)"', s)
    print(name, f'{len(s)/1e6:.1f} MB', 'refs externas restantes:', left)
build('index.html'); build('catalogo.html')
