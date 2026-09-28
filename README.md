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

## Новий домен

    npm run set-domain -- https://ваш-домен

Оновлює canonical, Open Graph, `robots.txt` і `sitemap.xml`. Потім закомітьте й запуште.
