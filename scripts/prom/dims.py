# Схема з розмірами на білому фоні (3-тє фото товару) для моделей, де ще немає згенерованого фото.
#   python3 scripts/prom/dims.py  → public/img/prom/d-<id>-<hash>.jpg, scripts/prom/dims.json
import hashlib
import io
import json
import os
import subprocess

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'img', 'prom')
TMP = os.path.join(ROOT, 'scripts', 'prom', '.render')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

# id: модель, діаметр (м), довжина (м) для пропорцій, підпис довжини, місткість, модулів
MODELS = {
    'me2ex': ('Extended', 3.0, 12, '12 м', '44–48 осіб', 1),
    'me2fl': ('Family L', 2.5, 8, '8 м', '28–30 осіб', 1),
    'me2fxl': ('Family XL', 2.5, 10, '10 м', '36–40 осіб', 1),
    'me2b': ('Business', 3.0, 6.25, '6,25 м', '20–24 особи', 1),
    'me2cl': ('Compact L', 2.0, 8, '8 м', '28–30 осіб', 1),
    'me2exl': ('Extended L', 3.0, 13, '13 м', '48–52 особи', 1),
    'me2exxl': ('Extended XL', 3.0, 14, '14 м', '52–56 осіб', 1),
    'me-v10': ('Extended XL ×2', 3.0, 14, '14 м × 2', '104–112 осіб', 2),
}
HOUSE = '<path fill="#111316" d="M8 94V40L50 6l42 34v54z"/><path d="M24 94V48L50 27l26 21v46" fill="none" stroke="#ffb000" stroke-width="9" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="32" fill="#ffb000"/>'


def tube(x, y, w, h):
    ribs = ''.join(f'<line x1="{x + i}" y1="{y + 4}" x2="{x + i}" y2="{y + h - 4}"/>' for i in range(int(h * .18) + 10, int(w), 11))
    ry = h / 2
    rx = ry * .26
    return f"""
  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(16, ry)}" fill="#1b1d21"/>
  <g stroke="#3a3e45" stroke-width="3">{ribs}</g>
  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(16, ry)}" fill="none" stroke="#000" stroke-width="3"/>
  <ellipse cx="{x + rx}" cy="{y + ry}" rx="{rx}" ry="{ry}" fill="#26292e" stroke="#000" stroke-width="4"/>
  <ellipse cx="{x + rx}" cy="{y + ry}" rx="{rx * .8}" ry="{ry * .86}" fill="none" stroke="#9aa0a8" stroke-width="3"/>
  <rect x="{x + rx - rx * .28}" y="{y + ry * .45}" width="{rx * .56}" height="{ry * 1.2}" rx="4" fill="#111316" stroke="#5c626b" stroke-width="2"/>
  <rect x="{x + w * .08}" y="{y + h - 2}" width="{max(40, w * .07)}" height="34" fill="#111316"/>
  <rect x="{x + w * .85}" y="{y + h - 2}" width="{max(40, w * .07)}" height="34" fill="#111316"/>"""


def svg(model, d, ln, ltxt, cap, n):
    W = 1254
    maxw, maxh = 900, 430
    total = ln * n + (0.6 if n == 2 else 0)
    scale = min(maxw / total, maxh / d)
    w, h = ln * scale, d * scale
    full = total * scale
    x0 = (W - full) / 2 + 40
    y0 = 600 - h / 2
    body = tube(x0, y0, w, h)
    if n == 2:
        body += tube(x0 + w + 0.6 * scale, y0, w, h)
        body += f'<rect x="{x0 + w - 6}" y="{y0 + h * .3}" width="{0.6 * scale + 12}" height="{h * .4}" fill="#26292e" stroke="#000" stroke-width="3"/>'
    ay = y0 - 70
    ax = x0 - 70
    arrow = 'marker-start="url(#a)" marker-end="url(#a)"'
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{W}" viewBox="0 0 {W} {W}">
<defs><marker id="a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#111316"/></marker></defs>
<rect width="{W}" height="{W}" fill="#fff"/>
<g transform="translate(720 70)">
  <rect width="480" height="120" rx="22" fill="#ffb000" stroke="#111316" stroke-width="6"/>
  <svg x="22" y="18" width="62" height="62" viewBox="0 0 100 100">{HOUSE}</svg>
  <text x="100" y="66" font-family="Unbounded" font-weight="900" font-size="40" fill="#111316">SHELTER ME</text>
  <rect x="110" y="90" width="300" height="56" rx="14" fill="#111316"/>
  <text x="260" y="128" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="28" fill="#fff">{model}</text>
