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
    linkNaMensagem: false,         // true = inclui o link da lista no fim da mensagem
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
  // versão em arquivo único: as fotos vêm embutidas em window.ACHEI_IMG
  const img = (p) => (window.ACHEI_IMG && window.ACHEI_IMG[p.id]) || `img/catalogo/${p.id}.webp`;
  const sizeOf = (p, h) => p.s.find((s) => s.h === h);
  const splitH = (h) => { const [a, ...b] = h.split(' · '); return [a, b.join(' · ')]; };
  // Acabamento: os modelos são produzidos em ouro, prata ou bronze — é uma escolha do pedido
  const CORES = [['ouro', 'Ouro'], ['prata', 'Prata'], ['bronze', 'Bronze'], ['', 'Sem preferência']];
  const corNome = (c) => (CORES.find((x) => x[0] === c) || CORES[3])[1];
  const mesma = (a, b) => a.id === b.id && a.h === b.h && (a.c || '') === (b.c || '');

  /* ------------------------------------------------------------- lista */
  // linhas: uma por modelo + medida · notas: personalização por modelo
  const salvo = store.get(CFG.chaveLista, null);
  const bruto = Array.isArray(salvo) ? { linhas: salvo, notas: {} } : salvo || { linhas: [], notas: {} };
  let lista = (bruto.linhas || [])
    .filter((l) => l && byId.has(l.id) && sizeOf(byId.get(l.id), l.h) && l.q > 0)
    .map((l) => ({ id: l.id, h: l.h, c: CORES.some((x) => x[0] === l.c) ? l.c : '', q: Math.min(MAXQ, l.q | 0) }));
  let notas = {};
  Object.entries(bruto.notas || {}).forEach(([id, n]) => { if (byId.has(id) && n) notas[id] = String(n).slice(0, 240); });
  (bruto.linhas || []).forEach((l) => { if (l && l.note && byId.has(l.id) && !notas[l.id]) notas[l.id] = String(l.note).slice(0, 240); });
  const persistir = () => {
    Object.keys(notas).forEach((id) => { if (!lista.some((l) => l.id === id)) delete notas[id]; });
    store.set(CFG.chaveLista, { linhas: lista, notas });
  };
  const salvar = () => { persistir(); sync(); };
  const linhasDe = (id) => lista.filter((l) => l.id === id);
  // ouro, prata, bronze, sem preferência; dentro de cada cor, da menor para a maior medida
  const ordenadas = (id) => {
    const p = byId.get(id), ic = (c) => CORES.findIndex((x) => x[0] === c), is = (h) => p.s.findIndex((x) => x.h === h);
    return linhasDe(id).sort((a, b) => ic(a.c) - ic(b.c) || is(a.h) - is(b.h));
  };
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
  // Passo 1: tipo (troféus ou medalhas). Passo 2: esporte. Passo 3: linha (quando existe).
  const LOTE = 24, POR_GRUPO = 8;
  const params = new URLSearchParams(location.search);
  const tipoDe = (c) => (c === 'medalhas' ? 'medalhas' : 'trofeus');
  const catsTrofeu = D.categorias.filter((c) => c.id !== 'medalhas');
  const gruposMedalha = [...new Set(prods.filter((p) => p.c === 'medalhas').map((p) => p.g))];
  const st = {
    tipo: params.get('t') === 'medalhas' || params.get('c') === 'medalhas' ? 'medalhas' : 'trofeus',
    cat: cats.has(params.get('c')) ? params.get('c') : 'all',
    sub: params.get('g') || '',
    q: params.get('q') || '',
    alt: params.get('a') || '',
    preco: params.get('v') || '',
    sort: params.get('o') || 'cat',
    mais: LOTE,
  };
  if (st.tipo === 'medalhas') st.cat = 'medalhas';
  const seg = $('#seg'), tabs = $('#tabs'), subs = $('#subs'), grid = $('#grid'), qIn = $('#q'), sortIn = $('#sort');
  const ALTS = [['', 'Qualquer'], ['a20', 'Até 20 cm'], ['a30', '21 a 30 cm'], ['a50', '31 a 50 cm'], ['m50', 'Acima de 50 cm']];
  const PRECOS = [['', 'Qualquer', 0, 1e9], ['p1', 'Até R$ 29,99', 0, 29.99], ['p2', 'R$ 30 a 49,99', 30, 49.99], ['p3', 'R$ 50 a 99,99', 50, 99.99],
    ['p4', 'R$ 100 a 399,99', 100, 399.99], ['p5', 'Acima de R$ 400', 400, 1e9]];
  qIn.value = st.q;
  if (matchMedia('(max-width: 820px)').matches) qIn.placeholder = 'Buscar por nome ou código';
  if ([...sortIn.options].some((o) => o.value === st.sort)) sortIn.value = st.sort; else st.sort = 'cat';
  if (!ALTS.some((a) => a[0] === st.alt)) st.alt = '';
  if (!PRECOS.some((a) => a[0] === st.preco)) st.preco = '';

  const nTrofeus = prods.filter((p) => p.c !== 'medalhas').length;
  const nMedalhas = prods.length - nTrofeus;
  seg.innerHTML = [['trofeus', 'Troféus', nTrofeus], ['medalhas', 'Medalhas', nMedalhas]]
    .map(([id, n, q]) => `<button class="seg-b" role="tab" type="button" data-tipo="${id}">${n}<sup>${q}</sup></button>`).join('');

  const mini = (p) => (p ? `<img src="${img(p)}" alt="" width="40" height="50" loading="lazy">` : '<span class="chip-all" aria-hidden="true"></span>');
  const chipsHTML = () => (st.tipo === 'trofeus'
    ? [{ id: 'all', n: 'Todos', q: nTrofeus }, ...catsTrofeu].map((c) => `<button class="chip-b chip-b--img" role="tab" type="button" data-cat="${c.id}" aria-selected="${c.id === st.cat}">${mini(c.id === 'all' ? null : byId.get(capa[c.id]))}<span>${esc(c.n)}<sup>${c.q}</sup></span></button>`)
    : [['', 'Todas', nMedalhas], ...gruposMedalha.map((g) => [g, g, prods.filter((p) => p.g === g && p.c === 'medalhas').length])]
      .map(([g, n, q]) => `<button class="chip-b chip-b--img" role="tab" type="button" data-sub="${esc(g)}" aria-selected="${g === st.sub}">${mini(g ? prods.find((p) => p.c === 'medalhas' && p.g === g) : null)}<span>${esc(n)}<sup>${q}</sup></span></button>`)
  ).join('');
  const chipsSimples = (lista0, atual, attr) => lista0.map(([v, n]) => `<button class="chip-b" type="button" ${attr}="${v}" aria-pressed="${v === atual}">${esc(n)}</button>`).join('');

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
  const ALT = { a20: [0, 20], a30: [21, 30], a50: [31, 50], m50: [51, 1e4] };
  const naAltura = (p) => !st.alt || p.s.some((s) => { const h = altura(s.h), [a, b] = ALT[st.alt]; return h >= a && h <= b; });
  // valor: o modelo entra se alguma das medidas custa dentro da faixa
  const noPreco = (p) => { if (!st.preco) return true; const [, , a, b] = PRECOS.find((x) => x[0] === st.preco); return p.s.some((s) => s.p >= a && s.p <= b); };

  const filtrar = () => {
    const toks = norm(st.q).split(/\s+/).filter(Boolean);
    // a busca procura no catálogo inteiro; sem busca, respeita tipo e esporte
    let r = prods.filter((p) => (toks.length
      ? toks.every((t) => p.q.includes(t))
      : tipoDe(p.c) === st.tipo && (st.cat === 'all' || p.c === st.cat) && (!st.sub || p.g === st.sub)) && naAltura(p) && noPreco(p));
    const ord = {
      asc: (a, b) => a.min - b.min,
      desc: (a, b) => b.min - a.min,
      tall: (a, b) => b.top - a.top || a.min - b.min,
      az: (a, b) => a.n.localeCompare(b.n, 'pt-BR', { numeric: true }),
    }[st.sort];
    if (ord) r = r.slice().sort(ord);
    return r;
  };

  const grupoHead = (n, t, q, attrs, ver) => `<div class="grp"><span class="grp-n">${String(n).padStart(2, '0')}</span>
    <h3 class="grp-t">${esc(t)}<i>${plural(q, 'modelo', 'modelos')}</i></h3>
    ${ver ? `<button class="grp-go" type="button" ${attrs}>Ver ${q > POR_GRUPO ? `os ${q}` : 'só estes'} <svg aria-hidden="true"><use href="#i-chev"/></svg></button>` : ''}</div>`;
  const maisCard = (q, t, attrs) => `<button class="it-more" type="button" ${attrs}><span><b>+${q - POR_GRUPO}</b>modelos de ${esc(t)}</span><span class="it-more-go">Ver todos <svg aria-hidden="true"><use href="#i-chev"/></svg></span></button>`;

  const render = () => {
    const r = filtrar();
    vista = r.map((p) => p.id);
    // vista geral: uma prateleira por coleção (ou por linha de medalha), 8 peças em cada
    const geral = !st.q && !st.alt && !st.preco && st.sort === 'cat' && (st.tipo === 'trofeus' ? st.cat === 'all' : !st.sub);
    let html = '';
    if (geral) {
      const chave = st.tipo === 'trofeus' ? (p) => p.c : (p) => p.g;
      const grupos = [];
      r.forEach((p) => { const k = chave(p); let g = grupos.find((x) => x.k === k); if (!g) grupos.push(g = { k, ps: [] }); g.ps.push(p); });
      grupos.forEach((g, n) => {
        const t = st.tipo === 'trofeus' ? cats.get(g.k).n : `Medalhas de ${g.k}`;
        const attrs = st.tipo === 'trofeus' ? `data-cat="${g.k}"` : `data-sub="${esc(g.k)}"`;
        html += grupoHead(n + 1, t, g.ps.length, attrs, g.ps.length > POR_GRUPO);
        html += g.ps.slice(0, POR_GRUPO).map(card).join('');
        if (g.ps.length > POR_GRUPO) html += maisCard(g.ps.length, st.tipo === 'trofeus' ? cats.get(g.k).n : g.k, attrs);
      });
    } else {
      html = r.slice(0, st.mais).map(card).join('');
      if (r.length > st.mais) {
        html += `<div class="more"><p>${num(Math.min(st.mais, r.length))} de ${num(r.length)} modelos</p>
          <button class="btn btn--ink" type="button" data-more><span>Mostrar mais ${Math.min(LOTE, r.length - st.mais)}</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></button></div>`;
      }
    }
    grid.innerHTML = html;
    $('#empty').hidden = r.length > 0;
    if (io) $$('.rv-it', grid).forEach((el) => io.observe(el));
    marcarCards();

    // contagem e resumo dos filtros (barra fixa)
    const onde = st.tipo === 'medalhas'
      ? `Medalhas${st.sub ? ` · ${st.sub}` : ''}`
      : st.cat === 'all' ? 'Troféus · todos os esportes' : `Troféus · ${cats.get(st.cat).n}${st.sub ? ` · ${st.sub}` : ''}`;
    const nomeAlt = (ALTS.find((a) => a[0] === st.alt) || [])[1], nomePreco = (PRECOS.find((a) => a[0] === st.preco) || [])[1];
    const extras = [st.alt && nomeAlt.toLowerCase(), st.preco && nomePreco].filter(Boolean).join(' · ');
    $('#meta').innerHTML = st.q
      ? `<b>${r.length}</b> ${r.length === 1 ? 'resultado' : 'resultados'} para “${esc(st.q)}” no catálogo inteiro${extras ? ` · ${esc(extras)}` : ''}`
      : `<b>${r.length}</b> modelos · ${esc(onde)}${extras ? ` · ${esc(extras)}` : ''}`;
    const tags = [];
    if (st.q) tags.push(['q', `“${st.q}”`]);
    else {
      tags.push(['', st.tipo === 'medalhas' ? 'Medalhas' : 'Troféus', true]);
      if (st.tipo === 'trofeus' && st.cat !== 'all') tags.push(['cat', cats.get(st.cat).n]);
      if (st.sub) tags.push(['sub', st.sub]);
    }
    if (st.alt) tags.push(['alt', nomeAlt]);
    if (st.preco) tags.push(['preco', nomePreco]);
    $('#tags').innerHTML = tags.map(([k, n, fixo]) => (fixo ? `<span class="tag tag--fixo">${esc(n)}</span>`
      : `<button type="button" class="tag" data-tag="${k}" aria-label="Remover filtro ${esc(n)}">${esc(n)}<svg aria-hidden="true"><use href="#i-x"/></svg></button>`)).join('')
      + (tags.length > 1 ? '<button type="button" class="tag-clear" data-tag="all">Limpar</button>' : '');
    $('#barN').textContent = plural(r.length, 'modelo', 'modelos');
    $('#alts').innerHTML = chipsSimples(ALTS, st.alt, 'data-alt');
    $('#precos').innerHTML = chipsSimples(PRECOS, st.preco, 'data-preco');

    // passos 1, 2 e 3
    $$('.seg-b', seg).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tipo === st.tipo && !st.q)));
    tabs.innerHTML = chipsHTML();
    if (st.q) $$('.chip-b', tabs).forEach((b) => b.setAttribute('aria-selected', 'false'));
    const linhas = st.tipo === 'trofeus' && st.cat !== 'all' ? [...new Set(prods.filter((p) => p.c === st.cat && p.g).map((p) => p.g))] : [];
    $('#subsRow').hidden = linhas.length < 2 || !!st.q;
    subs.innerHTML = linhas.length < 2 ? '' : ['', ...linhas]
      .map((g) => `<button class="chip-b" type="button" data-sub="${esc(g)}" aria-selected="${g === st.sub}">${g ? esc(g) : 'Todas'}</button>`).join('');

    // URL compartilhável
    const u = new URLSearchParams();
    if (st.tipo === 'medalhas') u.set('t', 'medalhas');
    if (st.cat !== 'all' && st.tipo === 'trofeus') u.set('c', st.cat);
    if (st.sub) u.set('g', st.sub);
    if (st.q) u.set('q', st.q);
    if (st.alt) u.set('a', st.alt);
    if (st.preco) u.set('v', st.preco);
    if (st.sort !== 'cat') u.set('o', st.sort);
    const qs = u.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  };

  // posição natural da barra (logo abaixo do painel de filtros), mesmo quando ela está grudada
  const topoBarra = () => $('#flt').getBoundingClientRect().bottom + scrollY - hd.offsetHeight;
  const topoAcervo = (sempre) => {
    const y = topoBarra();
    if (sempre || scrollY > y) scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  };
  const limparBusca = () => { if (st.q) { st.q = ''; qIn.value = ''; } };
  const setTipo = (t) => {
    limparBusca();
    st.tipo = t; st.cat = t === 'medalhas' ? 'medalhas' : 'all'; st.sub = ''; st.mais = LOTE;
    render(); topoAcervo();
  };
  const setCat = (c, rolar = true) => {
    limparBusca();
    st.tipo = tipoDe(c); st.cat = c === 'medalhas' ? 'medalhas' : c; st.sub = ''; st.mais = LOTE;
    render();
    const t = $(`.chip-b[aria-selected="true"]`, tabs);
    if (t) tabs.scrollTo({ left: t.offsetLeft - 40, behavior: RM ? 'auto' : 'smooth' });
    if (rolar) topoAcervo();
  };
  const setSub = (g, rolar = true) => { limparBusca(); st.sub = g; st.mais = LOTE; render(); if (rolar) topoAcervo(); };

  seg.addEventListener('click', (e) => { const b = e.target.closest('.seg-b'); if (b) setTipo(b.dataset.tipo); });
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.chip-b');
    if (!b) return;
    if (b.dataset.cat) setCat(b.dataset.cat); else { if (st.q) { limparBusca(); st.tipo = 'medalhas'; st.cat = 'medalhas'; } setSub(b.dataset.sub); }
  });
  subs.addEventListener('click', (e) => { const b = e.target.closest('.chip-b'); if (b) setSub(b.dataset.sub, false); });
  $('#alts').addEventListener('click', (e) => { const b = e.target.closest('[data-alt]'); if (b) { st.alt = b.dataset.alt; st.mais = LOTE; render(); } });
  $('#precos').addEventListener('click', (e) => { const b = e.target.closest('[data-preco]'); if (b) { st.preco = b.dataset.preco; st.mais = LOTE; render(); } });
  $('#tags').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tag]');
    if (!b) return;
    const k = b.dataset.tag;
    if (k === 'q' || k === 'all') limparBusca();
    if (k === 'cat' || k === 'all') { st.cat = st.tipo === 'medalhas' ? 'medalhas' : 'all'; st.sub = ''; }
    if (k === 'sub') st.sub = '';
    if (k === 'alt' || k === 'all') st.alt = '';
    if (k === 'preco' || k === 'all') st.preco = '';
    st.mais = LOTE; render();
  });
  $('#toFlt').addEventListener('click', () => {
    const y = $('#flt').getBoundingClientRect().top + scrollY - hd.offsetHeight - 10;
    scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  });
  grid.addEventListener('click', (e) => {
    const g = e.target.closest('.grp-go, .it-more');
    if (g) { if (g.dataset.cat) setCat(g.dataset.cat); else setSub(g.dataset.sub); return; }
    if (e.target.closest('[data-more]')) { st.mais += LOTE; render(); return; }
    const it = e.target.closest('.it');
    if (it) abrirFicha(it.dataset.id);
  });
  let tq;
  qIn.addEventListener('input', () => { clearTimeout(tq); tq = setTimeout(() => { st.q = qIn.value.trim(); st.mais = LOTE; render(); }, 140); });
  qIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { qIn.blur(); topoAcervo(true); } });
  sortIn.addEventListener('change', () => { st.sort = sortIn.value; st.mais = LOTE; render(); });

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
  let fp = null, fq = {}, fc = '';   // fq: quantidades por "cor|medida"; fc: cor em edição
  const fk = (c, h) => `${c}|${h}`;
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
    atuais.forEach((l) => { fq[fk(l.c, l.h)] = l.q; });
    fc = atuais.length ? atuais[0].c : '';
    if (!atuais.length) fq[fk(fc, p.s[0].h)] = 1;

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
        <span class="sz-p">${money(s.p)}</span>${stepper(fq[fk(fc, s.h)] || 0, 0, s.h)}</li>`;
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
      const h = li.dataset.h, q = fq[fk(fc, h)] || 0;
      li.classList.toggle('is-on', q > 0);
      $('input', li).value = q;
      $('[data-d="-1"]', li).disabled = q <= 0;
    });
    Object.entries(fq).forEach(([k, q]) => { if (q > 0) { pecas += q; valor += q * sizeOf(fp, k.split('|')[1]).p; } });
    // cores: a escolhida em destaque, as outras mostram quantas peças já têm
    $$('.cor-b', $('#qvCores')).forEach((b) => {
      const c = b.dataset.cor, n = fp.s.reduce((a, s) => a + (fq[fk(c, s.h)] || 0), 0);
      b.setAttribute('aria-pressed', String(c === fc));
      $('i', b).textContent = n ? num(n) : '';
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
    const k = fk(fc, b.closest('li').dataset.h);
    fq[k] = Math.max(0, Math.min(MAXQ, (fq[k] || 0) + Number(b.dataset.d)));
    atualizarFicha();
  });
  qvSizes.addEventListener('input', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    fq[fk(fc, e.target.closest('li').dataset.h)] = Math.max(0, Math.min(MAXQ, parseInt(e.target.value, 10) || 0));
    atualizarFicha();
  });
  qvSizes.addEventListener('focusin', (e) => { if (e.target.tagName === 'INPUT') e.target.select(); });
  $('#qvCores').innerHTML = CORES.map(([c, n]) => `<button type="button" class="cor-b" data-cor="${c}" aria-pressed="false"><span class="cor-dot cor-dot--${c || 'livre'}"></span>${n}<i></i></button>`).join('');
  $('#qvCores').addEventListener('click', (e) => { const b = e.target.closest('.cor-b'); if (b) { fc = b.dataset.cor; atualizarFicha(); } });

  $('#qvKit').addEventListener('click', () => {
    // 3º lugar na menor medida, 1º na terceira — o degrau do pódio
    const ord = fp.s.slice().sort((a, b) => altura(a.h) - altura(b.h) || a.p - b.p).slice(0, 3).map((s) => s.h);
    fq = {};
    fq[fk('ouro', ord[2])] = 1; fq[fk('prata', ord[1])] = 1; fq[fk('bronze', ord[0])] = 1;
    fc = 'ouro';
    atualizarFicha();
    toast(`Kit pódio · 1º ouro ${esc(ord[2])}, 2º prata ${esc(ord[1])}, 3º bronze ${esc(ord[0])}`);
  });

  $('#qvAdd').addEventListener('click', () => {
    const p = fp, note = $('#qvNote').value.trim();
    const tinha = linhasDe(p.id).length > 0;
    const antes = lista.findIndex((l) => l.id === p.id);
    const novas = [];
    CORES.forEach(([c]) => p.s.forEach((s) => { const q = fq[fk(c, s.h)] || 0; if (q > 0) novas.push({ id: p.id, h: s.h, c, q }); }));
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


  const grupoHTML = (id) => {
    const p = byId.get(id), ls = ordenadas(id);
    const rows = ls.map((l) => {
      const opts = p.s.map((x) => `<option value="${esc(x.h)}" ${x.h === l.h ? 'selected' : ''}>${esc(x.h)}</option>`).join('');
      const cores = CORES.map(([c, n]) => `<option value="${c}" ${c === l.c ? 'selected' : ''}>${n}</option>`).join('');
      return `<div class="ln-row" data-h="${esc(l.h)}" data-c="${l.c}">
          <span class="ln-sels"><select class="ln-size" aria-label="Medida de ${esc(p.n)}" ${p.s.length < 2 ? 'disabled' : ''}>${opts}</select>
          <select class="ln-cor" aria-label="Cor de ${esc(p.n)}">${cores}</select></span>
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
        <button class="ln-more" type="button" data-ficha="${p.id}"><svg aria-hidden="true"><use href="#i-plus"/></svg>Outra medida ou cor</button>
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
    return row ? lista.find((l) => l.id === id && l.h === row.dataset.h && l.c === row.dataset.c) : null;
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
        lista.splice(lista.indexOf(l), 1); salvar(); desenharLista(); toast(`<b>${esc(p.n)} ${esc(l.h)}${l.c ? ` ${corNome(l.c).toLowerCase()}` : ''}</b> removido`);
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
    if (!el.matches('.ln-size, .ln-cor')) return;
    const l = linhaDe(el), novo = { id: l.id, h: l.h, c: l.c };
    if (el.matches('.ln-size')) novo.h = el.value; else novo.c = el.value;
    const dup = lista.find((x) => x !== l && mesma(x, novo));
    if (dup) { dup.q = Math.min(MAXQ, dup.q + l.q); lista.splice(lista.indexOf(l), 1); toast('Essa combinação já estava na lista: <b>quantidades somadas</b>'); }
    else Object.assign(l, novo);
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
    const itens = lista.map((l) => [l.id, byId.get(l.id).s.findIndex((x) => x.h === l.h), l.q, l.c].join('~')).join('.');
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
        const [id, i, q, c0] = t.split('~'), p = byId.get(id), s = p && p.s[Number(i)], qt = Math.min(MAXQ, parseInt(q, 10) || 0);
        const c = CORES.some((x) => x[0] === c0) ? c0 : '';
        if (!s || qt < 1) return;
        const ex = lista.find((l) => mesma(l, { id, h: s.h, c }));
        if (ex) ex.q = Math.max(ex.q, qt); else lista.push({ id, h: s.h, c, q: qt });
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
    const SEP = '━━━━━━━━━━━━━━━━';
    const L = [];
    const linha = (x = '') => L.push(x);
    linha('Olá, Achei Troféus! Montei este pedido no catálogo do site e gostaria de um orçamento.');
    linha();
    linha(SEP);
    linha(`*PEDIDO* · ${plural(t.modelos, 'modelo', 'modelos')} · ${plural(t.pecas, 'peça', 'peças')}`);
    linha(SEP);
    // troféus primeiro, depois medalhas, na ordem em que entraram na lista
    const ordem = [...new Set(lista.map((l) => l.id))];
    const blocos = [['Troféus', ordem.filter((id) => byId.get(id).c !== 'medalhas')], ['Medalhas', ordem.filter((id) => byId.get(id).c === 'medalhas')]]
      .filter(([, ids]) => ids.length);
    let n = 0;
    blocos.forEach(([titulo, ids]) => {
      if (blocos.length > 1) { linha(); linha(`▸ *${titulo.toUpperCase()}*`); }
      ids.forEach((id) => {
        const p = byId.get(id), ls = ordenadas(id);
        n++;
        linha();
        linha(`*${n}. ${p.tipo} ${p.n}*`);
        linha(`${p.cat.n}${p.g && p.c !== 'medalhas' ? ` · ${p.g}` : ''}${p.k ? ` · Cód. ${p.k}` : ''}`);
        ls.forEach((l) => {
          const v = CFG.mostrarPrecos ? ` — ${money(sizeOf(p, l.h).p * l.q)}` : '';
          linha(`• ${l.h.replace(/^(\d+)cm/, '$1 cm')}${l.c ? ` · ${corNome(l.c)}` : ''}: ${num(l.q)} ${l.q === 1 ? 'unidade' : 'unidades'}${v}`);
        });
        if (notas[id]) linha(`✎ Personalização: ${notas[id]}`);
      });
    });
    if (CFG.mostrarPrecos) {
      linha();
      linha(SEP);
      linha(`*Valor de referência:* ${money(t.valor)}`);
      linha('_Pela tabela do catálogo. Personalização, prazo e frete a confirmar._');
    }
    const lugar = [evento.cidade, evento.uf].map((v) => (v || '').trim()).filter(Boolean).join(' – ');
    const pais = (evento.pais || '').trim();
    if (lugar || pais) {
      linha();
      linha('*ENTREGA*');
      linha([lugar, pais].filter(Boolean).join(', '));
    }
    const ev = [['Nome', evento.nome], ['Evento', evento.evento], ['Data', dataBR(evento.data)]].filter(([, v]) => v && String(v).trim());
    if (ev.length) {
      linha();
      linha('*EVENTO*');
      ev.forEach(([k, v]) => linha(`${k}: ${String(v).trim()}`));
    }
    if (evento.msg && evento.msg.trim()) {
      linha();
      linha('*MENSAGEM*');
      linha(evento.msg.trim());
    }
    if (CFG.linkNaMensagem && /^https?:/.test(location.protocol)) {
      linha();
      linha(`Lista no site: ${linkLista()}`);
    }
    linha();
    linha('Aguardo o orçamento. Obrigado!');
    return L.join('\n');
  };
  const send = $('#send');
  const atualizarEnvio = () => {
    send.classList.toggle('is-off', !lista.length);
    send.href = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(mensagem())}`;
  };
  send.addEventListener('click', () => { if (lista.length) setTimeout(() => toast('Abrindo o WhatsApp da Achei…'), 50); });
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
  const rota = () => {
    if (importar()) return;
    const m = /^#p=([\w-]+)/.exec(location.hash);
    if (m && byId.has(m[1])) abrirFicha(m[1]);
    else if (location.hash === '#lista') abrirLista();
  };
  rota();
  addEventListener('hashchange', rota);
})();
