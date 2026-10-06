# Фід для Google Merchant Center (RSS 2.0 + g:) з усіх товарів:
# наявні товари з вигрузки Prom + 10 нових (scripts/prom/variants.py).
#
#   python3 scripts/prom/merchant.py  →  ~/Downloads/shelterme-merchant-feed.xml
import html
import os
import re
import xml.etree.ElementTree as ET

FEEDS = [os.path.expanduser('~/Downloads/products_feed.xml'), os.path.expanduser('~/Downloads/shelterme-new-products.xml')]
OUT = os.path.expanduser('~/Downloads/shelterme-merchant-feed.xml')
SITE = 'https://www.shelterme.com.ua'
CATEGORY = '5835'  # Home & Garden > Emergency Preparedness
PRODUCT_TYPE = 'Захисні споруди цивільного захисту > Модульні укриття'
LAT = str.maketrans({'С': 'C', 'с': 'c', 'Р': 'P', 'р': 'p', 'Е': 'E', 'М': 'M', 'В': 'B', 'Х': 'X', 'А': 'A', 'О': 'O', 'К': 'K', 'Т': 'T', 'Н': 'H'})


def slug(code):
    return re.sub(r'[^a-z0-9-]+', '-', code.translate(LAT).lower()).strip('-')


def text(desc, limit=4900):
    t = re.sub(r'<(li)[^>]*>', '\n• ', desc or '')
    t = re.sub(r'<(br|/p|/h3|/ul)[^>]*>', '\n', t)
    t = html.unescape(re.sub(r'<[^>]+>', '', t))
    # без емодзі та без подвійного даху (базовий модуль іде без нього)
    t = re.sub('[\U0001F300-\U0001FAFF☀-➿️]', '', t)
    t = '\n'.join(line.strip() for line in t.split('\n') if not re.search(r'подвійн|вогнестійк|двойн', line, re.I))
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r'\n\s*\n+', '\n', t).strip()
    t = re.sub(r'(?m)^• +', '• ', t)
    return t[:limit]


def cm(v):
    """'2,5 м' / '6.25м' / '4–5 м' → '250 cm' (беремо більше число діапазону)."""
    nums = re.findall(r'\d+(?:[.,]\d+)?', v or '')
    if not nums:
        return None
    return f"{round(max(float(n.replace(',', '.')) for n in nums) * 100)} cm"


def dims(name, params):
    m = re.search(r'Ø\s*([\d,.]+)\s*м\s*[×x]\s*([\d,.–-]+)\s*м', name)
    d = params.get('Внутрішній діаметр') or (m and m.group(1))
    ln = params.get('Довжина') or (m and m.group(2))
    return cm(str(d)) if d else None, cm(str(ln)) if ln else None


def items():
    seen = set()
    for path in FEEDS:
        for o in ET.parse(path).findall('.//offer'):
            code = (o.findtext('vendorCode') or o.get('id')).strip()
            gid = slug(code)
            if gid in seen:
                continue
            seen.add(gid)
            name = (o.findtext('name_ua') or o.findtext('name') or '').strip()
            name = re.sub(r'\s+', ' ', name)
            params = {p.get('name'): (p.text or '').strip() for p in o.findall('param')}
            pics = [p.text for p in o.findall('picture') if p.text]
            yield dict(id=gid, code=code, title=name[:150], price=o.findtext('price'),
                       desc=text(o.findtext('description_ua') or o.findtext('description')),
                       pics=pics, params=params, dims=dims(name, params))


def main():
    e = html.escape
    out = []
    for it in items():
        d, ln = it['dims']
        details = ''.join(
            f"""
      <g:product_detail><g:section_name>Характеристики</g:section_name><g:attribute_name>{e(k)}</g:attribute_name><g:attribute_value>{e(v)}</g:attribute_value></g:product_detail>"""
            for k, v in it['params'].items() if v)
        extra = ''.join(f'\n      <g:additional_image_link>{e(p)}</g:additional_image_link>' for p in it['pics'][1:11])
        size = ''
        if d:
            size += f'\n      <g:product_width>{d}</g:product_width>\n      <g:product_height>{d}</g:product_height>'
        if ln:
            size += f'\n      <g:product_length>{ln}</g:product_length>'
        purpose = it['params'].get('Назначение', '')
        out.append(f"""    <item>
      <g:id>{it['id']}</g:id>
      <g:title>{e(it['title'])}</g:title>
      <g:description>{e(it['desc'])}</g:description>
      <g:link>{SITE}/katalog/{it['id']}/</g:link>
      <g:image_link>{e(it['pics'][0])}</g:image_link>{extra}
      <g:availability>in_stock</g:availability>
      <g:price>{float(it['price']):.2f} UAH</g:price>
      <g:condition>new</g:condition>
      <g:brand>SHELTER ME</g:brand>
      <g:mpn>{e(it['code'])}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>{CATEGORY}</g:google_product_category>
      <g:product_type>{e(PRODUCT_TYPE)}</g:product_type>
      <g:custom_label_0>{e(purpose)}</g:custom_label_0>
      <g:min_handling_time>20</g:min_handling_time>
      <g:max_handling_time>30</g:max_handling_time>{size}{details}
    </item>""")
    feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>SHELTER ME — модульні укриття</title>
    <link>{SITE}/</link>
    <description>Модульні підземні укриття SHELTER ME, ДСТУ 9195:2022, доставка по Україні</description>
{chr(10).join(out)}
  </channel>
</rss>
"""
    open(OUT, 'w', encoding='utf-8').write(feed)
    print(len(out), 'товарів →', OUT)


if __name__ == '__main__':
    main()
