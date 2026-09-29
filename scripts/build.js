// Збирає сайт: SEO-теги, шапку й підвал головної, посадкові сторінки (UA/RU),
// sitemap.xml і robots.txt. Запуск: npm run build
const fs = require('fs');
const path = require('path');
const pages = require('./pages');
const MAP = require('./ukraine-map.json');

const root = path.join(__dirname, '..');
const PUB = path.join(root, 'public');
const { url: SITE, brand: BRAND } = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => SITE + p;
const byPath = Object.fromEntries(pages.all.map((p) => [p.path, p]));

// ---------------- shared UI strings ----------------
const UI = {
  uk: {
    tagline: 'модульні укриття',
    home: 'Головна',
    toHome: 'на головну',
    menu: 'Меню',
    calc: 'Розрахувати',
    lead: 'Залишити заявку',
    fab: 'Заявка',
    call: 'Подзвонити',
    messengers: 'Месенджери',
    langLabel: 'Русский',
    langShort: 'RU',
    footerFor: 'Укриття для',
    footerInfo: 'Інформація',
    office: 'м. Південноукраїнськ, Миколаївська обл.',
    delivery: 'Доставка по всій Україні',
    rights: 'Модульні укриття та бомбосховища.',
  },
  ru: {
    tagline: 'модульные укрытия',
    home: 'Главная',
    toHome: 'на главную',
    menu: 'Меню',
    calc: 'Рассчитать',
    lead: 'Оставить заявку',
    fab: 'Заявка',
    call: 'Позвонить',
    messengers: 'Мессенджеры',
    langLabel: 'Українська',
    langShort: 'UA',
    footerFor: 'Укрытие для',
    footerInfo: 'Информация',
    office: 'г. Южноукраинск, Николаевская обл.',
    delivery: 'Доставка по всей Украине',
    rights: 'Модульные укрытия и бомбоубежища.',
  },
};
const EMAIL = 'sheltermeua@gmail.com';
const PHONE = '380771138924';
const PHONE_TXT = '+38 (077) 113-89-24';
const MSG = {
  uk: 'Добрий день! Цікавить модульне укриття ShelterMe.',
  ru: 'Здравствуйте! Интересует модульное укрытие ShelterMe.',
};
const ICONS = {
  telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13.1l-4.8-1.5c-1-.3-1-1 .2-1.5L20.5 2.8c.9-.3 1.6.2 1.4 1.5z"/></svg>',
  viber: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.9 2 3 5.4 3 10.3c0 2.7 1.2 5 3.2 6.6V21l3.5-2.1c.7.1 1.5.2 2.3.2 5.1 0 9-3.4 9-8.3S17.1 2 12 2zm4.6 11.6c-.2.6-1.1 1.1-1.6 1.2-.4.1-1 .1-1.6-.1-3-1-5-4-5.1-4.2-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.8-.1 1.4z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1.1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.8-.2 1.5z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>',
};
const messengers = (lang) => [
  ['telegram', 'Telegram', 'https://t.me/sheltermeua'],
  ['viber', 'Viber', `viber://chat?number=%2B${PHONE}`],
  ['whatsapp', 'WhatsApp', `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG[lang])}`],
];
const msgLinks = (lang, cls) => messengers(lang)
  .map(([k, label, href]) => `<a class="${cls} ${cls}--${k}" href="${href}" target="_blank" rel="noopener" data-contact="${k}" aria-label="${label}">${ICONS[k]}<span>${label}</span></a>`)
  .join('');

function dock(p) {
  const t = UI[p.lang];
  return `<div class="dock" id="dock">
  <a class="dock__call" href="tel:+${PHONE}" data-contact="phone">${ICONS.phone}<span>${t.call}</span></a>
  <div class="dock__msg">${msgLinks(p.lang, 'mbtn')}</div>
  <a class="dock__lead" href="#order">${t.fab}</a>
</div>`;
}

const logoSvg = `<svg class="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M6 32V20a14 14 0 0 1 28 0v12" />
        <path d="M11 32V20a9 9 0 0 1 18 0v12" />
        <path d="M2 32h36" />
      </svg>`;

