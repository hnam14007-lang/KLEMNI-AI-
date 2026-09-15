/* =========================================================
   KLEMNI AI — main.js
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const fmt = (n) => n.toLocaleString('ru-RU');

  /* Images are generated in Higgsfield (Nano Banana Pro) and served from the live host. */
  const IMG_BASE = 'https://klemni-ai.higgsfield.app/img/';
  const img = (name, sm = false) => `${IMG_BASE}${name}${sm ? '@sm' : ''}.webp`;

  /* ---------------- Data ---------------- */
  const FRAGRANCES = [
    { id: 'ambre-solaire', num: '01', name: 'Ambre Solaire', family: 'Амбровый',
      desc: 'Тёплый солнечный аккорд амбры и бергамота, который к вечеру раскрывается в дымный сандал.',
      notes: ['амбра', 'бергамот', 'сандал', 'ваниль'], moods: ['sweet', 'evening', 'unisex'],
      prices: { 30: 6900, 50: 9800, 100: 15900 }, image: 'hero', badge: 'Бестселлер' },
    { id: 'vetiver-noir', num: '02', name: 'Vétiver Noir', family: 'Древесный',
      desc: 'Сухой, дымный ветивер с Гаити, чёрный перец и кожа. Строгий, как хорошо сшитый костюм.',
      notes: ['ветивер', 'чёрный перец', 'кожа', 'кедр'], moods: ['woody', 'evening', 'unisex'],
      prices: { 30: 7200, 50: 10400, 100: 16800 }, image: 'vetiver-noir' },
    { id: 'iris-pale', num: '03', name: 'Iris Pâle', family: 'Пудровый',
      desc: 'Холодный тосканский ирис, фиалка и белый мускус. Аромат чистых простыней и утреннего света.',
      notes: ['ирис', 'фиалка', 'белый мускус', 'рисовая пудра'], moods: ['fresh', 'sweet', 'unisex'],
      prices: { 30: 7800, 50: 11200, 100: 17900 }, image: 'iris-pale', badge: 'Новинка' },
    { id: 'citrus-marin', num: '04', name: 'Citrus Marin', family: 'Цитрусовый',
      desc: 'Сицилийский лимон, морская соль и зелёный чай. Прозрачный, как утро на побережье.',
      notes: ['лимон', 'морская соль', 'зелёный чай', 'нероли'], moods: ['fresh', 'unisex'],
      prices: { 30: 6400, 50: 9200, 100: 14900 }, image: 'citrus-marin' },
    { id: 'nuit-figue', num: '05', name: 'Nuit Figue', family: 'Фруктово-древесный',
      desc: 'Спелая фига, кокосовое молоко и тёмный кедр. Сладость без грамма приторности.',
      notes: ['фига', 'кокос', 'кедр', 'бобы тонка'], moods: ['sweet', 'woody', 'evening'],
      prices: { 30: 7400, 50: 10800, 100: 17200 }, image: 'nuit-figue' },
    { id: 'bois-de-the', num: '06', name: 'Bois de Thé', family: 'Древесно-чайный',
      desc: 'Копчёный чай лапсанг, гваяковое дерево и дым. Для тех, кто любит тишину и осень.',
      notes: ['чай лапсанг', 'гваяк', 'дым', 'бензоин'], moods: ['woody', 'fresh', 'unisex'],
      prices: { 30: 7000, 50: 10200, 100: 16400 }, image: 'bois-de-the' },
  ];
  const VOLUMES = [30, 50, 100];
  const MOOD_LABELS = { fresh: 'свежий', sweet: 'сладкий', woody: 'древесный', evening: 'вечерний', unisex: 'унисекс' };

  /* ---------------- Cards ---------------- */
  function pictureHTML(f, sizes) {
    return `<img src="${img(f.image)}" srcset="${img(f.image, true)} 720w, ${img(f.image)} 1400w" sizes="${sizes}" alt="${f.name} — флакон KLEMNI AI" loading="lazy" decoding="async">`;
  }

  function cardHTML(f) {
    return `
<article class="card reveal" data-id="${f.id}">
  <div class="card__media">
    ${f.badge ? `<span class="card__badge">${f.badge}</span>` : ''}
    <span class="card__num">Nº ${f.num}</span>
    ${pictureHTML(f, '(max-width: 600px) 92vw, (max-width: 1100px) 46vw, 30vw')}
  </div>
  <div class="card__body">
    <div class="card__title-row"><h3 class="card__title">${f.name}</h3><span class="card__family">${f.family}</span></div>
    <p class="card__desc">${f.desc}</p>
    <div class="card__notes">${f.notes.map(n => `<span>${n}</span>`).join('')}</div>
    <div class="card__bottom">
      <div>
        <div class="card__price"><span class="price-flip" data-price>${fmt(f.prices[50])}</span><small>₽</small></div>
        <div class="card__price-note" data-price-note>50 мл · Extrait de Parfum</div>
      </div>
      <div class="volume" role="group" aria-label="Объём">
        <span class="volume__thumb"></span>
        ${VOLUMES.map(v => `<button type="button" data-vol="${v}" class="${v === 50 ? 'is-active' : ''}" aria-pressed="${v === 50}">${v} мл</button>`).join('')}
      </div>
    </div>
    <div class="card__actions">
      <button type="button" class="btn btn--solid btn--full" data-order><span>Заказать</span><i class="btn__arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg></i></button>
    </div>
  </div>
</article>`;
  }

  function setupVolume(volEl, onChange) {
    const thumb = $('.volume__thumb', volEl);
    const btns = $$('button', volEl);
    const move = (btn) => { thumb.style.width = `${btn.offsetWidth}px`; thumb.style.transform = `translateX(${btn.offsetLeft - 3}px)`; };
    const active = btns.find(b => b.classList.contains('is-active')) || btns[0];
    requestAnimationFrame(() => move(active));
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
      move(b); onChange(Number(b.dataset.vol));
    }));
    new ResizeObserver(() => { const a = btns.find(x => x.classList.contains('is-active')); if (a) move(a); }).observe(volEl);
  }

  function bindCard(card) {
    const f = FRAGRANCES.find(x => x.id === card.dataset.id);
    const priceEl = $('[data-price]', card);
    const noteEl = $('[data-price-note]', card);
    let vol = 50;
    setupVolume($('.volume', card), (v) => {
      vol = v;
      priceEl.classList.remove('is-flip'); void priceEl.offsetWidth; priceEl.classList.add('is-flip');
      setTimeout(() => { priceEl.textContent = fmt(f.prices[v]); }, 190);
      noteEl.textContent = `${v} мл · Extrait de Parfum`;
    });
    $('[data-order]', card).addEventListener('click', () => openModal(f, vol));
    if (!isTouch) card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`); card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  function renderCards(container, list) {
    container.innerHTML = list.map(cardHTML).join('');
    $$('.card', container).forEach(bindCard);
    observeReveals(container);
  }

  /* ---------------- Reveal ---------------- */
  let revealIO;
  function observeReveals(root = document) {
    if (!revealIO) revealIO = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal', root).forEach(el => {
      if (el.hasAttribute('data-split') && !el.dataset.splitDone) splitWords(el);
      revealIO.observe(el);
    });
  }
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="word"><span style="--i:${i}">${w}</span></span>`).join(' ');
    el.dataset.splitDone = '1';
  }

  /* ---------------- Preloader ---------------- */
  function preloader() {
    const pre = $('#preloader');
    let finished = false;
    const done = () => {
      if (finished) return; finished = true;
      pre.classList.add('is-done');
      document.body.classList.add('is-loaded');
      setTimeout(() => $('#fog').classList.add('is-on'), 900);
    };
    const heroImg = $('#heroPhoto img');
    const imgReady = heroImg && !heroImg.complete ? new Promise(r => { heroImg.onload = r; heroImg.onerror = r; }) : Promise.resolve();
    const minTime = new Promise(r => setTimeout(r, reduceMotion ? 0 : 1900));
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([minTime, fonts, imgReady]).then(done);
    setTimeout(done, 5000);
  }

  /* ---------------- Header ---------------- */
  function header() {
    const h = $('#header'), burger = $('#burger'), nav = $('#nav');
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      h.classList.toggle('is-scrolled', y > 30);
      if (y > 400 && y > lastY + 6 && !nav.classList.contains('is-open')) h.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 120) h.classList.remove('is-hidden');
      lastY = y;
    }, { passive: true });
    const toggle = (open) => {
      const isOpen = open ?? !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', isOpen); burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('is-locked', isOpen);
    };
    burger.addEventListener('click', () => toggle());
    $$('a', nav).forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ---------------- Scroll choreography ---------------- */
  function scrollFX() {
    const photo = $('#heroPhoto'), visual = $('#heroVisual'), hero = $('#hero');
    const parallaxEls = $$('[data-parallax]'), imgEls = $$('[data-parallax-img]');
    let ticking = false, mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    if (!isTouch && !reduceMotion) window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX / window.innerWidth - .5; mouseY = e.clientY / window.innerHeight - .5;
    }, { passive: true });

    const update = () => {
      ticking = false;
      const y = window.scrollY, vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, y / (hero.offsetHeight * 0.9)));

      if (!reduceMotion) {
        curX += (mouseX - curX) * .06; curY += (mouseY - curY) * .06;
        const rz = -2 + p * 16, ry = curX * 10 + p * 18, rx = -curY * 6 - p * 4;
        photo.style.transform = `translate3d(${p * -80}px, ${p * vh * .45}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${1 - p * .12})`;
        visual.style.opacity = String(1 - Math.max(0, p - .6) / .4);
        parallaxEls.forEach(el => {
          const k = parseFloat(el.dataset.parallax);
          if (hero.contains(el)) el.style.transform = `translate3d(${el.classList.contains('hero__wordmark') ? '-50%' : '0'}, ${y * k}px, 0)`;
          else {
            const r = el.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return;
            el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - vh / 2) * k * 2}px, 0)`;
          }
        });
      }
      imgEls.forEach(el => {
        const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallaxImg);
        const target = $('img', el);
        if (target) target.style.setProperty('--py', `${off}px`);
      });
      spray.onScroll(y, p);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    if (!isTouch && !reduceMotion) { const loop = () => { if (window.scrollY < window.innerHeight * 1.2) update(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    update();
  }

  /* ---------------- Spray particles ---------------- */
  const spray = (() => {
    const canvas = $('#spray'), ctx = canvas.getContext('2d'), photo = $('#heroPhoto');
    let W = 0, H = 0, particles = [], lastY = 0, lastBurst = 0, running = false;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1); const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize); setTimeout(resize, 120);
    // nozzle ≈ top of the cap: 50% across, 17% down the photo
    const nozzle = () => { const pr = photo.getBoundingClientRect(), cr = canvas.getBoundingClientRect(); return { x: pr.left + pr.width * .5 - cr.left, y: pr.top + pr.height * .17 - cr.top }; };
    const burst = (count, power = 1) => {
      const { x, y } = nozzle();
      const m = photo.style.transform.match(/rotateZ\(([-\d.]+)deg\)/); const rz = m ? parseFloat(m[1]) : 0;
      const base = (-35 + rz) * Math.PI / 180;
      for (let i = 0; i < count; i++) {
        const a = base + (Math.random() - .5) * .75, sp = (2 + Math.random() * 5) * power;
        particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: .6 + Math.random() * 2.2, life: 1, decay: .008 + Math.random() * .014, hue: 38 + Math.random() * 10 });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    };
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vx *= .975; p.vy = p.vy * .975 - .012; p.vx += (Math.random() - .5) * .12; p.life -= p.decay; p.r += .05;
        const a = Math.max(0, p.life) * .5; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, `hsla(${p.hue},60%,88%,${a})`); g.addColorStop(1, `hsla(${p.hue},60%,88%,0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
      }
      if (particles.length) requestAnimationFrame(tick); else running = false;
    };
    if (!reduceMotion) {
      setInterval(() => { if (window.scrollY < window.innerHeight * .6 && document.body.classList.contains('is-loaded')) burst(14, .8); }, 3400);
      setTimeout(() => burst(44, 1.2), 2600);
    }
    return { onScroll(y, p) {
      if (reduceMotion || p >= 1) return;
      const dy = Math.abs(y - lastY); lastY = y; const now = performance.now();
      if (dy > 4 && now - lastBurst > 70) { lastBurst = now; burst(Math.min(30, 6 + dy * .4), 1 + Math.min(1, dy / 80)); }
    } };
  })();

  /* ---------------- Fog ---------------- */
  function fog() {
    const canvas = $('#fog'); if (reduceMotion || window.innerWidth < 600) return;
    const ctx = canvas.getContext('2d'); let W, H, t = 0, lastScroll = window.scrollY, drift = 0; const clouds = [];
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 9; i++) clouds.push({ x: Math.random() * W, y: Math.random() * H, r: 220 + Math.random() * 340, vx: (.15 + Math.random() * .3) * (Math.random() > .5 ? 1 : -1), vy: (Math.random() - .5) * .12, a: .03 + Math.random() * .045, hue: Math.random() > .5 ? '205,188,152' : '170,165,210' });
    const draw = () => {
      t += .005; const sy = window.scrollY; drift += ((sy - lastScroll) * .9 - drift) * .1; lastScroll = sy;
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'screen';
      for (const c of clouds) {
        c.x += c.vx + drift * .02 * (c.vx > 0 ? 1 : -1); c.y += c.vy + Math.sin(t + c.r) * .15;
        if (c.x < -c.r) c.x = W + c.r; if (c.x > W + c.r) c.x = -c.r; if (c.y < -c.r) c.y = H + c.r; if (c.y > H + c.r) c.y = -c.r;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r); const a = c.a * (.8 + Math.abs(Math.sin(t * 1.7 + c.r)) * .4);
        g.addColorStop(0, `rgba(${c.hue},${a})`); g.addColorStop(1, `rgba(${c.hue},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------------- Cursor & magnetic ---------------- */
  function cursor() {
    if (isTouch || reduceMotion) return;
    const glow = document.createElement('div'); glow.className = 'cursor-glow'; document.body.appendChild(glow);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; glow.classList.add('is-on'); }, { passive: true });
    const loop = () => { cx += (x - cx) * .1; cy += (y - cy) * .1; glow.style.transform = `translate(${cx - 230}px, ${cy - 230}px)`; requestAnimationFrame(loop); }; loop();
    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('pointermove', (e) => { const r = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * .18}px, ${(e.clientY - (r.top + r.height / 2)) * .28}px)`; });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------------- Finder ---------------- */
  function finder() {
    const chips = $$('.chip[data-mood]'), reset = $('#chipReset'), result = $('#finderResult'), active = new Set();
    const render = () => {
      reset.hidden = active.size === 0;
      if (!active.size) { result.innerHTML = `<p class="finder__hint reveal is-in">Выберите настроение — подходящие ароматы появятся здесь.</p>`; return; }
      const list = FRAGRANCES.filter(f => [...active].every(m => f.moods.includes(m)));
      const labels = [...active].map(m => MOOD_LABELS[m]).join(' + ');
      if (!list.length) { result.innerHTML = `<p class="finder__hint reveal is-in">Такое сочетание пока в работе. Уберите один из фильтров или <a href="#cta" style="color:var(--gold)">напишите парфюмеру</a>.</p>`; return; }
      result.innerHTML = `<p class="finder__count">Найдено <strong>${list.length}</strong> · ${labels}</p><div class="finder__grid"></div>`;
      const grid = $('.finder__grid', result); grid.innerHTML = list.map(cardHTML).join('');
      $$('.card', grid).forEach(c => { c.classList.remove('reveal'); bindCard(c); });
    };
    chips.forEach(ch => ch.addEventListener('click', () => {
      const m = ch.dataset.mood;
      if (active.has(m)) { active.delete(m); ch.classList.remove('is-active'); } else { active.add(m); ch.classList.add('is-active'); }
      ch.setAttribute('aria-pressed', String(active.has(m))); render();
    }));
    reset.addEventListener('click', () => { active.clear(); chips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); }); render(); });
  }

  /* ---------------- Reviews ---------------- */
  function reviews() {
    const track = $('#reviewsTrack'); const step = () => ($('.review', track)?.offsetWidth || 360) + 24;
    $('#revPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('#revNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* ---------------- Modal ---------------- */
  const modal = $('#orderModal'); const state = { f: null, vol: 50, consult: false }; let lastFocus = null;
  function openModal(f, vol = 50, consult = false) {
    lastFocus = document.activeElement; state.f = f; state.vol = vol; state.consult = consult;
    $('#modalBody').hidden = false; $('#modalSuccess').hidden = true; $('#formError').hidden = true; $('#orderForm').reset();
    $$('.field input', modal).forEach(i => i.classList.remove('is-invalid'));
    $('#modalProduct').classList.toggle('is-consult', consult);
    $('#submitBtn > span').textContent = consult ? 'Отправить' : 'Заказать';
    if (consult) {
      $('#modalEyebrow').textContent = 'Консультация'; $('#modalTitle').textContent = 'Подобрать аромат вместе';
      $('#modalNotes').textContent = 'Оставьте контакт: парфюмер студии перезвонит, задаст несколько вопросов и предложит 2–3 аромата под вас. Пробники отправим бесплатно.';
    } else {
      $('#modalPhoto').innerHTML = `<img src="${img(f.image, true)}" alt="${f.name}">`;
      $('#modalEyebrow').textContent = `Nº ${f.num} · ${f.family}`; $('#modalTitle').textContent = f.name; $('#modalNotes').textContent = f.notes.join(' · ');
      const volEl = $('#modalVolume');
      volEl.innerHTML = `<span class="volume__thumb"></span>` + VOLUMES.map(v => `<button type="button" data-vol="${v}" class="${v === vol ? 'is-active' : ''}" aria-pressed="${v === vol}">${v} мл</button>`).join('');
      setupVolume(volEl, (v) => { state.vol = v; updatePrice(); }); updatePrice();
    }
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('is-locked');
    setTimeout(() => $('#fName').focus({ preventScroll: true }), 350);
  }
  function updatePrice() { const el = $('#modalPrice'); el.innerHTML = `${fmt(state.f.prices[state.vol])} <small>₽</small>`; el.classList.remove('is-flip'); void el.offsetWidth; el.classList.add('is-flip'); }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('is-locked'); lastFocus?.focus?.({ preventScroll: true }); }
  function modalInit() {
    $$('[data-close]', modal).forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
    $('#ctaConsult').addEventListener('click', () => openModal(null, 50, true));
    const phone = $('#fPhone');
    phone.addEventListener('input', () => {
      let d = phone.value.replace(/\D/g, ''); if (!d) { phone.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1); if (d[0] !== '7') d = '7' + d; d = d.slice(0, 11);
      let out = '+7'; if (d.length > 1) out += ' (' + d.slice(1, 4); if (d.length >= 4) out += ') ' + d.slice(4, 7);
      if (d.length >= 7) out += '-' + d.slice(7, 9); if (d.length >= 9) out += '-' + d.slice(9, 11); phone.value = out;
    });
    $('#orderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#fName'), err = $('#formError'), digits = phone.value.replace(/\D/g, '');
      let ok = true;
      name.classList.toggle('is-invalid', name.value.trim().length < 2); phone.classList.toggle('is-invalid', digits.length < 11);
      if (name.value.trim().length < 2) { ok = false; err.textContent = 'Введите имя — хотя бы два символа.'; }
      else if (digits.length < 11) { ok = false; err.textContent = 'Проверьте номер телефона.'; }
      err.hidden = ok; if (!ok) return;
      const btn = $('#submitBtn'); btn.classList.add('is-loading');
      const payload = { name: name.value.trim(), phone: phone.value, fragrance: state.consult ? null : state.f.name, volume: state.consult ? null : state.vol, price: state.consult ? null : state.f.prices[state.vol], ts: new Date().toISOString() };
      // Точка подключения бэкенда: fetch('/api/order', { method: 'POST', body: JSON.stringify(payload) })
      try { const q = JSON.parse(localStorage.getItem('klemni_orders') || '[]'); q.push(payload); localStorage.setItem('klemni_orders', JSON.stringify(q)); } catch (_) {}
      setTimeout(() => {
        btn.classList.remove('is-loading'); $('#modalBody').hidden = true; $('#successName').textContent = payload.name;
        $('#successText').textContent = state.consult ? 'Парфюмер студии перезвонит вам в течение 15 минут в рабочее время и поможет с выбором.' : `Заказ на ${payload.fragrance}, ${payload.volume} мл принят. Перезвоним в течение 15 минут, чтобы уточнить доставку.`;
        const s = $('#modalSuccess'); s.hidden = false;
        $$('.success__circle, .success__check', s).forEach(p => { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
      }, 900);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    preloader(); header(); renderCards($('#catalogGrid'), FRAGRANCES); observeReveals(); scrollFX(); fog(); cursor(); finder(); reviews(); modalInit();
  });
})();
