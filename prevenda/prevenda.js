/* Achei Troféus — Pré-venda "Próxima Conquista"
   Tudo que é regra da campanha mora em DADOS, logo abaixo. Para mudar valores,
   pacotes, janelas ou sorteios, edite só este bloco. */
(function () {
  'use strict';

  /* ======================================================================
     DADOS DA CAMPANHA (em validação nesta prévia)
     ====================================================================== */
  // Horário de Brasília (UTC-3, sem horário de verão).
  var T_ABRE = Date.parse('2026-11-16T20:00:00-03:00');
  var T_H1 = Date.parse('2026-11-16T21:00:00-03:00');
  var T_H24 = Date.parse('2026-11-17T20:00:00-03:00');
  var T_FIM = Date.parse('2026-11-18T20:00:00-03:00');

  var WHATS = 'https://wa.me/5532998042012';
  var MIN_BONUS = 1300;       // abaixo disso: só o desconto da campanha
  var MIN_MUNDIAL = 5000;     // em outros produtos e kits
  var MEDALHA_CENT = 1129;    // média já vendida, medalha de metal
  var TROFEU_CENT = 2079;     // média já vendida, troféu de 15 cm
  var MAIS_MEDALHAS = 10;     // janelas 1ª hora e 24h

  var PACOTES = [
    { min: 1300, m: 10, t: 0, x: 'Chaveiro da modalidade' },
    { min: 1500, m: 15, t: 2, x: 'Boné, viseira ou munhequeira' },
    { min: 2000, m: 20, t: 3, x: 'Item da modalidade (bola, bolinhas ou similar)' },
    { min: 3000, m: 30, t: 5, x: '10% de cashback na próxima compra' },
    { min: 5000, m: 50, t: 10, x: 'Copo ou boné com a sua marca' },
    { min: 7500, m: 80, t: 15, x: 'Camisa autografada' },
    { min: 10000, m: 120, t: 25, x: 'Visita ao bastidor ou camarote' },
    { min: 15000, m: 200, t: 40, x: 'Gravação do nome em troféu ou copo' }
  ];

  var JANELAS = [
    { nome: '1ª hora', na: 'na 1ª hora', fim: T_H1 },
    { nome: 'Até 24h', na: 'na janela de 24h', fim: T_H24 },
    { nome: 'Até 48h', na: 'na janela de 48h', fim: T_FIM }
  ];

  // Sorteio i vale para quem compra na janela i ou antes.
  var SORTEIOS = [
    'Concorre a 1 ano de troféus grátis, com teto de R$ 10.000 em produtos (proposta)',
    'Concorre a 1 visita ao bastidor do Flamengo e 3 camisas autografadas (quantidades propostas)',
    'Concorre a 10 kits da modalidade (bola, bolinhas ou similar)'
  ];

  var MUNDIAL = [
    { cm: 22, de: 23920, por: 7176 },
    { cm: 35, de: 42090, por: 12627 },
    { cm: 50, de: 89900, por: 26970 },
    { cm: 60, de: 109900, por: 32970 }
  ];

  // Trilho: uma marca por pacote, espaçamento igual entre marcas.
  var MARCAS = [0, 1300, 1500, 2000, 3000, 5000, 7500, 10000, 15000];
  var ROTULOS = ['0', '1,3k', '1,5k', '2k', '3k', '5k', '7,5k', '10k', '15k'];
  var RAIL_MAX = 15000;

  /* ======================================================================
     Utilidades
     ====================================================================== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = document.documentElement.classList.contains('rm');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var milhar = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var reais = function (v) { return 'R$ ' + milhar(v); };
  var centavos = function (c) {
    var neg = c < 0; c = Math.abs(Math.round(c));
    return (neg ? '−' : '') + 'R$ ' + milhar(Math.floor(c / 100)) + ',' + String(c % 100).padStart(2, '0');
  };
  var pct = function (x) { return (Math.round(x * 10) / 10).toFixed(1).replace('.', ',') + '%'; };
  var lower1 = function (s) { return s.charAt(0).toLowerCase() + s.slice(1); };
  var ico = function (id, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true"><use href="#' + id + '"/></svg>'; };
  var wa = function (msg) { return WHATS + '?text=' + encodeURIComponent(msg); };

  // Relógio. ?agora=2026-11-16T20:30 simula outro momento (útil para aprovar os estados).
  var OFFSET = 0;
  (function () {
    var q = new URLSearchParams(location.search).get('agora');
    if (!q) return;
    var iso = q;
    if (!/[zZ]|[+-]\d\d:?\d\d$/.test(iso)) {
      if (/T\d\d:\d\d$/.test(iso)) iso += ':00';
      iso += '-03:00';
    }
    var t = Date.parse(iso);
    if (!isNaN(t)) OFFSET = t - Date.now();
  })();
  var agora = function () { return Date.now() + OFFSET; };

  // -1 antes, 0 1ª hora, 1 até 24h, 2 até 48h, 3 encerrada
  function fase(t) {
    if (t < T_ABRE) return -1;
    if (t < T_H1) return 0;
    if (t < T_H24) return 1;
    if (t < T_FIM) return 2;
    return 3;
  }

  function partes(ms) {
    ms = Math.max(0, ms);
    var s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  }
  var p2 = function (n) { return String(n).padStart(2, '0'); };

  /* ======================================================================
     Regra de cálculo
     ====================================================================== */
  function pacoteDe(v) {
    var p = null;
    for (var i = 0; i < PACOTES.length; i++) if (v >= PACOTES[i].min) p = PACOTES[i];
    return p;
  }
  function proximo(p) {
    if (!p) return PACOTES[0];
    var i = PACOTES.indexOf(p);
    return PACOTES[i + 1] || null;
  }
  function calc(v, w) {
    var p = pacoteDe(v);
    if (!p) return { p: null, medalhas: 0, dobro: 0, janela: 0, trofeus: 0, extras: [], sorteios: [] };
    var dobro = w === 0 ? p.m : 0;
    var jan = w <= 1 ? MAIS_MEDALHAS : 0;
    return {
      p: p,
      medalhas: p.m + dobro + jan,
      dobro: dobro,
      janela: jan,
      trofeus: p.t,
      extras: PACOTES.filter(function (k) { return k.min <= p.min; }).map(function (k) { return k.x; }),
      sorteios: SORTEIOS.slice(w)
    };
  }

  /* ======================================================================
     Estado
     ====================================================================== */
  var faseAtual = fase(agora());
  var S = { v: 3000, w: faseAtual >= 0 && faseAtual <= 2 ? faseAtual : 0 };

  /* ======================================================================
     Grupos de rádio com teclado (setas)
     ====================================================================== */
  function radio(group, onPick) {
    var items = $$('[role="radio"]', group);
    function pick(el, focus) {
      items.forEach(function (b) {
        var on = b === el;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      if (focus) el.focus();
      onPick(el, items.indexOf(el));
    }
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(b, false); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % items.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + items.length) % items.length;
        if (k === 'Home') j = 0;
        if (k === 'End') j = items.length - 1;
        if (j !== null) { e.preventDefault(); pick(items[j], true); }
      });
    });
    return { pick: pick, items: items };
  }

  /* ======================================================================
     Contagem regressiva, janelas e status
     ====================================================================== */
  var cdBoxes = $$('.cd');
  var hdStatus = $('#hdStatus');
  var mbarLbl = $('#mbarLbl'), mbarT = $('#mbarT');
  var tlNow = $('#tlNow');
  var wCards = $$('#wGrid .w');
  var segLabels = $$('#simWin label');

  function setDigits(box, t) {
    ['d', 'h', 'm', 's'].forEach(function (u) {
      var el = $('[data-u="' + u + '"]', box);
      if (!el) return;
      var val = p2(t[u]);
      if (el.textContent !== val) {
        el.textContent = val;
        if (!RM) { el.classList.remove('tick-anim'); void el.offsetWidth; el.classList.add('tick-anim'); }
      }
    });
  }

  function tick() {
    var t = agora();
    var f = fase(t);
    var alvo = f < 0 ? T_ABRE : T_FIM;
    var rest = partes(alvo - t);
    var lbl = f < 0 ? 'A pré-venda abre em' : f <= 2 ? 'A pré-venda termina em' : 'Pré-venda encerrada';

    cdBoxes.forEach(function (box) {
      var l = $('.cd-lbl', box);
      if (l) l.innerHTML = (f >= 0 && f <= 2 ? '<span class="live" aria-hidden="true"></span>' : '') + lbl;
      setDigits(box, f > 2 ? { d: 0, h: 0, m: 0, s: 0 } : rest);
      box.classList.toggle('is-live', f >= 0 && f <= 2);
    });

    var sub = $('#cdSub');
    if (sub) {
      if (f < 0) sub.textContent = '16/11, às 20h (Brasília) até 18/11, às 20h';
      else if (f <= 2) {
        var wr = partes(JANELAS[f].fim - t);
        var wtxt = (wr.d ? wr.d + 'd ' : '') + p2(wr.h) + ':' + p2(wr.m) + ':' + p2(wr.s);
        sub.textContent = 'Você está comprando ' + JANELAS[f].na + (f < 2 ? '. Esta janela fecha em ' + wtxt + '.' : '. Últimas horas da pré-venda.');
      } else sub.textContent = 'A pré-venda durou 48 horas, de 16/11 a 18/11.';
    }

    if (hdStatus) {
      hdStatus.textContent = f < 0 ? 'Pré-venda 16/11 · 20h · só 48 horas'
        : f === 0 ? 'Aberta · 1ª hora, até 21h'
        : f === 1 ? 'Aberta · até 24h, fecha 17/11 às 20h'
        : f === 2 ? 'Aberta · até 48h, fecha 18/11 às 20h'
        : 'Pré-venda encerrada';
    }

    if (mbarT) {
      mbarLbl.textContent = f < 0 ? 'Abre em' : f <= 2 ? 'Termina em' : 'Encerrada';
      mbarT.textContent = f > 2 ? '00:00:00' : (rest.d ? rest.d + 'd ' : '') + p2(rest.h) + ':' + p2(rest.m) + ':' + p2(rest.s);
    }

    // Linha do tempo das janelas (segmentos 1,1 : 3 : 3, não proporcionais)
    if (tlNow) {
      var x = null;
      if (f === 0) x = (t - T_ABRE) / (T_H1 - T_ABRE) * 1.1;
      if (f === 1) x = 1.1 + (t - T_H1) / (T_H24 - T_H1) * 3;
      if (f === 2) x = 4.1 + (t - T_H24) / (T_FIM - T_H24) * 3;
      tlNow.classList.toggle('on', x !== null);
      if (x !== null) tlNow.style.setProperty('--x', (x / 7.1 * 100) + '%');
    }

    wCards.forEach(function (c, i) {
      var st = $('[data-state]', c);
      c.classList.toggle('is-now', f === i);
      c.classList.toggle('is-closed', f > i);
      var txt = '';
      if (f < 0 && i === 0) { var a = partes(T_ABRE - t); txt = 'Abre em ' + (a.d ? a.d + 'd ' : '') + p2(a.h) + 'h' + p2(a.m); }
      else if (f === i) { var r = partes(JANELAS[i].fim - t); txt = '<span class="live" aria-hidden="true"></span>Agora · fecha em ' + (r.d ? r.d + 'd ' : '') + p2(r.h) + ':' + p2(r.m) + ':' + p2(r.s); }
      else if (f > i && f <= 2) txt = 'Fechada';
      else if (f > 2) txt = 'Encerrada';
      if (st.innerHTML !== txt) st.innerHTML = txt;
    });

    if (f !== faseAtual) { faseAtual = f; syncSeg(); syncHot(f); }
  }

  function syncSeg() {
    var live = faseAtual >= 0 && faseAtual <= 2;
    segLabels.forEach(function (lab, i) {
      var inp = $('input', lab);
      var closed = live && i < faseAtual;
      inp.disabled = closed;
      lab.classList.toggle('is-now', live && i === faseAtual);
      lab.title = closed ? 'Janela fechada' : '';
    });
    if (live && S.w < faseAtual) { S.w = faseAtual; render(); }
    var cur = $('input[value="' + S.w + '"]', $('#simWin'));
    if (cur) cur.checked = true;
  }

  /* ======================================================================
     Troféu Mundial: tamanhos
     ====================================================================== */
  (function () {
    var g = $('#sizes'); if (!g) return;
    var de = $('#pDe'), por = $('#pPor'), eco = $('#pEco'), obj = $('#munObj');
    var marks = $$('#ruler span');
    var rows = $$('.mun-tbl tbody tr');
    function show(i, anim) {
      var s = MUNDIAL[i];
      de.textContent = centavos(s.de);
      por.textContent = centavos(s.por);
      eco.textContent = centavos(s.de - s.por);
      obj.style.setProperty('--s', (s.cm / 60).toFixed(3));
      marks.forEach(function (m, k) { m.classList.toggle('on', k === 3 - i); });
      rows.forEach(function (r, k) { r.classList.toggle('on', k === i); });
      if (anim && !RM) { por.classList.remove('bump'); void por.offsetWidth; por.classList.add('bump'); }
    }
    radio(g, function (el, i) { show(i, true); });
    show(0, false);
  })();

  /* ======================================================================
     Simulador
     ====================================================================== */
  var rail = $('#rail'), thumb = $('#thumb'), bubble = $('#bubble');
  var input = $('#simVal');
  var ticksBox = $('#railTicks');
  var o = {
    val: $('#oVal'), win: $('#oWin'), med: $('#oMed'), tro: $('#oTro'), sum: $('#oSum'),
    ext: $('#oExt'), sort: $('#oSort'), valTxt: $('#oValTxt'), next: $('#oNext'), mun: $('#oMun'),
    kits: $('#oKits'), lootM: $('#lootM'), lootT: $('#lootT'), live: $('#simLive')
  };
  var loot = $('.loot');
  var SEG = MARCAS.length - 1;

  function v2p(v) {
    v = clamp(v, 0, RAIL_MAX);
    for (var i = 0; i < SEG; i++) {
      if (v <= MARCAS[i + 1]) return (i + (v - MARCAS[i]) / (MARCAS[i + 1] - MARCAS[i])) / SEG;
    }
    return 1;
  }
  function p2v(p) {
    p = clamp(p, 0, 1);
    var f = p * SEG, i = Math.min(SEG - 1, Math.floor(f));
    return MARCAS[i] + (f - i) * (MARCAS[i + 1] - MARCAS[i]);
  }

  var tickEls = MARCAS.map(function (m, i) {
    var li = document.createElement('li');
    li.style.setProperty('--x', (i / SEG * 100) + '%');
    if (m === MIN_MUNDIAL) li.className = 'is-mun';
    li.innerHTML = '<span>' + ROTULOS[i] + '</span>';
    ticksBox.appendChild(li);
    return li;
  });

  function countTo(el, to) {
    var from = +(el.getAttribute('data-v') || 0);
    el.setAttribute('data-v', to);
    if (RM || from === to) { el.textContent = to; return; }
    var t0 = performance.now(), dur = 420;
    cancelAnimationFrame(el._raf);
    (function step(t) {
      var k = Math.min(1, (t - t0) / dur);
      k = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * k);
      if (k < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }

  function renderLoot(r) {
    var box = o.lootM, have = box.children.length, want = r.medalhas;
    var pm = r.p ? r.p.m : 0;
    for (var i = have; i < want; i++) {
      var d = document.createElement('i');
      if (!RM) d.style.animationDelay = Math.min(i - have, 80) * 4 + 'ms';
      box.appendChild(d);
    }
    while (box.children.length > want) box.removeChild(box.lastChild);
    for (var j = 0; j < want; j++) {
      var cls = j < pm ? '' : j < pm + r.dobro ? 'd' : 'j';
      box.children[j].className = cls + (j >= have ? ' n' : '');
    }
    var tb = o.lootT, th = tb.children.length;
    for (var k = th; k < r.trofeus; k++) {
      var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      var u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      u.setAttribute('href', '#i-tro-f');
      s.appendChild(u);
      s.setAttribute('class', 'n');
      if (!RM) s.style.animationDelay = (k - th) * 14 + 'ms';
      tb.appendChild(s);
    }
    while (tb.children.length > r.trofeus) tb.removeChild(tb.lastChild);
    loot.classList.toggle('is-empty', want === 0);
  }

  var liveTimer;
  function render(opts) {
    opts = opts || {};
    var v = S.v, w = S.w, r = calc(v, w), p = r.p;
    var pos = v2p(v);

    rail.style.setProperty('--p', (pos * 100) + '%');
    rail.classList.toggle('at-start', pos < .07);
    rail.classList.toggle('at-end', pos > .93);
    bubble.textContent = reais(v);
    thumb.setAttribute('aria-valuenow', Math.min(v, RAIL_MAX));
    thumb.setAttribute('aria-valuetext', reais(v) + (p ? ', pacote de ' + p.m + ' medalhas' + (p.t ? ' e ' + p.t + ' troféus' : '') : ', sem pacote'));
    tickEls.forEach(function (li, i) { li.classList.toggle('on', MARCAS[i] <= v && MARCAS[i] > 0); });
    if (!opts.fromInput) input.value = v;

    o.val.textContent = reais(v);
    o.win.textContent = JANELAS[w].nome;
    countTo(o.med, r.medalhas);
    countTo(o.tro, r.trofeus);
    renderLoot(r);

    if (p) {
      var parts = [p.m + ' do pacote'];
      if (r.dobro) parts.push(r.dobro + ' do dobro');
      if (r.janela) parts.push(r.janela + ' da janela');
      o.sum.textContent = parts.join(' + ') + ' = ' + r.medalhas + ' medalhas';
    } else {
      o.sum.textContent = 'Abaixo de R$ 1.300: compra com o desconto da campanha, sem bônus.';
    }

    var ext = r.extras.map(function (x) { return '<li>' + ico('i-check') + '<span>' + x + '</span></li>'; });
    if (p) ext.push('<li class="new">' + ico('i-bolt') + '<span>Chaveiro extra da modalidade (janela)</span></li>');
    o.ext.innerHTML = ext.length ? ext.join('') : '<li class="none">Os extras começam em R$ 1.300.</li>';
    o.sort.innerHTML = r.sorteios.length
      ? r.sorteios.map(function (x) { return '<li>' + ico('i-ticket') + '<span>' + x + '</span></li>'; }).join('')
      : '<li class="none">Os sorteios começam em R$ 1.300.</li>';

    if (p) {
      var vp = p.m * MEDALHA_CENT + p.t * TROFEU_CENT;
      var vt = r.medalhas * MEDALHA_CENT + p.t * TROFEU_CENT;
      var txt = 'Medalhas e troféus do pacote, sem bônus da janela, valem <b>' + centavos(vp) + '</b> aprox. (' + pct(vp / v) + ' do pedido).';
      if (vt > vp) txt += ' Com o bônus da janela: <b>' + centavos(vt) + '</b> (' + pct(vt / v) + ').';
      if (v > RAIL_MAX) txt += ' Acima de R$ 15.000: mantém o último pacote.';
      o.valTxt.innerHTML = txt;
    } else {
      o.valTxt.innerHTML = 'Medalhas e troféus grátis a partir de <b>R$ 1.300</b>.';
    }

    var nx = proximo(p);
    if (nx) {
      var falta = nx.min - v;
      var oque = nx.m + ' medalhas' + (nx.t ? ' e ' + nx.t + ' troféus' : '');
      o.next.innerHTML = ico('i-gift') + '<span>Faltam <b>' + reais(falta) + '</b> para ' + (p ? 'o pacote de ' : 'o primeiro pacote: ') + oque + ', mais: ' + lower1(nx.x) + '.</span>';
    } else {
      o.next.innerHTML = ico('i-gift') + '<span>Você chegou ao <b>maior pacote</b>. Acima de R$ 15.000, mantém o último pacote.</span>';
    }

    if (v < MIN_MUNDIAL) {
      o.mun.classList.remove('is-on');
      o.mun.innerHTML = ico('i-lock') + '<span>Com mais <b>' + reais(MIN_MUNDIAL - v) + '</b> em outros produtos e kits, o Troféu Mundial a 70% OFF fica desbloqueado.</span>';
    } else {
      o.mun.classList.add('is-on');
      o.mun.innerHTML = ico('i-unlock') + '<span><b>Troféu Mundial a 70% OFF desbloqueado:</b> a partir de R$ 71,76 no tamanho de 22 cm.</span>';
    }

    o.kits.href = wa('Olá! Quero ver kits da pré-venda Próxima Conquista para um pedido de ' + reais(v) + ', comprando ' + JANELAS[w].na + '.');

    // Itens liberados e tabela de pacotes acompanham o simulador
    var gs = $$('#gGrid [data-min]'), on = 0;
    gs.forEach(function (g) { var ok = v >= +g.getAttribute('data-min'); g.classList.toggle('on', ok); if (ok) on++; });
    var st = $('#giftsSt');
    if (st) st.innerHTML = 'Com <b>' + reais(v) + '</b> no <a href="#simulador">simulador</a>, você libera <b>' + on + ' de ' + gs.length + '</b> itens.';
    $$('#pkTbl tbody tr').forEach(function (tr) { tr.classList.toggle('on', !!p && +tr.getAttribute('data-min') === p.min); });

    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      o.live.textContent = reais(v) + ', ' + JANELAS[w].nome + ': ' + r.medalhas + ' medalhas e ' + r.trofeus + ' troféus grátis.';
    }, 700);
  }

  function setV(v, opts) { S.v = Math.max(0, Math.round(v)); render(opts); }

  // Arrastar
  (function () {
    var drag = false, pend = null;
    function fromX(x) {
      var rc = rail.getBoundingClientRect();
      var pp = (x - rc.left) / rc.width;
      var v = p2v(pp);
      for (var i = 0; i < MARCAS.length; i++) {
        if (Math.abs(v2p(MARCAS[i]) - clamp(pp, 0, 1)) < .018) { v = MARCAS[i]; break; }
        if (i === MARCAS.length - 1) v = Math.round(v / 50) * 50;
      }
      setV(v);
    }
    function start(e) {
      drag = true; pend = null;
      rail.classList.add('is-drag');
      try { rail.setPointerCapture(e.pointerId); } catch (err) {}
      fromX(e.clientX);
    }
    rail.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      var onThumb = e.target.closest('.rail-thumb');
      if (e.pointerType === 'touch' && !onThumb) { pend = { x: e.clientX, y: e.clientY, id: e.pointerId }; return; }
      e.preventDefault();
      thumb.focus({ preventScroll: true });
      start(e);
    });
    rail.addEventListener('pointermove', function (e) {
      if (drag) { fromX(e.clientX); return; }
      if (pend && e.pointerId === pend.id) {
        var dx = Math.abs(e.clientX - pend.x), dy = Math.abs(e.clientY - pend.y);
        if (dx > 6 && dx > dy) start(e);
        else if (dy > 8) pend = null;
      }
    });
    function end(e) {
      if (pend && e.type === 'pointerup' && e.pointerId === pend.id) fromX(e.clientX);
      pend = null;
      if (!drag) return;
      drag = false;
      rail.classList.remove('is-drag');
    }
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
  })();

  // Teclado no troféu
  thumb.addEventListener('keydown', function (e) {
    var v = Math.min(S.v, RAIL_MAX), k = e.key, n = null;
    if (k === 'ArrowRight' || k === 'ArrowUp') n = v + 50;
    else if (k === 'ArrowLeft' || k === 'ArrowDown') n = v - 50;
    else if (k === 'PageUp') { n = RAIL_MAX; for (var i = 0; i < MARCAS.length; i++) if (MARCAS[i] > v) { n = MARCAS[i]; break; } }
    else if (k === 'PageDown') { n = 0; for (var j = MARCAS.length - 1; j >= 0; j--) if (MARCAS[j] < v) { n = MARCAS[j]; break; } }
    else if (k === 'Home') n = 0;
    else if (k === 'End') n = RAIL_MAX;
    if (n === null) return;
    e.preventDefault();
    setV(clamp(n, 0, RAIL_MAX));
  });

  // Campo de valor
  input.addEventListener('input', function () {
    var d = input.value.replace(/\D/g, '').slice(0, 7);
    if (input.value !== d) input.value = d;
    setV(d ? parseInt(d, 10) : 0, { fromInput: true });
  });
  input.addEventListener('blur', function () { input.value = S.v; });
  input.addEventListener('focus', function () { input.select(); });

  // Janela
  $$('#simWin input').forEach(function (inp) {
    inp.addEventListener('change', function () { if (inp.checked) { S.w = +inp.value; render(); } });
  });

  // Atalhos que levam ao simulador com um valor (ex.: FAQ)
  $$('[data-sim]').forEach(function (a) {
    a.addEventListener('click', function () {
      var pr = a.getAttribute('data-sim').split(',');
      var w = +pr[1];
      if (faseAtual >= 0 && faseAtual <= 2 && w < faseAtual) w = faseAtual;
      S.w = w; S.v = +pr[0];
      var cur = $('input[value="' + S.w + '"]', $('#simWin'));
      if (cur) cur.checked = true;
      render();
    });
  });

  /* ======================================================================
     Chaveiro: frente e verso, modalidade
     ====================================================================== */
  (function () {
    var key = $('#key'); if (!key) return;
    var hint = $('#keyHint'), useIc = $('#keyIc'), mod = $('#keyMod');
    var nome = 'futebol';
    function label() {
      var back = key.getAttribute('aria-pressed') === 'true';
      key.setAttribute('aria-label', 'Chaveiro de ' + nome + ', ' + (back ? 'verso' : 'frente') + '. Toque para ver ' + (back ? 'a frente' : 'o verso') + '.');
      hint.textContent = (back ? 'Verso' : 'Frente') + ' · toque na imagem para ver ' + (back ? 'a frente' : 'o verso') + '.';
    }
    key.addEventListener('click', function () {
      key.setAttribute('aria-pressed', key.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      label();
    });
    radio($('#keyMods'), function (el) {
      useIc.setAttribute('href', '#' + el.getAttribute('data-ic'));
      mod.textContent = el.getAttribute('data-n') + ' · 2026';
      nome = el.textContent.toLowerCase();
      label();
    });
    label();
  })();

  /* ======================================================================
     O mesmo pedido em cada janela
     ====================================================================== */
  (function () {
    var g = $('#cmpChips'); if (!g) return;
    var cap = $('#cmpCap');
    function show(v, anim) {
      var r = [calc(v, 0), calc(v, 1), calc(v, 2)];
      var set = function (k, val) {
        var td = $('[data-k="' + k + '"]', $('#cmpTbl'));
        if (td.textContent === String(val)) return;
        td.textContent = val;
        if (anim && !RM) { td.classList.remove('flash'); void td.offsetWidth; td.classList.add('flash'); }
      };
      [0, 1, 2].forEach(function (i) { set('m' + i, r[i].medalhas); set('t' + i, r[i].trofeus); });
      set('l1', '−' + (r[0].medalhas - r[1].medalhas));
      set('l2', '−' + (r[0].medalhas - r[2].medalhas));
      cap.textContent = 'Pedido de ' + reais(v) + ' em cada janela';
    }
    radio(g, function (el) { show(+el.getAttribute('data-v'), true); });
    show(3000, false);
  })();

  /* ======================================================================
     Fogo: chamas em canvas nos cards das melhores ofertas
     Partículas com mistura aditiva (amarelo no miolo, laranja, vermelho na
     ponta) + faíscas. Só anima o que está na tela; com movimento reduzido,
     desenha um quadro parado.
     ====================================================================== */
  var hotCards = $$('.hot');
  function syncHot(f) {
    hotCards.forEach(function (c) {
      var from = c.getAttribute('data-out-from');
      var out = f >= 3 || (from !== null && f >= +from);
      c.classList.toggle('is-out', out);
      var msg = $('.hot-out', c);
      if (msg) msg.textContent = !out ? '' : f >= 3 ? 'Apagou: a pré-venda foi encerrada.' : 'Apagou: a 1ª hora fechou. Janela que fecha não volta.';
    });
    // Card do maior pacote acompanha a janela atual
    var w = f >= 0 && f <= 2 ? f : 0, r = calc(15000, w);
    var n = $('#hot15n'), l = $('#hot15l'), pp = $('#hot15p');
    if (n) {
      n.textContent = r.medalhas;
      l.textContent = 'medalhas grátis, ' + JANELAS[w].na;
      var parts = [r.p.m + ' do pacote'];
      if (r.dobro) parts.push(r.dobro + ' do dobro');
      if (r.janela) parts.push(r.janela + ' da janela');
      pp.innerHTML = parts.join(' + ') + ', mais <b>' + r.trofeus + ' troféus</b> e gravação do nome em troféu ou copo.';
      var a = $('.hot--3 .hot-cta');
      if (a) a.setAttribute('data-sim', '15000,' + w);
    }
  }

  (function () {
    if (!hotCards.length || !window.HTMLCanvasElement) return;
    // Chama é macia: desenhar a 60% da resolução não muda o visual e custa bem menos.
    var DPR = .6;
    var RAMP = [[255, 244, 210], [255, 224, 140], [255, 186, 66], [255, 138, 28], [246, 94, 12], [220, 56, 8], [158, 28, 6], [78, 12, 4]];
    var NS = 24, SPR = [];
    for (var i = 0; i < NS; i++) {
      var t = i / (NS - 1), f = t * (RAMP.length - 1), k = Math.floor(f), m = f - k;
      var A = RAMP[k], B = RAMP[Math.min(k + 1, RAMP.length - 1)];
      var col = [0, 1, 2].map(function (j) { return Math.round(A[j] + (B[j] - A[j]) * m); }).join(',');
      var sc = document.createElement('canvas'); sc.width = sc.height = 64;
      var g = sc.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(' + col + ',1)'); gr.addColorStop(.38, 'rgba(' + col + ',.5)'); gr.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); SPR.push(sc);
    }

    var F = hotCards.map(function (el) {
      var cv = document.createElement('canvas');
      cv.className = 'flame'; cv.setAttribute('aria-hidden', 'true');
      el.insertBefore(cv, el.firstChild);
      var st = { el: el, cv: cv, ctx: cv.getContext('2d'), w: 0, h: 0, ps: [], em: [], acc: 0, eacc: 0, heat: +el.getAttribute('data-heat') || 1, boost: 1, want: 1, vis: false, seed: Math.random() * 100 };
      var up = function () { st.want = 1.55; kick(); }, down = function () { st.want = 1; };
      el.addEventListener('pointerenter', up);
      el.addEventListener('pointerleave', down);
      el.addEventListener('focusin', up);
      el.addEventListener('focusout', down);
      return st;
    });

    function size(st) {
      st.w = st.el.clientWidth; st.h = st.el.clientHeight;
      st.cv.width = Math.round(st.w * DPR); st.cv.height = Math.round(st.h * DPR);
      st.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    F.forEach(size);

    function tongues(st) {
      var n = Math.max(3, Math.round(st.w / 64)), list = [];
      for (var i = 0; i < n; i++) list.push({ base: (i + .5) / n, ph: Math.random() * 6.28, sp: .6 + Math.random() * .9, amp: .35 + Math.random() * .4 });
      st.tg = list;
    }
    function tongueX(st, tg, time) {
      return st.w * (tg.base + Math.sin(time * tg.sp + tg.ph) * (tg.amp / st.tg.length));
    }

    function step(st, dt, time) {
      var w = st.w, h = st.h, out = st.el.classList.contains('is-out');
      if (!st.tg || st.tg.length !== Math.max(3, Math.round(w / 64))) tongues(st);
      st.boost += (st.want - st.boost) * Math.min(1, dt * 3);
      var heat = out ? 0 : st.heat * st.boost;
      var s = Math.max(.75, Math.min(1.35, w / 420));
      // chamas: línguas que oscilam e afinam na ponta, sobre um leito de brasa
      st.acc += dt * 175 * heat * (w / 380);
      while (st.acc >= 1) {
        st.acc--;
        var bed = Math.random() < .3;
        var ti = Math.floor(Math.random() * st.tg.length), tg = st.tg[ti];
        var strength = .7 + .3 * Math.sin(time * (2.2 + tg.sp) + tg.ph * 3);
        var x = bed ? w * Math.random() : tongueX(st, tg, time) + (Math.random() + Math.random() - 1) * 20 * s;
        var life = bed ? .3 + Math.random() * .3 : .5 + Math.random() * .6;
        var H = h * (.2 + .17 * heat) * (bed ? .3 : strength);
        st.ps.push({ x: x, y: h + 8, vx: 0, vy: -(H / life) * (.75 + Math.random() * .5), r: (bed ? 14 + Math.random() * 13 : 15 + Math.random() * 18) * s, t: 0, life: life, ph: Math.random() * 6.28, ti: bed ? -1 : ti });
      }
      // faíscas
      st.eacc += dt * 8 * heat;
      while (st.eacc >= 1) {
        st.eacc--;
        st.em.push({ x: w * Math.random(), y: h - Math.random() * h * .12, vx: (Math.random() - .5) * 30, vy: -(80 + Math.random() * 140) * s, r: .7 + Math.random() * 1.5, t: 0, life: 1.3 + Math.random() * 1.7, ph: Math.random() * 6.28 });
      }
      var i, p;
      for (i = st.ps.length - 1; i >= 0; i--) {
        p = st.ps[i]; p.t += dt;
        if (p.t >= p.life) { st.ps.splice(i, 1); continue; }
        if (p.ti >= 0 && st.tg[p.ti]) p.x += (tongueX(st, st.tg[p.ti], time) - p.x) * Math.min(1, dt * 2.6);
        p.x += Math.sin(time * 6 + p.ph + p.y * .03) * 10 * s * dt;
        p.vy *= 1 + dt * .5;
        p.y += p.vy * dt;
      }
      for (i = st.em.length - 1; i >= 0; i--) {
        p = st.em[i]; p.t += dt;
        if (p.t >= p.life || p.y < -10) { st.em.splice(i, 1); continue; }
        p.x += (p.vx + Math.sin(time * 2 + p.ph) * 26) * dt;
        p.y += p.vy * dt;
      }
    }

    function draw(st) {
      var c = st.ctx, i, p, k, rd, a, rw, rh;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, st.w, st.h);
      c.globalCompositeOperation = 'lighter';
      for (i = 0; i < st.ps.length; i++) {
        p = st.ps[i]; k = p.t / p.life;
        rd = p.r * (1 - k * .7);
        rw = rd * .8; rh = rd * 1.45;
        a = k < .1 ? k / .1 : Math.pow(1 - k, 1.1);
        c.globalAlpha = a * .62;
        c.drawImage(SPR[Math.min(NS - 1, Math.floor(k * NS))], p.x - rw, p.y - rh * .7, rw * 2, rh * 2);
      }
      for (i = 0; i < st.em.length; i++) {
        p = st.em[i]; k = p.t / p.life;
        c.globalAlpha = Math.max(0, (1 - k) * (.55 + .45 * Math.sin(p.t * 22 + p.ph)));
        rd = p.r * 5;
        c.drawImage(SPR[Math.min(NS - 1, 2 + Math.floor(k * 8))], p.x - rd, p.y - rd, rd * 2, rd * 2);
      }
      c.globalAlpha = 1;
    }

    var last = 0, raf = 0;
    function kick() {
      if (RM) return;
      if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    // Movimento reduzido: um quadro parado, já com o fogo formado
    if (RM) {
      var still = function () {
        F.forEach(function (st) {
          size(st); st.ps = []; st.em = [];
          for (var n = 0; n < 110; n++) step(st, 1 / 60, n / 60);
          draw(st);
        });
      };
      still();
      window.addEventListener('resize', still);
      return;
    }

    function loop(now) {
      raf = 0;
      var dt = Math.min(.05, (now - last) / 1000 || .016), time = now / 1000;
      last = now;
      var busy = false;
      F.forEach(function (st) {
        if (!st.vis) return;
        step(st, dt, time);
        draw(st);
        if (st.ps.length || st.em.length || !st.el.classList.contains('is-out')) busy = true;
      });
      if (busy && !document.hidden) raf = requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { F.forEach(function (st) { if (st.el === e.target) st.vis = e.isIntersecting; }); });
        kick();
      }, { rootMargin: '120px 0px' });
      F.forEach(function (st) { io.observe(st.el); });
    } else { F.forEach(function (st) { st.vis = true; }); kick(); }
    document.addEventListener('visibilitychange', kick);
    if (window.ResizeObserver) new ResizeObserver(function () { F.forEach(size); }).observe(hotCards[0].parentElement);
    else window.addEventListener('resize', function () { F.forEach(size); });
  })();

  /* ======================================================================
     Revelação ao rolar + barra fixa no celular
     ====================================================================== */
  (function () {
    var sel = '.sec-h, .hot, .cat, .g, .acc-c, .pk-tbl-wrap, .w, .cmp-box, .faq-list details, .sim-box, .mun-copy, .mun-stage, .mun-tbl, .fin-in > *, .w-warn, .nosum';
    var els = $$(sel);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    els.forEach(function (el) {
      if (!el.classList.contains('nosum')) el.classList.add('rv');
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (/^(LI|ARTICLE|DETAILS)$/.test(el.tagName) || el.parentElement.classList.contains('fin-in')) el.style.setProperty('--dl', (sib % 5) * 0.07 + 's');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });

    var bar = $('#mbar'), hero = $('.hero-cta'), fin = $('#grupo');
    if (!bar || !hero) return;
    var heroOut = false, finIn = false;
    var upd = function () { bar.classList.toggle('is-on', heroOut && !finIn); };
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe(hero);
    new IntersectionObserver(function (es) { finIn = es[0].isIntersecting; upd(); }, { threshold: 0.25 }).observe(fin);
  })();

  /* ======================================================================
     Início
     ====================================================================== */
  syncSeg();
  syncHot(faseAtual);
  render();
  tick();
  setInterval(tick, 1000);
})();
