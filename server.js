// Локальний сервер: статичні файли з ./public + прийом заявок у ./leads.json
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3030;
// Адреса сайту для canonical, Open Graph і sitemap. На хостингу задайте SITE_URL=https://ваш-домен
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');
// Ключ для перегляду заявок: /api/leads?key=... Без ключа список заявок недоступний
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const PUBLIC = path.join(__dirname, 'public');
const LEADS = path.join(__dirname, 'leads.json');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.txt', '.xml', '.svg']);

function origin(req) {
  if (SITE_URL) return SITE_URL;
  const proto = (req.headers['x-forwarded-proto'] || 'http').split(',')[0];
  return `${proto}://${req.headers.host}`;
}

function send(req, res, code, body, type = 'application/json; charset=utf-8', headers = {}) {
  const ext = Object.keys(TYPES).find((k) => TYPES[k] === type);
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = zlib.gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(code, { 'Content-Type': type, ...headers });
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
      return send(req, res, 400, JSON.stringify({ ok: false, error: 'Некоректні дані' }));
    }
    const name = String(data.name || '').trim().slice(0, 100);
    const phone = String(data.phone || '').trim().slice(0, 30);
    if (!name || phone.replace(/\D/g, '').length < 10) {
      return send(req, res, 422, JSON.stringify({ ok: false, error: "Вкажіть ім'я та коректний телефон" }));
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
      config: String(data.config || '').slice(0, 500),
    };
    let leads = [];
    try {
      leads = JSON.parse(fs.readFileSync(LEADS, 'utf8'));
    } catch {}
    leads.push(lead);
    fs.writeFileSync(LEADS, JSON.stringify(leads, null, 2));
    console.log('Нова заявка:', lead.name, lead.phone, lead.object);
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
      if (!ADMIN_KEY || key !== ADMIN_KEY) return send(req, res, 404, 'Не знайдено', TYPES['.txt']);
      return send(req, res, 200, fs.existsSync(LEADS) ? fs.readFileSync(LEADS) : '[]');
    }
    if (url === '/robots.txt') {
      return send(req, res, 200, `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin(req)}/sitemap.xml\n`, TYPES['.txt']);
    }
    if (url === '/sitemap.xml') {
      const lastmod = fs.statSync(path.join(PUBLIC, 'index.html')).mtime.toISOString().slice(0, 10);
      return send(req, res, 200,
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${origin(req)}/</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
        TYPES['.xml']);
    }
    const file = path.normalize(path.join(PUBLIC, url === '/' ? 'index.html' : url));
    if (!file.startsWith(PUBLIC)) return send(req, res, 403, 'Forbidden', TYPES['.txt']);
    fs.readFile(file, (err, buf) => {
      if (err) return send(req, res, 404, 'Не знайдено', TYPES['.txt']);
      const ext = path.extname(file);
      const headers = {};
      if (ext === '.html') {
        buf = buf.toString('utf8').replaceAll('%ORIGIN%', origin(req));
        headers['Cache-Control'] = 'no-cache';
      } else {
        headers['Cache-Control'] = ext === '.css' || ext === '.js' ? 'public, max-age=3600' : 'public, max-age=604800';
      }
      send(req, res, 200, buf, TYPES[ext] || 'application/octet-stream', headers);
    });
  })
  .listen(PORT, () => console.log(`Сайт працює: http://localhost:${PORT}`));
