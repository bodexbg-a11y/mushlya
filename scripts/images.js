// Стискає картинки з public/img у WebP (поруч з оригіналом).
// Запуск: node scripts/images.js  — потім npm run build
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG = path.join(__dirname, '..', 'public', 'img');
const jobs = [
  // [файл, макс. ширина, якість]
  ['models/hero-shelter.png', 820, 80],
  ['models/render-1.jpg', 800, 78],
  ['projects/installed-1.jpg', 1000, 68],
  ['projects/installed-2.jpg', 1200, 74],
  ['projects/installed-3.jpg', 1200, 74],
];

(async () => {
  for (const [rel, w, q] of jobs) {
    const src = path.join(IMG, rel);
    const out = src.replace(/\.(png|jpe?g)$/i, '.webp');
    const info = await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: q, alphaQuality: 90, effort: 6 }).toFile(out);
    const kb = (f) => Math.round(fs.statSync(f).size / 1024);
    console.log(`${rel}: ${kb(src)} KB → ${path.basename(out)} ${kb(out)} KB (${info.width}×${info.height})`);
  }
})();
