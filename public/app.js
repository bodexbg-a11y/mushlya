(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#year').textContent = new Date().getFullYear();

  // Header on scroll
  const header = $('.header');
  const fab = $('.fab');
  const orderSec = $('#order');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', scrollY > 30);
    const r = orderSec.getBoundingClientRect();
    fab.classList.toggle('is-hidden', scrollY < 500 || (r.top < innerHeight && r.bottom > 0));
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

  // Blueprint ↔ parts list
  const setPart = (n) => {
    $$('#construction [data-part]').forEach((el) => el.classList.toggle('is-active', el.dataset.part === n));
  };
  $$('.parts li, .bp-markers g').forEach((el) => {
    el.addEventListener('mouseenter', () => setPart(el.dataset.part));
    el.addEventListener('click', () => setPart(el.dataset.part));
  });
  setPart('1');

  // Calculator: один модуль — до 12 місць
  const SEATS = 12;
  const range = $('#calcRange');
  const updateCalc = () => {
    const people = +range.value;
    const mods = Math.ceil(people / SEATS);
    $('#calcPeople').textContent = people;
    $('#calcMods').textContent = mods;
    $('#calcSeats').textContent = mods * SEATS;
    range.style.setProperty('--p', ((people - range.min) / (range.max - range.min)) * 100 + '%');
    const tube = $('#calcTube');
    if (tube.childElementCount !== mods) {
      tube.innerHTML = '<i></i>'.repeat(mods);
    }
  };
  range.addEventListener('input', updateCalc);
  updateCalc();

  const formCapacity = $('#formCapacity');
  const formMessage = $('#formMessage');
  $('#calcBtn').addEventListener('click', () => {
    formCapacity.value = range.value;
  });
  $$('[data-model]').forEach((b) => b.addEventListener('click', () => {
    formMessage.value = `Цікавить варіант: ${b.dataset.model}. `;
  }));

  // Phone mask
  const phone = $('input[name="phone"]');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('0')) d = '38' + d;
    if (d && !d.startsWith('38')) d = '38' + d;
    d = d.slice(0, 12);
    const p = d.slice(2);
    let out = '+38';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    phone.value = d ? out : '';
  });

  // Form
  const form = $('#leadForm');
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
    if (!String(fd.get('name')).trim()) { setError(nameInput, "Вкажіть ваше ім'я"); ok = false; } else setError(nameInput);
    if (String(fd.get('phone')).replace(/\D/g, '').length < 12) { setError(phone, 'Вкажіть повний номер телефону'); ok = false; } else setError(phone);
    if (!fd.get('consent')) { status.textContent = 'Потрібна згода на обробку даних'; status.className = 'form__status is-error'; ok = false; }
    if (!ok) return;

    status.textContent = '';
    status.className = 'form__status';
    form.classList.add('is-loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Помилка сервера');
      success.hidden = false;
      form.reset();
    } catch (err) {
      status.textContent = err.message || 'Не вдалося надіслати. Спробуйте ще раз або зателефонуйте.';
      status.className = 'form__status is-error';
    } finally {
      form.classList.remove('is-loading');
    }
  });
  $('#formAgain').addEventListener('click', () => { success.hidden = true; });
  $$('input', form).forEach((i) => i.addEventListener('input', () => setError(i)));
})();
