/* ========================================================= */
/*  trip-prog portfolio                                       */
/* ========================================================= */

const BASE = 'https://trip-prog.github.io/';

/* ---------- данные проектов ---------- */
const PROJECTS = [
  { slug: 'maestro-kitchens',         title: 'MAESTRO KITCHENS', desc: 'Тёмный премиум-лендинг кухонь на заказ. Квиз-конфигуратор сам считает цену и собирает заявки.', tags: ['кухни на заказ', 'тёмный премиум', 'квиз-конфигуратор'], hot: 'квиз-конфигуратор' },
  { slug: 'proremont-landing',        title: 'ПРОРЕМОНТ',        desc: 'Ремонт под ключ: калькулятор сметы, этапы работ и блок «до/после».', tags: ['ремонт под ключ', 'калькулятор сметы', 'до/после'], hot: 'калькулятор сметы' },
  { slug: 'estet-dent-landing',       title: 'ESTET DENT',       desc: 'Стоматология в тёмном золоте: услуги, врачи, онлайн-запись на приём.', tags: ['стоматология', 'тёмный + золото', 'онлайн-запись'] },
  { slug: 'nova-development-landing', title: 'NOVA DEVELOPMENT', desc: 'Сайт застройщика: планировки, ход строительства и ипотечный калькулятор.', tags: ['застройщик', 'планировки', 'ипотечный калькулятор'], hot: 'ипотечный калькулятор' },
  { slug: 'brutal-barbershop',        title: 'BRUTAL',           desc: 'Гранжевый барбершоп: прайс, мастера и бронь в пару кликов.', tags: ['барбершоп', 'тёмный гранж', 'онлайн-бронь'] },
  { slug: 'aurea-landing',            title: 'AUREA',            desc: 'Косметология в нюд-палитре со слайдером «до/после» на живых фото.', tags: ['косметология', 'нюд-палитра', 'слайдер до/после'] },
  { slug: 'rostov-remont',            title: 'ROSTOV REMONT',    desc: 'Светлый бело-золотой лендинг ремонта квартир в Ростове.', tags: ['ремонт квартир', 'светлый премиум', 'белый + золото'] },
  { slug: 'shine-studio-detailing',   title: 'SHINE STUDIO',     desc: 'Детейлинг-студия: пакеты услуг, галерея работ и запись онлайн.', tags: ['детейлинг', 'тёмный премиум', 'прайс-пакеты'] },
  { slug: 'freshbox-landing',         title: 'FRESHBOX',         desc: 'Доставка питания: конструктор рациона, календарь и подписка.', tags: ['доставка питания', 'конструктор рациона', 'подписка'], hot: 'конструктор рациона' },
  { slug: 'chistodoma-landing',       title: 'ЧИСТОДОМА',        desc: 'Клининг с калькулятором уборки и подпиской на регулярный сервис.', tags: ['клининг', 'калькулятор уборки', 'подписка'] },
];

/* сайты, которые показываются на экране ноутбука */
const SHOWCASE = ['maestro-kitchens', 'freshbox-landing', 'aurea-landing'];

/* ---------- курсор ---------- */
(() => {
  const cur = document.querySelector('.cursor');
  if (!cur || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = cur.querySelector('.cursor-dot');
  const ring = cur.querySelector('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    const t = e.target.closest('a, button');
    cur.classList.toggle('is-link', !!t);
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
})();

/* ---------- ноутбук: клавиши ---------- */
(() => {
  const kb = document.getElementById('keyboard');
  if (!kb) return;
  const rows = [14, 14, 13, 12, 11];
  rows.forEach((n, ri) => {
    for (let i = 0; i < n; i++) {
      const k = document.createElement('div');
      k.className = 'key';
      if (ri === 4 && i === 5) k.classList.add('space');
      kb.appendChild(k);
    }
  });
})();

/* ---------- ноутбук: поворот за курсором ---------- */
(() => {
  const laptop = document.getElementById('laptop');
  if (!laptop) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let trx = 8, tryy = 9, crx = 8, cry = 9;

  if (fine) {
    addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth;   // 0..1
      const ny = e.clientY / innerHeight;  // 0..1
      tryy = 26 - nx * 34;                 //  26 .. -8, в центре +9: смотрит чуть влево, на посетителя
      trx  = 14 - ny * 13;                 //  14 .. 1
    }, { passive: true });
  }

  (function loop() {
    crx += (trx - crx) * 0.055;
    cry += (tryy - cry) * 0.055;
    laptop.style.setProperty('--rx', crx.toFixed(2) + 'deg');
    laptop.style.setProperty('--ry', cry.toFixed(2) + 'deg');
    requestAnimationFrame(loop);
  })();
})();

