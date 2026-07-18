/* ========================================================= */
/*  trip-prog portfolio                                       */
/* ========================================================= */

const BASE = 'https://trip-prog.github.io/';

/* ---------- данные проектов ---------- */
const PROJECTS = [
  { slug: 'maestro-kitchens',             title: 'MAESTRO KITCHENS', tags: ['кухни на заказ', 'тёмный премиум', 'квиз-конфигуратор'], hot: 'квиз-конфигуратор', span: 7 },
  { slug: 'proremont-landing',            title: 'ПРОРЕМОНТ',        tags: ['ремонт под ключ', 'калькулятор сметы', 'до/после'], hot: 'калькулятор сметы', span: 5 },
  { slug: 'estet-dent-landing',           title: 'ESTET DENT',       tags: ['стоматология', 'тёмный + золото', 'онлайн-запись'], span: 5 },
  { slug: 'nova-development-landing',     title: 'NOVA DEVELOPMENT', tags: ['застройщик', 'планировки', 'ипотечный калькулятор'], hot: 'ипотечный калькулятор', span: 7 },
  { slug: 'brutal-barbershop',            title: 'BRUTAL',           tags: ['барбершоп', 'тёмный гранж', 'онлайн-бронь'], span: 7 },
  { slug: 'aurea-landing',                title: 'AUREA',            tags: ['косметология', 'нюд-палитра', 'слайдер до/после'], span: 5 },
  { slug: 'rostov-remont',                title: 'ROSTOV REMONT',    tags: ['ремонт квартир', 'светлый премиум', 'белый + золото'], span: 5 },
  { slug: 'shine-studio-detailing',       title: 'SHINE STUDIO',     tags: ['детейлинг', 'тёмный премиум', 'прайс-пакеты'], span: 7 },
  { slug: 'freshbox-landing',             title: 'FRESHBOX',         tags: ['доставка питания', 'конструктор рациона', 'подписка'], hot: 'конструктор рациона', span: 7 },
  { slug: 'chistodoma-landing',           title: 'ЧИСТОДОМА',        tags: ['клининг', 'калькулятор уборки', 'подписка'], span: 5 },
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
    const t = e.target.closest('a, button, .project-card');
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
  let trx = 8, tryy = -16, crx = 8, cry = -16;

  if (fine) {
    addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth;   // 0..1
      const ny = e.clientY / innerHeight;  // 0..1
      tryy = 8 - nx * 34;                  //   8 .. -26
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

/* ---------- карточки проектов ---------- */
function projectCard(p, i) {
  const url = BASE + p.slug + '/';
  const shortUrl = url.replace('https://', '');
  const a = document.createElement('a');
  a.className = 'project-card reveal' + (p.span ? ' span-' + p.span : '');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = `
    <div class="browser-frame">
      <div class="browser-bar"><i></i><i></i><i></i><span class="browser-url">${shortUrl}</span></div>
      <div class="preview" data-src="${url}"><span class="ph">// загрузка превью</span></div>
    </div>
    <div class="project-meta">
      <div class="project-top">
        <span class="project-num">${String(i + 1).padStart(2, '0')}</span>
        <h3>${p.title}</h3>
        <span class="project-arrow">↗</span>
      </div>
      <div class="project-tags">
        ${p.tags.map(t => `<span class="tag${t === p.hot ? ' hot' : ''}">${t}</span>`).join('')}
      </div>
    </div>`;
  return a;
}

(() => {
  const grid = document.getElementById('projects-grid');
  if (grid) PROJECTS.forEach((p, i) => grid.appendChild(projectCard(p, i)));
})();

/* ---------- ленивые iframe-превью + масштаб ---------- */
(() => {
  const previews = [...document.querySelectorAll('.preview')];
  if (!previews.length) return;

  const fit = (box) => {
    const f = box.querySelector('iframe');
    if (!f) return;
    const w = box.clientWidth, h = box.clientHeight;
    const s = Math.max(w / 1440, h / 902);
    f.style.transform = `translateX(${((w - 1440 * s) / 2).toFixed(1)}px) scale(${s.toFixed(4)})`;
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
      f.setAttribute('scrolling', 'no');
      f.addEventListener('load', () => box.querySelector('.ph')?.remove(), { once: true });
      box.appendChild(f);
      fit(box);
    });
  }, { rootMargin: '500px 0px' });

  previews.forEach(p => io.observe(p));
  addEventListener('resize', () => previews.forEach(fit), { passive: true });
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
