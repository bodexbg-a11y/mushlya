# Рівно 4 фото на товар, у такому порядку (Prom, каталог на сайті, Google Merchant):
#   1) головне  2) всередині (реальне фото)  3) розміри на білому фоні  4) звичайне фото модуля
#   python3 scripts/prom/photos.py  →  scripts/prom/photos.json
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PROM = os.path.join(HERE, '..', '..', 'public', 'img', 'prom')
INTERIOR = '/img/katalog/a73a8cc38357.jpg'
OUTDOOR = '/img/katalog/46d75b812e4e.jpg'


def one(pattern):
    found = sorted(glob.glob(os.path.join(PROM, pattern)))
    assert len(found) == 1, (pattern, found)
    return '/img/prom/' + os.path.basename(found[0])


def main():
    main_ = {
        'me1': one('p-me1-main-*.jpg'), 'me2': one('p-me2-main-*.jpg'), 'me2xl': one('p-me2xl-main-*.jpg'),
        'me2c': one('p-me2c-main-*.jpg'), 'me2cp': one('p-me2cp-main-*.jpg'),
        # ще без нових фото — поточне головне фото з Prom
        'me2ex': '/img/katalog/bfb7b98a7686.jpg', 'me2fl': '/img/katalog/43228804ef72.jpg',
        'me2fxl': '/img/katalog/2d663d5c1352.jpg', 'me2b': '/img/katalog/c1348ee7a7a8.jpg',
        'me2cl': '/img/katalog/5ab152529b74.jpg', 'me2exl': '/img/katalog/bfb7b98a7686.jpg',
        'me2exxl': '/img/katalog/bfb7b98a7686.jpg',
    }
    for i in range(1, 11):
        main_[f'me-v{i:02d}'] = one(f'v-me-v{i:02d}-main-*.jpg')
    dims = {
        'me1': one('p-me1-dims-*.jpg'), 'me2': one('p-me2-dims-*.jpg'), 'me2xl': one('p-me2xl-dims-*.jpg'),
        'me2c': one('p-me2c-dims-*.jpg'), 'me2cp': one('p-me2cp-dims-*.jpg'),
    }
    for gid in ('me2ex', 'me2fl', 'me2fxl', 'me2b', 'me2cl', 'me2exl', 'me2exxl', 'me-v10'):
        dims[gid] = one(f'd-{gid}-*.jpg')
    # варіанти: схема базової моделі того ж розміру
    for v, base in {'me-v01': 'me2cp', 'me-v02': 'me1', 'me-v03': 'me2fl', 'me-v04': 'me2cl', 'me-v05': 'me2ex',
                    'me-v06': 'me2b', 'me-v07': 'me2fxl', 'me-v08': 'me2exxl', 'me-v09': 'me2c'}.items():
        dims[v] = dims[base]
    out = {gid: [m, INTERIOR, dims[gid], OUTDOOR] for gid, m in main_.items()}
    json.dump(out, open(os.path.join(HERE, 'photos.json'), 'w'), indent=1, sort_keys=True)
    print(len(out), 'товарів × 4 фото')


if __name__ == '__main__':
    main()