// ---------------- head ----------------
function head(p) {
  const alt = p.alt && byPath[p.alt];
  const hreflang = alt
    ? [
        `<link rel="alternate" hreflang="${p.lang}" href="${abs(p.path)}">`,
        `<link rel="alternate" hreflang="${alt.lang}" href="${abs(alt.path)}">`,
        `<link rel="alternate" hreflang="x-default" href="${abs(p.lang === 'uk' ? p.path : alt.path)}">`,
      ].join('\n  ')
    : `<link rel="alternate" hreflang="${p.lang}" href="${abs(p.path)}">`;
  const locale = p.lang === 'uk' ? 'uk_UA' : 'ru_UA';
  const img = abs('/img/og.jpg');
  const ld = [organization(), website(p), ...(p.product ? [product(p)] : []), ...(p.path !== '/' && p.path !== '/ru/' ? [breadcrumbs(p)] : []), ...(p.faq ? [faqLd(p)] : [])];
  return `<title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#111316">
  <link rel="canonical" href="${abs(p.path)}">
  ${hreflang}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${locale}">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${esc(p.ogTitle || p.title)}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:url" content="${abs(p.path)}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(p.imageAlt || p.h1)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.ogTitle || p.title)}">
  <meta name="twitter:description" content="${esc(p.description)}">
  <meta name="twitter:image" content="${img}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
${ld.map((x) => `  <script type="application/ld+json">\n${JSON.stringify(x, null, 2)}\n  </script>`).join('\n')}`;
}

function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': abs('/#org'),
    name: BRAND,
    url: abs('/'),
    logo: abs('/apple-touch-icon.png'),
    email: EMAIL,
    sameAs: ['https://t.me/sheltermeua'],
    telephone: '+380771138924',
    contactPoint: { '@type': 'ContactPoint', telephone: '+380771138924', contactType: 'sales', areaServed: 'UA', availableLanguage: ['uk', 'ru'] },
    address: { '@type': 'PostalAddress', addressLocality: 'Південноукраїнськ', addressRegion: 'Миколаївська область', addressCountry: 'UA' },
    areaServed: { '@type': 'Country', name: 'Україна' },
  };
}

function website(p) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), name: BRAND, url: abs('/'), inLanguage: p.lang, publisher: { '@id': abs('/#org') } };
}

function product(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.product,
    description: p.description,
    image: [abs('/img/og.jpg'), abs('/img/interior-3.webp'), abs('/img/modules-outdoor.webp')],
    brand: { '@type': 'Brand', name: BRAND },
    category: p.lang === 'uk' ? 'Модульні укриття' : 'Модульные укрытия',
    additionalProperty: pages.specs[p.lang].slice(0, 5).map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
  };
}

function breadcrumbs(p) {
  const home = p.lang === 'uk' ? '/' : '/ru/';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: UI[p.lang].home, item: abs(home) },
      { '@type': 'ListItem', position: 2, name: p.crumb, item: abs(p.path) },
    ],
  };
}

