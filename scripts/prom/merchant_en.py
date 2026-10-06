# Англомовний фід Google Merchant Center (для показу за кордоном: Латвія, Естонія, Австрія, Болгарія…)
# + HTML-описи англійською з фото (для майбутніх англомовних сторінок товарів).
#
#   python3 scripts/prom/merchant_en.py
#     → ~/Downloads/shelterme-merchant-feed-en.xml
#     → ~/Downloads/shelterme-descriptions-en.html
import html
import os
import xml.etree.ElementTree as ET

from fix_existing import M
from merchant import CATEGORY, SITE, cm, slug
from variants import V

FEEDS = [os.path.expanduser('~/Downloads/shelterme-prom-update.xml'), os.path.expanduser('~/Downloads/shelterme-new-products.xml')]
OUT = os.path.expanduser('~/Downloads/shelterme-merchant-feed-en.xml')
OUT_HTML = os.path.expanduser('~/Downloads/shelterme-descriptions-en.html')
PRODUCT_TYPE = 'Civil protection structures > Modular underground shelters'

ITEMS = {
    'двоярусні спальні місця': 'bunk beds', 'матраци': 'mattresses', 'вентиляція з фільтрацією': 'filtered ventilation',
    'освітлення й розетки': 'lighting and power sockets', 'аварійне освітлення': 'emergency lighting', 'полиці для речей': 'shelves for belongings',
    'зберігання води й запасів': 'water and supplies storage', 'захисні двері': 'protective door', 'спальні місця': 'sleeping places',
    'санвузол': 'toilet', 'душ': 'shower', 'електрообігрів': 'electric heating', 'лави для сидіння': 'benches',
    'оздоблення інтерʼєру': 'interior finishing', 'мʼякі дивани': 'upholstered sofas', 'телевізор і медіазона': 'TV and media zone',
    'інтернет і Wi-Fi': 'internet and Wi-Fi', 'кухонна зона': 'kitchen area', 'санвузол і душ': 'toilet and shower', 'освітлення': 'lighting',
    'дитячі спальні місця': "children's sleeping places", 'зона для ігор': 'play area',
    'освітлення й аварійне освітлення': 'lighting and emergency lighting', 'лави та місця для сидіння': 'benches and seating',
    'розетки': 'power sockets', 'робочі місця': 'workstations', 'столи й стільці': 'desks and chairs', 'зберігання води': 'water storage',
    'лави для персоналу': 'benches for staff', 'аптечка й запаси': 'first-aid kit and supplies', 'вентиляція': 'ventilation',
    'полиці для запасів': 'storage shelves', 'зʼєднання модулів': 'module connection', 'окремі зони': 'separate zones', 'санвузли': 'toilets',
}
BASE_KIT = ['filtered ventilation', 'power supply', 'lighting', 'emergency lighting', 'benches and seating', 'mattresses and sleeping places',
            'flooring', 'protective door', 'toilet', 'shower', 'water and supplies storage', 'equipment to specification']

