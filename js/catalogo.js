/* ==========================================================================
   ACHEI TROFÉUS — Catálogo + lista de orçamento
   Sem dependências. A lista fica salva no navegador e vira uma mensagem
   pronta no WhatsApp da Achei.
   ========================================================================== */
(() => {
  'use strict';

  const CFG = {
    whatsapp: '5532998042012',
    mostrarPrecos: true,           // false = catálogo só de orçamento, sem valores
    chaveLista: 'achei:lista:v1',
    chaveEvento: 'achei:evento:v1',
    maxQtd: 10000,                 // quantidade máxima por medida
  };

  const MAXQ = CFG.maxQtd;
  const D = window.ACHEI_CATALOGO;
  if (!D) return;

  const H = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const RM = H.classList.contains('rm');
  if (!CFG.mostrarPrecos) H.classList.add('no-prices');

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = (v) => brl.format(v).replace(/ /g, ' ');
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (n) => Number(n).toLocaleString('pt-BR');
  const plural = (n, um, varios) => `${num(n)} ${n === 1 ? um : varios}`;
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
  };

  /* ------------------------------------------------------------- dados */
  const cats = new Map(D.categorias.map((c) => [c.id, c]));
  const altura = (h) => {
    const m = /^([\d,]+)\s*(cm|metro)/.exec(h);
    if (!m) return 0;
    const v = parseFloat(m[1].replace(',', '.'));
    return m[2] === 'metro' ? v * 100 : v;
  };
  const fmtAlt = (cm) => (cm >= 100 ? `${(cm / 100).toLocaleString('pt-BR', { minimumFractionDigits: cm % 100 ? 2 : 0 })} m` : `${cm} cm`);
  const prods = D.produtos.map((p, i) => {
    const c = cats.get(p.c);
    const alts = p.s.map((s) => altura(s.h));
    const lo = Math.min(...alts), hi = Math.max(...alts);
    return Object.assign(p, {
      i,
      cat: c,
      min: Math.min(...p.s.map((s) => s.p)),
      top: hi,
      faixa: lo === hi ? fmtAlt(lo) : hi >= 100 ? `${fmtAlt(lo)} – ${fmtAlt(hi)}` : `${lo}–${hi} cm`,
      tipo: p.c === 'medalhas' ? 'Medalha' : 'Troféu',
      q: norm([p.n, c.n, p.k, p.k.replace('#', ''), p.g, p.c === 'medalhas' ? 'medalha' : 'trofeu'].join(' ')),
    });
  });
  const byId = new Map(prods.map((p) => [p.id, p]));
  const img = (p) => `img/catalogo/${p.id}.webp`;
  const sizeOf = (p, h) => p.s.find((s) => s.h === h);
  const splitH = (h) => { const [a, ...b] = h.split(' · '); return [a, b.join(' · ')]; };

  /* ------------------------------------------------------------- lista */
  // linhas: uma por modelo + medida · notas: personalização por modelo
  const salvo = store.get(CFG.chaveLista, null);
  const bruto = Array.isArray(salvo) ? { linhas: salvo, notas: {} } : salvo || { linhas: [], notas: {} };
  let lista = (bruto.linhas || [])
    .filter((l) => l && byId.has(l.id) && sizeOf(byId.get(l.id), l.h) && l.q > 0)
    .map((l) => ({ id: l.id, h: l.h, q: Math.min(MAXQ, l.q | 0) }));
  let notas = {};
  Object.entries(bruto.notas || {}).forEach(([id, n]) => { if (byId.has(id) && n) notas[id] = String(n).slice(0, 240); });
  (bruto.linhas || []).forEach((l) => { if (l && l.note && byId.has(l.id) && !notas[l.id]) notas[l.id] = String(l.note).slice(0, 240); });
  const persistir = () => {
    Object.keys(notas).forEach((id) => { if (!lista.some((l) => l.id === id)) delete notas[id]; });
    store.set(CFG.chaveLista, { linhas: lista, notas });
  };
  const salvar = () => { persistir(); sync(); };
  const linhasDe = (id) => lista.filter((l) => l.id === id);
  const totais = () => {
    const modelos = new Set(lista.map((l) => l.id)).size;
    const pecas = lista.reduce((a, l) => a + l.q, 0);
    const valor = lista.reduce((a, l) => a + l.q * sizeOf(byId.get(l.id), l.h).p, 0);
    return { modelos, pecas, valor };
  };

  /* ------------------------------------------------------------- header */
  const hd = $('#hd');
  const setHdh = () => H.style.setProperty('--hdh', `${hd.offsetHeight}px`);
  setHdh();
  addEventListener('resize', setHdh);
  const onScroll = () => {
    hd.classList.toggle('is-solid', scrollY > 30);
    const bar = $('#bar');
    bar.classList.toggle('is-stuck', bar.getBoundingClientRect().top <= hd.offsetHeight + 1);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menu mobile (mesmo comportamento do site)
  const menuBtn = $('#menuBtn'), mnav = $('#mnav');
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
      Object.assign(document.body.style, { position: 'fixed', top: `${-lockY}px`, left: '0', right: '0' });
    } else {
      Object.assign(document.body.style, { position: '', top: '', left: '', right: '' });
      scrollTo(0, lockY);
    }
  };
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', mnav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('resize', () => { if (menuOpen && innerWidth > 1100) setMenu(false); });

  // Entrada do hero
  const ready = () => requestAnimationFrame(() => H.classList.add('is-ready'));
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(ready);
  setTimeout(ready, 1200);
  $$('[data-total]').forEach((el) => { el.textContent = prods.length; });

  // Títulos que sobem com a máscara (mesma linguagem do site)
  const rvs = $$('.rv');
  if (RM || !('IntersectionObserver' in window)) rvs.forEach((el) => el.classList.add('is-in'));
  else {
    const rio = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    rvs.forEach((el) => rio.observe(el));
  }

  // Pódio acompanha o cursor
  const ch = $('.ch');
  if (!RM && matchMedia('(hover: hover)').matches) {
    const objs = $$('.pd-obj', ch);
    ch.addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      objs.forEach((o, i) => {
        const k = [1, 1.4, 0.8][i];
        o.style.transform = `rotateY(${x * 14 * k}deg) rotateX(${-y * 5}deg) translate3d(${x * 10 * k}px, 0, 0)`;
      });
    });
    ch.addEventListener('pointerleave', () => objs.forEach((o) => { o.style.transform = ''; }));
    objs.forEach((o) => { o.style.transition = 'transform 1.2s cubic-bezier(.16,1,.3,1)'; });
  }

  /* ------------------------------------------------------------- filtros */
  const params = new URLSearchParams(location.search);
  const st = {
    cat: cats.has(params.get('c')) ? params.get('c') : 'all',
    sub: params.get('g') || '',
    q: params.get('q') || '',
    sort: params.get('o') || 'cat',
  };
  const tabs = $('#tabs'), subs = $('#subs'), grid = $('#grid'), qIn = $('#q'), sortIn = $('#sort');
  qIn.value = st.q;
  if (matchMedia('(max-width: 820px)').matches) qIn.placeholder = 'Buscar no catálogo';
  if ([...sortIn.options].some((o) => o.value === st.sort)) sortIn.value = st.sort; else st.sort = 'cat';

  tabs.innerHTML = [{ id: 'all', n: 'Todos', q: prods.length }, ...D.categorias]
    .map((c) => `<button class="tab" role="tab" type="button" data-cat="${c.id}" aria-selected="${c.id === st.cat}">${esc(c.n)}<sup>${c.q}</sup></button>`)
    .join('');

  // Setas da barra de categorias (desktop)
  const tw = $('.tabs-wrap');
  const setas = () => {
    tw.classList.toggle('can-l', tabs.scrollLeft > 4);
    tw.classList.toggle('can-r', tabs.scrollLeft + tabs.clientWidth < tabs.scrollWidth - 4);
  };
  tabs.addEventListener('scroll', setas, { passive: true });
  addEventListener('resize', setas);
  $$('.tabs-arr', tw).forEach((b) => b.addEventListener('click', () => tabs.scrollBy({ left: Number(b.dataset.dir) * tabs.clientWidth * 0.7 })));

  // Índice: uma peça forte para representar cada coleção
  const capa = { futebol: 'futebol-bola-de-ouro', beach: 'beach-goiania', volei: 'volei-austria', medalhas: 'medalhas-futebol-04', exclusivos: 'exclusivos-triunfo',
    padel: 'padel-padel-03', ciclismo: 'ciclismo-ciclismo-mtb-4', pesca: 'pesca-pesca-7', cartas: 'cartas-poker-06', outros: 'outros-auto-04' };
  $('#idx').innerHTML = D.categorias.map((c, i) => {
    const p = byId.get(capa[c.id]) || prods.find((x) => x.c === c.id);
    return `<button class="ix" type="button" data-cat="${c.id}" aria-label="${esc(c.n)}: ${c.q} modelos">
      <img src="${img(p)}" width="440" height="550" alt="" loading="lazy" decoding="async">
      <span class="ix-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ix-b"><span class="ix-t">${esc(c.n)}</span><span class="ix-q">${c.q} modelos<svg aria-hidden="true"><use href="#i-chev"/></svg></span></span></button>`;
  }).join('');
  $('#idx').addEventListener('click', (e) => {
    const b = e.target.closest('.ix');
    if (!b) return;
    setCat(b.dataset.cat, false);
    topoAcervo(true);
  });

  let vista = [];   // ids na ordem exibida (para navegar na ficha)
  const io = !RM && 'IntersectionObserver' in window
    ? new IntersectionObserver((ents) => {
      let k = 0;
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', `${Math.min(k++, 6) * 0.06}s`);
        e.target.classList.add('is-seen');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px' })
    : null;

  const card = (p) => {
    const alt = `${p.tipo} ${p.n} — ${p.cat.n}`;
    const preco = CFG.mostrarPrecos ? `<span class="it-p"><small>a partir de</small><b>${money(p.min)}</b></span>` : '';
    return `<button class="it${io ? ' rv-it' : ''}" type="button" data-id="${p.id}" aria-label="${esc(alt)}. Ver medidas e adicionar à lista">
      <span class="it-ph"><img src="${img(p)}" width="440" height="550" alt="${esc(alt)}" loading="lazy" decoding="async">
        ${p.k ? `<span class="it-code">${esc(p.k)}</span>` : ''}<span class="it-in" data-in></span>
        <span class="it-plus" aria-hidden="true"><svg><use href="#i-plus"/></svg></span></span>
      <span class="it-b"><span class="it-n">${esc(p.n)}</span><span class="it-m">${p.faixa} · ${plural(p.s.length, 'medida', 'medidas')}</span>${preco}</span>
    </button>`;
  };

  const filtrar = () => {
    const toks = norm(st.q).split(/\s+/).filter(Boolean);
    let r = prods.filter((p) => (st.cat === 'all' || p.c === st.cat) && (!st.sub || p.g === st.sub) && toks.every((t) => p.q.includes(t)));
    const ord = {
      asc: (a, b) => a.min - b.min,
      desc: (a, b) => b.min - a.min,
      tall: (a, b) => b.top - a.top || a.min - b.min,
      az: (a, b) => a.n.localeCompare(b.n, 'pt-BR', { numeric: true }),
    }[st.sort];
    if (ord) r = r.slice().sort(ord);
    return r;
  };

  const render = () => {
    const r = filtrar();
    vista = r.map((p) => p.id);
    const agrupar = st.cat === 'all' && !st.q && st.sort === 'cat';
    let html = '', atual = '', n = 0;
    r.forEach((p) => {
      if (agrupar && p.c !== atual) {
        atual = p.c; n++;
        html += `<div class="grp"><span class="grp-n">${String(n).padStart(2, '0')}</span>
          <h3 class="grp-t">${esc(p.cat.n)}<i>${p.cat.q} modelos</i></h3>
          <button class="grp-go" type="button" data-cat="${p.c}">Ver só ${esc(p.cat.n)} <svg aria-hidden="true"><use href="#i-chev"/></svg></button></div>`;
      }
      html += card(p);
    });
    grid.innerHTML = html;
    $('#empty').hidden = r.length > 0;
    if (io) $$('.rv-it', grid).forEach((el) => io.observe(el));
    marcarCards();

    // contagem
    const onde = st.cat === 'all' ? 'todo o catálogo' : cats.get(st.cat).n + (st.sub ? ` · ${st.sub}` : '');
    $('#meta').innerHTML = st.q
      ? `<b>${r.length}</b> ${r.length === 1 ? 'resultado' : 'resultados'} para “${esc(st.q)}” em ${esc(onde)}`
      : `<b>${r.length}</b> modelos · ${esc(onde)}`;

    // abas e subgrupos
    $$('.tab', tabs).forEach((t) => t.setAttribute('aria-selected', String(t.dataset.cat === st.cat)));
    const grupos = st.cat === 'all' ? [] : [...new Set(prods.filter((p) => p.c === st.cat && p.g).map((p) => p.g))];
    subs.hidden = grupos.length < 2;
    subs.innerHTML = grupos.length < 2 ? '' : ['', ...grupos]
      .map((g) => `<button class="sub" type="button" data-sub="${esc(g)}" aria-pressed="${g === st.sub}">${g ? esc(g) : 'Todas'}</button>`).join('');

    // URL compartilhável
    const u = new URLSearchParams();
    if (st.cat !== 'all') u.set('c', st.cat);
    if (st.sub) u.set('g', st.sub);
    if (st.q) u.set('q', st.q);
    if (st.sort !== 'cat') u.set('o', st.sort);
    const qs = u.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  };

  // posição natural da barra (logo abaixo do índice), mesmo quando ela está grudada
  const topoBarra = () => $('.idx').getBoundingClientRect().bottom + scrollY - hd.offsetHeight;
  const topoAcervo = (sempre) => {
    const y = topoBarra();
    if (sempre || scrollY > y) scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  };
  const setCat = (c, rolar = true) => {
    st.cat = c; st.sub = '';
    render();
    const t = $(`.tab[data-cat="${c}"]`, tabs);
    if (t) tabs.scrollTo({ left: t.offsetLeft - 40, behavior: RM ? 'auto' : 'smooth' });
    if (rolar) topoAcervo();
  };

  tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) setCat(t.dataset.cat); });
  subs.addEventListener('click', (e) => { const b = e.target.closest('.sub'); if (b) { st.sub = b.dataset.sub; render(); } });
  grid.addEventListener('click', (e) => {
    const g = e.target.closest('.grp-go');
    if (g) { setCat(g.dataset.cat); return; }
    const it = e.target.closest('.it');
    if (it) abrirFicha(it.dataset.id);
  });
  let tq;
  qIn.addEventListener('input', () => { clearTimeout(tq); tq = setTimeout(() => { st.q = qIn.value.trim(); render(); }, 140); });
  qIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { qIn.blur(); topoAcervo(); } });
  sortIn.addEventListener('change', () => { st.sort = sortIn.value; render(); });

  const marcarCards = () => {
    const q = new Map();
    lista.forEach((l) => q.set(l.id, (q.get(l.id) || 0) + l.q));
    $$('.it', grid).forEach((el) => {
      const n = q.get(el.dataset.id) || 0;
      el.classList.toggle('is-in-list', n > 0);
      if (n) $('[data-in]', el).textContent = `Na lista · ${n}`;
    });
  };

  /* ------------------------------------------------------------- diálogos */
  const qv = $('#qv'), dr = $('#dr');
  const abrir = (d) => {
    if (d.open) return;
    d.showModal();
    H.classList.add('is-locked');
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
  };
  const fechar = (d) => {
    if (!d.open || d.dataset.closing) return;
    d.dataset.closing = '1';
    d.classList.remove('is-open');
    setTimeout(() => {
      d.close();
      delete d.dataset.closing;
      if (!qv.open && !dr.open) H.classList.remove('is-locked');
      if (d === qv && location.hash.startsWith('#p=')) history.replaceState(null, '', location.pathname + location.search);
      sync();
    }, RM ? 0 : 420);
  };
  [qv, dr].forEach((d) => {
    d.addEventListener('cancel', (e) => { e.preventDefault(); fechar(d); });
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) fechar(d); });
  });

  /* ------------------------------------------------------------- ficha */
  let fp = null, fq = {};
  const qvSizes = $('#qvSizes');

  const stepper = (val, min, label) => `<span class="step">
      <button type="button" data-d="-1" aria-label="Diminuir ${label}" ${val <= min ? 'disabled' : ''}><svg aria-hidden="true"><use href="#i-minus"/></svg></button>
      <input type="number" inputmode="numeric" min="${min}" max="${MAXQ}" value="${val}" aria-label="Quantidade ${label}">
      <button type="button" data-d="1" aria-label="Aumentar ${label}"><svg aria-hidden="true"><use href="#i-plus"/></svg></button></span>`;

  const abrirFicha = (id) => {
    const p = byId.get(id);
    if (!p) return;
    fp = p;
    const atuais = linhasDe(id);
    fq = {};
    p.s.forEach((s) => { fq[s.h] = 0; });
    atuais.forEach((l) => { fq[l.h] = l.q; });
    if (!atuais.length) fq[p.s[0].h] = 1;

    const im = $('#qvImg');
    im.classList.add('is-loading');
    im.onload = () => im.classList.remove('is-loading');
    im.src = img(p);
    im.alt = `${p.tipo} ${p.n} — ${p.cat.n}`;
    $('#qvCode').textContent = p.k;
    $('#qvCat').textContent = p.cat.n + (p.g ? ` · ${p.g}` : '');
    $('#qvName').textContent = p.n;
    $('#qvNote').value = notas[id] || '';
    $('#qvKit').hidden = new Set(p.s.map((s) => altura(s.h))).size < 3 || p.c === 'medalhas';

    qvSizes.innerHTML = p.s.map((s) => {
      const [h, extra] = splitH(s.h);
      return `<li data-h="${esc(s.h)}"><span class="sz-h">${esc(h)}${extra ? `<small>${esc(extra)}</small>` : ''}</span>
        <span class="sz-p">${money(s.p)}</span>${stepper(fq[s.h], 0, s.h)}</li>`;
    }).join('');

    const lst = vista.includes(id) ? vista : prods.map((x) => x.id);
    const pos = lst.indexOf(id);
    $('#qvPos').textContent = `${String(pos + 1).padStart(2, '0')} / ${String(lst.length).padStart(2, '0')}`;
    $('#qvPrev').dataset.id = lst[(pos - 1 + lst.length) % lst.length];
    $('#qvNext').dataset.id = lst[(pos + 1) % lst.length];

    atualizarFicha();
    history.replaceState(null, '', `${location.pathname}${location.search}#p=${id}`);
    if (!qv.open) abrir(qv);
    $('.qv-body', qv).scrollTop = 0;
    if (innerWidth <= 820) $('.qv-in', qv).scrollTop = 0;
  };

  const atualizarFicha = () => {
    if (!fp) return;
    let pecas = 0, valor = 0;
    $$('li', qvSizes).forEach((li) => {
      const h = li.dataset.h, q = fq[h] || 0;
      li.classList.toggle('is-on', q > 0);
      $('input', li).value = q;
      $('[data-d="-1"]', li).disabled = q <= 0;
      pecas += q; valor += q * sizeOf(fp, h).p;
    });
    const tinha = linhasDe(fp.id).length > 0;
    $('#qvSum').innerHTML = pecas
      ? `<b>${plural(pecas, 'peça', 'peças')}</b>${CFG.mostrarPrecos ? `<span>${money(valor)} de referência</span>` : ''}`
      : '<b>Nenhuma peça</b><span>Escolha a quantidade de cada medida</span>';
    const btn = $('#qvAdd');
    btn.disabled = !pecas && !tinha;
    $('#qvAddT').textContent = !pecas ? (tinha ? 'Remover da lista' : 'Adicionar à lista') : tinha ? 'Atualizar lista' : 'Adicionar à lista';
  };

  qvSizes.addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]');
    if (!b) return;
    const h = b.closest('li').dataset.h;
    fq[h] = Math.max(0, Math.min(MAXQ, (fq[h] || 0) + Number(b.dataset.d)));
    atualizarFicha();
  });
  qvSizes.addEventListener('input', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    const h = e.target.closest('li').dataset.h;
    fq[h] = Math.max(0, Math.min(MAXQ, parseInt(e.target.value, 10) || 0));
    atualizarFicha();
  });
  qvSizes.addEventListener('focusin', (e) => { if (e.target.tagName === 'INPUT') e.target.select(); });

  $('#qvKit').addEventListener('click', () => {
    // 3º lugar na menor medida, 1º na terceira — o degrau do pódio
    const ord = fp.s.slice().sort((a, b) => altura(a.h) - altura(b.h) || a.p - b.p).slice(0, 3).map((s) => s.h);
    fp.s.forEach((s) => { fq[s.h] = ord.includes(s.h) ? 1 : 0; });
    atualizarFicha();
    toast(`Kit pódio · 1º ${esc(ord[2])}, 2º ${esc(ord[1])}, 3º ${esc(ord[0])}`);
  });

  $('#qvAdd').addEventListener('click', () => {
    const p = fp, note = $('#qvNote').value.trim();
    const tinha = linhasDe(p.id).length > 0;
    const antes = lista.findIndex((l) => l.id === p.id);
    const novas = p.s.filter((s) => fq[s.h] > 0).map((s) => ({ id: p.id, h: s.h, q: fq[s.h] }));
    if (novas.length && note) notas[p.id] = note; else delete notas[p.id];
    lista = lista.filter((l) => l.id !== p.id);
    lista.splice(antes < 0 ? lista.length : antes, 0, ...novas);
    salvar();
    const pecas = novas.reduce((a, l) => a + l.q, 0);
    if (!pecas) toast(`<b>${esc(p.n)}</b> saiu da lista`);
    else toast(`<b>${esc(p.n)}</b> ${tinha ? 'atualizado' : 'na lista'} · ${plural(pecas, 'peça', 'peças')}`);
    bump();
    if (dr.open) desenharLista();
    fechar(qv);
  });

  ['qvPrev', 'qvNext'].forEach((k) => $(`#${k}`).addEventListener('click', (e) => abrirFicha(e.currentTarget.dataset.id)));
  qv.addEventListener('keydown', (e) => {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') $('#qvNext').click();
    if (e.key === 'ArrowLeft') $('#qvPrev').click();
  });

  /* ------------------------------------------------------------- lista (gaveta) */
  const ul = $('#lines');
  const evento = Object.assign({ nome: '', evento: '', data: '', cidade: '', uf: '', pais: '', msg: '' }, store.get(CFG.chaveEvento, {}));
  if (evento.obs && !evento.msg) { evento.msg = evento.obs; delete evento.obs; }
  $$('#evt [name]').forEach((f) => {
    f.value = evento[f.name] || '';
    f.addEventListener('input', () => { evento[f.name] = f.value; store.set(CFG.chaveEvento, evento); atualizarEnvio(); });
  });

  /* ------------------------------------------------------------- logo */
  // O link do WhatsApp só leva texto: a logo segue num segundo toque
  // (compartilhar no celular, copiar e colar no computador).
  let logo = null;
  const up = $('#up'), logoIn = $('#logo');
  const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
  const ehImagem = (f) => /^image\/(png|jpe?g|webp|gif)$/.test(f.type);
  const setLogo = (f) => {
    if (f && f.size > 25 * 1048576) { toast('Arquivo acima de 25 MB. Envie uma versão menor.'); f = null; }
    logo = f || null;
    logoIn.value = '';
    up.hidden = !!logo;
    $('#upFile').hidden = !logo;
    $('#logoStep').hidden = true;
    if (logo) {
      const th = $('#upTh');
      th.style.backgroundImage = '';
      th.textContent = '';
      if (ehImagem(logo) || logo.type === 'image/svg+xml') th.style.backgroundImage = `url("${URL.createObjectURL(logo)}")`;
      else th.textContent = (logo.name.split('.').pop() || 'arq').toUpperCase().slice(0, 4);
      $('#upName').textContent = logo.name;
      $('#upInfo').textContent = `${kb(logo.size)} · enviada após o pedido`;
    }
    atualizarEnvio();
  };
  logoIn.addEventListener('change', () => setLogo(logoIn.files[0]));
  $('#upRm').addEventListener('click', () => setLogo(null));
  ['dragenter', 'dragover'].forEach((t) => up.addEventListener(t, (e) => { e.preventDefault(); up.classList.add('is-drag'); }));
  ['dragleave', 'drop'].forEach((t) => up.addEventListener(t, () => up.classList.remove('is-drag')));
  up.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) setLogo(e.dataTransfer.files[0]); });

  const podeCompartilhar = () => !!(logo && navigator.canShare && navigator.canShare({ files: [logo] }));
  const pngDe = (f) => new Promise((ok, erro) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas');
      c.width = im.naturalWidth; c.height = im.naturalHeight;
      c.getContext('2d').drawImage(im, 0, 0);
      c.toBlob((b) => (b ? ok(b) : erro()), 'image/png');
    };
    im.onerror = erro;
    im.src = URL.createObjectURL(f);
  });
  const copiarLogo = async () => {
    if (!logo || !ehImagem(logo) || !window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) return false;
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngDe(logo) })]); return true; } catch (e) { return false; }
  };
  const mac = /Mac|iPhone|iPad/.test(navigator.platform);
  const enviarLogo = async () => {
    if (!logo) return;
    if (podeCompartilhar()) {
      try { await navigator.share({ files: [logo], title: 'Logo — pedido Achei Troféus' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    if (await copiarLogo()) toast(`<b>Logo copiada.</b> Na conversa da Achei, cole com ${mac ? '⌘V' : 'Ctrl+V'}.`);
    else toast('Arraste o arquivo da logo para a conversa da Achei no WhatsApp.');
  };
  $('#logoSend').addEventListener('click', enviarLogo);

  const grupoHTML = (id) => {
    const p = byId.get(id), ls = linhasDe(id);
    const rows = ls.map((l) => {
      const opts = p.s.map((x) => `<option value="${esc(x.h)}" ${x.h === l.h ? 'selected' : ''}>${esc(x.h)}</option>`).join('');
      return `<div class="ln-row" data-h="${esc(l.h)}">
          <select class="ln-size" aria-label="Medida de ${esc(p.n)}" ${p.s.length < 2 ? 'disabled' : ''}>${opts}</select>
          ${stepper(l.q, 1, `de ${p.n} ${l.h}`)}
          ${CFG.mostrarPrecos ? `<span class="ln-v"></span>` : ''}
          <button class="ln-rm" type="button" data-rm aria-label="Remover ${esc(p.n)} ${esc(l.h)}"><svg aria-hidden="true"><use href="#i-x"/></svg></button>
        </div>`;
    }).join('');
    return `<li class="ln-it" data-id="${p.id}">
      <button class="ln-ph" type="button" data-ficha="${p.id}" aria-label="Abrir ${esc(p.n)}"><img src="${img(p)}" alt="" width="72" height="90" loading="lazy"></button>
      <div class="ln-main">
        <div class="ln-top"><div><p class="ln-n">${esc(p.n)}</p><span class="ln-k">${esc(p.cat.n)}${p.k ? ` · ${esc(p.k)}` : ''}</span></div>
          <button class="ln-all" type="button" data-rmall>Remover</button></div>
        <div class="ln-rows">${rows}</div>
        ${ls.length < p.s.length ? `<button class="ln-more" type="button" data-ficha="${p.id}"><svg aria-hidden="true"><use href="#i-plus"/></svg>Outra medida</button>` : ''}
        <label class="ln-note"><span class="sr">Personalização de ${esc(p.n)}</span><input type="text" maxlength="240" value="${esc(notas[p.id] || '')}" placeholder="Personalização: texto da placa, categoria, cores…"></label>
      </div></li>`;
  };

  const desenharLista = () => {
    ul.innerHTML = [...new Set(lista.map((l) => l.id))].map(grupoHTML).join('');
    dr.classList.toggle('is-empty', !lista.length);
    $('#drEmpty').hidden = lista.length > 0;
    resumoLista();
  };
  const linhaDe = (el) => {
    const id = el.closest('.ln-it').dataset.id, row = el.closest('.ln-row');
    return row ? lista.find((l) => l.id === id && l.h === row.dataset.h) : null;
  };
  const resumoLista = () => {
    const t = totais();
    $('#sumPieces').textContent = num(t.pecas);
    $('#sumPieces').nextSibling.textContent = t.pecas === 1 ? ' peça · ' : ' peças · ';
    $('#sumModels').textContent = plural(t.modelos, 'modelo', 'modelos');
    $('#sumValue').textContent = money(t.valor);
    $$('.ln-row', ul).forEach((row) => {
      const l = linhaDe(row), v = $('.ln-v', row);
      if (l && v) v.textContent = money(sizeOf(byId.get(l.id), l.h).p * l.q);
    });
    atualizarEnvio();
  };

  $('#drStart').innerHTML = D.categorias.slice(0, 6).map((c) => `<button type="button" data-cat="${c.id}">${esc(c.n)}</button>`).join('');
  $('#drStart').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    fechar(dr);
    setCat(b.dataset.cat, false);
    setTimeout(() => topoAcervo(true), 120);
  });

  const sair = (el, fim) => { if (RM) fim(); else { el.classList.add('is-leaving'); setTimeout(fim, 380); } };
  ul.addEventListener('click', (e) => {
    const f = e.target.closest('[data-ficha]');
    if (f) { abrirFicha(f.dataset.ficha); return; }
    const all = e.target.closest('[data-rmall]');
    if (all) {
      const li = all.closest('.ln-it'), p = byId.get(li.dataset.id);
      sair(li, () => { lista = lista.filter((l) => l.id !== p.id); salvar(); desenharLista(); toast(`<b>${esc(p.n)}</b> saiu da lista`); });
      return;
    }
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const l = linhaDe(rm), p = byId.get(l.id), ultimo = linhasDe(l.id).length === 1;
      sair(ultimo ? rm.closest('.ln-it') : rm.closest('.ln-row'), () => {
        lista.splice(lista.indexOf(l), 1); salvar(); desenharLista(); toast(`<b>${esc(p.n)} ${esc(l.h)}</b> removido`);
      });
      return;
    }
    const b = e.target.closest('[data-d]');
    if (b) {
      const l = linhaDe(b), st2 = b.closest('.step');
      l.q = Math.max(1, Math.min(MAXQ, l.q + Number(b.dataset.d)));
      $('input', st2).value = l.q;
      $('[data-d="-1"]', st2).disabled = l.q <= 1;
      salvar(); resumoLista();
    }
  });
  ul.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('.step input')) {
      const l = linhaDe(el), v = parseInt(el.value, 10);
      if (v >= 1) { l.q = Math.min(MAXQ, v); $('[data-d="-1"]', el.closest('.step')).disabled = l.q <= 1; salvar(); resumoLista(); }
    } else if (el.matches('.ln-note input')) {
      const id = el.closest('.ln-it').dataset.id, v = el.value.trim();
      if (v) notas[id] = v.slice(0, 240); else delete notas[id];
      persistir(); atualizarEnvio();
    }
  });
  ul.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('.step input')) { el.value = linhaDe(el).q; return; }
    if (!el.matches('.ln-size')) return;
    const l = linhaDe(el), dup = lista.find((x) => x !== l && x.id === l.id && x.h === el.value);
    if (dup) { dup.q = Math.min(MAXQ, dup.q + l.q); lista.splice(lista.indexOf(l), 1); toast('Essa medida já estava na lista: <b>quantidades somadas</b>'); }
    else l.h = el.value;
    salvar(); desenharLista();
  });
  ul.addEventListener('focusin', (e) => { if (e.target.matches('.step input')) e.target.select(); });

  $('#clear').addEventListener('click', () => {
    if (!lista.length || !confirm('Limpar toda a lista de orçamento?')) return;
    lista = []; notas = {}; salvar(); desenharLista(); toast('Lista limpa');
  });

  const abrirLista = () => { desenharLista(); abrir(dr); };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-list]');
    if (!b) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    abrirLista();
  });

  /* ------------------------------------------------------------- compartilhar */
  // #l=modelo~medida~qtd.modelo~medida~qtd!modelo~personalização
  const cod = (t) => encodeURIComponent(t).replace(/[.~!]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  const linkLista = () => {
    const base = location.href.split('#')[0].split('?')[0];
    const itens = lista.map((l) => [l.id, byId.get(l.id).s.findIndex((x) => x.h === l.h), l.q].join('~')).join('.');
    const ns = Object.entries(notas).map(([id, n]) => `${id}~${cod(n)}`).join('.');
    return `${base}#l=${itens}${ns ? `!${ns}` : ''}`;
  };
  const copiar = async (txt) => {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) {
      const t = document.createElement('textarea');
      t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      (dr.open ? dr : document.body).appendChild(t); t.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      t.remove(); return ok;
    }
  };
  $('#share').addEventListener('click', async () => {
    if (!lista.length) return;
    const url = linkLista();
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: 'Minha lista — Achei Troféus', url }); return; } catch (e) { /* cancelado */ }
    }
    toast(await copiar(url) ? '<b>Link copiado.</b> Quem abrir vê a mesma lista.' : 'Não foi possível copiar o link');
  });

  const importar = () => {
    const m = /^#l=(.+)$/.exec(location.hash);
    if (!m) return false;
    try {
      const [itens, ns = ''] = m[1].split('!');
      let n = 0;
      itens.split('.').forEach((t) => {
        const [id, i, q] = t.split('~'), p = byId.get(id), s = p && p.s[Number(i)], qt = Math.min(MAXQ, parseInt(q, 10) || 0);
        if (!s || qt < 1) return;
        const ex = lista.find((l) => l.id === id && l.h === s.h);
        if (ex) ex.q = Math.max(ex.q, qt); else lista.push({ id, h: s.h, q: qt });
        n++;
      });
      ns.split('.').forEach((t) => {
        const [id, txt] = t.split('~');
        if (byId.has(id) && txt) notas[id] = decodeURIComponent(txt).slice(0, 240);
      });
      history.replaceState(null, '', location.pathname + location.search);
      if (n) { salvar(); setTimeout(() => { abrirLista(); toast('<b>Lista compartilhada</b> carregada'); }, 400); }
      return true;
    } catch (e) { return false; }
  };

  /* ------------------------------------------------------------- WhatsApp */
  const dataBR = (iso) => { const [y, m, d] = (iso || '').split('-'); return d ? `${d}/${m}/${y}` : ''; };
  const mensagem = () => {
    const t = totais();
    const L = [];
    L.push('Olá, Achei Troféus! Montei esta lista no catálogo do site e gostaria de um orçamento.');
    L.push('');
    L.push(`*MINHA LISTA* · ${plural(t.modelos, 'modelo', 'modelos')} · ${plural(t.pecas, 'peça', 'peças')}`);
    const ordem = [...new Set(lista.map((l) => l.id))];
    ordem.forEach((id, i) => {
      const p = byId.get(id);
      L.push('');
      L.push(`*${i + 1}. ${p.tipo} ${p.n}* — ${p.cat.n}${p.k ? ` · ${p.k}` : ''}`);
      linhasDe(id).forEach((l) => L.push(`   • ${l.h} × ${num(l.q)}`));
      if (notas[id]) L.push(`   _Personalização:_ ${notas[id]}`);
    });
    if (CFG.mostrarPrecos) {
      L.push('');
      L.push(`Referência pela tabela do catálogo: ${money(t.valor)} (sujeito à confirmação)`);
    }
    const ev = [
      ['Nome', evento.nome], ['Evento', evento.evento], ['Data do evento', dataBR(evento.data)],
    ].filter(([, v]) => v && String(v).trim());
    if (ev.length) {
      L.push('');
      L.push('*EVENTO*');
      ev.forEach(([k, v]) => L.push(`${k}: ${String(v).trim()}`));
    }
    const ent = [['Cidade', evento.cidade], ['Estado', evento.uf], ['País', evento.pais]].filter(([, v]) => v && v.trim());
    if (ent.length) {
      L.push('');
      L.push('*ENTREGA*');
      ent.forEach(([k, v]) => L.push(`${k}: ${v.trim()}`));
    }
    if (evento.msg && evento.msg.trim()) {
      L.push('');
      L.push('*MENSAGEM*');
      L.push(evento.msg.trim());
    }
    if (logo) {
      L.push('');
      L.push(`*LOGO / ARTE:* ${logo.name} — envio o arquivo em seguida, nesta conversa.`);
    }
    if (/^https?:/.test(location.protocol)) {
      L.push('');
      L.push(`Lista no site: ${linkLista()}`);
    }
    return L.join('\n');
  };
  const send = $('#send');
  const atualizarEnvio = () => {
    send.classList.toggle('is-off', !lista.length);
    send.href = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(mensagem())}`;
  };
  send.addEventListener('click', () => {
    if (!lista.length) return;
    if (!logo) { setTimeout(() => toast('Abrindo o WhatsApp da Achei…'), 50); return; }
    // computador: a logo já vai para a área de transferência no mesmo clique
    const celular = podeCompartilhar() && matchMedia('(pointer: coarse)').matches;
    $('#logoStep').hidden = false;
    $('#logoStepT').textContent = celular
      ? 'Volte aqui e toque para mandar o arquivo na conversa da Achei.'
      : 'Toque para copiar a logo e cole na conversa da Achei.';
    if (!celular) copiarLogo().then((ok) => { if (ok) { $('#logoStepT').textContent = `Logo copiada: cole na conversa da Achei (${mac ? '⌘V' : 'Ctrl+V'}).`; toast(`<b>Logo copiada.</b> No WhatsApp, cole com ${mac ? '⌘V' : 'Ctrl+V'}.`); } });
  });
  $$('[data-wa-custom]').forEach((a) => {
    a.href = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent('Olá, Achei Troféus! Quero criar uma peça exclusiva para o meu evento.')}`;
  });

  /* ------------------------------------------------------------- estado global */
  const dock = $('#dock');
  const sync = () => {
    const t = totais();
    $$('[data-count]').forEach((el) => { el.textContent = t.modelos; });
    $$('.list-btn').forEach((b) => b.classList.toggle('has-items', t.modelos > 0));
    dock.hidden = false;
    dock.classList.toggle('is-on', t.modelos > 0 && !dr.open && !qv.open);
    $('#dockSum').textContent = t.modelos ? `${plural(t.modelos, 'modelo', 'modelos')} · ${plural(t.pecas, 'peça', 'peças')}` : '';
    marcarCards();
    atualizarEnvio();
  };
  const bump = () => {
    [dock, ...$$('.list-btn')].forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  };

  let tt;
  const toastEl = $('#toast');
  const toast = (html) => {
    toastEl.innerHTML = html;
    toastEl.classList.remove('is-on'); void toastEl.offsetWidth; toastEl.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };

  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); }));

  /* ------------------------------------------------------------- início */
  render();
  sync();
  setas();
  const rota = () => {
    if (importar()) return;
    const m = /^#p=([\w-]+)/.exec(location.hash);
    if (m && byId.has(m[1])) abrirFicha(m[1]);
    else if (location.hash === '#lista') abrirLista();
  };
  rota();
  addEventListener('hashchange', rota);
})();
