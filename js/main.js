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

  /* ---------------- Data ---------------- */
  const FRAGRANCES = [
    {
      id: 'ambre-solaire', num: '01', name: 'Ambre Solaire', family: 'Амбровый',
      desc: 'Тёплый солнечный аккорд амбры и бергамота, который к вечеру раскрывается в дымный сандал.',
      notes: ['амбра', 'бергамот', 'сандал', 'ваниль'],
      moods: ['sweet', 'evening', 'unisex'],
      prices: { 30: 6900, 50: 9800, 100: 15900 },
      colors: { top: '#f2c98c', mid: '#c98d4e', bottom: '#5a3216', glow: 'rgba(212,150,80,.45)' },
      badge: 'Бестселлер',
    },
    {
      id: 'vetiver-noir', num: '02', name: 'Vétiver Noir', family: 'Древесный',
      desc: 'Сухой, дымный ветивер с Гаити, чёрный перец и кожа. Строгий, как хорошо сшитый костюм.',
      notes: ['ветивер', 'чёрный перец', 'кожа', 'кедр'],
      moods: ['woody', 'evening', 'unisex'],
      prices: { 30: 7200, 50: 10400, 100: 16800 },
      colors: { top: '#b7c7a8', mid: '#5f7a5c', bottom: '#15211a', glow: 'rgba(110,150,110,.4)' },
    },
    {
      id: 'iris-pale', num: '03', name: 'Iris Pâle', family: 'Пудровый',
      desc: 'Холодный флорентийский ирис, фиалка и белый мускус. Аромат чистых простыней и утреннего света.',
      notes: ['ирис', 'фиалка', 'белый мускус', 'рисовая пудра'],
      moods: ['fresh', 'sweet', 'unisex'],
      prices: { 30: 7800, 50: 11200, 100: 17900 },
      colors: { top: '#efe6fb', mid: '#a996cf', bottom: '#3d3358', glow: 'rgba(160,140,220,.45)' },
      badge: 'Новинка',
    },
    {
      id: 'citrus-marin', num: '04', name: 'Citrus Marin', family: 'Цитрусовый',
      desc: 'Сицилийский лимон, морская соль и зелёный чай. Бодрящий, прозрачный, как утро на побережье.',
      notes: ['лимон', 'морская соль', 'зелёный чай', 'нероли'],
      moods: ['fresh', 'unisex'],
      prices: { 30: 6400, 50: 9200, 100: 14900 },
      colors: { top: '#e9f8f3', mid: '#8fd3c7', bottom: '#1f4f4a', glow: 'rgba(120,200,190,.4)' },
    },
    {
      id: 'nuit-figue', num: '05', name: 'Nuit Figue', family: 'Фруктово-древесный',
      desc: 'Спелая фига, кокосовое молоко и тёмный кедр. Сладость, в которой нет ни грамма приторности.',
      notes: ['фига', 'кокос', 'кедр', 'бобы тонка'],
      moods: ['sweet', 'woody', 'evening'],
      prices: { 30: 7400, 50: 10800, 100: 17200 },
      colors: { top: '#d7a9c8', mid: '#7d4f8a', bottom: '#241533', glow: 'rgba(150,100,180,.45)' },
    },
    {
      id: 'bois-de-the', num: '06', name: 'Bois de Thé', family: 'Древесно-чайный',
      desc: 'Копчёный чай лапсанг, гваяковое дерево и дым. Аромат для тех, кто любит тишину и осень.',
      notes: ['чай лапсанг', 'гваяк', 'дым', 'бензоин'],
      moods: ['woody', 'fresh', 'unisex'],
      prices: { 30: 7000, 50: 10200, 100: 16400 },
      colors: { top: '#e9d5b8', mid: '#a0704a', bottom: '#3a2416', glow: 'rgba(190,140,90,.4)' },
    },
  ];

  const VOLUMES = [30, 50, 100];
  const MOOD_LABELS = { fresh: 'свежий', sweet: 'сладкий', woody: 'древесный', evening: 'вечерний', unisex: 'унисекс' };

  /* ---------------- Bottle SVG factory ---------------- */
  let uid = 0;
  function bottleSVG(f, opts = {}) {
    const id = `b${++uid}`;
    const { top, mid, bottom } = f.colors;
    return `
<svg viewBox="0 0 320 560" class="bottle-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-liq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/>
    </linearGradient>
    <linearGradient id="${id}-side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".3" stop-color="#000" stop-opacity="0"/>
      <stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/>
    </linearGradient>
    <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".18" stop-color="#fff" stop-opacity=".06"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".02"/><stop offset=".85" stop-color="#fff" stop-opacity=".08"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".3"/>
    </linearGradient>
    <linearGradient id="${id}-cap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6b5330"/><stop offset=".25" stop-color="#e8cd93"/><stop offset=".5" stop-color="#b08d55"/>
      <stop offset=".75" stop-color="#f3e0b4"/><stop offset="1" stop-color="#5f4826"/>
    </linearGradient>
    <linearGradient id="${id}-shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".7"/>
      <stop offset=".7" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="${id}-clip"><rect x="48" y="150" width="224" height="380" rx="26"/></clipPath>
  </defs>
  <g clip-path="url(#${id}-clip)">
    <rect x="48" y="150" width="224" height="380" fill="#0a0709"/>
    <rect x="48" y="${opts.level || 215}" width="224" height="330" fill="url(#${id}-liq)"/>
    <rect x="48" y="150" width="224" height="380" fill="url(#${id}-side)"/>
    <ellipse cx="160" cy="${opts.level || 215}" rx="112" ry="8" fill="${top}" opacity=".6"/>
  </g>
  <rect x="48" y="150" width="224" height="380" rx="26" fill="url(#${id}-glass)" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>
  <rect x="48" y="490" width="224" height="40" fill="#fff" opacity=".07"/>
  <rect x="66" y="176" width="10" height="320" rx="5" fill="url(#${id}-shine)" opacity=".8"/>
  <rect x="244" y="190" width="6" height="280" rx="3" fill="url(#${id}-shine)" opacity=".35"/>
  <g opacity=".9">
    <text x="160" y="332" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="30" letter-spacing="7" fill="#f3e9d6">KLEMNI</text>
    <text x="160" y="354" text-anchor="middle" font-family="Manrope, sans-serif" font-size="9" letter-spacing="4.5" fill="#d9c9a5">AI · PARFUM</text>
    <line x1="128" y1="366" x2="192" y2="366" stroke="#d9c9a5" stroke-opacity=".5"/>
    <text x="160" y="384" text-anchor="middle" font-family="Cormorant Garamond, serif" font-style="italic" font-size="13" letter-spacing="1.5" fill="#d9c9a5" opacity=".85">Nº ${f.num} · ${f.name}</text>
  </g>
  <rect x="128" y="112" width="64" height="44" rx="6" fill="#fff" opacity=".12" stroke="#fff" stroke-opacity=".25"/>
  <rect x="136" y="118" width="6" height="34" rx="3" fill="#fff" opacity=".35"/>
  <rect x="120" y="104" width="80" height="16" rx="3" fill="url(#${id}-cap)"/>
  <rect x="120" y="104" width="80" height="3" fill="#fff" opacity=".5"/>
  <rect x="104" y="18" width="112" height="90" rx="10" fill="url(#${id}-cap)"/>
  <rect x="116" y="26" width="8" height="74" rx="4" fill="#fff" opacity=".45"/>
  <rect x="192" y="26" width="4" height="74" rx="2" fill="#fff" opacity=".25"/>
  <path d="M104 28 q56 -16 112 0" fill="none" stroke="#fff6dc" stroke-opacity=".8" stroke-width="1.5"/>
</svg>`;
  }

  /* ---------------- Cards ---------------- */
  function cardHTML(f) {
    return `
<article class="card reveal" data-id="${f.id}" style="--c1:${f.colors.glow}">
  <div class="card__media">
    ${f.badge ? `<span class="card__badge">${f.badge}</span>` : ''}
    <span class="card__num">Nº ${f.num}</span>
    <div class="card__bottle">${bottleSVG(f)}</div>
  </div>
  <div class="card__body">
    <div class="card__title-row">
      <h3 class="card__title">${f.name}</h3>
      <span class="card__family">${f.family}</span>
    </div>
    <p class="card__desc">${f.desc}</p>
    <div class="card__notes">${f.notes.map(n => `<span>${n}</span>`).join('')}</div>
    <div class="card__bottom">
      <div class="card__price-wrap">
        <div class="card__price"><span class="price-flip" data-price>${fmt(f.prices[50])}</span><small>₽</small></div>
        <span class="card__price-note" data-price-note>50 мл · Extrait de Parfum</span>
      </div>
      <div class="volume" role="group" aria-label="Объём">
        <span class="volume__thumb"></span>
        ${VOLUMES.map(v => `<button type="button" data-vol="${v}" class="${v === 50 ? 'is-active' : ''}" aria-pressed="${v === 50}">${v} мл</button>`).join('')}
      </div>
    </div>
    <div class="card__actions">
      <button type="button" class="btn btn--primary btn--full" data-order>
        <span class="btn__label">Заказать</span>
        <span class="btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </button>
    </div>
  </div>
</article>`;
  }

  function setupVolume(volEl, onChange) {
    const thumb = $('.volume__thumb', volEl);
    const btns = $$('button', volEl);
    const move = (btn) => {
      thumb.style.width = `${btn.offsetWidth}px`;
      thumb.style.transform = `translateX(${btn.offsetLeft - 3}px)`;
    };
    const active = btns.find(b => b.classList.contains('is-active')) || btns[0];
    requestAnimationFrame(() => move(active));
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
      move(b);
      onChange(Number(b.dataset.vol));
    }));
    // keep thumb aligned on resize/font-load
    const ro = new ResizeObserver(() => {
      const a = btns.find(x => x.classList.contains('is-active'));
      if (a) move(a);
    });
    ro.observe(volEl);
    return { set(v) { const b = btns.find(x => Number(x.dataset.vol) === v); if (b) b.click(); } };
  }

  function bindCard(card) {
    const f = FRAGRANCES.find(x => x.id === card.dataset.id);
    const priceEl = $('[data-price]', card);
    const noteEl = $('[data-price-note]', card);
    let vol = 50;
    setupVolume($('.volume', card), (v) => {
      vol = v;
      priceEl.classList.remove('is-flip');
      void priceEl.offsetWidth;
      priceEl.classList.add('is-flip');
      setTimeout(() => { priceEl.textContent = fmt(f.prices[v]); }, 190);
      noteEl.textContent = `${v} мл · Extrait de Parfum`;
    });
    $('[data-order]', card).addEventListener('click', () => openModal(f, vol));

    // spotlight follows cursor
    if (!isTouch) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    }
  }

  function renderCards(container, list) {
    container.innerHTML = list.map(cardHTML).join('');
    $$('.card', container).forEach(bindCard);
    observeReveals(container);
  }

  /* ---------------- Reveal on scroll ---------------- */
  let revealIO;
  function observeReveals(root = document) {
    if (!revealIO) {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }
    $$('.reveal', root).forEach(el => {
      if (el.hasAttribute('data-split') && !el.dataset.splitDone) splitWords(el);
      revealIO.observe(el);
    });
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="word"><span style="--i:${i}">${w}</span></span>`).join(' ');
    el.dataset.splitDone = '1';
  }

  /* ---------------- Preloader ---------------- */
  function preloader() {
    const pre = $('#preloader');
    const done = () => {
      pre.classList.add('is-done');
      document.body.classList.add('is-loaded');
      setTimeout(() => { $('#fog').classList.add('is-on'); }, 900);
    };
    const minTime = new Promise(r => setTimeout(r, reduceMotion ? 0 : 1400));
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([minTime, fonts]).then(done);
    setTimeout(done, 4500); // safety
  }

  /* ---------------- Header ---------------- */
  function header() {
    const h = $('#header');
    const burger = $('#burger');
    const nav = $('#nav');
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      h.classList.toggle('is-scrolled', y > 30);
      if (y > 400 && y > lastY + 6 && !nav.classList.contains('is-open')) h.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 120) h.classList.remove('is-hidden');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const toggle = (open) => {
      const isOpen = open ?? !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', isOpen);
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('is-locked', isOpen);
    };
    burger.addEventListener('click', () => toggle());
    $$('a', nav).forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ---------------- Scroll-driven hero ---------------- */
  function heroScroll() {
    const bottle = $('#heroBottle');
    const visual = $('#heroVisual');
    const hero = $('#hero');
    const parallaxEls = $$('[data-parallax]');
    const imgEls = $$('[data-parallax-img]');
    let ticking = false;
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

    if (!isTouch && !reduceMotion) {
      window.addEventListener('pointermove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const heroH = hero.offsetHeight;
      const p = Math.min(1, Math.max(0, y / (heroH * 0.9))); // 0..1 through hero

      if (!reduceMotion) {
        // bottle: drift + rotate + slight tilt in 3D
        curX += (mouseX - curX) * 0.06;
        curY += (mouseY - curY) * 0.06;
        const rotZ = -4 + p * 22;                       // rotate as we scroll
        const rotY = curX * 14 + p * 28;
        const rotX = -curY * 8 - p * 6;
        const ty = p * vh * 0.42;
        const tx = p * -60;
        const scale = 1 - p * 0.14;
        bottle.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
        visual.style.opacity = String(1 - Math.max(0, p - 0.65) / 0.35);

        parallaxEls.forEach(el => {
          const k = parseFloat(el.dataset.parallax);
          if (hero.contains(el)) {
            el.style.transform = `translate3d(0, ${y * k}px, 0)`;
          } else {
            const r = el.getBoundingClientRect();
            if (r.bottom < -vh || r.top > vh * 2) return;
            const off = (r.top + r.height / 2 - vh / 2) * k * 2;
            el.style.transform = `translate3d(0, ${off}px, 0)`;
          }
        });
      }

      // images move with scroll (relative to viewport center)
      imgEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const k = parseFloat(el.dataset.parallaxImg);
        const off = (r.top + r.height / 2 - vh / 2) * k;
        const glass = $('.img-glass', el);
        if (glass) glass.style.setProperty('--py', `${off}px`);
      });

      spray.onScroll(y, p);
    };

    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    if (!isTouch && !reduceMotion) {
      // continuous loop for mouse smoothing while in hero
      const loop = () => { if (window.scrollY < window.innerHeight * 1.2) update(); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    update();
  }

  /* ---------------- Spray particles ---------------- */
  const spray = (() => {
    const canvas = $('#spray');
    const ctx = canvas.getContext('2d');
    const bottle = $('#heroBottle');
    let W = 0, H = 0, dpr = 1;
    let particles = [];
    let lastY = 0, lastBurst = 0, running = false;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);

    const nozzlePos = () => {
      const noz = $('#nozzle');
      const cr = canvas.getBoundingClientRect();
      if (!noz) return { x: W * 0.62, y: H * 0.28 };
      const nr = noz.getBoundingClientRect();
      return { x: nr.left + nr.width / 2 - cr.left, y: nr.top + nr.height / 2 - cr.top };
    };

    const burst = (count, power = 1) => {
      const { x, y } = nozzlePos();
      // direction: up-right, slightly following bottle rotation
      const m = bottle.style.transform.match(/rotateZ\(([-\d.]+)deg\)/);
      const rz = m ? parseFloat(m[1]) : 0;
      const base = (-20 + rz) * Math.PI / 180;
      for (let i = 0; i < count; i++) {
        const a = base + (Math.random() - 0.5) * 0.7;
        const sp = (2 + Math.random() * 5) * power;
        particles.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          r: 0.6 + Math.random() * 2.4, life: 1, decay: 0.008 + Math.random() * 0.014,
          hue: 38 + Math.random() * 12,
        });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.975; p.vy = p.vy * 0.975 - 0.012; // gentle lift
        p.vx += (Math.random() - 0.5) * 0.12;
        p.life -= p.decay;
        p.r += 0.05;
        const alpha = Math.max(0, p.life) * 0.55;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        g.addColorStop(0, `hsla(${p.hue}, 70%, 85%, ${alpha})`);
        g.addColorStop(1, `hsla(${p.hue}, 70%, 85%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
      }
      if (particles.length) requestAnimationFrame(tick); else running = false;
    };

    // idle puffs
    if (!reduceMotion) {
      setInterval(() => {
        if (window.scrollY < window.innerHeight * 0.6 && document.body.classList.contains('is-loaded')) burst(14, 0.8);
      }, 3200);
      setTimeout(() => burst(40, 1.2), 2200);
    }

    return {
      onScroll(y, p) {
        if (reduceMotion || p >= 1) return;
        const dy = Math.abs(y - lastY);
        lastY = y;
        const now = performance.now();
        if (dy > 4 && now - lastBurst > 70) {
          lastBurst = now;
          burst(Math.min(30, 6 + dy * 0.4), 1 + Math.min(1, dy / 80));
        }
      },
    };
  })();

  /* ---------------- Fog ---------------- */
  function fog() {
    const canvas = $('#fog');
    if (reduceMotion || window.innerWidth < 600) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0, lastScroll = window.scrollY, drift = 0;
    const clouds = [];
    const resize = () => {
      W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight;
    };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 9; i++) {
      clouds.push({
        x: Math.random() * W, y: Math.random() * H, r: 220 + Math.random() * 320,
        vx: (0.15 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1), vy: (Math.random() - 0.5) * 0.12,
        a: 0.035 + Math.random() * 0.05, hue: Math.random() > 0.5 ? '212,180,122' : '170,160,220',
      });
    }
    const draw = () => {
      t += 0.005;
      const sy = window.scrollY;
      drift += ((sy - lastScroll) * 0.9 - drift) * 0.1; // fog streams horizontally on scroll
      lastScroll = sy;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      for (const c of clouds) {
        c.x += c.vx + drift * 0.02 * (c.vx > 0 ? 1 : -1);
        c.y += c.vy + Math.sin(t + c.r) * 0.15;
        if (c.x < -c.r) c.x = W + c.r; if (c.x > W + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = H + c.r; if (c.y > H + c.r) c.y = -c.r;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        const a = c.a * (0.8 + Math.abs(Math.sin(t * 1.7 + c.r)) * 0.4);
        g.addColorStop(0, `rgba(${c.hue},${a})`);
        g.addColorStop(1, `rgba(${c.hue},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------------- Cursor glow & magnetic buttons ---------------- */
  function cursor() {
    if (isTouch || reduceMotion) return;
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; glow.classList.add('is-on'); }, { passive: true });
    const loop = () => {
      cx += (x - cx) * 0.1; cy += (y - cy) * 0.1;
      glow.style.transform = `translate(${cx - 210}px, ${cy - 210}px)`;
      requestAnimationFrame(loop);
    };
    loop();

    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    $$('.feature').forEach(el => el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }));
  }

  /* ---------------- Finder ---------------- */
  function finder() {
    const chips = $$('.chip[data-mood]');
    const reset = $('#chipReset');
    const result = $('#finderResult');
    const active = new Set();

    const render = () => {
      reset.hidden = active.size === 0;
      if (!active.size) {
        result.innerHTML = `<p class="finder__hint reveal is-in">Выберите настроение выше — подходящие ароматы появятся здесь.</p>`;
        return;
      }
      const list = FRAGRANCES.filter(f => [...active].every(m => f.moods.includes(m)));
      const labels = [...active].map(m => MOOD_LABELS[m]).join(' + ');
      if (!list.length) {
        result.innerHTML = `<p class="finder__hint reveal is-in">Такое сочетание пока в разработке. Попробуйте убрать один из фильтров или <a href="#cta" style="color:var(--gold)">напишите парфюмеру</a>.</p>`;
        return;
      }
      result.innerHTML = `<p class="finder__count">Найдено <strong>${list.length}</strong> · ${labels}</p><div class="finder__grid"></div>`;
      const grid = $('.finder__grid', result);
      grid.innerHTML = list.map(cardHTML).join('');
      $$('.card', grid).forEach(c => { c.classList.remove('reveal'); bindCard(c); });
    };

    chips.forEach(ch => ch.addEventListener('click', () => {
      const m = ch.dataset.mood;
      if (active.has(m)) { active.delete(m); ch.classList.remove('is-active'); }
      else { active.add(m); ch.classList.add('is-active'); }
      ch.setAttribute('aria-pressed', String(active.has(m)));
      render();
    }));
    reset.addEventListener('click', () => {
      active.clear(); chips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
      render();
    });
  }

  /* ---------------- Reviews nav ---------------- */
  function reviews() {
    const track = $('#reviewsTrack');
    const step = () => ($('.review', track)?.offsetWidth || 340) + 24;
    $('#revPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('#revNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* ---------------- Modal ---------------- */
  const modal = $('#orderModal');
  const modalState = { f: null, vol: 50, consult: false };
  let modalVolumeCtl = null;
  let lastFocus = null;

  function openModal(f, vol = 50, consult = false) {
    lastFocus = document.activeElement;
    modalState.f = f; modalState.vol = vol; modalState.consult = consult;
    $('#modalBody').hidden = false; $('#modalSuccess').hidden = true;
    $('#formError').hidden = true;
    $('#orderForm').reset();
    $$('.field input', modal).forEach(i => i.classList.remove('is-invalid'));

    const bottleWrap = $('#modalBottle');
    const product = $('#modalProduct');
    product.classList.toggle('is-consult', consult);
    $('#submitBtn .btn__label').textContent = consult ? 'Отправить' : 'Заказать';
    if (consult) {
      $('#modalEyebrow').textContent = 'Консультация';
      $('#modalTitle').textContent = 'Подобрать аромат вместе';
      $('#modalNotes').textContent = 'Оставьте контакт — парфюмер студии перезвонит, задаст несколько вопросов и предложит 2–3 аромата под вас. Пробники отправим бесплатно.';
    } else {
      bottleWrap.style.setProperty('--c1', f.colors.glow);
      bottleWrap.innerHTML = bottleSVG(f);
      $('#modalEyebrow').textContent = `Nº ${f.num} · ${f.family}`;
      $('#modalTitle').textContent = f.name;
      $('#modalNotes').textContent = f.notes.join(' · ');
      const volEl = $('#modalVolume');
      volEl.innerHTML = `<span class="volume__thumb"></span>` + VOLUMES.map(v => `<button type="button" data-vol="${v}" class="${v === vol ? 'is-active' : ''}" aria-pressed="${v === vol}">${v} мл</button>`).join('');
      modalVolumeCtl = setupVolume(volEl, (v) => { modalState.vol = v; updateModalPrice(); });
      updateModalPrice();
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => $('#fName').focus({ preventScroll: true }), 350);
  }

  function updateModalPrice() {
    const { f, vol } = modalState;
    const el = $('#modalPrice');
    el.innerHTML = `${fmt(f.prices[vol])} <small>₽</small>`;
    el.classList.remove('is-flip'); void el.offsetWidth; el.classList.add('is-flip');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function modalInit() {
    $$('[data-close]', modal).forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
    $('#ctaConsult').addEventListener('click', () => openModal(null, 50, true));

    // phone mask (+7)
    const phone = $('#fPhone');
    phone.addEventListener('input', () => {
      let d = phone.value.replace(/\D/g, '');
      if (!d) { phone.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      let out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 4) out += ') ' + d.slice(4, 7);
      if (d.length >= 7) out += '-' + d.slice(7, 9);
      if (d.length >= 9) out += '-' + d.slice(9, 11);
      phone.value = out;
    });

    $('#orderForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#fName'); const err = $('#formError');
      const digits = phone.value.replace(/\D/g, '');
      let ok = true;
      name.classList.toggle('is-invalid', name.value.trim().length < 2);
      phone.classList.toggle('is-invalid', digits.length < 11);
      if (name.value.trim().length < 2) { ok = false; err.textContent = 'Введите имя — хотя бы два символа.'; }
      else if (digits.length < 11) { ok = false; err.textContent = 'Проверьте номер телефона.'; }
      err.hidden = ok;
      if (!ok) return;

      const btn = $('#submitBtn');
      btn.classList.add('is-loading');
      const payload = {
        name: name.value.trim(), phone: phone.value,
        fragrance: modalState.consult ? null : modalState.f.name,
        volume: modalState.consult ? null : modalState.vol,
        price: modalState.consult ? null : modalState.f.prices[modalState.vol],
        ts: new Date().toISOString(),
      };
      // Здесь можно подключить бэкенд: fetch('/api/order', { method: 'POST', body: JSON.stringify(payload) })
      try { const q = JSON.parse(localStorage.getItem('klemni_orders') || '[]'); q.push(payload); localStorage.setItem('klemni_orders', JSON.stringify(q)); } catch (_) {}

      setTimeout(() => {
        btn.classList.remove('is-loading');
        $('#modalBody').hidden = true;
        $('#successName').textContent = payload.name;
        $('#successText').textContent = modalState.consult
          ? 'Парфюмер студии перезвонит вам в течение 15 минут в рабочее время и поможет с выбором.'
          : `Заказ на ${payload.fragrance}, ${payload.volume} мл принят. Мы перезвоним в течение 15 минут, чтобы уточнить доставку.`;
        const s = $('#modalSuccess'); s.hidden = false;
        // restart draw animations
        $$('.success__circle, .success__check', s).forEach(p => { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
      }, 900);
    });
  }

  /* ---------------- Init ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    preloader();
    header();
    renderCards($('#catalogGrid'), FRAGRANCES);
    $('#ctaBottle').innerHTML = bottleSVG(FRAGRANCES[0]);
    observeReveals();
    heroScroll();
    fog();
    cursor();
    finder();
    reviews();
    modalInit();
  });
})();
