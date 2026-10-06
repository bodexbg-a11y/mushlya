# Оновлення 12 наявних товарів Prom: правильні назви (UA/RU), місткість, 26 характеристик,
# 36 пошукових запитів, категорія маркетплейсу, бренд, описи без подвійного даху.
#
#   python3 scripts/prom/fix_existing.py  →  ~/Downloads/shelterme-prom-update.xml
import html
import os
import re

from render import hero, render
from variants import KW_RU, KW_UA, PORTAL_URL

FEED_IN = os.path.expanduser('~/Downloads/products_feed.xml')
OUT = os.path.expanduser('~/Downloads/shelterme-prom-update.xml')
DL = os.path.expanduser('~/Downloads')
IMG = 'https://www.shelterme.com.ua/img/prom/'

# code: модель, діаметр, довжина, сидячих, спальних, призначення, файли (hero, cap, specs, modular), UA-опис
M = {
    'ME1': dict(model='', diam='2,5', len='6,25', seats='20–24', sleep='10–12', purpose='Для дома',
                img=('hero-fc795ca7.png', 'stdcap-e2e43177.png', 'specs-4a9ac52c.png', None), ua='ShelterMe-prom-opys.html',
                who_ua='для будинку, ЖК, підприємства', who_ru='для дома, ЖК, предприятия'),
    'ME2': dict(model='Business L', diam='3,0', len='8', seats='28–30', sleep='14–15', purpose='Для предприятия',
                img=(None, None, None, None), ua=None),
    'ME2XL': dict(model='Business XL', diam='3,0', len='10', seats='36–40', sleep='18–20', purpose='Для предприятия',
                  img=(None, None, None, None), ua=None),
    'ME2С': dict(model='Compact', diam='2,0', len='4–5', seats='12–16', sleep='6–8', purpose='Для дома',
                 img=('comphero-7a2edc79.png', 'compcap-6d84a32d.png', 'compspecs-5119375b.png', None), ua='ShelterMe-prom-opys-compact.html'),
    'ME2СP': dict(model='Compact+', diam='2,0', len='6,25', seats='20–22', sleep='10–11', purpose='Для дома',
                  img=('plushero-2e96022f.png', 'pluscap-84617d94.png', 'plusspecs-988b0b51.png', None), ua='ShelterMe-prom-opys-compact-plus.html'),
    'ME2EX': dict(model='Extended', diam='3,0', len='12', seats='44–48', sleep='22–24', purpose='Для дома',
                  img=('exthero-e1870f04.png', 'extcap-f85e707f.png', 'extspecs2-ba672d18.png', 'extmodular-70fd47c2.png'), ua='ShelterMe-prom-opys-extended.html'),
    'ME2FL': dict(model='Family L', diam='2,5', len='8', seats='28–30', sleep='14–15', purpose='Для дома',
                  img=('famlhero-1f57a040.png', 'famlcap-357650f5.png', 'famlspecs-70eb0e6a.png', 'famlmodular-92843e18.png'), ua='ShelterMe-prom-opys-family-l.html',
                  who_ua='для будинку, ЖК, підприємства', who_ru='для дома, ЖК, предприятия'),
    'ME2FXL': dict(model='Family XL', diam='2,5', len='10', seats='36–40', sleep='18–20', purpose='Для дома',
                   img=('famxlhero-3a407a8a.png', 'famxlcap-cd7e2135.png', 'famxlspecs-8a6b25ec.png', 'famxlmodular-237c64e9.png'), ua='ShelterMe-prom-opys-family-xl.html',
                   who_ua='для будинку, ЖК, підприємства', who_ru='для дома, ЖК, предприятия'),
    'ME2B': dict(model='Business', diam='3,0', len='6,25', seats='20–24', sleep='10–12', purpose='Для предприятия',
                 img=('bizshero-1604757e.png', 'bizscap-245fc757.png', 'bizsspecs-fe63b95a.png', 'bizsmodular-88cd1be6.png'), ua='ShelterMe-prom-opys-business.html'),
    'ME2СL': dict(model='Compact L', diam='2,0', len='8', seats='28–30', sleep='14–15', purpose='Для дома',
                  img=('complhero-96b739fe.png', 'complcap-8021481b.png', 'complspecs-3af681e2.png', 'complmodular-dd19f477.png'), ua='ShelterMe-prom-opys-compact-l.html'),
    'ME2EXL': dict(model='Extended L', diam='3,0', len='13', seats='48–52', sleep='24–26', purpose='Для дома',
                   img=('extlhero-4f627336.png', 'extlcap-c04bb502.png', 'extlspecs-8ecdf90b.png', 'extlmodular-b7fac218.png'), ua='ShelterMe-prom-opys-extended-l.html'),
    'ME2EXXL': dict(model='Extended XL', diam='3,0', len='14', seats='52–56', sleep='26–28', purpose='Для дома',
                    img=('extxlhero-a3a77a8f.png', 'extxlcap-91564e2d.png', 'extxlspecs-c9acd160.png', 'extxlmodular-5452df2d.png'), ua='ShelterMe-prom-opys-extended-xl.html'),
}


