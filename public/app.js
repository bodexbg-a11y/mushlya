(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const RU = document.documentElement.lang === 'ru';
  const T = RU ? {
    name: 'Укажите ваше имя',
    phone: 'Укажите полный номер телефона', consent: 'Нужно согласие на обработку данных',
    server: 'Ошибка сервера', fail: 'Не удалось отправить. Попробуйте ещё раз или позвоните нам.',
    cbName: 'Обратный звонок', cbOk: 'Спасибо! Перезвоним в течение рабочего дня.',
  } : {
    name: "Вкажіть ваше ім'я",
    phone: 'Вкажіть повний номер телефону', consent: 'Потрібна згода на обробку даних',
    server: 'Помилка сервера', fail: 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте.',
    cbName: 'Зворотний дзвінок', cbOk: 'Дякуємо! Передзвонимо протягом робочого дня.',
  };

  // Конверсії для реклами: спрацює, якщо на сайті підключені GA4 / Google Ads / Meta Pixel
  const trackLead = (form) => {
    try {
      (window.dataLayer = window.dataLayer || []).push({ event: 'generate_lead', form });
      if (window.gtag) {
        window.gtag('event', 'generate_lead', { form });
        // Google Ads: «Отправка формы для потенциальных клиентов»
        window.gtag('event', 'conversion', { send_to: 'AW-18482298767/GyxaCMKoyawdEI__he1E' });
      }
      if (window.fbq) window.fbq('track', 'Lead', { form });
    } catch (e) { /* аналітика не повинна ламати форму */ }
  };
  const sendLead = async (payload) => {
    const res = await fetch('/api/lead/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, page: location.pathname }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || T.server);
  };

  // Маска телефону для всіх полів
  const maskPhone = (input) => input.addEventListener('input', () => {
    let d = input.value.replace(/\D/g, '');
    if (d.startsWith('0')) d = '38' + d;
    if (d && !d.startsWith('38')) d = '38' + d;
    d = d.slice(0, 12);
    const p = d.slice(2);
    let out = '+38';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    input.value = d ? out : '';
  });
  $$('input[type="tel"]').forEach(maskPhone);

  // Кліки по телефону й месенджерах — теж звернення для реклами
  $$('[data-contact]').forEach((a) => a.addEventListener('click', () => {
    try {
      (window.dataLayer = window.dataLayer || []).push({ event: 'contact', method: a.dataset.contact });
      if (window.gtag) window.gtag('event', 'contact', { method: a.dataset.contact });
      if (window.fbq) window.fbq('track', 'Contact', { method: a.dataset.contact });
    } catch (e) { /* ignore */ }
  }));

  // Швидка форма «Передзвоніть мені»
  $$('.callback').forEach((cb) => {
    const input = $('input[type="tel"]', cb);
    const msg = $('.callback__msg', cb);
    cb.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (input.value.replace(/\D/g, '').length < 12) {
        msg.textContent = T.phone; msg.className = 'callback__msg is-error'; input.focus();
        return;
      }
      cb.classList.add('is-loading');
      try {
        await sendLead({ name: T.cbName, phone: input.value, message: T.cbName });
        trackLead('callback');
        cb.classList.add('is-done');
        msg.textContent = T.cbOk; msg.className = 'callback__msg is-ok';
      } catch (err) {
        msg.textContent = err.message || T.fail; msg.className = 'callback__msg is-error';
      } finally {
        cb.classList.remove('is-loading');
      }
    });
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Header on scroll
  const header = $('.header');
  const fab = $('#dock');
  const orderSec = $('#order');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', scrollY > 30);
    if (!fab || !orderSec) return;
    const r = orderSec.getBoundingClientRect();
    fab.classList.toggle('is-hidden', r.top < innerHeight * 0.6 && r.bottom > 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', false);
  }));

  // Reveal + counters
  const countUp = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min((t - t0) / 1400, 1);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el) => io.observe(el));

  const form = $('#leadForm');
  if (!form) return;

  const phone = form.elements.phone;

  // Form
  const status = $('#formStatus');
  const success = $('#formSuccess');

  const setError = (input, msg) => {
    const field = input.closest('.field');
    field.classList.toggle('has-error', !!msg);
    let err = $('.err', field);
    if (msg) {
      if (!err) { err = document.createElement('small'); err.className = 'err'; field.appendChild(err); }
      err.textContent = msg;
    } else if (err) err.remove();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nameInput = form.elements.name;
    let ok = true;
    if (!String(fd.get('name')).trim()) { setError(nameInput, T.name); ok = false; } else setError(nameInput);
    if (String(fd.get('phone')).replace(/\D/g, '').length < 12) { setError(phone, T.phone); ok = false; } else setError(phone);
    if (!fd.get('consent')) { status.textContent = T.consent; status.className = 'form__status is-error'; ok = false; }
    if (!ok) return;

    status.textContent = '';
    status.className = 'form__status';
    form.classList.add('is-loading');
    try {
      await sendLead(Object.fromEntries(fd));
      trackLead('main');
      success.hidden = false;
      form.reset();
    } catch (err) {
      status.textContent = err.message || T.fail;
      status.className = 'form__status is-error';
    } finally {
      form.classList.remove('is-loading');
    }
  });
  $('#formAgain').addEventListener('click', () => { success.hidden = true; });
  $$('input', form).forEach((i) => i.addEventListener('input', () => setError(i)));

  // Згорнутий SEO-текст: увесь текст у HTML (Google його бачить), на екрані — перший абзац і кнопка
  $$('[data-collapse]').forEach((box) => {
    box.classList.add('is-collapsed');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.setAttribute('aria-controls', box.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = box.dataset.more;
    box.after(btn);
    btn.addEventListener('click', () => {
      const open = box.classList.toggle('is-collapsed') === false;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? box.dataset.less : box.dataset.more;
      if (!open) box.scrollIntoView({ block: 'nearest' });
    });
  });
})();