</g>
{body}
<line x1="{x0}" y1="{ay}" x2="{x0 + full}" y2="{ay}" stroke="#111316" stroke-width="5" {arrow}/>
<line x1="{x0}" y1="{ay - 20}" x2="{x0}" y2="{y0}" stroke="#111316" stroke-width="2" stroke-dasharray="8 6"/>
<line x1="{x0 + full}" y1="{ay - 20}" x2="{x0 + full}" y2="{y0}" stroke="#111316" stroke-width="2" stroke-dasharray="8 6"/>
<text x="{x0 + full / 2}" y="{ay - 24}" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="54" fill="#111316">{ltxt}</text>
<line x1="{ax}" y1="{y0}" x2="{ax}" y2="{y0 + h}" stroke="#111316" stroke-width="5" {arrow}/>
<line x1="{ax - 20}" y1="{y0}" x2="{x0}" y2="{y0}" stroke="#111316" stroke-width="2" stroke-dasharray="8 6"/>
<line x1="{ax - 20}" y1="{y0 + h}" x2="{x0}" y2="{y0 + h}" stroke="#111316" stroke-width="2" stroke-dasharray="8 6"/>
<text transform="translate({ax - 22} {y0 + h / 2}) rotate(-90)" text-anchor="middle" font-family="Unbounded" font-weight="800" font-size="48" fill="#111316">Ø{str(d).replace('.0', '').replace('.', ',')} м</text>
<g transform="translate(60 1040)">
  <rect width="470" height="130" rx="65" fill="#111316" stroke="#ffb000" stroke-width="6"/>
  <circle cx="65" cy="65" r="52" fill="#ffb000"/>
  <g fill="#111316"><circle cx="48" cy="52" r="11"/><circle cx="82" cy="52" r="11"/><circle cx="65" cy="46" r="13"/><path d="M28 92c0-16 9-26 20-26s20 10 20 26zM62 92c0-16 9-26 20-26s20 10 20 26zM42 94c0-20 10-32 23-32s23 12 23 32z"/></g>
  <text x="140" y="84" font-family="Manrope" font-weight="800" font-size="48" fill="#fff">{cap}</text>
</g>
<g transform="translate(620 1050)" font-family="Manrope" font-weight="800">
  <rect width="290" height="110" rx="24" fill="#111316" stroke="#ffb000" stroke-width="5"/>
  <text x="145" y="50" text-anchor="middle" font-size="27" fill="#fff">Протокол</text><text x="145" y="84" text-anchor="middle" font-size="27" fill="#fff">випробування</text>
  <rect x="320" width="270" height="110" rx="24" fill="#111316" stroke="#ffb000" stroke-width="5"/>
  <text x="455" y="50" text-anchor="middle" font-size="27" fill="#fff">Стандарт</text><text x="455" y="84" text-anchor="middle" font-size="27" fill="#fff">ДСТУ</text>
</g>
</svg>"""


def main():
    os.makedirs(TMP, exist_ok=True)
    out = {}
    for gid, args in MODELS.items():
        page = os.path.join(TMP, f'dims-{gid}.html')
        shot = os.path.join(TMP, f'dims-{gid}.png')
        open(page, 'w', encoding='utf-8').write(
            '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@800;900&family=Manrope:wght@800&display=swap">'
            f'<style>body{{margin:0}}</style>{svg(*args)}')
        subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--virtual-time-budget=6000', '--window-size=1254,1254', f'--screenshot={shot}', f'file://{page}'], capture_output=True)
        b = io.BytesIO()
        Image.open(shot).convert('RGB').save(b, 'JPEG', quality=90, optimize=True)
        data = b.getvalue()
        fn = f'd-{gid}-{hashlib.md5(data).hexdigest()[:8]}.jpg'
        open(os.path.join(OUT, fn), 'wb').write(data)
        out[gid] = fn
        print(gid, fn)
    json.dump(out, open(os.path.join(ROOT, 'scripts', 'prom', 'dims.json'), 'w'), indent=1, sort_keys=True)


if __name__ == '__main__':
    main()