def lo(seats):
    return seats.split('–')[0]


def hi(seats):
    return seats.split('–')[-1]


def names(m):
    model = f"SHELTER ME {m['model']}".strip()
    size = f"Ø{m['diam'].replace(',0', '')} м × {m['len']} м"
    ua = f"Модульне підземне укриття-бомбосховище {model} на {m['seats']} осіб, {size}"
    ru = f"Модульное подземное укрытие-бомбоубежище {model} на {m['seats']} человек, {size}"
    if m.get('who_ua'):
        ua = f"Модульне підземне укриття-бомбосховище {m['who_ua']} {model} на {m['seats']} осіб, {size}"
        ru = f"Модульное подземное укрытие-бомбоубежище {m['who_ru']} {model} на {m['seats']} человек, {size}"
    return ua, ru


def img(fn, alt):
    return f'<p><img src="{IMG}{fn}" alt="{html.escape(alt)}" width="100%"></p>' if fn else ''


def spec_list(m, ru):
    rows = ([('Диаметр', f"{m['diam']} м"), ('Длина', f"{m['len']} м"), ('Сидячих мест', m['seats']), ('Спальных мест', m['sleep']),
             ('Корпус', 'цельный, герметичный, HDPE'), ('Конфигурация', 'по ТЗ заказчика'), ('Соответствие', 'ДСТУ 9195:2022'),
             ('Изготовление', '~24 рабочих дня'), ('Доставка', 'по всей Украине')] if ru else
            [('Діаметр', f"{m['diam']} м"), ('Довжина', f"{m['len']} м"), ('Місць для сидіння', m['seats']), ('Спальних місць', m['sleep']),
             ('Корпус', 'цільний, герметичний, HDPE'), ('Конфігурація', 'за ТЗ замовника'), ('Відповідність', 'ДСТУ 9195:2022'),
             ('Виготовлення', '~24 робочі дні'), ('Доставка', 'по всій Україні')])
    h = '<h3>📐 Характеристики</h3>'
    return h + '<ul>' + ''.join(f'<li><b>{k}:</b> {v}</li>' for k, v in rows) + '</ul>'


