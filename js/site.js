/* Achei Troféus — direção de movimento
   Uma curva (expo), uma assinatura (o laser), três grandes momentos:
   a entrada, a anatomia do troféu e a fábrica em travelling. */
(() => {
  const H = document.documentElement;
  const RM = H.classList.contains('rm');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOB = '(max-width: 820px)';
  const isMob = () => matchMedia(MOB).matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const WA = '5532998042012';

  /* ------------------------------------------------------------------ dados */
  const SPORTS = [
    { n: 'Futebol', img: 'img/cut/futebol.webp', obj: 1, cap: 'Campeão · Vice-campeão' },
    { n: 'Futsal', img: 'img/cut/futsal.webp', obj: 1, cap: 'Copa Minas Gerais de Futsal' },
    { n: 'Beach Tennis', img: 'img/beach.webp', cap: 'World Tour BT 400' },
    { n: 'Tênis', img: 'img/cut/tenis.webp', obj: 1, cap: 'Ranking Tennis' },
    { n: 'Vôlei', img: 'img/volei.webp', cap: 'O título é do time' },
    { n: 'Futevôlei', img: 'img/ligadelas.webp', cap: 'Liga Delas' },
    { n: 'Corrida', img: 'img/hyrox.webp', cap: 'Hyrox Amazônia' },
    { n: 'Lutas', img: 'img/cut/judo.webp', obj: 1, cap: '2ª Copa Kinayama de Judô' },
    { n: 'Corporativo', img: 'img/cafu.webp', cap: 'Homenagens' },
    { n: 'Medalhas', img: 'img/medalhas.webp', cap: 'Medalhas de metal' },
    { n: 'Personalizados', img: 'img/truco.webp', cap: 'Campeonato de truco' },
  ];
  const pad = (i) => String(i + 1).padStart(2, '0');

  /* ------------------------------------------------- montagem de conteúdo */
  const list = $('#espList'), frame = $('#espFrame'), cards = $('#espCards'), chipsSport = $('#bldSport');
  SPORTS.forEach((s, i) => {
    list.insertAdjacentHTML('beforeend',
      `<li><a class="esp-item" href="#orcamento" data-i="${i}" data-sport="${s.n}"><span class="n">${pad(i)}</span><span class="t">${s.n}</span><span class="go">Montar premiação</span></a></li>`);
    frame.insertAdjacentHTML('beforeend',
      `<div class="cut${s.obj ? ' is-obj' : ''}" data-i="${i}"><img src="${s.img}" alt="${s.n} — ${s.cap}" loading="lazy" decoding="async"></div>`);
    cards.insertAdjacentHTML('beforeend',
      `<a class="ec" href="#orcamento" data-sport="${s.n}"><div class="ph"><img class="${s.obj ? 'is-obj' : ''}" src="${s.img}" alt="${s.n} — ${s.cap}" loading="lazy" decoding="async"><b><small>${pad(i)}</small>${s.n}</b></div><p><span>${s.cap}</span>Montar →</p></a>`);
    chipsSport.insertAdjacentHTML('beforeend',
      `<label class="chip"><input type="radio" name="esporte" value="${s.n}"><span>${s.n}</span></label>`);
  });
  chipsSport.insertAdjacentHTML('beforeend', `<label class="chip"><input type="radio" name="esporte" value="Outro"><span>Outro</span></label>`);

  // Espessura física das camadas do troféu: cópias escuras atrás de cada camada
  $$('.lyr-in').forEach((inn) => {
    const main = inn.querySelector('img');
    const n = isMob() ? 1 : inn.parentElement.dataset.l === '4' ? 1 : inn.parentElement.dataset.l === '2' ? 2 : 3;
    for (let k = n; k >= 1; k--) {
      const g = main.cloneNode(); g.alt = ''; g.className = `g g${k}`; g.setAttribute('aria-hidden', 'true');
      inn.insertBefore(g, main);
    }
  });
  // Reflexo do troféu no chão do hero
  const heroImg = $('.hero-obj .tilt > img');
  const refl = heroImg.cloneNode(); refl.className = 'refl'; refl.alt = ''; refl.removeAttribute('fetchpriority'); refl.setAttribute('aria-hidden', 'true');
  $('.hero-obj').appendChild(refl);

  // Brilho metálico recortado exatamente na silhueta da peça
  $$('[data-mask]').forEach((el) => {
    const imgs = [...el.parentElement.querySelectorAll('img')].filter((i) => !i.classList.contains('g'));
    const img = imgs[imgs.length - 1];
    const set = () => el.style.setProperty('--mask', `url("${img.currentSrc || img.src}")`);
    img.complete ? set() : img.addEventListener('load', set, { once: true });
  });

  /* ----------------------------------------------------------- menu mobile */
  const menuBtn = $('#menuBtn'), mnav = $('#mnav'), body = document.body;
  let menuOpen = false, lockY = 0;
  const setMenu = (open) => {
    if (open === menuOpen) return;
    menuOpen = open;
    H.classList.toggle('is-menu', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mnav.inert = !open;
    if (open) {
      lockY = scrollY;
      Object.assign(body.style, { position: 'fixed', top: `${-lockY}px`, left: '0', right: '0' });
      if (window.__lenis) window.__lenis.stop();
      setTimeout(() => { const a = $('a', mnav); if (a && menuOpen) a.focus({ preventScroll: true }); }, 380);
    } else {
      Object.assign(body.style, { position: '', top: '', left: '', right: '' });
      window.scrollTo(0, lockY);
      if (window.__lenis) window.__lenis.start();
    }
  };
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', mnav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); return; }
    if (e.key !== 'Tab') return;
    const f = [menuBtn, ...$$('a', mnav)];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  addEventListener('resize', () => { if (menuOpen && innerWidth > 1100) setMenu(false); });

  // Carrosséis nativos: a linha de laser acompanha o gesto
  const hprog = (scroller, bar) => {
    if (!scroller || !bar) return;
    const upd = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      bar.style.setProperty('--p', max > 0 ? Math.max(.1, scroller.scrollLeft / max).toFixed(3) : 1);
    };
    scroller.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  };
  hprog($('#espCards'), $('.esp .xprog'));
  hprog($('.fab-track'), $('.fab-progress'));

  // Animações contínuas só rodam quando estão na tela
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)));
    $$('.marquee, .fab-band').forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------- orçamento → WA */
  const form = $('#bld');
  const pick = (sport) => {
    const r = form.querySelector(`input[name="esporte"][value="${sport}"]`);
    if (r) r.checked = true;
  };
  $$('[data-sport]').forEach((a) => a.addEventListener('click', () => pick(a.dataset.sport)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const L = ['Olá, Achei Troféus! Quero um orçamento de premiação.'];
    const add = (k, label) => { const v = (f.get(k) || '').toString().trim(); if (v) L.push(`• ${label}: ${v}`); };
    add('tipo', 'Preciso de');
    add('esporte', 'Esporte/evento');
    add('qtd', 'Quantidade aproximada');
    const d = (f.get('data') || '').toString();
    if (d) { const [y, m, dd] = d.split('-'); L.push(`• Data do evento: ${dd}/${m}/${y}`); }
    add('cidade', 'Cidade/UF');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(L.join('\n'))}`, '_blank', 'noopener');
  });

  /* ------------------------------------------------------ esportes: hover */
  const items = $$('.esp-item'), shots = $$('.cut', frame), cap = $('#espCap'), num = $('#espNum');
  let cur = -1, zTop = 1;
  const showSport = (i, instant) => {
    if (i === cur) return;
    cur = i;
    items.forEach((it) => it.classList.toggle('is-on', +it.dataset.i === i));
    cap.textContent = SPORTS[i].cap; num.textContent = `${pad(i)} / ${pad(SPORTS.length - 1)}`;
    const el = shots[i];
    el.style.zIndex = ++zTop;
    if (RM || instant || !window.gsap) { shots.forEach((s) => s.style.setProperty('--c', s === el ? 100 : 0)); return; }
    gsap.killTweensOf(el);
    gsap.fromTo(el, { '--c': 0, '--lz': 1 }, { '--c': 100, duration: .9, ease: 'expo.inOut', onComplete: () => {
      shots.forEach((s) => { if (s !== el) s.style.setProperty('--c', 0); });
    } });
    gsap.to(el, { '--lz': 0, duration: .3, delay: .7 });
  };
  items.forEach((it) => {
    const i = +it.dataset.i;
    it.addEventListener('pointerenter', () => { list.classList.add('is-hover'); showSport(i); });
    it.addEventListener('focus', () => { list.classList.add('is-hover'); showSport(i); });
  });
  list.addEventListener('pointerleave', () => list.classList.remove('is-hover'));
  showSport(0, true);

  /* ------------------------------------------------ luz que segue o cursor */
  const quick = new WeakMap();
  const tiltTo = (el, rx, ry) => {
    if (!window.gsap) return;
    let q = quick.get(el);
    if (!q) {
      q = { x: gsap.quickTo(el, 'rotationX', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(el, 'rotationY', { duration: 1.1, ease: 'power3' }) };
      quick.set(el, q);
    }
    q.x(rx); q.y(ry);
  };
  const lightAt = (sheen, x, y) => {
    const r = sheen.getBoundingClientRect();
    if (!r.width) return;
    sheen.style.setProperty('--mx', `${((x - r.left) / r.width) * 100}%`);
    sheen.style.setProperty('--my', `${((y - r.top) / r.height) * 100}%`);
  };

  if (!RM) {
    // Palcos (hero, personalização, orçamento): o troféu inclina na direção do olhar
    $$('[data-tilt]').forEach((t) => {
      const amp = +t.dataset.tilt;
      const area = t.closest('section');
      const sheen = t.querySelector('.sheen');
      area.addEventListener('pointermove', (e) => {
        if (!fine()) return;
        const r = t.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
        tiltTo(t, -ny * amp, nx * amp);
        if (sheen) lightAt(sheen, e.clientX, e.clientY);
      });
      area.addEventListener('pointerleave', () => tiltTo(t, 0, 0));
    });
    // Peças da coleção e pílulas de material
    $$('.lit').forEach((el) => {
      const sheen = el.querySelector('.sheen');
      const t = el.querySelector('.tilt');
      el.addEventListener('pointermove', (e) => {
        if (!fine()) return;
        if (sheen) lightAt(sheen, e.clientX, e.clientY);
        if (t) {
          const r = el.getBoundingClientRect();
          tiltTo(t, -((e.clientY - r.top) / r.height - .5) * 10, ((e.clientX - r.left) / r.width - .5) * 12);
        }
      });
      el.addEventListener('pointerleave', () => { if (t) tiltTo(t, 0, 0); });
    });
    // Botões magnéticos (só com mouse)
    $$('.mag').forEach((b) => {
      let qx, qy;
      b.addEventListener('pointermove', (e) => {
        if (!fine() || !window.gsap) return;
        qx = qx || gsap.quickTo(b, 'x', { duration: .8, ease: 'power3' });
        qy = qy || gsap.quickTo(b, 'y', { duration: .8, ease: 'power3' });
        const r = b.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * .22);
        qy((e.clientY - (r.top + r.height / 2)) * .32);
      });
      b.addEventListener('pointerleave', () => { if (qx) { qx(0); qy(0); } });
    });
  }

  /* -------------------------------------------------------- sem GSAP/RM */
  if (RM || !window.gsap || !window.ScrollTrigger) {
    H.classList.add('no-intro');
    $$('.cut').forEach((c) => c.style.setProperty('--c', 100));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------------------------------------------------------------- Lenis */
  // No toque, o scroll é o do sistema: nada de inércia artificial
  let lenis = null;
  if (window.Lenis && !touch) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 ? $(id) : $('#top');
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ----------------------------------------------------- revelação laser */
  const laser = (el, d = 0, dur = isMob() ? 1.05 : 1.5) => {
    gsap.fromTo(el, { '--c': 0 }, { '--c': 100, duration: dur, delay: d, ease: 'expo.inOut' });
    gsap.fromTo(el, { '--lz': 1 }, { '--lz': 0, duration: .45, delay: d + dur * .72, ease: 'power1.out' });
  };
  const lines = (el) => $$('.ln > span', el).forEach((s, i) => { s.style.transitionDelay = `${i * .09}s`; });
  $$('.rv').forEach((el) => {
    lines(el);
    ScrollTrigger.create({ trigger: el, start: 'top 86%', once: true, onEnter: () => el.classList.add('is-in') });
  });
  // .sup-h: linhas e pílulas entram juntas, linha a linha
  $$('.sup-h .row').forEach((row, r) => {
    $$('.ln > span', row).forEach((s, i) => { s.style.transition = `transform 1.25s var(--ease) ${i * .08}s`; });
    ScrollTrigger.create({ trigger: row, start: 'top 88%', once: true, onEnter: () => {
      $$('.ln > span', row).forEach((s) => (s.style.transform = 'none'));
      $$('.cut', row).forEach((c) => laser(c, .15, 1.2));
    } });
  });
  const autoCuts = $$('.cut').filter((c) => !c.closest('.cq, .esp-frame, .fab-track, .sup-h'));
  autoCuts.forEach((c) => ScrollTrigger.create({ trigger: c, start: isMob() ? 'top 96%' : 'top 88%', once: true, onEnter: () => laser(c) }));

  /* ------------------------------------------------------------- entrada */
  const heroLines = $$('.hero-h .ln > span');
  gsap.set(heroLines, { y: 0, yPercent: 108 });
  const intro = gsap.timeline();
  if (isMob()) intro.timeScale(1.25);
  if (lenis) lenis.stop();
  intro
    .to('.intro-mark', { opacity: .7, duration: .7 }, .1)
    .to('.intro-line', { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, .15)
    .to('.intro-mark', { opacity: 0, duration: .3 }, 1.0)
    .to('.intro-half--t', { yPercent: -101, duration: 1.35, ease: 'expo.inOut' }, 1.15)
    .to('.intro-half--b', { yPercent: 101, duration: 1.35, ease: 'expo.inOut' }, 1.15)
    .to('.intro-line', { opacity: 0, duration: .5, ease: 'power1.out' }, 1.25)
    .from('.hero-obj .tilt', { scale: 1.14, yPercent: 5, autoAlpha: 0, duration: 2 }, 1.3)
    .from('.refl', { autoAlpha: 0, duration: 1.4 }, 1.9)
    .to(heroLines, { yPercent: 0, duration: 1.5, stagger: .1 }, 1.5)
    .from(['.hero-eyebrow', '.hero-foot', '.scroll-cue'], { autoAlpha: 0, y: 24, duration: 1.3, stagger: .08 }, 1.85)
    .from('.hd', { autoAlpha: 0, yPercent: -40, duration: 1.3, clearProps: 'transform' }, 1.95)
    .add(() => { if (lenis) lenis.start(); $('.intro') && $('.intro').remove(); }, 2.1);

  /* ------------------------------------------------ sinal de passagem sutil */
  const hd = $('#hd'), mcta = $('#mcta');
  const onScroll = (y, dir) => {
    hd.classList.toggle('is-hidden', dir > 0 && y > innerHeight * .6);
    hd.style.setProperty('--hd-shade', y > 40 ? 1 : 0);
  };
  if (lenis) lenis.on('scroll', (l) => onScroll(l.scroll, l.direction));
  else { let ly = 0; addEventListener('scroll', () => { const y = scrollY; onScroll(y, y > ly ? 1 : -1); ly = y; }, { passive: true }); }

  /* -------------------------------------------------- troca de capítulos */
  const railN = $('.rail-n'), railT = $('.rail-t'), railBar = $('.rail-bar');
  const navLinks = $$('.hd-nav a');
  $$('[data-rail]').forEach((sec) => {
    const [n, t] = sec.dataset.rail.split('|');
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: (s) => {
        if (!s.isActive) return;
        railN.textContent = n; railT.textContent = t;
        navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === `#${sec.id}` || (sec.id === 'acabamento' && a.getAttribute('href') === '#colecao')));
        if (sec.dataset.bg) gsap.to(document.body, { backgroundColor: sec.dataset.bg, color: sec.dataset.fg, duration: 1, ease: 'power2.out', overwrite: 'auto' });
      },
      onUpdate: (s) => railBar.style.setProperty('--p', s.progress.toFixed(3)),
    });
  });
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60%', endTrigger: '#orcamento', end: 'top 70%',
    onToggle: (s) => mcta.classList.toggle('is-on', s.isActive) });

  /* ---------------------------------------------- cenas por breakpoint */
  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 821px)', mob: MOB }, (ctx) => {
    const { desk } = ctx.conditions;
    const vh = () => innerHeight / 100;

    /* 00 · HERO — a câmera desliza até o troféu e o entrega para a história */
    const obj = $('.hero-obj');
    const toCenter = () => desk ? innerWidth / 2 - (obj.offsetLeft + obj.offsetWidth / 2) : 0;
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } })
      .to('.hero-h .w1', { xPercent: -14, autoAlpha: 0, duration: .55 }, 0)
      .to('.hero-h .w2', { xPercent: -22, autoAlpha: 0, duration: .55 }, .06)
      .to(['.hero-eyebrow', '.hero-foot', '.scroll-cue'], { autoAlpha: 0, y: -30, duration: .35 }, 0)
      .to(obj, { x: toCenter, scale: desk ? 1.16 : 1.05, duration: .7, ease: 'power2.inOut' }, 0)
      .to(obj, { y: () => (desk ? -10 : -5) * vh(), scale: desk ? 1.26 : 1.09, duration: .3, ease: 'power1.in' }, .7)
      .to('.refl', { autoAlpha: 0, duration: .3 }, .6);

    /* 01 · CONQUISTA — a chegada passa, a conquista fica */
    const cqA = $$('.cq-a .ln > span'), cqB = $$('.cq-b .ln > span');
    gsap.set([...cqA, ...cqB], { y: 0, yPercent: 108 });
    gsap.set('.cq-sub', { autoAlpha: 0, y: 20 });
    ScrollTrigger.create({ trigger: '.cq', start: 'top 82%', once: true,
      onEnter: () => gsap.to(cqA, { yPercent: 0, duration: 1.4, stagger: .1 }) });
    const cq = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.cq', start: 'top top', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true } });
    $$('.cq-ph').forEach((ph) => {
      const [y0, y1] = (desk ? ph.dataset.y : ph.dataset.ym).split(',').map(Number);
      cq.fromTo(ph, { y: () => y0 * vh() }, { y: () => y1 * vh(), duration: 1 }, 0);
      const tIn = (y0 - 96) / (y0 - y1);
      const cut = $('.cut', ph), cap = $('figcaption', ph);
      gsap.set(cap, { autoAlpha: 0 });
      if (tIn <= 0) {
        ScrollTrigger.create({ trigger: '.cq', start: 'top 45%', once: true, onEnter: () => {
          laser(cut, .1, desk ? 1.3 : 1);
          gsap.to(cap, { autoAlpha: .6, duration: .6, delay: desk ? 1.1 : .8 });
        } });
      } else {
        cq.fromTo(cut, { '--c': 0 }, { '--c': 100, duration: desk ? .09 : .06, ease: 'power2.inOut' }, tIn);
        cq.fromTo(cut, { '--lz': 1 }, { '--lz': 0, duration: .03 }, tIn + (desk ? .075 : .05));
        cq.to(cap, { autoAlpha: .6, duration: .03 }, tIn + (desk ? .08 : .055));
      }
    });
    if (desk) cq.to('.cq-a', { y: () => -26 * vh(), autoAlpha: 0, duration: .2, ease: 'power1.in' }, .3);
    else cq.to('.cq-a', { y: () => -12 * vh(), duration: .2, ease: 'power1.in' }, .3).to('.cq-a', { autoAlpha: 0, duration: .1 }, .3);
    cq
      .to(cqB, { yPercent: 0, duration: .14, stagger: .03, ease: 'power3.out' }, .44)
      .to('.cq-sub', { autoAlpha: .8, y: 0, duration: .1 }, .58)
      .set({}, {}, 1);

    /* 02 · ANATOMIA — o troféu se desmonta em camadas reais */
    const an = $('.an'), rig = $('.an-rig'), L = $$('.lyr'), steps = $$('.an-steps li');
    // Desktop: explosão em profundidade. Celular: explosão vertical, que cabe no retrato.
    const Z = desk ? [-240, -80, 125, 35, 225] : [-60, 0, 90, 10, 80];
    const Y = desk ? [0, 0, 0, 8, 13] : [-14, -5, 0, 11, 18];
    const S0 = desk ? .3 : .24, S1 = desk ? .86 : .84;
    let step = -2;
    const setStep = (p) => {
      an.classList.toggle('is-past', p >= S0);
      const i = p >= S0 && p < S1 ? Math.min(4, Math.floor((p - S0) / ((S1 - S0) / 5))) : -1;
      if (i === step) return;
      step = i;
      an.classList.toggle('is-steps', i >= 0);
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      L.forEach((l, k) => l.classList.toggle('is-on', k === i));
    };
    const sheen2 = $('.lyr[data-l="1"] .sheen');
    const at = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: an, start: 'top top', end: 'bottom bottom', scrub: .9,
      onUpdate: (s) => { setStep(s.progress); an.classList.toggle('is-end', s.progress > .9); } } });
    at.fromTo(rig, { rotationY: 0, rotationX: 0, scale: .92 }, { rotationY: desk ? -34 : -14, rotationX: desk ? 9 : 16, scale: 1, duration: desk ? .2 : .17, ease: 'power2.inOut' }, .05)
      .to('.an-grid', { opacity: 1, duration: .15 }, .1)
      .fromTo(sheen2, { '--sp': '-20%' }, { '--sp': '120%', duration: .25 }, .05);
    L.forEach((l, i) => at.to(l, { z: Z[i], yPercent: Y[i], duration: desk ? .2 : .15, ease: 'power2.inOut' }, (desk ? .09 : .07) + i * .01));
    at.to(rig, { rotationY: desk ? -18 : -8, rotationX: desk ? 5 : 12, duration: S1 - S0 }, S0)
      .to(L, { z: 0, yPercent: 0, duration: .1, ease: 'power2.inOut' }, S1)
      .to(rig, { rotationY: 0, rotationX: 0, duration: .1, ease: 'power2.inOut' }, S1)
      .to('.an-grid', { opacity: 0, duration: .08 }, .88)
      .fromTo(sheen2, { '--sp': '-20%' }, { '--sp': '120%', duration: .1 }, .9)
      .set({}, {}, 1);

    /* 03 · FÁBRICA — travelling horizontal pela produção */
    const fh = $('.fab-h'), track = $('.fab-track'), prog = $('.fab-progress');
    const frames = $$('.cut', track);
    if (desk) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const size = () => { fh.style.height = `${dist() + innerHeight}px`; };
      size();
      ScrollTrigger.addEventListener('refreshInit', size);
      const move = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
        trigger: fh, start: 'top top', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true,
        onUpdate: (s) => prog.style.setProperty('--p', s.progress.toFixed(4)) } });
      frames.forEach((c) => {
        if (c.getBoundingClientRect().left - track.getBoundingClientRect().left < innerWidth * .8) {
          ScrollTrigger.create({ trigger: fh, start: 'top 65%', once: true, onEnter: () => laser(c, .1) });
        } else {
          ScrollTrigger.create({ trigger: c, containerAnimation: move, start: 'left 88%', once: true, onEnter: () => laser(c) });
        }
      });
      $$('.fr .num', track).forEach((n) => gsap.fromTo(n, { xPercent: 40 }, { xPercent: -40, ease: 'none',
        scrollTrigger: { trigger: n.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } }));
      ctx.add(() => () => { ScrollTrigger.removeEventListener('refreshInit', size); fh.style.height = ''; });
    } else {
      // Carrossel nativo: o primeiro par é cortado a laser ao entrar; o resto já espera pronto fora da tela
      frames.forEach((c, k) => {
        if (k < 2) ScrollTrigger.create({ trigger: track, start: 'top 88%', once: true, onEnter: () => laser(c, k * .14) });
        else c.style.setProperty('--c', 100);
      });
    }

    /* 04 · COLEÇÃO e 06 · EVENTOS — profundidade discreta */
    if (desk) {
      $$('.pc[data-speed]').forEach((el) => gsap.fromTo(el, { y: () => +el.dataset.speed * vh() }, { y: () => -el.dataset.speed * vh(), ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } }));
    }
    if (desk) {
      $$('.evt-col').forEach((col) => {
        const s = +col.dataset.speed;
        if (!s) return;
        gsap.fromTo(col, { y: 0 }, { y: () => s * vh() * 3, ease: 'none',
          scrollTrigger: { trigger: '.evt-cols', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      });
      gsap.fromTo('.evt-num', { scale: .86 }, { scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.evt', start: 'top bottom', end: 'bottom top', scrub: true } });
    } else {
      gsap.from('.evt-num', { yPercent: 30, autoAlpha: 0, duration: 1.4, scrollTrigger: { trigger: '.evt-back', start: 'top 80%', once: true } });
    }

    /* 07 · ORÇAMENTO — o troféu sobe para o palco */
    gsap.from('.cta-obj .stage', { yPercent: 18, autoAlpha: 0, duration: desk ? 1.8 : 1.3, scrollTrigger: { trigger: desk ? '.cta' : '.cta-obj', start: desk ? 'top 60%' : 'top 90%', once: true } });

    /* Esportes (mobile): cartões entram com o mesmo corte */
    if (!desk) gsap.from($$('.ec').slice(0, 3), { autoAlpha: 0, x: 40, duration: 1.1, stagger: .08, clearProps: 'transform', scrollTrigger: { trigger: '#espCards', start: 'top 90%', once: true } });

    /* Toque: o brilho do hero varre sozinho */
    if (!fine()) {
      const sweep = (sel, trigger, from, to, dur) => {
        const tw = gsap.fromTo(sel, from, { ...to, duration: dur, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
        ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? tw.play() : tw.pause()) });
      };
      sweep('.hero-obj .sheen', '.hero', { '--mx': '10%', '--my': '15%' }, { '--mx': '90%', '--my': '60%' }, 3.6);
      sweep('.pers-obj .sheen', '.pers-obj', { '--mx': '0%', '--my': '20%' }, { '--mx': '100%', '--my': '70%' }, 4);
      sweep('.cta-obj .sheen', '.cta-obj', { '--mx': '0%', '--my': '20%' }, { '--mx': '100%', '--my': '70%' }, 4);
    }
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
