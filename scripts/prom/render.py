# Генератор картинок для описань Prom (банер товару та комплектація).
# Рендер через Chrome headless, обрізка по останньому темному рядку,
# збереження з хешем у назві (Prom кешує картинки за іменем файлу).
#
#   python3 scripts/prom/render.py   — див. VARIANTS у scripts/prom/variants.py
import hashlib
import html
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'img', 'prom')
TMP = os.path.join(ROOT, 'scripts', 'prom', '.render')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;background:#fff;color:#eeece6;font-family:Manrope,sans-serif}
.k{position:relative;background:#111316;overflow:hidden}
.ribs{position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,transparent 2px 26px)}
.o{color:#ffb000}
.logo{display:flex;align-items:center;gap:12px;font:900 27px Unbounded;letter-spacing:.01em;color:#ffb000}
.logo svg{width:38px;height:38px}
.badge{background:#ffb000;color:#111316;font:800 19px Manrope;padding:13px 24px;border-radius:100px;text-transform:uppercase}
h1{font:900 50px/1.05 Unbounded;text-transform:uppercase;margin:34px 0 18px;letter-spacing:-.02em}
.lead{font:600 22px/1.45 Manrope;color:#d8d5cc;max-width:1000px}
.lead b{color:#ffb000}
.pill{display:inline-block;margin-top:26px;border:1.5px solid rgba(255,176,0,.6);border-radius:100px;padding:12px 22px;font:700 17px Manrope;color:#ffb000}
.sec{padding:52px 50px 46px}
.h{font:900 36px Unbounded;text-transform:uppercase;letter-spacing:-.01em;margin-bottom:24px}
.pills{display:flex;flex-wrap:wrap;gap:14px 12px}
.pl{display:inline-flex;align-items:center;gap:14px;background:#1a1d21;border:1.5px solid rgba(255,176,0,.45);border-radius:100px;padding:13px 22px;font:700 18px Manrope;color:#eeece6}
.pl i{font-style:normal;color:#ffb000;font-weight:800}
.note{font:600 18px Manrope;color:#d8d5cc;margin:22px 4px 0}
"""
HOUSE = '<svg viewBox="0 0 100 100"><path fill="#ffb000" d="M8 94V40L50 6l42 34v54z"/><path d="M24 94V48L50 27l26 21v46" fill="none" stroke="#111316" stroke-width="9" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="32" fill="#111316"/></svg>'
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@800;900&family=Manrope:wght@600;700;800&display=swap">'


def hero(title, accent, subtitle, size, lead):
    e = html.escape
    return f"""<div class="k"><div class="ribs"></div><div style="position:relative;padding:56px 64px 60px">
<div style="display:flex;justify-content:space-between;align-items:center"><div class="logo">{HOUSE}<span>SHELTER ME</span></div><span class="badge">{e(size)}</span></div>
<h1>{e(title)} <span class="o">{e(accent)}</span><br>{e(subtitle)}</h1>
<p class="lead">{lead}</p>
<div class="pill">🛡 Сертифіковано · ДСТУ 9195:2022 · Протокол випробувань</div>
</div></div>"""


def kit(title_w, title_o, items, note):
    e = html.escape
    pills = ''.join(f'<span class="pl"><i>+</i>{e(x)}</span>' for x in items)
    return f"""<div class="k"><div class="ribs"></div><div class="sec" style="position:relative">
<h2 class="h">{e(title_w)} <span class="o">{e(title_o)}</span></h2>
<div class="pills">{pills}</div>
<p class="note">{e(note)}</p>
</div></div>"""


def render(name, block):
    """Рендерить блок і повертає назву файлу з хешем (name-xxxxxxxx.png)."""
    os.makedirs(TMP, exist_ok=True)
    page = os.path.join(TMP, f'{name}.html')
    shot = os.path.join(TMP, f'{name}.png')
    with open(page, 'w', encoding='utf-8') as f:
        f.write(f'<!doctype html><meta charset="utf-8">{FONTS}<style>{CSS}</style><body>{block}</body>')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--virtual-time-budget=6000', '--window-size=1200,1200', f'--screenshot={shot}', f'file://{page}'],
                   capture_output=True, check=False)
    im = Image.open(shot).convert('RGB')
    w, h = im.size
    px = im.load()
    last = max(y for y in range(h) if px[5, y][0] < 40)
    im = im.crop((0, 0, w, last + 1))
    im.save(shot, optimize=True)
    data = open(shot, 'rb').read()
    fn = f'{name}-{hashlib.md5(data).hexdigest()[:8]}.png'
    with open(os.path.join(OUT, fn), 'wb') as f:
        f.write(data)
    return fn


if __name__ == '__main__':
    sys.exit('Запускайте scripts/prom/variants.py')
