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

  // Configurator
  const SCALE = 36; // px на 1 м — однаковий для довжини, діаметра та людини
  const GROUND = 176;
  const cfg = { diam: 2.5, len: 8, mods: 1, people: 12, opts: [] };
  const fmt = (n) => String(n).replace('.', ',');
  const lenInput = $('#cfgLen');

  const drawTube = () => {
    const w = cfg.len * SCALE;
    const h = cfg.diam * SCALE;
    const x = 120;
    const y = GROUND - h;
    const r = h / 2;
    const g = $('#cfgTube');
    const extra = cfg.mods > 1
      ? `<text x="${x + w + 14}" y="${y + r + 6}" class="cfg__times">× ${cfg.mods}</text>`
      : '';
    g.innerHTML = `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(10, r)}" fill="url(#ribs)" stroke="#555b64"/>
      <path d="M${x} ${y + 3} H${x + w}" stroke="#ffb000" stroke-opacity=".5" stroke-width="2"/>
      <ellipse cx="${x}" cy="${y + r}" rx="${r * 0.28}" ry="${r}" fill="#2c3036" stroke="#6b717a"/>
      <rect x="${x - r * 0.1}" y="${y + r * 0.35}" width="${r * 0.2}" height="${r * 1.3}" rx="2" fill="#16181b" stroke="#ffb000" stroke-width="1.2"/>
      <line x1="${x}" y1="${y + h + 12}" x2="${x + w}" y2="${y + h + 12}" class="cfg__dim"/>
      <text x="${x + w / 2}" y="${y + h + 22}" text-anchor="middle" class="cfg__dimtxt">${fmt(cfg.len)} м</text>
      <line x1="${x - r * 0.28 - 14}" y1="${y}" x2="${x - r * 0.28 - 14}" y2="${y + h}" class="cfg__dim"/>
      <text x="${x - r * 0.28 - 18}" y="${y + r + 4}" text-anchor="end" class="cfg__dimtxt">Ø ${fmt(cfg.diam)} м</text>
      ${extra}`;
    // людина 1,75 м всередині модуля
    const ph = 1.75 * SCALE;
    const px = x + Math.min(w * 0.55, w - 20);
    const top = GROUND - ph;
    const person = $('#cfgPerson');
    $('circle', person).setAttribute('cx', px);
    $('circle', person).setAttribute('cy', top + 4.5);
    $('path', person).setAttribute('d',
      `M${px} ${top + 9} V${top + ph * 0.58} M${px} ${top + ph * 0.58} L${px - 6} ${GROUND} M${px} ${top + ph * 0.58} L${px + 6} ${GROUND} M${px - 8} ${top + ph * 0.3} L${px} ${top + 13} L${px + 8} ${top + ph * 0.3}`);
    const svg = $('#cfgSvg');
    const need = x + w + (cfg.mods > 1 ? 70 : 20);
    svg.setAttribute('viewBox', `0 0 ${Math.max(600, need)} 200`);
  };

  const summary = (syncInputs = true) => {
    const opts = cfg.opts.length ? cfg.opts.join(', ') : '—';
    $('#cfgLenOut').textContent = `${fmt(cfg.len)} м`;
    $('#cfgMods').textContent = cfg.mods;
    if (syncInputs) $('#cfgPeople').value = cfg.people;
    $('#cfgSumSize').textContent = `Ø ${fmt(cfg.diam)} × ${fmt(cfg.len)} м`;
    $('#cfgSumMods').textContent = cfg.mods;
    $('#cfgSumPeople').textContent = cfg.people;
    $('#cfgSumOpts').textContent = opts;
    lenInput.style.setProperty('--p', ((cfg.len - lenInput.min) / (lenInput.max - lenInput.min)) * 100 + '%');
    drawTube();
    return `Ø ${fmt(cfg.diam)} м × ${fmt(cfg.len)} м, модулів: ${cfg.mods}, людей: ${cfg.people}, додатково: ${opts}`;
  };

  $$('input[name="cfgDiam"]').forEach((r) => r.addEventListener('change', () => { cfg.diam = +r.value; summary(); }));
  lenInput.addEventListener('input', () => { cfg.len = +lenInput.value; summary(); });
  $$('.stepper').forEach((st) => {
    const field = $('output, input', st);
    const key = field.id === 'cfgMods' ? 'mods' : 'people';
    const min = +st.dataset.min;
    const max = +st.dataset.max;
    const clamp = (v) => Math.min(max, Math.max(min, Math.round(v) || min));
    $$('button', st).forEach((b) => b.addEventListener('click', () => {
      cfg[key] = clamp(cfg[key] + +b.dataset.step);
      summary();
    }));
    if (field.tagName === 'INPUT') {
      field.addEventListener('input', () => { if (field.value !== '') { cfg[key] = clamp(+field.value); summary(false); } });
      field.addEventListener('blur', () => { cfg[key] = clamp(+field.value); summary(); });
    }
  });
  $$('.cfg__opts input').forEach((c) => c.addEventListener('change', () => {
    cfg.opts = $$('.cfg__opts input:checked').map((i) => i.value);
    summary();
  }));
  summary();

  const formCapacity = $('#formCapacity');
  $('#cfgSubmit').addEventListener('click', () => {
    const text = summary();
    $('#formConfigText').textContent = text;
    $('#formConfigInput').value = text;
    $('#formConfig').hidden = false;
    formCapacity.value = cfg.people;
  });

  // Gallery lightbox
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const closeLb = () => { lb.hidden = true; lbImg.src = ''; };
  $$('.gallery__item').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    lbImg.src = a.getAttribute('href');
    lbImg.alt = $('img', a).alt;
    lb.hidden = false;
  }));
  lb.addEventListener('click', (e) => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

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
      $('#formConfig').hidden = true;
      $('#formConfigInput').value = '';
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