def description(m, ru, hero_fn):
    """Опис у форматі наших карток. UA для Business L/XL і всі RU-описи."""
    hero_f, cap, specs, modular = m['img']
    hero_f = hero_f or hero_fn
    name_ua, name_ru = names(m)
    title = (name_ru if ru else name_ua).split(',')[0]
    d, ln, s, sl = m['diam'], m['len'], m['seats'], m['sleep']
    if ru:
        intro = (f"<p><b>{html.escape(title)}</b> — модуль <b>Ø {d} × {ln} м</b> на <b>{s} сидячих или {sl} спальных мест</b>. "
                 f"Быстровозводимое подземное укрытие для <b>частного дома, ОСМД, ЖК, предприятия и коммерческого объекта</b>. "
                 f"Изготавливается <b>индивидуально по техническому заданию</b>, доставка по всей Украине.</p>")
        why = (f"<h3>🏠 Сколько людей вмещает</h3><p>Диаметр {d} м и длина {ln} м — <b>{s} сидячих или {sl} спальных мест</b>. "
               f"Мы рассчитываем <b>50 см на человека — просторнее, чем требует норматив ДСТУ</b>: {lo(s)} человек размещаются с комфортным запасом, "
               f"по нормативу ДСТУ — до {hi(s)}. Нужно больше мест — <b>модули соединяются между собой</b>.</p>"
               "<ul><li>💧 <b>Цельный герметичный корпус</b> из HDPE — без стыков, через которые протекает вода</li>"
               "<li>📄 <b>Всё по вашему ТЗ</b> — конфигурация, планировка и комплектация определяются техническим заданием заказчика</li>"
               "<li>⚡ <b>Без мокрых работ на участке</b> — модуль привозят готовым</li></ul>")
        docs = ('<h3>📄 Испытания и документация</h3><p>Конструкция прошла <b>сертификационные испытания</b> и соответствует <b>ДСТУ 9195:2022</b>. '
                'Есть <b>протокол испытаний, сертификат, техническая и сопроводительная документация</b> — предоставляем для ознакомления.</p>')
        price = '<p>Стоимость рассчитывается <b>индивидуально</b>: зависит от технического задания, комплектации, дополнительного оборудования и места доставки. Доставка оплачивается отдельно.</p>'
        kw = f"<p><i>{html.escape(name_ru.split(',')[0])} • модульное укрытие • бомбоубежище • подземное укрытие • укрытие для дома • укрытие для ОСМД • укрытие для предприятия • быстровозводимое защитное сооружение • укрытие ДСТУ 9195:2022</i></p>"
    else:
        intro = (f"<p><b>{html.escape(title)}</b> — модуль <b>Ø {d} × {ln} м</b> на <b>{s} сидячих або {sl} спальних місць</b>. "
                 f"Швидкоспоруджуване підземне укриття для <b>підприємств, офісів, закладів, комерційних обʼєктів та ОСББ</b>. "
                 f"Виготовляється <b>індивідуально за технічним завданням</b>, доставка по всій Україні.</p>")
        why = (f"<h3>🏢 Укриття для персоналу поруч із робочими місцями</h3><p>Діаметр {d} м дає просторий прохід і комфортну висоту, а довжина {ln} м — "
               f"<b>{s} місць для сидіння або {sl} спальних місць</b>. Ми розраховуємо <b>50 см на людину — просторіше, ніж вимагає норматив ДСТУ</b>: "
               f"{lo(s)} осіб розміщуються з комфортним запасом, за нормативом ДСТУ — до {hi(s)}. Потрібно більше місць — <b>модулі зʼєднуються між собою</b>.</p>"
               "<ul><li>💧 <b>Цільний герметичний корпус</b> — стійкий до вологи, без стиків, через які протікає вода</li>"
               "<li>📄 <b>Все за вашим ТЗ</b> — конфігурація, планування й комплектація визначаються технічним завданням замовника</li>"
               "<li>⚡ <b>Без мокрих робіт на території</b> — модуль привозять готовим</li></ul>")
        docs = ('<h3>📄 Випробування та документація</h3><p>Конструкція пройшла <b>сертифікаційні випробування</b> і відповідає <b>ДСТУ 9195:2022</b>. '
                'Наявні <b>протокол випробувань, сертифікат, технічна та супровідна документація</b> — надаємо для ознайомлення.</p>')
        price = '<p>Вартість розраховується <b>індивідуально</b>: залежить від технічного завдання, комплектації, додаткового обладнання та місця доставки. Доставка оплачується окремо.</p>'
        kw = f"<p><i>{html.escape(name_ua.split(',')[0])} • модульне укриття • бомбосховище • підземне укриття • укриття для підприємства • укриття для персоналу • укриття для ОСББ • швидкоспоруджувана захисна споруда • укриття ДСТУ 9195:2022</i></p>"
    parts = [
        img(hero_f, title), intro,
        img('trust-9f7f36b0.png', 'ДСТУ 9195:2022, сертифікат, протокол випробувань, доставка по Україні, 24 дні виготовлення, технічний паспорт'),
        img(cap, f"{s} / {sl}"), why,
        img(specs, f"Ø {d} × {ln} м") if specs else spec_list(m, ru),
        img('objects-62723f71.png', 'Укриття для приватних будинків, ЖК та ОСББ, підприємств і комерційних обʼєктів'),
        img('protect-e6de175d.png', 'Від чого захищає модульне укриття: уламки, ударна хвиля, БПЛА, артобстріл середньої інтенсивності'),
        img(modular, 'Модульна система'), img('extkit-cdc462b0.png', 'Можлива комплектація за ТЗ'),
        docs, img('extcalc-b754df68.png', 'Розрахунок укриття під технічне завдання'), price,
        img('cta1-2529dd68.png', 'Написати продавцю'), kw,
    ]
    return '\n'.join(p for p in parts if p)


def ua_description(code, m, hero_fn):
    if not m['ua']:
        return description(m, False, hero_fn)
    s = open(os.path.join(DL, m['ua']), encoding='utf-8').read()
    assert not re.search('подвійн|вогнестійк', s), m['ua']
    return s.strip()


