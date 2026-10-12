# Дані для каталогу на сайті (/katalog/…): ті самі товари, ціни й id, що у фіді Google Merchant.
# Фото з Prom завантажує в public/img/katalog/ (щоб сайт не залежав від чужого CDN).
#
#   python3 scripts/prom/catalog_data.py  →  scripts/catalog.json  (далі: node scripts/build.js)
import hashlib
import io
import json
import os
import re
import time
import urllib.request
import xml.etree.ElementTree as ET

from PIL import Image

from merchant import FEEDS, slug

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'scripts', 'catalog.json')
IMG_DIR = os.path.join(ROOT, 'public', 'img', 'katalog')
OWN = 'https://www.shelterme.com.ua'


def local(url):
    """Своє фото → шлях на сайті; фото з Prom → завантажити в /img/katalog/ (webp)."""
    if url.startswith(OWN):
        return url[len(OWN):]
    name = hashlib.md5(url.encode()).hexdigest()[:12] + '.webp'
    dst = os.path.join(IMG_DIR, name)
    if not os.path.exists(dst):
        data = None
        for _ in range(3):
            try:
                data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read()
                break
            except OSError:
                time.sleep(2)
        if data is None:
            print('  пропущено фото (Prom не віддав):', url)
            return None
        im = Image.open(io.BytesIO(data)).convert('RGB')
        im.thumbnail((1400, 1400))
        im.save(dst, 'WEBP', quality=80, method=6)
    return f'/img/katalog/{name}'


def clean_desc(h):
    h = h.replace(OWN + '/img/', '/img/')
    h = re.sub(r'<p><img[^>]*cta1-[^>]*></p>\s*', '', h)          # кнопка «Написати продавцю» — для Prom
    h = re.sub(r'<p><i>[^<]*•[^<]*</i></p>\s*$', '', h.strip())    # рядок ключових слів у кінці
    return h.strip()


def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    out, seen = [], set()
    for path in FEEDS:
        for o in ET.parse(path).findall('.//offer'):
            code = o.findtext('vendorCode')
            gid = slug(code)
            if gid in seen:
                continue
            seen.add(gid)
            params = {p.get('name'): (p.text or '').strip() for p in o.findall('param')}
            out.append(dict(
                id=gid, code=code, price=int(float(o.findtext('price'))),
                name=re.sub(r'\s+', ' ', o.findtext('name_ua')).strip(),
                images=[x for x in (local(p.text) for p in o.findall('picture')) if x],
                params=params, purpose=params.get('Назначение', ''),
                description=clean_desc(o.findtext('description_ua') or ''),
            ))
            print(gid, len(out[-1]['images']), 'фото')
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(out), '→', OUT)


if __name__ == '__main__':
    main()