function faqLd(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

// ---------------- header / footer ----------------
function header(p) {
  const t = UI[p.lang];
  const home = p.lang === 'uk' ? '/' : '/ru/';
  const alt = p.alt && byPath[p.alt];
  const nav = p.nav.map(([href, label]) => `      <a href="${href}">${label}</a>`).join('\n');
  const lang = alt ? `\n      <a href="${alt.path}" class="nav__lang" hreflang="${alt.lang}" lang="${alt.lang}" aria-label="${t.langLabel}">${t.langShort}</a>` : '';
  return `<header class="header" id="top">
  <div class="container header__inner">
    <a href="${home}" class="logo" aria-label="${BRAND} — ${t.toHome}">
      ${logoSvg}
      <span class="logo__text">${BRAND}<small>${t.tagline}</small></span>
    </a>
    <nav class="nav" id="nav">
${nav}${lang}
    </nav>
    <div class="header__cta">
      <a href="tel:+380771138924" class="header__phone">+38 (077) 113-89-24</a>
      <a href="${p.calcHref}" class="btn btn--primary btn--sm">${t.calc}</a>
    </div>
    <button class="burger" id="burger" aria-label="${t.menu}" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>`;
}

function footer(p) {
  const t = UI[p.lang];
  const home = p.lang === 'uk' ? '/' : '/ru/';
  const landings = pages.all.filter((x) => x.lang === p.lang && x.crumb);
  const alt = p.alt && byPath[p.alt];
  return `<footer class="footer">
  <div class="container">
    <div class="footer__inner">
      <a href="${home}" class="logo">
        ${logoSvg}
        <span class="logo__text">${BRAND}<small>${t.tagline}</small></span>
      </a>
      <a href="#order" class="btn btn--primary btn--sm">${t.lead}</a>
    </div>
    <div class="footer__cols">
      <nav aria-label="${t.footerFor}">
        <p class="footer__h">${t.footerFor}</p>
        ${landings.map((x) => `<a href="${x.path}">${x.footerLabel}</a>`).join('\n        ')}
      </nav>
      <div>
        <p class="footer__h">${t.footerInfo}</p>
        <a href="${home}">${t.home}</a>
        ${alt ? `<a href="${alt.path}" hreflang="${alt.lang}">${t.langLabel}</a>` : `<a href="${p.lang === 'uk' ? '/ru/' : '/'}">${t.langLabel}</a>`}
      </div>
      <div>
        <p class="footer__h">${BRAND}</p>
        <p>${t.office}<br>${t.delivery}</p>
        <p><a href="tel:+380771138924">+38 (077) 113-89-24</a><br><a href="mailto:${EMAIL}">${EMAIL}</a></p>
      </div>
    </div>
    <p class="footer__copy">© <span id="year"></span> ${BRAND}. ${t.rights}</p>
  </div>
</footer>

${dock(p)}`;
}

// ---------------- landing page body ----------------
function landing(p) {
  const L = pages.text[p.lang];
  const home = p.lang === 'uk' ? '/' : '/ru/';
  const crumbs = `<nav class="crumbs" aria-label="breadcrumbs"><a href="${home}">${UI[p.lang].home}</a><span>/</span><span aria-current="page">${p.crumb}</span></nav>`;
  return `<main>

<section class="hero hero--page">
  <div class="hero__ribs" aria-hidden="true"></div>
  <div class="container hero__grid">
    <div class="hero__content">
      ${p.crumb ? crumbs : ''}
      <h1 class="hero__title hero__title--page">${p.h1}</h1>
      <p class="hero__lead">${p.lead}</p>
      <div class="hero__actions">
        <a href="#order" class="btn btn--primary">${L.getCalc} <span aria-hidden="true">→</span></a>
        <a href="${p.calcHref}" class="btn btn--ghost">${L.toConfig}</a>
      </div>
${callback(p.lang)}    </div>
    <div class="hero__visual">
      <figure class="photo photo--hero">
        <img src="/img/${p.image}.webp" alt="${esc(p.imageAlt)}" width="1050" height="1400" fetchpriority="high">
      </figure>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${p.benefitsTitle}</h2>
    </div>
    <div class="benefits">
${p.benefits.map(([h, t], i) => `      <article class="benefit"><span class="benefit__n">0${i + 1}</span><h3>${h}</h3><p>${t}</p></article>`).join('\n')}
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="container seo__grid">
    <div class="section__head">
      <h2 class="section__title">${p.textTitle}</h2>
      ${p.map ? ukraineMap(p.lang) : ''}
    </div>
    <div class="prose">
${p.text.map((x) => (x.startsWith('<') ? `      ${x}` : `      <p>${x}</p>`)).join('\n')}
    </div>
  </div>
</section>

<section class="section specs">
  <div class="container specs__grid">
    <div>
      <div class="section__head">
        <h2 class="section__title">${L.specsTitle}</h2>
      </div>
      <dl class="spec-table">
${pages.specs[p.lang].map(([k, v]) => `        <div><dt>${k}</dt><dd>${v}</dd></div>`).join('\n')}
      </dl>
    </div>
    <figure class="photo photo--specs">
      <img src="/img/${p.image2 || 'modules-outdoor'}.webp" alt="${esc(p.image2Alt || L.photoAlt)}" width="1400" height="1050" loading="lazy">
    </figure>
  </div>
</section>

<section class="section section--dark">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${L.protectTitle}</h2>
      <p class="section__lead">${L.protectLead}</p>
    </div>
    <div class="protect">
      <div class="protect__col protect__col--yes">
        <h3>${L.protectYes}</h3>
        <ul>${L.yes.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="protect__col protect__col--no">
        <h3>${L.protectNo}</h3>
        <ul>${L.no.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>
${p.configurator ? configurator(p) : ''}
<section class="section" id="faq">
  <div class="container faq">
    <div class="section__head">
      <h2 class="section__title">${L.faqTitle}</h2>
    </div>
    <div class="faq__list">
${p.faq.map(([q, a], i) => `      <details${i === 0 ? ' open' : ''}>\n        <summary>${q}</summary>\n        <p>${a}</p>\n      </details>`).join('\n')}
    </div>
  </div>
</section>

${orderForm(p)}

</main>`;
}

const CB = {"uk": ["Не хочете розбиратися? Залиште номер — передзвонимо й усе розрахуємо", "Передзвоніть мені", "Телефон"], "ru": ["Не хотите разбираться? Оставьте номер — перезвоним и всё рассчитаем", "Перезвоните мне", "Телефон"]};
function callback(lang) {
  const [label, btn, aria] = CB[lang];
  return `      <form class="callback" novalidate>
        <p class="callback__label">${label}</p>
        <div class="callback__row">
          <input type="tel" name="phone" autocomplete="tel" placeholder="+38 (0__) ___-__-__" aria-label="${aria}" required>
          <button type="submit" class="btn btn--primary">${btn}</button>
        </div>
        <p class="callback__msg" role="status" aria-live="polite"></p>
      </form>
`;
}

// Карта України за областями (дані: @svg-maps/ukraine, CC BY 4.0)
const MAP_TXT = {
  uk: { office: 'Офіс — Південноукраїнськ', delivery: 'Доставка по всій Україні', aria: 'Карта України: доставка модульних укриттів у всі області' },
  ru: { office: 'Офис — Южноукраинск', delivery: 'Доставка по всей Украине', aria: 'Карта Украины: доставка модульных укрытий во все области' },
};
function ukraineMap(lang) {
  const t = MAP_TXT[lang];
  // Південноукраїнськ: 47.82° пн. ш., 31.17° сх. д. — у межах Миколаївської області
  const [x1, y1, x2, y2] = MAP.boxes.mykolaiv;
  const px = Math.round(x1 + ((31.17 - 30.25) / 3.0) * (x2 - x1));
  const py = Math.round(y1 + ((48.3 - 47.82) / 1.9) * (y2 - y1));
  const regions = MAP.regions
    .map((r) => `<path class="ua-map__r${r.id === 'mykolaiv' ? ' is-home' : ''}" d="${r.d}"><title>${r.name}${r.id === 'kyiv-city' || r.id === 'crimea' ? '' : ' область'}</title></path>`)
    .join('');
  return `<figure class="ua-map">
        <svg viewBox="0 0 1000 670" role="img" aria-label="${t.aria}">${regions}
          <g class="ua-map__pin" transform="translate(${px} ${py})"><circle r="22" class="ua-map__pulse"/><circle r="9"/><circle r="3.5" class="ua-map__dot"/></g>
        </svg>
        <figcaption>
          <span class="ua-map__legend ua-map__legend--home">${t.office}</span>
          <span class="ua-map__legend">${t.delivery}</span>
        </figcaption>
        <!-- Map data: @svg-maps/ukraine by Olesia Ladanai, CC BY 4.0 -->
      </figure>`;
}

function configurator(p) {
  const C = pages.text[p.lang].cfg;
  return `
<section class="section section--steel config" id="config">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${C.title}</h2>
      <p class="section__lead">${C.lead}</p>
    </div>
    <div class="cfg">
      <div class="cfg__controls">
        <div class="cfg__group">
          <p class="cfg__label">${C.diam}</p>
          <div class="cfg__seg" role="radiogroup" aria-label="${C.diam}">
            <label><input type="radio" name="cfgDiam" value="2.2"><span>2,2 м</span></label>
            <label><input type="radio" name="cfgDiam" value="2.5" checked><span>2,5 м</span></label>
            <label><input type="radio" name="cfgDiam" value="3"><span>3 м</span></label>
          </div>
        </div>
        <div class="cfg__group">
          <p class="cfg__label">${C.len} <output id="cfgLenOut">8 м</output></p>
          <input type="range" id="cfgLen" min="3" max="14" step="0.5" value="8" aria-label="${C.len}">
          <div class="cfg__scale"><span>3 м</span><span>14 м</span></div>
        </div>
        <div class="cfg__row">
          <div class="cfg__group">
            <p class="cfg__label">${C.mods}</p>
            <div class="stepper" data-min="1" data-max="10">
              <button type="button" data-step="-1" aria-label="−">−</button>
              <output id="cfgMods">1</output>
              <button type="button" data-step="1" aria-label="+">+</button>
            </div>
          </div>
          <div class="cfg__group">
            <p class="cfg__label">${C.people}</p>
            <div class="stepper" data-min="1" data-max="500">
              <button type="button" data-step="-1" aria-label="−">−</button>
              <input type="number" id="cfgPeople" min="1" max="500" value="12" inputmode="numeric" aria-label="${C.people}">
              <button type="button" data-step="1" aria-label="+">+</button>
            </div>
          </div>
        </div>
        <div class="cfg__group">
          <p class="cfg__label">${C.extra}</p>
          <div class="cfg__opts">
${C.opts.map((o) => `            <label><input type="checkbox" value="${o.toLowerCase()}"><span>${o}</span></label>`).join('\n')}
          </div>
        </div>
      </div>
      <div class="cfg__preview">
        <div class="cfg__stage">
          <svg id="cfgSvg" viewBox="0 0 600 200" role="img" aria-label="${C.scheme}">
            <defs><pattern id="ribs" width="6" height="10" patternUnits="userSpaceOnUse"><rect width="6" height="10" fill="#23262b"/><rect width="2" height="10" fill="#3a3f47"/></pattern></defs>
            <line x1="0" y1="176" x2="600" y2="176" class="cfg__ground"/>
            <g id="cfgTube"></g>
            <g id="cfgPerson" class="cfg__person"><circle r="4.2"/><path d=""/></g>
          </svg>
          <p class="cfg__hint">${C.scale}</p>
        </div>
        <dl class="cfg__summary">
          <div><dt>${C.sumSize}</dt><dd id="cfgSumSize">Ø 2,5 × 8 м</dd></div>
          <div><dt>${C.sumMods}</dt><dd id="cfgSumMods">1</dd></div>
          <div><dt>${C.sumPeople}</dt><dd id="cfgSumPeople">12</dd></div>
          <div><dt>${C.extra}</dt><dd id="cfgSumOpts">—</dd></div>
        </dl>
        <a href="#leadForm" class="btn btn--primary btn--block btn--lg" id="cfgSubmit">${C.submit} <span aria-hidden="true">→</span></a>
        <p class="cfg__note">${C.note}</p>
      </div>
    </div>
  </div>
</section>
`;
}

function orderForm(p) {
  const F = pages.text[p.lang].form;
  return `<section class="section order" id="order">
  <div class="order__ribs" aria-hidden="true"></div>
  <div class="container order__grid">
    <div class="order__info">
      <h2 class="section__title">${F.title}</h2>
      <p class="section__lead">${F.lead}</p>
      <ul class="contacts">
        <li><span class="mono">${F.phone}</span><a href="tel:+${PHONE}" data-contact="phone">${PHONE_TXT}</a></li>
        <li><span class="mono">${UI[p.lang].messengers}</span><div class="contacts__msg">${msgLinks(p.lang, 'mbtn')}</div></li>
        <li><span class="mono">Email</span><a href="mailto:${EMAIL}">${EMAIL}</a></li>
        <li><span class="mono">${F.hours}</span><b>${F.hoursVal}</b></li>
        <li><span class="mono">${F.office}</span><b>${UI[p.lang].office}</b></li>
      </ul>
    </div>
    <form class="form" id="leadForm" novalidate>
      <div class="form__config" id="formConfig" hidden>
        <span>${F.yourConfig}</span>
        <b id="formConfigText"></b>
        <a href="#config">${F.change}</a>
      </div>
      <input type="hidden" name="config" id="formConfigInput">
      <div class="form__row">
        <label class="field"><span>${F.name} *</span><input type="text" name="name" autocomplete="name" placeholder="${F.namePh}" required></label>
        <label class="field"><span>${F.phone} *</span><input type="tel" name="phone" autocomplete="tel" placeholder="+38 (0__) ___-__-__" required></label>
      </div>
      <fieldset class="field">
        <legend>${F.object}</legend>
        <div class="chips">
${F.objects.map((o, i) => `          <label><input type="radio" name="object" value="${o}"${o === p.object || (!p.object && i === 0) ? ' checked' : ''}><span>${o}</span></label>`).join('\n')}
        </div>
      </fieldset>
      <div class="form__row">
        <label class="field"><span>${F.people}</span><input type="number" name="capacity" id="formCapacity" min="1" placeholder="${F.peoplePh}"></label>
        <label class="field"><span>${F.region}</span><input type="text" name="region" placeholder="${F.regionPh}"></label>
      </div>
      <label class="field"><span>${F.comment}</span><textarea name="message" id="formMessage" rows="3" placeholder="${F.commentPh}"></textarea></label>
      <label class="consent"><input type="checkbox" name="consent" required checked><span>${F.consent}</span></label>
      <button type="submit" class="btn btn--primary btn--block btn--lg"><span class="btn__label">${F.submit}</span><span class="btn__spinner" aria-hidden="true"></span></button>
      <p class="form__status" id="formStatus" role="status" aria-live="polite"></p>
      <div class="form__success" id="formSuccess" hidden>
        <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>
        <h3>${F.okTitle}</h3>
        <p>${F.okText}</p>
        <button type="button" class="btn btn--ghost" id="formAgain">${F.again}</button>
      </div>
    </form>
  </div>
</section>`;
}

function page(p) {
  const t = UI[p.lang];
  return `<!doctype html>
<html lang="${p.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- SEO:START -->
  ${head(p)}
  <!-- SEO:END -->
  <link rel="preload" as="image" href="/img/${p.image}.webp" fetchpriority="high">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"></noscript>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>

${header(p)}

${landing(p)}

${footer(p)}

<script src="/app.js"></script>
</body>
</html>
`;
}

// ---------------- write ----------------
const between = (html, start, end, content) => {
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a < 0 || b < 0) throw new Error(`Маркери ${start} / ${end} не знайдено`);
  return html.slice(0, a + start.length) + '\n' + content + '\n' + html.slice(b);
};