# Англійські назви й вступ: базові моделі (код Prom) і варіанти (ME-V…)
EN = {
    'ME1': ('SHELTER ME Modular Underground Bomb Shelter for Home & Business, {s} People, {size}',
            'a ready-made underground shelter for a private house, apartment building, company or commercial property.'),
    'ME2': ('SHELTER ME Business L Modular Underground Shelter for Companies, {s} People, {size}',
            'a spacious shelter for staff right next to the workplace.'),
    'ME2XL': ('SHELTER ME Business XL Modular Underground Shelter for Companies, {s} People, {size}',
              'a large shelter for company staff, warehouses and commercial properties.'),
    'ME2С': ('SHELTER ME Compact Modular Underground Bomb Shelter for Family, {s} People, {size}',
             'a compact family shelter that fits even a small plot.'),
    'ME2СP': ('SHELTER ME Compact+ Modular Underground Bomb Shelter for Home, {s} People, {size}',
              'a compact shelter for a large family or several households.'),
    'ME2EX': ('SHELTER ME Extended Large Modular Underground Shelter, {s} People, {size}',
              'a large shelter for companies, apartment buildings and institutions.'),
    'ME2FL': ('SHELTER ME Family L Modular Underground Shelter for Home, {s} People, {size}',
              'a spacious shelter for a large family, neighbours or a small company.'),
    'ME2FXL': ('SHELTER ME Family XL Modular Underground Shelter, {s} People, {size}',
               'a high-capacity shelter for apartment buildings, private houses or companies.'),
    'ME2B': ('SHELTER ME Business Modular Underground Shelter for Office & Staff, {s} People, {size}',
             'a shelter for staff next to the workplace — offices, shops and institutions.'),
    'ME2СL': ('SHELTER ME Compact L Modular Underground Shelter, {s} People, {size}',
              'a compact-diameter shelter with large capacity, easy to place on a plot.'),
    'ME2EXL': ('SHELTER ME Extended L Large Modular Underground Shelter, {s} People, {size}',
               'a large shelter for big teams, apartment buildings and institutions.'),
    'ME2EXXL': ('SHELTER ME Extended XL Large Modular Underground Shelter, {s} People, {size}',
                'our largest single module for big teams, apartment buildings and schools.'),
    'ME-V01': ('SHELTER ME Compact+ Sleep Family Bomb Shelter with Bunk Beds, {s} People, {size}',
               'a family shelter where you can actually sleep during a long alert: bunk beds along the walls and a free central aisle.', 'Sleep'),
    'ME-V02': ('SHELTER ME Family Comfort Underground Shelter with Toilet & Shower, {s} People, {size}',
               'a shelter for staying several days: toilet, shower, heating and sleeping places.', 'Comfort'),
    'ME-V03': ('SHELTER ME Family L Premium Luxury Bunker with Sofas, Media Zone & Kitchen, {size}',
               'a premium shelter that feels like home: finished interior, sofas, TV, internet, kitchen area, toilet and shower.', 'Premium'),
    'ME-V04': ('SHELTER ME Compact L Kids Kindergarten Shelter with Sleeping Places, {size}',
               'a kindergarten shelter where children can calmly wait out an alert: sleep, play, with caregivers nearby.', 'Kids'),
    'ME-V05': ('SHELTER ME Extended School Underground Shelter for {s} Students, {size}',
               'a school shelter so that lessons can continue during an alert: seating for a class, light, ventilation and a toilet.', 'School'),
    'ME-V06': ('SHELTER ME Business Office Shelter with Workstations & Internet, {s} People, {size}',
               'an office shelter where the team can keep working during an alert: workstations, power, internet and a toilet.', 'Office'),
    'ME-V07': ('SHELTER ME Family XL Staff Underground Shelter for Company Personnel, {s} People, {size}',
               'a shelter for staff of a company, warehouse or shop — right next to the workplace.', 'Staff'),
    'ME-V08': ('SHELTER ME Extended XL Home Shelter for Apartment Buildings, {s} Residents, {size}',
               'a shelter for apartment buildings where there is no suitable basement, installed in the courtyard.', 'Home'),
    'ME-V09': ('SHELTER ME Compact Dacha Small Bunker for Country House, {s} People, {size}',
               'a compact shelter for a country house or small plot — easy to place where space is limited.', 'Dacha'),
    'ME-V10': ('SHELTER ME Extended XL ×2 Shelter Complex of Two Connected Modules, 100+ People',
               'a complex of two connected Extended XL modules for large teams: 104–112 seats or 52–56 sleeping places, can be divided into zones.', 'Complex'),
}


def num(v):
    return v.replace(',', '.').replace('.0 ', ' ').strip()


