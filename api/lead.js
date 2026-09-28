// Функція Vercel: POST /api/lead — приймає заявку з форми і надсилає в Telegram та на пошту.
// Налаштування — у Vercel: Project → Settings → Environment Variables (див. README).
const { validate, deliver } = require('../lib/leads');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: 'Некоректні дані' });
    }
  }
  const { lead, error } = validate(body);
  if (error) return res.status(422).json({ ok: false, error });

  const delivered = await deliver(lead);
  if (!delivered) {
    console.error('Заявку не доставлено жодним каналом:', lead.name, lead.phone);
    return res.status(502).json({ ok: false, error: 'Не вдалося надіслати заявку. Будь ласка, зателефонуйте нам.' });
  }
  return res.status(200).json({ ok: true });
};
