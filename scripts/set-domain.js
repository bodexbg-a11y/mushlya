// Змінює адресу сайту в SEO-тегах, robots.txt і sitemap.xml.
// Використання: npm run set-domain -- https://shelterme.com.ua
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const configFile = path.join(root, 'site.config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const next = (process.argv[2] || '').trim().replace(/\/$/, '');
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(next)) {
  console.error('Вкажіть адресу у форматі https://домен, наприклад: npm run set-domain -- https://shelterme.com.ua');
  process.exit(1);
}

const prev = config.url;
const today = new Date().toISOString().slice(0, 10);

const index = path.join(root, 'public', 'index.html');
let html = fs.readFileSync(index, 'utf8');
html = html.split(prev).join(next).split('%ORIGIN%').join(next);
fs.writeFileSync(index, html);

fs.writeFileSync(
  path.join(root, 'public', 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${next}/sitemap.xml\n`
);
fs.writeFileSync(
  path.join(root, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${next}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`
);

config.url = next;
fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
console.log(`Адресу сайту змінено: ${prev} → ${next}`);