/* ---------- ноутбук: живой экран ---------- */
(() => {
  const screen = document.getElementById('laptop-screen');
  if (!screen) return;

  addEventListener('load', () => {
    const frames = SHOWCASE.map((slug, i) => {
      const f = document.createElement('iframe');
      f.src = BASE + slug + '/';
      f.loading = i === 0 ? 'eager' : 'lazy';
      f.setAttribute('tabindex', '-1');
      f.setAttribute('aria-hidden', 'true');
      f.setAttribute('scrolling', 'no');
      screen.appendChild(f);
      return f;
    });

    let idx = 0;
    frames[0].addEventListener('load', () => {
      screen.querySelector('.screen-boot')?.remove();
      frames[0].classList.add('on');
    }, { once: true });

    setInterval(() => {
      frames[idx].classList.remove('on');
      idx = (idx + 1) % frames.length;
      frames[idx].classList.add('on');
    }, 7000);
  });
})();

/* ---------- слайды проектов ---------- */
function projectSlide(p, i) {
  const url = BASE + p.slug + '/';
  const shortUrl = url.replace('https://', '');
  const el = document.createElement('article');
  el.className = 'slide' + (i % 2 ? ' slide-flip' : '');
  el.innerHTML = `
    <div class="slide-meta">
      <div class="slide-num">${String(i + 1).padStart(2, '0')}</div>
      <h3 class="slide-title">${p.title}</h3>
      <p class="slide-desc">${p.desc}</p>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="tag${t === p.hot ? ' hot' : ''}">${t}</span>`).join('')}
      </div>
      <a class="btn btn-ghost btn-sm slide-open" href="${url}" target="_blank" rel="noopener">Открыть сайт ↗</a>
    </div>
    <a class="browser-frame" href="${url}" target="_blank" rel="noopener" aria-label="${p.title}">
      <div class="browser-bar"><i></i><i></i><i></i><span class="browser-url">${shortUrl}</span></div>
      <div class="preview" data-src="${url}"><span class="ph">// загрузка превью</span></div>
      <div class="slide-hint mono">наведи — сайт пролистается</div>
    </a>`;
  return el;
}

(() => {
  const track = document.getElementById('projects-track');
  if (track) PROJECTS.forEach((p, i) => track.appendChild(projectSlide(p, i)));
})();

/* ---------- горизонтальная лента на скролле ---------- */
(() => {
  const pin = document.getElementById('projects');
  const track = document.getElementById('projects-track');
  if (!pin || !track) return;
  const count = document.getElementById('proj-count');
  const fill = document.getElementById('proj-bar-fill');
  const mq = matchMedia('(min-width: 901px)');
  const SPEED = 1.4; // px ленты на 1px прокрутки страницы
  const N = PROJECTS.length;
  let extra = 0, pinTop = 0, target = 0, cur = 0;

  function onScroll() {
    if (!mq.matches) return;
    target = Math.min(Math.max((scrollY - pinTop) * SPEED, 0), extra);
  }

  function layout() {
    if (!mq.matches) {
      pin.style.height = '';
      track.style.transform = '';
      cur = target = 0;
      return;
    }
    extra = Math.max(track.scrollWidth - innerWidth, 0);
    pin.style.height = Math.round(innerHeight + extra / SPEED) + 'px';
    pinTop = pin.getBoundingClientRect().top + scrollY;
    onScroll();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', layout, { passive: true });
  addEventListener('load', layout);
  if (document.fonts?.ready) document.fonts.ready.then(layout);
  if (mq.addEventListener) mq.addEventListener('change', layout);
  layout();

  (function loop() {
    if (mq.matches && extra > 0) {
      cur += (target - cur) * 0.095;
      if (Math.abs(target - cur) < .05) cur = target;
      track.style.transform = `translate3d(${(-cur).toFixed(1)}px, 0, 0)`;
      const pr = cur / extra;
      if (fill) fill.style.width = (pr * 100).toFixed(2) + '%';
      if (count) count.textContent = String(Math.min(N, Math.round(pr * (N - 1)) + 1)).padStart(2, '0') + ' / ' + N;
    }
    requestAnimationFrame(loop);
  })();
})();

/* ---------- ленивые iframe-превью + масштаб ---------- */
(() => {
  const previews = [...document.querySelectorAll('.preview')];
  if (!previews.length) return;

  const fit = (box) => {
    const f = box.querySelector('iframe');
    if (!f) return;
    f.style.transform = `scale(${(box.clientWidth / 1440).toFixed(4)})`;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const box = en.target;
      io.unobserve(box);
      const f = document.createElement('iframe');
      f.src = box.dataset.src;
      f.loading = 'lazy';
      f.setAttribute('tabindex', '-1');
      f.setAttribute('aria-hidden', 'true');
      f.addEventListener('load', () => {
        box.querySelector('.ph')?.remove();
        // прячем скроллбар внутри превью (same-origin на проде)
        try {
          const d = f.contentDocument;
          const st = d.createElement('style');
          st.textContent = 'html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important}html,body{scrollbar-width:none!important}';
          (d.head || d.documentElement).appendChild(st);
        } catch { /* cross-origin в dev */ }
      }, { once: true });
      box.appendChild(f);
      fit(box);
    });
  }, { rootMargin: '300px 1400px 300px 1400px' });

  previews.forEach(p => io.observe(p));
  addEventListener('resize', () => previews.forEach(fit), { passive: true });
})();

/* ---------- автопросмотр: сайт листается при наведении ---------- */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.slide .browser-frame').forEach(frame => {
    const box = frame.querySelector('.preview');
    if (!box) return;
    let raf = null, mode = 0, last = 0;

    function step(ts) {
      const f = box.querySelector('iframe');
      if (!f || !mode) { raf = null; return; }
      let win, max;
      try {
        win = f.contentWindow;
        max = win.document.documentElement.scrollHeight - win.innerHeight;
      } catch { raf = null; return; }
      if (max <= 0) { raf = null; return; }
      if (!last) last = ts;
      const dt = Math.min((ts - last) / 1000, .05);
      last = ts;
      const speed = mode > 0 ? 620 : 2800;
      let y = win.scrollY + mode * speed * dt;
      y = Math.max(0, Math.min(y, max));
      win.scrollTo({ top: y, behavior: 'instant' });
      if ((mode > 0 && y >= max) || (mode < 0 && y <= 0)) { raf = null; return; }
      raf = requestAnimationFrame(step);
    }

    const start = m => { mode = m; last = 0; if (raf === null) raf = requestAnimationFrame(step); };
    frame.addEventListener('mouseenter', () => start(1));
    frame.addEventListener('mouseleave', () => start(-1));
  });
})();

/* ---------- магнитные кнопки ---------- */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const strength = 0.26;
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * strength;
      const dy = (e.clientY - r.top - r.height / 2) * strength;
      btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();

/* ---------- пасхалка: взрыв по клику на логотип ---------- */
(() => {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  logo.addEventListener('click', () => {
    if (typeof window.fluidBurst === 'function') window.fluidBurst(16);
    logo.classList.remove('boom');
    void logo.offsetWidth; // перезапуск анимации
    logo.classList.add('boom');
  });
})();

/* ---------- reveal при скролле ---------- */
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---------- глитч на слове ---------- */
(() => {
  const w = document.querySelector('.glitch-word');
  if (!w) return;
  const fire = () => {
    w.classList.add('glitching');
    setTimeout(() => w.classList.remove('glitching'), 340);
  };
  setTimeout(fire, 1200);
  setInterval(() => { if (Math.random() < 0.55) fire(); }, 3800);
})();

/* ---------- бегущая строка ---------- */
(() => {
  const track = document.getElementById('marquee-track');
  if (track) track.innerHTML += track.innerHTML;
})();

/* ---------- терминал ---------- */
(() => {
  const body = document.getElementById('term-body');
  const box = document.getElementById('terminal');
  if (!body || !box) return;

  const LINES = [
    ['whoami', 'веб-разработчик и дизайнер интерфейсов'],
    ['ls ~/projects | wc -l', '10 живых сайтов, все в продакшене'],
    ['stack --main', 'js · react · three.js · python · node'],
    ['status', '<span class="p">●</span> открыт к новым проектам'],
  ];

  let started = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || started) return;
    started = true;
    io.disconnect();
    typeLines(0);
  }, { threshold: 0.4 });
  io.observe(box);

  function typeLines(li) {
    if (li >= LINES.length) {
      const end = document.createElement('div');
      end.className = 'ln';
      end.innerHTML = '<span class="p">$</span> <span class="term-caret"></span>';
      body.appendChild(end);
      return;
    }
    const [cmd, out] = LINES[li];
    const ln = document.createElement('div');
    ln.className = 'ln';
    ln.innerHTML = '<span class="p">$</span> ';
    body.appendChild(ln);
    let ci = 0;
    const t = setInterval(() => {
      ln.innerHTML = '<span class="p">$</span> ' + cmd.slice(0, ++ci);
      if (ci >= cmd.length) {
        clearInterval(t);
        setTimeout(() => {
          const res = document.createElement('div');
          res.className = 'ln';
          res.innerHTML = '<span class="c">→ ' + out + '</span>';
          body.appendChild(res);
          setTimeout(() => typeLines(li + 1), 260);
        }, 300);
      }
    }, 42);
  }
})();

/* ---------- бургер ---------- */
(() => {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');
  if (!burger) return;
  burger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open')));
})();

/* ---------- копирование почты ---------- */
(() => {
  const btn = document.getElementById('copy-mail');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.mail);
      const old = btn.textContent;
      btn.textContent = 'Скопировано ✓';
      setTimeout(() => (btn.textContent = old), 1800);
    } catch { /* clipboard недоступен */ }
  });
})();

/* ---------- год в футере ---------- */
(() => {
  const el = document.querySelector('.footer .mono');
  if (el) el.innerHTML = el.innerHTML.replace('{{year}}', new Date().getFullYear());
})();
