# Повна вигрузка для Prom у табличному форматі (CSV), де «Наявність» = 24 → «Під замовлення, 24 дні».
# Береться з ~/Downloads/shelterme-prom-all.xml (python3 scripts/prom/prom_all.py).
#   python3 scripts/prom/prom_csv.py  →  ~/Downloads/shelterme-prom-all.csv
import csv
import os
import xml.etree.ElementTree as ET

from variants import PORTAL_URL

SRC = os.path.expanduser('~/Downloads/shelterme-prom-all.xml')
OUT = os.path.expanduser('~/Downloads/shelterme-prom-all.csv')
DAYS = '24'


def main():
    offers = ET.parse(SRC).findall('.//offer')
    n_params = max(len(o.findall('param')) for o in offers)
    head = ['Код_товару', 'Назва_позиції', 'Назва_позиції_укр', 'Пошукові_запити', 'Пошукові_запити_укр',
            'Опис', 'Опис_укр', 'Тип_товару', 'Ціна', 'Валюта', 'Одиниця_виміру', 'Посилання_зображення',
            'Наявність', 'Виробник', 'Країна_виробник', 'Ідентифікатор_товару', 'Посилання_підрозділу']
    for _ in range(n_params):
        head += ['Назва_Характеристики', 'Одиниця_виміру_Характеристики', 'Значення_Характеристики']
    with open(OUT, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(head)
        for o in offers:
            row = [o.findtext('vendorCode'), o.findtext('name'), o.findtext('name_ua'),
                   o.findtext('keywords'), o.findtext('keywords_ua'),
                   o.findtext('description'), o.findtext('description_ua'),
                   'r', o.findtext('price'), 'UAH', 'шт.',
                   ', '.join(p.text for p in o.findall('picture')),
                   DAYS, o.findtext('vendor') or 'SHELTER ME', 'Україна', o.get('id'), PORTAL_URL]
            for p in o.findall('param'):
                row += [p.get('name'), '', p.text or '']
            w.writerow(row)
    print(len(offers), 'товарів →', OUT)


if __name__ == '__main__':
    main()