for (const p of pages.all) {
  if (p.path === '/') {
    // головна — ручна верстка, оновлюємо лише SEO, шапку й підвал
    const file = path.join(PUB, 'index.html');
    let html = fs.readFileSync(file, 'utf8');
    if (p.faqFromHtml) {
      const strip = (x) => x.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      p.faq = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [strip(m[1]), strip(m[2])]);
    }
    html = between(html, '<!-- SEO:START -->', '<!-- SEO:END -->', '  ' + head(p) + '\n  ');
    html = between(html, '<!-- HEADER:START -->', '<!-- HEADER:END -->', header(p));
    html = between(html, '<!-- FOOTER:START -->', '<!-- FOOTER:END -->', footer(p));
    html = between(html, '<!-- MAP:START -->', '<!-- MAP:END -->', '      ' + ukraineMap(p.lang));
    html = between(html, '<!-- MSG:START -->', '<!-- MSG:END -->', `        <li><span class="mono">${UI[p.lang].messengers}</span><div class="contacts__msg">${msgLinks(p.lang, 'mbtn')}</div></li>`);
    fs.writeFileSync(file, html);
  } else {
    const dir = path.join(PUB, p.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page(p));
  }
}

// версії CSS/JS для скидання кешу браузера після оновлень
const crypto = require('crypto');
const ver = (f) => crypto.createHash('md5').update(fs.readFileSync(path.join(PUB, f))).digest('hex').slice(0, 8);
const V = { css: ver('styles.css'), js: ver('app.js') };
const htmlFiles = pages.all.map((p) => path.join(PUB, p.path, 'index.html'));
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8')
    .replace(/href="\/styles\.css(\?v=\w+)?"/, `href="/styles.css?v=${V.css}"`)
    .replace(/src="\/app\.js(\?v=\w+)?"/, `src="/app.js?v=${V.js}"`);
  fs.writeFileSync(f, html);
}

// sitemap з hreflang
const urls = pages.all
  .map((p) => {
    const alt = p.alt && byPath[p.alt];
    const links = alt
      ? `\n    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${abs(p.path)}"/>\n    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${abs(alt.path)}"/>`
      : '';
    return `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${p.priority || '0.8'}</priority>${links}\n  </url>`;
  })
  .join('\n');
fs.writeFileSync(
  path.join(PUB, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
);
fs.writeFileSync(path.join(PUB, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${abs('/sitemap.xml')}\n`);

console.log(`Готово: ${pages.all.length} сторінок, sitemap.xml, robots.txt → ${SITE}`);
