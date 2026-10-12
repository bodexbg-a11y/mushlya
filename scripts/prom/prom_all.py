# Одна вигрузка для Prom на всі 22 товари (12 наявних + 10 нових):
# активні (available="true"), «під замовлення ~24 робочі дні» в умовах продажу,
# фото — копії на нашому сайті (посилання Prom змінюються після оновлень).
#
#   python3 scripts/prom/prom_all.py  →  ~/Downloads/shelterme-prom-all.xml
import html
import os
import re

from merchant import FEEDS, site_pics, slug

OUT = os.path.expanduser('~/Downloads/shelterme-prom-all.xml')
NOTE = 'Під замовлення: виготовлення ~24 робочі дні. Передоплата.'


def main():
    offers = []
    for path in FEEDS:
        src = open(path, encoding='utf-8').read()
        for attrs, body in re.findall(r'<offer ([^>]*)>(.*?)</offer>', src, re.S):
            code = re.search(r'<vendorCode>(.*?)</vendorCode>', body).group(1)
            attrs = re.sub(r'available="[^"]*"', 'available="true"', attrs)
            pics = site_pics(slug(code))
            if pics:
                body = re.sub(r'\s*<picture>.*?</picture>', '', body, flags=re.S)
                body = body.replace('    <pickup>', ''.join(f'    <picture>{html.escape(p)}</picture>\n' for p in pics) + '    <pickup>', 1)
            body = re.sub(r'<sales_notes>.*?</sales_notes>', f'<sales_notes>{NOTE}</sales_notes>', body)
            # Prom приймає виробника лише зі свого довідника — беремо значення з експорту Prom
            body = re.sub(r'<vendor>.*?</vendor>', '<vendor>Собственное производство</vendor>', body)
            if '<param name="Наявність">' not in body:
                body = body.replace('<param name="Термін виготовлення">', '<param name="Наявність">під замовлення</param>\n    <param name="Термін виготовлення">', 1)
            offers.append(f'<offer {attrs}>{body}</offer>')
            print(code, len(pics), 'фото')
    feed = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="2026-10-12 12:00">
  <shop>
    <name>Shelter Me</name>
    <company>Shelter Me</company>
    <url>https://cs4242922.prom.ua/</url>
    <currencies>
      <currency id="UAH" rate="1"/>
    </currencies>
  <offers>
{chr(10).join(offers)}
  </offers>
  </shop>
</yml_catalog>
"""
    open(OUT, 'w', encoding='utf-8').write(feed)
    print(len(offers), '→', OUT)


if __name__ == '__main__':
    main()
