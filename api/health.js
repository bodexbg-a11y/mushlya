// GET /api/health — показує, чи налаштовані канали заявок (лише так/ні, без ключів)
const { channels } = require('../lib/leads');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, channels: channels() });
};
