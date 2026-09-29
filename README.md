# Сайт модульних укриттів

## Локально

    npm install
    npm start

Сайт: http://localhost:3030 · заявки зберігаються у `leads.json`.

## Vercel — заявки в Telegram і на пошту

Форма відправляє заявку на `/api/lead` (файл `api/lead.js`).
Налаштування: **Vercel → Project → Settings → Environment Variables**:

| Змінна | Значення |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота від @BotFather |
| `TELEGRAM_CHAT_ID` | необовʼязково — якщо не задано, бот пише тому, хто останнім написав йому |
| `GMAIL_USER` | `sheltermeua@gmail.com` |
| `GMAIL_APP_PASSWORD` | пароль додатка Google (16 символів) |
| `LEAD_EMAIL` | необовʼязково — куди слати заявки (за замовчуванням `sheltermeua@gmail.com`) |

Після додавання змінних зробіть **Redeploy**.
Якщо жоден канал не налаштований — форма покаже клієнту помилку, а не «прийнято».

## Сторінки та SEO

Сайт: https://www.shelterme.com.ua (адреса й бренд — у `site.config.json`).

- `public/index.html` — головна (UA), верстається вручну; SEO-теги, шапка й підвал оновлюються збіркою між маркерами `<!-- ... :START/END -->`.
- `scripts/pages.js` — тексти посадкових сторінок (UA/RU), заголовки, описи, FAQ.
- `npm run build` — генерує сторінки, `sitemap.xml`, `robots.txt`, розмітку Schema.org і версії CSS/JS.

Після будь-яких змін у текстах, стилях чи скриптах: `npm run build`, потім commit і push.

## Ліцензії

Карта України: [@svg-maps/ukraine](https://github.com/VictorCazanave/svg-maps/tree/master/packages/ukraine), автор Olesia Ladanai, CC BY 4.0 (контури спрощено, назви областей українською).
