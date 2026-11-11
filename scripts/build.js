// Збирає сайт: SEO-теги, шапку й підвал головної, посадкові сторінки (UA/RU),
// sitemap.xml і robots.txt. Запуск: npm run build
const fs = require('fs');
const path = require('path');
const pages = require('./pages');
const models = require('./models');

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
    footerFor: 'Рішення',
    footerInfo: 'Інформація',
    office: 'Миколаївська обл.',
    delivery: 'Доставка по всій Україні',
    rights: 'Модульні бетонні укриття та бомбосховища.',
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
    footerFor: 'Решения',
    footerInfo: 'Информация',
    office: 'Николаевская обл.',
    delivery: 'Доставка по всей Украине',
    rights: 'Модульные бетонные укрытия и бомбоубежища.',
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
// Google Ads: тег на всіх сторінках; конверсію «заявка» надсилає public/app.js
const GADS_ID = 'AW-18482298767';
// Сам gtag.js вантажимо після load — не гальмує перший екран; до того події чекають у dataLayer
const GTAG = `<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GADS_ID}');
  addEventListener('load', function () { setTimeout(function () { var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=${GADS_ID}'; document.head.appendChild(s); }, 1200); });</script>`;

function head(p) {
  const alt = p.alt && byPath[p.alt];
  const hreflang = alt
    ? [
        `<link rel="alternate" hreflang="${p.lang}" href="${abs(p.path)}">`,
        `<link rel="alternate" hreflang="${alt.lang}" href="${abs(alt.path)}">`,
        `<link rel="alternate" hreflang="x-default" href="${abs(p.lang === 'uk' ? p.path : alt.path)}">`,
      ].join('\n  ')
    : [
        `<link rel="alternate" hreflang="${p.lang}" href="${abs(p.path)}">`,
        `<link rel="alternate" hreflang="x-default" href="${abs(p.path)}">`,
      ].join('\n  ');
  const locale = p.lang === 'uk' ? 'uk_UA' : 'ru_UA';
  const ld = [organization(), website(p), service(p), ...(p.crumb ? [breadcrumbs(p)] : []), ...(p.faq ? [faqLd(p)] : [])];
  return `${GTAG}
  <title>${esc(p.title)}</title>
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
  <meta property="og:image" content="${abs('/img/logo.png')}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(p.ogTitle || p.title)}">
  <meta name="twitter:description" content="${esc(p.description)}">
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
    logo: abs('/img/logo.png'),
    email: EMAIL,
    sameAs: ['https://t.me/sheltermeua'],
    telephone: '+380771138924',
    contactPoint: { '@type': 'ContactPoint', telephone: '+380771138924', contactType: 'sales', areaServed: 'UA', availableLanguage: ['uk', 'ru'] },
    address: { '@type': 'PostalAddress', addressRegion: 'Миколаївська область', addressCountry: 'UA' },
    areaServed: { '@type': 'Country', name: 'Україна' },
  };
}

function website(p) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), name: BRAND, url: abs('/'), inLanguage: p.lang, publisher: { '@id': abs('/#org') } };
}

// Послуга, а не Product: у Product Google вимагає ціну або відгуки, яких у нас немає
function service(p) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${p.h1} ${BRAND}`,
    serviceType: p.lang === 'uk' ? 'Модульні бетонні укриття' : 'Модульные бетонные укрытия',
    description: p.description,
    provider: { '@id': abs('/#org') },
    brand: { '@type': 'Brand', name: BRAND },
    areaServed: { '@type': 'Country', name: 'Україна' },
    url: abs(p.path),
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
  // Пункт меню може мати підпункти (сторінки) — Google бере їх для sitelinks
  const nav = p.nav.map(([href, label, sub]) => sub
    ? `      <div class="nav__drop"><a href="${href}" class="nav__parent">${label}</a><div class="nav__sub">${sub.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</div></div>`
    : `      <a href="${p.noCalc && href === '#calc' ? home + '#calc' : href}">${label}</a>`).join('\n');
  const other = alt ? alt : { path: p.lang === 'uk' ? '/ru/' : '/', lang: p.lang === 'uk' ? 'ru' : 'uk' };
  const lang = `\n      <a href="${other.path}" class="nav__lang" hreflang="${other.lang}" lang="${other.lang}" aria-label="${t.langLabel}">${t.langShort}</a>`;
  return `<header class="header" id="top">
  <div class="container header__inner">
    <a href="${home}" class="logo" aria-label="${BRAND} — ${t.toHome}">
      <svg class="logo__house" viewBox="0 0 100 100" aria-hidden="true"><path d="M8 94V40L50 6l42 34v54z"/><path d="M24 94V48L50 27l26 21v46" fill="none" stroke="var(--logo-bg, #111316)" stroke-width="9" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="32" fill="var(--logo-bg, #111316)"/></svg><span class="logo__word">SHELTER<b>ME</b></span>
    </a>
    <nav class="nav" id="nav">
${nav}${lang}
    </nav>
    <div class="header__cta">
      <a href="tel:+380771138924" class="header__phone">+38 (077) 113-89-24</a>
      <a href="#order" class="btn btn--primary btn--sm">${t.calc}</a>
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
        <svg class="logo__house" viewBox="0 0 100 100" aria-hidden="true"><path d="M8 94V40L50 6l42 34v54z"/><path d="M24 94V48L50 27l26 21v46" fill="none" stroke="var(--logo-bg, #111316)" stroke-width="9" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="32" fill="var(--logo-bg, #111316)"/></svg><span class="logo__word">SHELTER<b>ME</b></span>
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

// Схема-переріз модульного укриття замість фото
const HERO_ART = {
  uk: { aria: 'Схема: наземне модульне залізобетонне укриття в розрізі', head: 'Наземне укриття', ground: 'ґрунт', concrete: 'залізобетон 300 мм', size: 'від 5 до 15 осіб' },
  ru: { aria: 'Схема: наземное модульное железобетонное укрытие в разрезе', head: 'Наземное укрытие', ground: 'грунт', concrete: 'железобетон 300 мм', size: 'от 5 до 15 человек' },
};
function heroArt(lang) {
  const t = HERO_ART[lang];
  return `<figure class="hero-art">
        <svg viewBox="0 0 600 520" role="img" aria-label="${t.aria}">
          <defs>
            <pattern id="ha-soil" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" class="ha-soil-line"/></pattern>
            <pattern id="ha-concrete" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.6" class="ha-dot"/><circle cx="13" cy="12" r="1.2" class="ha-dot"/><circle cx="9" cy="16" r="0.9" class="ha-dot"/></pattern>
          </defs>
          <text x="40" y="52" class="ha-head">${t.head.toUpperCase()}</text>
          <rect x="20" y="420" width="560" height="34" fill="url(#ha-soil)" class="ha-soil"/>
          <path d="M20 420 H580" class="ha-ground"/>
          <rect x="70" y="400" width="460" height="20" class="ha-wall"/>
          <path d="M110 400 V250 A190 130 0 0 1 490 250 V400 Z" class="ha-wall"/>
          <path d="M110 400 V250 A190 130 0 0 1 490 250 V400 Z" fill="url(#ha-concrete)"/>
          <path d="M70 400 L110 400 L110 236 L94 236 Z M530 400 L490 400 L490 236 L506 236 Z" class="ha-wall"/>
          <path d="M70 400 L110 400 L110 236 L94 236 Z M530 400 L490 400 L490 236 L506 236 Z" fill="url(#ha-concrete)"/>
          <path d="M140 400 V258 A160 100 0 0 1 460 258 V400 Z" class="ha-in"/>
          <g class="ha-seats"><rect x="165" y="368" width="110" height="14"/><rect x="325" y="368" width="110" height="14"/></g>
          <g class="ha-dim">
            <path d="M300 104 V120"/>
            <path d="M70 478 H530 M70 470 V486 M530 470 V486"/>
            <text x="300" y="505" text-anchor="middle">${t.size}</text>
          </g>
          <text x="300" y="96" text-anchor="middle" class="ha-label">${t.concrete}</text>
          <text x="40" y="446" class="ha-label">${t.ground}</text>
        </svg>
      </figure>`;
}

// «Чому модульне укриття» — спільний блок для всіх сторінок
function pros(p) {
  const P = pages.text[p.lang].pros;
  return `<section class="section" id="pros">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${P.title}</h2>
      <p class="section__lead">${P.lead}</p>
    </div>
    <div class="benefits">
${P.items.map(([h, t], i) => `      <article class="benefit"><span class="benefit__n">${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${t}</p></article>`).join('\n')}
    </div>
  </div>
</section>`;
}

// Модельний ряд: картки з габаритами, площею й місткістю + схема зверху
const fmtNum = (n) => String(n).replace('.', ',');
function modelPlan(m) {
  // схема зверху в масштабі: довжина ↔ ширина, лінії між модулями, входи з торців
  const k = Math.min(260 / m.l, 90 / m.w);
  const w = m.l * k, h = m.w * k, x = (300 - w) / 2, y = (120 - h) / 2;
  const lines = Array.from({ length: m.modules - 1 }, (_, i) => {
    const lx = x + (w / m.modules) * (i + 1);
    return `<line x1="${lx.toFixed(1)}" y1="${y.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${(y + h).toFixed(1)}"/>`;
  }).join('');
  const door = m.type === 'under'
    ? `<rect x="${(x + w).toFixed(1)}" y="${(y + h / 2 - 12).toFixed(1)}" width="16" height="24" class="model__door"/>`
    : `<rect x="${(x - 9).toFixed(1)}" y="${(y + 8).toFixed(1)}" width="9" height="18" class="model__door"/><rect x="${(x + w).toFixed(1)}" y="${(y + h - 26).toFixed(1)}" width="9" height="18" class="model__door"/>`;
  return `<svg viewBox="0 0 300 120" class="model__plan" aria-hidden="true"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" class="model__body"/><g class="model__mods">${lines}</g>${door}</svg>`;
}
// Блок «Модельний ряд» тимчасово прихований. Щоб повернути — true (і пункт меню в pages.js)
const SHOW_MODELS = false;
function modelsBlock(p) {
  const M = pages.text[p.lang].models;
  return `<section class="section" id="models">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${M.title}</h2>
      <p class="section__lead">${M.lead}</p>
    </div>
    <div class="models">
${models.list.map((m) => `      <article class="model" id="model-${m.id}">
        <div class="model__top"><span class="model__tag${m.type === 'under' ? ' model__tag--under' : ''}">${m.type === 'under' ? M.under : M.ground}</span><span class="model__mono">${M.modules}: ${m.modules}</span></div>
        <h3 class="model__name">ShelterMe ${m.name}</h3>
        ${modelPlan(m)}
        <dl class="model__specs">
          <div><dt>${M.people}</dt><dd>до ${m.people} ${M.peopleUnit}</dd></div>
          <div><dt>${M.area}</dt><dd>${fmtNum(m.area)} м²</dd></div>
          <div><dt>${M.size}</dt><dd>${fmtNum(m.l)} × ${fmtNum(m.w)} м</dd></div>
        </dl>
        <p class="model__text">${m[p.lang]}</p>
        <a href="#order" class="btn btn--ghost btn--block model__ask" data-model="ShelterMe ${m.name}" data-under="${m.type === 'under' ? 1 : 0}">${M.ask} <span aria-hidden="true">→</span></a>
      </article>`).join('\n')}
    </div>
    <p class="models__note">${M.note}</p>
    <h3 class="models__h">${M.specsTitle}</h3>
    <div class="benefits">
${M.specs.map(([h, t], i) => `      <article class="benefit"><span class="benefit__n">${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${t}</p></article>`).join('\n')}
    </div>
  </div>
</section>`;
}

// Калькулятор: кількість людей → площа й підбір моделі (логіка — public/app.js)
function calculator(p) {
  const C = pages.text[p.lang].calc;
  const F = pages.text[p.lang].form;
  const types = F.objects.slice(0, -1);
  const start = Math.max(0, types.indexOf(p.object));
  const data = models.list.filter((m) => m.type === 'ground').map((m) => ({ n: `ShelterMe ${m.name}`, id: m.id, a: m.area, l: m.l, w: m.w, m: m.modules }));
  return `<section class="section section--steel config" id="calc" data-models='${JSON.stringify(data)}'>
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${C.title}</h2>
      <p class="section__lead">${C.lead}</p>
    </div>
    <div class="cfg">
      <div class="cfg__controls">
        <div class="cfg__group">
          <p class="cfg__label">${C.people} <output id="calcPeopleOut">10</output></p>
          <input type="range" id="calcRange" min="5" max="15" step="1" value="10" aria-label="${C.people}">
          <div class="cfg__scale"><span>5</span><span>15</span></div>
        </div>
        <div class="cfg__group">
          <p class="cfg__label">${C.exact}</p>
          <div class="stepper" data-min="5" data-max="15">
            <button type="button" data-step="-1" aria-label="−">−</button>
            <input type="number" id="calcPeople" min="5" max="15" value="10" inputmode="numeric" aria-label="${C.people}">
            <button type="button" data-step="1" aria-label="+">+</button>
          </div>
        </div>
        <div class="cfg__group">
          <p class="cfg__label">${F.object}</p>
          <div class="cfg__opts" role="radiogroup" aria-label="${F.object}">
${types.map((o, i) => `            <label><input type="radio" name="calcType" value="${o}"${i === start ? ' checked' : ''}><span>${o}</span></label>`).join('\n')}
          </div>
        </div>
      </div>
      <div class="cfg__preview">
        <div class="cfg__stage">
          <svg id="calcSvg" viewBox="0 0 600 220" role="img" aria-label="${C.scheme}">
            <rect id="calcRoom" x="40" y="40" width="520" height="120" rx="4" class="calc__room"/>
            <text id="calcW" x="24" y="100" text-anchor="end" class="cfg__dimtxt"></text>
            <text id="calcL" x="300" y="190" text-anchor="middle" class="cfg__dimtxt"></text>
          </svg>
          <p class="cfg__hint">${C.scheme}</p>
        </div>
        <dl class="cfg__summary">
          <div><dt>${C.sumMin}</dt><dd id="calcMin">—</dd></div>
          <div><dt>${C.sumComfort}</dt><dd id="calcComfort">—</dd></div>
          <div><dt>${C.sumSize}</dt><dd id="calcSize">—</dd></div>
        </dl>
        <a href="#order" class="btn btn--primary btn--block btn--lg" id="calcSubmit">${C.submit} <span aria-hidden="true">→</span></a>
        <p class="cfg__note">${C.note}</p>
      </div>
    </div>
  </div>
</section>`;
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
        <a href="${p.noCalc ? '#order' : '#calc'}" class="btn btn--primary">${L.getCalc} <span aria-hidden="true">→</span></a>
        <a href="tel:+${PHONE}" class="btn btn--ghost" data-contact="phone">${L.call}: ${PHONE_TXT}</a>
      </div>
${callback(p.lang)}    </div>
    <div class="hero__visual">
      ${heroArt(p.lang)}
    </div>
  </div>
</section>
${p.noCalc ? '' : calculator(p)}
${SHOW_MODELS ? modelsBlock(p) : ''}
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
${p.forWhom ? forWhomBlock(p.forWhom) : ''}
${pros(p)}
<section class="section section--dark">
  <div class="container seo__grid">
    <div class="section__head">
      <h2 class="section__title">${p.textTitle}</h2>
    </div>
    <div class="prose">
${p.text.map((x) => (/^<\/?(h\d|ul|ol|div|table)/.test(x) ? `      ${x}` : `      <p>${x}</p>`)).join('\n')}
    </div>
  </div>
</section>

<section class="section" id="process">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${L.stepsTitle}</h2>
    </div>
    <ol class="steps">
${L.steps.map(([h, d], i) => `      <li><span class="steps__n mono">0${i + 1}</span><h3>${h}</h3><p>${d}</p></li>`).join('\n')}
    </ol>
  </div>
</section>
<section class="section" id="faq">
  <div class="container faq">
    <div class="section__head">
      <h2 class="section__title">${L.faqTitle}</h2>
${faqAside(p.lang)}
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

// Блок «Для кого» (картки об'єктів) — як на українській головній
const FW_ICONS = {
  school: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-5h6v5M12 8.5v2.5"/>',
  kinder: '<path d="M4 21V11l8-6 8 6v10z"/><path d="M12 18s-3-1.7-3-3.5a1.6 1.6 0 0 1 3-.9 1.6 1.6 0 0 1 3 .9c0 1.8-3 3.5-3 3.5z"/>',
  house: '<path d="M3 11l9-7 9 7M5 10v11h14V10M10 21v-6h4v6"/>',
  osbb: '<path d="M6 21V3h12v18M3 21h18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  factory: '<path d="M3 21V11l5 3v-3l5 3v-3l5 3V5h3v16zM7 18h2M11 18h2M15 18h2"/>',
};
function forWhomBlock(fw) {
  const card = (c, i) => c.icon === '+'
    ? `      <article class="card card--accent">
        <div class="card__num mono">+</div>
        <h3>${c.h}</h3>
        <p>${c.t}</p>
        <a href="${c.href}" class="card__link">${c.link}</a>
      </article>`
    : `      <article class="card${i === 0 ? ' card--big' : ''}">
        <div class="card__num card__icon"><svg viewBox="0 0 24 24" aria-hidden="true">${FW_ICONS[c.icon]}</svg></div>
        <h3>${c.h}</h3>
        <p>${c.t}</p>${c.tags ? `\n        <ul class="tags">${c.tags.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
        <a href="${c.href}" class="card__link">${c.link}</a>
      </article>`;
  return `<section class="section" id="for-whom">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${fw.title}</h2>
      <p class="section__lead">${fw.lead}</p>
    </div>
    <div class="cards">
${fw.cards.map(card).join('\n')}
    </div>
  </div>
</section>
`;
}

// Ілюстрація біля «Часті запитання» + швидкий контакт
const FAQ_ASIDE = {
  uk: { t: 'Не знайшли відповіді?', d: 'Напишіть або зателефонуйте — відповімо на будь-яке питання про укриття.', call: 'Подзвонити' },
  ru: { t: 'Не нашли ответа?', d: 'Напишите или позвоните — ответим на любой вопрос об укрытии.', call: 'Позвонить' },
};
function faqAside(lang) {
  const t = FAQ_ASIDE[lang];
  return `      <div class="faq-aside">
        <svg class="faq-aside__art" viewBox="0 0 320 220" aria-hidden="true">
          <rect width="320" height="220" rx="18" class="faq-aside__bg"/>
          <path d="M40 196V120a120 120 0 0 1 240 0v76" class="faq-aside__arch"/>
          <path d="M62 196V122a98 98 0 0 1 196 0v74" class="faq-aside__arch faq-aside__arch--thin"/>
          <line x1="24" y1="196" x2="296" y2="196" class="faq-aside__ground"/>
          <text x="160" y="170" text-anchor="middle" class="faq-aside__q">?</text>
          <text x="78" y="92" class="faq-aside__s">FAQ</text>
        </svg>
        <p class="faq-aside__t">${t.t}</p>
        <p class="faq-aside__d">${t.d}</p>
        <div class="faq-aside__btns">
          <a class="btn btn--primary btn--sm" href="tel:+${PHONE}" data-contact="phone">${t.call}</a>
          ${msgLinks(lang, 'mbtn').split('</a>')[0]}</a>
        </div>
      </div>`;
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
      <div class="form__row">
        <label class="field"><span>${F.name} *</span><input type="text" name="name" autocomplete="name" placeholder="${F.namePh}" required></label>
        <label class="field"><span>${F.phone} *</span><input type="tel" name="phone" autocomplete="tel" placeholder="+38 (0__) ___-__-__" required></label>
      </div>
      <fieldset class="field">
        <legend>${F.object}</legend>
        <div class="chips">
${F.objects.map((o, i) => `          <label><input type="radio" name="object" value="${o}"${o === p.object || (!F.objects.includes(p.object) && i === 0) ? ' checked' : ''}><span>${o}</span></label>`).join('\n')}
        </div>
      </fieldset>
      <div class="form__row">
        <fieldset class="field" data-required="placement">
          <legend>${F.placement} *</legend>
          <div class="chips">
${F.placements.map((o) => `            <label><input type="radio" name="placement" value="${o}" required><span>${o}</span></label>`).join('\n')}
          </div>
        </fieldset>
      </div>
      <div class="field budget">
        <p class="budget__label"><span>${F.budget}</span><output id="budgetOut">${F.budgets[0]} ${F.budgetUnit}</output></p>
        <input type="range" id="budgetRange" min="0" max="${F.budgets.length - 1}" step="1" value="0" aria-label="${F.budget}" data-labels="${F.budgets.join('|')}" data-unit="${F.budgetUnit}">
        <input type="hidden" name="budget" id="budgetValue" value="${F.budgets[0]} ${F.budgetUnit}">
        <div class="budget__scale">${F.budgets.map((b) => `<span>${b}</span>`).join('')}</div>
      </div>
      <div class="form__row">
        <label class="field"><span>${F.people}</span><input type="number" name="capacity" id="formCapacity" min="5" max="15" placeholder="${F.peoplePh}"></label>
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
  ${head(p)}
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

<script src="/app.js" defer></script>
</body>
</html>
`;
}

// ---------------- write ----------------
for (const p of pages.all) {
  const dir = path.join(PUB, p.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(p));
}

// версії CSS/JS для скидання кешу браузера після оновлень
const crypto = require('crypto');
const ver = (f) => crypto.createHash('md5').update(fs.readFileSync(path.join(PUB, f))).digest('hex').slice(0, 8);
const V = { css: ver('styles.css'), js: ver('app.js') };
const htmlFiles = pages.all.map((p) => path.join(PUB, p.path, 'index.html'));
const imgVer = {};
const withVer = (url) => {
  const clean = url.split('?')[0];
  const file = path.join(PUB, clean);
  if (!fs.existsSync(file)) return url;
  if (!imgVer[clean]) imgVer[clean] = crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  return `${clean}?v=${imgVer[clean]}`;
};
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8')
    .replace(/(src|href)="(\/img\/[^"?]+)(\?v=\w+)?"/g, (m, attr, url) => `${attr}="${withVer(url)}"`)
    .replace(/(srcset|imagesrcset)="([^"]+)"/g, (m, attr, list) =>
      `${attr}="${list.replace(/(\/img\/[^\s?,]+)(\?v=\w+)?/g, (u, url) => withVer(url))}"`)
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
