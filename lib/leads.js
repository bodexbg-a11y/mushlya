// Спільна логіка заявок: перевірка даних і відправка в Telegram та на пошту.
// Використовується і функцією Vercel (api/lead.js), і локальним сервером (server.js).
const nodemailer = require('nodemailer');

const env = (k) => (process.env[k] || '').trim();

function validate(data = {}) {
  const name = String(data.name || '').trim().slice(0, 100);
  const phone = String(data.phone || '').trim().slice(0, 30);
  if (!name || phone.replace(/\D/g, '').length < 10) {
    return { error: "Вкажіть ім'я та коректний телефон" };
  }
  return {
    lead: {
      id: Date.now(),
      date: new Date().toISOString(),
      name,
      phone,
      object: String(data.object || '').slice(0, 50),
      capacity: String(data.capacity || '').slice(0, 20),
      region: String(data.region || '').slice(0, 100),
      message: String(data.message || '').slice(0, 2000),
      config: String(data.config || '').slice(0, 500),
      page: String(data.page || '').slice(0, 100),
    },
  };
}

const rows = (lead) => [
  ["Ім'я", lead.name],
  ['Телефон', lead.phone],
  ["Об'єкт", lead.object],
  ['Кількість осіб', lead.capacity],
  ['Регіон', lead.region],
  ['Конфігурація', lead.config],
  ['Коментар', lead.message],
  ['Сторінка', lead.page],
].filter(([, v]) => v);

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Якщо TELEGRAM_CHAT_ID не задано — беремо чат останнього, хто написав боту
async function telegramChatId(token) {
  const fixed = env('TELEGRAM_CHAT_ID');
  if (fixed) return fixed;
  const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = await r.json();
  if (!data.ok) throw new Error(`Telegram getUpdates: ${data.description || r.status}. Задайте TELEGRAM_CHAT_ID вручну`);
  const last = (data.result || []).reverse().find((u) => u.message && u.message.chat);
  if (!last) throw new Error('бот не бачить ваших повідомлень: напишіть саме цьому боту або задайте TELEGRAM_CHAT_ID (свій id можна дізнатися в @userinfobot)');
  console.log(`Telegram chat id: ${last.message.chat.id} — можна додати в TELEGRAM_CHAT_ID`);
  return String(last.message.chat.id);
}

async function sendTelegram(lead) {
  const token = env('TELEGRAM_BOT_TOKEN');
  if (!token) return false;
  const chatId = await telegramChatId(token);
  const text = '<b>🟡 Нова заявка з сайту</b>\n\n' + rows(lead).map(([k, v]) => `<b>${k}:</b> ${esc(v)}`).join('\n');
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`);
  return true;
}

async function sendEmail(lead) {
  const user = env('GMAIL_USER');
  const pass = env('GMAIL_APP_PASSWORD').replace(/\s/g, '');
  if (!user || !pass) return false;
  const to = env('LEAD_EMAIL') || 'sheltermeua@gmail.com';
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  await transport.sendMail({
    from: `"Сайт — заявки" <${user}>`,
    to,
    subject: `Нова заявка: ${lead.name}, ${lead.phone}`,
    text: rows(lead).map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<h2>Нова заявка з сайту</h2><table cellpadding="6">${rows(lead)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`)
      .join('')}</table>`,
  });
  return true;
}

// Надсилає в усі налаштовані канали. Повертає кількість успішних доставок.
async function deliver(lead) {
  const results = await Promise.allSettled([sendTelegram(lead), sendEmail(lead)]);
  let delivered = 0;
  results.forEach((r, i) => {
    const channel = i === 0 ? 'Telegram' : 'Email';
    if (r.status === 'rejected') console.warn(`${channel}: не вдалося надіслати —`, r.reason.message);
    else if (r.value) delivered += 1;
  });
  return delivered;
}

// Які канали налаштовані (без розкриття самих ключів)
function channels() {
  return {
    telegram: Boolean(env('TELEGRAM_BOT_TOKEN')),
    email: Boolean(env('GMAIL_USER') && env('GMAIL_APP_PASSWORD')),
  };
}

module.exports = { validate, deliver, channels };
