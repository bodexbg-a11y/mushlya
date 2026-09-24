// Локальний сервер: статичні файли з ./public + прийом заявок у ./leads.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3030;
const PUBLIC = path.join(__dirname, 'public');
const LEADS = path.join(__dirname, 'leads.json');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
}

function handleLead(req, res) {
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 20000) req.destroy();
  });
  req.on('end', () => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return send(res, 400, JSON.stringify({ ok: false, error: 'Некоректні дані' }));
    }
    const name = String(data.name || '').trim().slice(0, 100);
    const phone = String(data.phone || '').trim().slice(0, 30);
    if (!name || phone.replace(/\D/g, '').length < 10) {
      return send(res, 422, JSON.stringify({ ok: false, error: "Вкажіть ім'я та коректний телефон" }));
    }
    const lead = {
      id: Date.now(),
      date: new Date().toISOString(),
      name,
      phone,
      object: String(data.object || '').slice(0, 50),
      capacity: String(data.capacity || '').slice(0, 20),
      region: String(data.region || '').slice(0, 100),
      message: String(data.message || '').slice(0, 2000),
    };
    let leads = [];
    try {
      leads = JSON.parse(fs.readFileSync(LEADS, 'utf8'));
    } catch {}
    leads.push(lead);
    fs.writeFileSync(LEADS, JSON.stringify(leads, null, 2));
    console.log('Нова заявка:', lead.name, lead.phone, lead.object);
    send(res, 200, JSON.stringify({ ok: true }));
  });
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (req.method === 'POST' && url === '/api/lead') return handleLead(req, res);
    if (req.method === 'GET' && url === '/api/leads') {
      return send(res, 200, fs.existsSync(LEADS) ? fs.readFileSync(LEADS) : '[]');
    }
    const file = path.normalize(path.join(PUBLIC, url === '/' ? 'index.html' : url));
    if (!file.startsWith(PUBLIC)) return send(res, 403, 'Forbidden', 'text/plain');
    fs.readFile(file, (err, buf) => {
      if (err) return send(res, 404, 'Не знайдено', 'text/plain; charset=utf-8');
      send(res, 200, buf, TYPES[path.extname(file)] || 'application/octet-stream');
    });
  })
  .listen(PORT, () => console.log(`Сайт працює: http://localhost:${PORT}`));