def kw_model(m, ru):
    s = m['seats']
    n = hi(s)
    if ru:
        return f"укрытие на {lo(s)} человек, укрытие на {n} человек, укрытие {m['diam'].replace(',0', '')} метра, SHELTER ME {m['model']}".rstrip()
    return f"укриття на {lo(s)} осіб, укриття на {n} осіб, укриття {m['diam'].replace(',0', '')} метри, SHELTER ME {m['model']}".rstrip()


def params(m):
    return [('Тип', 'Модульные'), ('Размещение', 'Подземное'), ('Назначение', m['purpose']),
            ('Габарити модуля (Ø × довжина)', f"Ø {m['diam']} × {m['len']} м"),
            ('Внутрішній діаметр', f"{m['diam']} м"), ('Довжина', f"{m['len']} м"), ('Кількість модулів', '1'),
            ('Вмісткість', f"{m['seats'].replace('–', '-')} осіб"), ('Кількість місць для сидіння', m['seats']),
            ('Кількість спальних місць', m['sleep']),
            ('Матеріал корпусу', 'HDPE (поліетилен високої щільності)'), ('Корпус', 'цільний, герметичний, без стиків'),
            ('Товщина стінки', '100–150 мм'), ('Вага модуля', '1–3 т залежно від комплектації'),
            ('Вологостойкість', 'IPX8'), ('Захист від', 'Ударної хвилі'),
            ('Захисні властивості', 'від уламків, осколків і ударної хвилі при засипці ґрунтом 2–3 м'),
            ('Ґрунтове покриття', '2–3 м'), ('Піщана подушка', '300–500 мм'), ('Відповідність', 'ДСТУ 9195:2022'),
            ('Документи', 'сертифікат відповідності, протокол випробувань, технічний паспорт'),
            ('Комплектація', 'за технічним завданням замовника'), ('Термін виготовлення', 'орієнтовно 24 робочі дні'),
            ('Виготовлення', 'за технічним завданням замовника'),
            ('Доставка', 'по всій Україні спецтранспортом із краном, оплачується окремо'), ('Країна виробник', 'Україна')]


def main():
    src = open(FEED_IN, encoding='utf-8').read()
    out = []
    e = html.escape
    for attrs, o in re.findall(r'<offer ([^>]*)>(.*?)</offer>', src, re.S):
        code = re.search(r'<vendorCode>(.*?)</vendorCode>', o).group(1)
        m = M[code]
        hero_fn = None
        if not m['img'][0]:
            hero_fn = render(f"hero-{code.lower()}", hero('SHELTER ME', m['model'], f"на {m['seats']} осіб", f"Ø {m['diam']} × {m['len']} м",
                                                     f"Модуль для підприємства, офісу, закладу чи ОСББ: <b>{m['seats']} сидячих або {m['sleep']} спальних місць</b> в одному укритті."))
        name_ua, name_ru = names(m)
        pics = re.findall(r'<picture>(.*?)</picture>', o)
        price = re.search(r'<price>(.*?)</price>', o).group(1)
        out.append(f"""<offer {attrs}>
    <price>{price}</price>
    <currencyId>UAH</currencyId>
    <portal_category_url>{PORTAL_URL}</portal_category_url>
{''.join(f'    <picture>{p}</picture>' + chr(10) for p in pics)}    <pickup>false</pickup>
    <delivery>true</delivery>
    <sales_notes>предоплата</sales_notes>
    <name>{e(name_ru)}</name>
    <name_ua>{e(name_ua)}</name_ua>
    <vendor>SHELTER ME</vendor>
    <vendorCode>{code}</vendorCode>
    <country_of_origin>Украина</country_of_origin>
    <description><![CDATA[{description(m, True, hero_fn)}]]></description>
    <description_ua><![CDATA[{ua_description(code, m, hero_fn)}]]></description_ua>
    <keywords>{e(KW_RU + ', ' + kw_model(m, True))}</keywords>
    <keywords_ua>{e(KW_UA + ', ' + kw_model(m, False))}</keywords_ua>
{''.join(f'    <param name="{e(k)}">{e(v)}</param>' + chr(10) for k, v in params(m))}</offer>""")
        print(code, '|', name_ua)
    feed = f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="2026-10-06 18:00">
  <shop>
    <name>Shelter Me</name>
    <company>Shelter Me</company>
    <url>https://cs4242922.prom.ua/</url>
    <currencies>
      <currency id="UAH" rate="1"/>
    </currencies>
  <offers>
{chr(10).join(out)}
  </offers>
  </shop>
</yml_catalog>
"""
    open(OUT, 'w', encoding='utf-8').write(feed)
    print(len(out), '→', OUT)


if __name__ == '__main__':
    main()