def data():
    src = {}
    for path in FEEDS:
        for o in ET.parse(path).findall('.//offer'):
            code = o.findtext('vendorCode')
            src[code] = dict(price=o.findtext('price'), pics=[p.text for p in o.findall('picture')])
    out = []
    for code, m in M.items():
        out.append(dict(code=code, d=m['diam'], ln=m['len'], s=m['seats'], sl=m['sleep'], kit=None, kit_name=None, double=False,
                        purpose='Home' if m['purpose'] == 'Для дома' else 'Business', **src[code]))
    for v in V:
        out.append(dict(code=v['code'], d=v['diam'], ln=v['len'].replace(' × 2', ''), s=v['seats'], sl=v['sleep'],
                        kit=[ITEMS[x] for x in v['items_ua']], kit_name=EN[v['code']][2], double=bool(v.get('double')),
                        purpose='Home' if v['purpose_ru'] in ('Для дома', 'Для ОСМД') else 'Business', **src[v['code']]))
    for p in out:
        p['size'] = f"Ø{num(p['d']).replace('.0', '')} m × {num(p['ln'])} m"
        t, intro = EN[p['code']][:2]
        p['title'] = t.format(s=p['s'], size=p['size'])[:150]
        p['intro'] = intro
    return out


def blocks(p):
    """Текст опису блоками: (заголовок, абзац | список)."""
    mod = 'two modules' if p['double'] else 'module'
    b = [
        (None, f"{p['title'].split(',')[0]} — {p['intro']}"),
        ('Capacity', f"Each module Ø {num(p['d'])} × {num(p['ln'])} m seats {p['s']} people or provides {p['sl']} sleeping places. "
                     "We calculate 50 cm per person — more spacious than the Ukrainian DSTU standard requires."
         if p['double'] else
         f"Module Ø {num(p['d'])} × {num(p['ln'])} m: {p['s']} seats or {p['sl']} sleeping places. "
         "We calculate 50 cm per person — more spacious than the Ukrainian DSTU standard requires. Need more space? Modules can be connected."),
        ('Key features', ['One-piece sealed body made of HDPE (high-density polyethylene), no joints for water to leak through',
                          'Moisture resistance IPX8, wall thickness 100–150 mm',
                          'Certified to Ukrainian standard DSTU 9195:2022; test report, certificate and technical passport available',
                          'No concrete or wet works on site — the module arrives ready-made',
                          'Layout and equipment made to the customer’s technical specification']),
        (f'Included in the “{p["kit_name"]}” configuration' if p['kit'] else 'Possible equipment (on request)', p['kit'] or BASE_KIT),
        (None, 'The final configuration is agreed according to the customer’s technical specification: any equipment can be added or removed.'),
        ('Protection', 'When installed underground and covered with 2–3 m of soil, the shelter protects against debris, fragments and the blast wave. '
                       'It is not designed for a direct hit by missiles or aerial bombs, nor for chemical, biological or radiation threats.'),
        ('Production and delivery', 'Manufacturing time is approx. 24 working days. Delivery by special truck with a crane; delivery is paid separately. '
                                    'Excavation, installation and backfilling are arranged by the customer.'),
        (None, f"The price is for the {mod} {p['size']}" + ('' if not p['kit'] else '; equipment and finishing are calculated individually')
         + '. Send us your requirements — we will prepare an individual quote.'),
    ]
    return b


def text(p):
    out = []
    for h, body in blocks(p):
        if h:
            out.append(f'{h}:')
        out.append('\n'.join(f'• {x}' for x in body) if isinstance(body, list) else body)
    return '\n'.join(out)[:4900]


def html_desc(p):
    e = html.escape
    pics = p['pics'][:4]
    out = [f'<p><img src="{e(pics[0])}" alt="{e(p["title"])}" width="100%"></p>']
    for i, (h, body) in enumerate(blocks(p)):
        if h:
            out.append(f'<h3>{e(h)}</h3>')
        if isinstance(body, list):
            out.append('<ul>' + ''.join(f'<li>{e(x)}</li>' for x in body) + '</ul>')
        else:
            out.append(f'<p>{e(body)}</p>')
        if i == 2 and len(pics) > 1:
            out += [f'<p><img src="{e(x)}" alt="{e(p["title"])}" width="100%"></p>' for x in pics[1:]]
    return '\n'.join(out)


