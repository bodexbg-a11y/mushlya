// Локальний сервер для розробки: статичні файли з ./public + заявки.
// На Vercel цей файл не використовується — там працює api/lead.js.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { validate, deliver } = require('./lib/leads');

const PORT = process.env.PORT || 3030;
// Ключ для перегляду заявок: /api/leads?key=... Без ключа список заявок недоступний
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const PUBLIC = path.join(__dirname, 'public');
const LEADS = path.join(__dirname, 'leads.json');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.txt', '.xml', '.svg']);

function send(req, res, code, body, ext = '.json', headers = {}) {
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = zlib.gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(code, { 'Content-Type': TYPES[ext] || 'application/octet-stream', ...headers });
  res.end(body);
}

function handleLead(req, res) {
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 20000) req.destroy();
  });
  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return send(req, res, 400, JSON.stringify({ ok: false, error: 'Некоректні дані' }));
    }
    const { lead, error } = validate(data);
    if (error) return send(req, res, 422, JSON.stringify({ ok: false, error }));

    let leads = [];
    try {
      leads = JSON.parse(fs.readFileSync(LEADS, 'utf8'));
    } catch {}
    leads.push(lead);
    fs.writeFileSync(LEADS, JSON.stringify(leads, null, 2));
    console.log('Нова заявка:', lead.name, lead.phone, lead.object);
    await deliver(lead);
    send(req, res, 200, JSON.stringify({ ok: true }));
  });
}

http
  .createServer((req, res) => {
    const [rawPath, query = ''] = req.url.split('?');
    const url = decodeURIComponent(rawPath);
    if (req.method === 'POST' && url === '/api/lead') return handleLead(req, res);
    if (req.method === 'GET' && url === '/api/leads') {
      const key = new URLSearchParams(query).get('key');
      if (!ADMIN_KEY || key !== ADMIN_KEY) return send(req, res, 404, 'Не знайдено', '.txt');
      return send(req, res, 200, fs.existsSync(LEADS) ? fs.readFileSync(LEADS) : '[]');
    }
    const file = path.normalize(path.join(PUBLIC, url === '/' ? 'index.html' : url));
    if (!file.startsWith(PUBLIC)) return send(req, res, 403, 'Forbidden', '.txt');
    fs.readFile(file, (err, buf) => {
      if (err) return send(req, res, 404, 'Не знайдено', '.txt');
      const ext = path.extname(file);
      const cache = ext === '.html' ? 'no-cache' : ext === '.css' || ext === '.js' ? 'public, max-age=3600' : 'public, max-age=604800';
      send(req, res, 200, buf, ext, { 'Cache-Control': cache });
    });
  })
  .listen(PORT, () => console.log(`Сайт працює: http://localhost:${PORT}`));