def details(p):
    rows = [('Internal diameter', f"{num(p['d'])} m"), ('Length', f"{num(p['ln'])} m"), ('Modules', '2' if p['double'] else '1'),
            ('Seats', p['s']), ('Sleeping places', p['sl']), ('Body material', 'HDPE (high-density polyethylene)'),
            ('Body', 'one-piece, sealed, no joints'), ('Wall thickness', '100–150 mm'), ('Module weight', '1–3 t depending on equipment'),
            ('Moisture resistance', 'IPX8'), ('Protection', 'debris, fragments, blast wave (with 2–3 m soil cover)'),
            ('Soil cover', '2–3 m'), ('Sand bed', '300–500 mm'), ('Standard', 'DSTU 9195:2022 (Ukraine)'),
            ('Documents', 'certificate, test report, technical passport'), ('Manufacturing time', 'approx. 24 working days'),
            ('Country of origin', 'Ukraine')]
    return ''.join(f"""
      <g:product_detail><g:section_name>Specifications</g:section_name><g:attribute_name>{k}</g:attribute_name><g:attribute_value>{html.escape(v)}</g:attribute_value></g:product_detail>"""
                   for k, v in rows)


def main():
    e = html.escape
    items, pages = [], []
    for p in data():
        gid = slug(p['code'])
        d, ln = cm(p['d']), cm(p['ln'])
        pics = p['pics']  # у нових товарів перше фото — головна візуалізація (MAIN)
        extra = ''.join(f'\n      <g:additional_image_link>{e(x)}</g:additional_image_link>' for x in pics[1:11])
        items.append(f"""    <item>
      <g:id>{gid}</g:id>
      <g:title>{e(p['title'])}</g:title>
      <g:description>{e(text(p))}</g:description>
      <g:link>{SITE}/en/katalog/{gid}/</g:link>
      <g:image_link>{e(pics[0])}</g:image_link>{extra}
      <g:availability>in_stock</g:availability>
      <g:price>{float(p['price']):.2f} UAH</g:price>
      <g:condition>new</g:condition>
      <g:brand>SHELTER ME</g:brand>
      <g:mpn>{e(p['code'])}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>{CATEGORY}</g:google_product_category>
      <g:product_type>{PRODUCT_TYPE}</g:product_type>
      <g:custom_label_0>{p['purpose']}</g:custom_label_0>
      <g:min_handling_time>20</g:min_handling_time>
      <g:max_handling_time>30</g:max_handling_time>
      <g:product_width>{d}</g:product_width>
      <g:product_height>{d}</g:product_height>
      <g:product_length>{ln}</g:product_length>{details(p)}
    </item>""")
        price = f'{int(float(p["price"])):,}'.replace(',', ' ')
        pages.append(f'<section id="{gid}">\n<h2>{e(p["title"])}</h2>\n<p><b>Code:</b> {gid} · <b>Price:</b> {price} UAH</p>\n{html_desc(p)}\n</section>')
        print(gid, '|', p['title'])
    open(OUT, 'w', encoding='utf-8').write(f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>SHELTER ME — modular underground shelters</title>
    <link>{SITE}/</link>
    <description>Modular underground shelters SHELTER ME, certified to DSTU 9195:2022</description>
{chr(10).join(items)}
  </channel>
</rss>
""")
    open(OUT_HTML, 'w', encoding='utf-8').write(
        '<!doctype html><html lang="en"><meta charset="utf-8"><title>SHELTER ME — product descriptions (EN)</title>'
        '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px}section{border-top:2px solid #ddd;padding:24px 0}</style>\n'
        + '\n'.join(pages) + '\n</html>\n')
    print(len(items), '→', OUT, '\n   →', OUT_HTML)


if __name__ == '__main__':
    main()
