/* Achei Troféus — loja da pré-venda "Próxima Conquista" (PRÉVIA)
   Rotas por hash:
     #/vitrine[?tab=todos|trofeus|medalhas|kits&mod=&q=&tam=&v=]   vitrine e kits
     #/kit/<id>   #/p/<id>   #/bonus[?v=centavos]   #/carrinho
   Regras da campanha: ../campanha.js · fogo: ../fogo.js · dados: catalogo.js
   O carrinho fica salvo neste aparelho (localStorage) e sai pelo WhatsApp. */
(function () {
  'use strict';
  var A = window.ACHEI, C = window.CATALOGO;
  var $ = A.$, $$ = A.$$, centavos = A.centavos, reais = A.reais, ico = A.ico, calc = A.calc;
  var pacoteDe = A.pacoteDe, proximo = A.proximo, partes = A.partes, p2 = A.p2, lower1 = A.lower1;
  var PACOTES = A.PACOTES, JANELAS = A.JANELAS, MUNDIAL = A.MUNDIAL, MARCAS = A.MARCAS;
  var IMG = '../../img/';
  var foto = function (p) { var I = window.ACHEI_FOTOS; return I && I[p] ? I[p] : IMG + p; };
  var GRUPO = A.wa('Quero entrar no grupo da pré-venda Próxima Conquista da Achei Troféus');
  var app = $('#app');

  /* ======================================================================
     Catálogo
     ====================================================================== */
  var slug = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var cents = function (s) { return Math.round(parseFloat(s.replace('.', '').replace(',', '.')) * 100); };
  var norm = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var FOTOS = C.fotos || {};

  var MODS = {};
  C.modalidades.forEach(function (m) { MODS[m.id] = m; });
  var SEM_MOD = { id: 'classificar', nome: 'A classificar', ic: 'i-tro' };
  var MODELOS = [], M = {};
  C.grupos.forEach(function (g) {
    g.itens.forEach(function (line) {
      var f = line.split('|');
      var pre = g.tipo === 'm' ? 'medalhas' : (g.mod ? MODS[g.mod].slug : 'trofeus');
      var id = pre + '-' + slug(f[0]);
      if (M[id]) { var n = 2; while (M[id + '-' + n]) n++; id = id + '-' + n; }
      var t = f[1].split(' a ').map(Number);
      var m = { id: id, nome: f[0], mod: g.mod, tipo: g.tipo, min: t[0], max: t[1] || t[0], de: cents(f[2]), por: cents(f[3]), desc: +f[4] };
      MODELOS.push(m); M[id] = m;
    });
  });
  var KITS = C.kits.map(function (k) {
    var o = {};
    for (var key in k) o[key] = k[key];
    o.mundial = k.por >= A.MIN_MUNDIAL * 100;
    return o;
  });
  var K = {};
  KITS.forEach(function (k) { K[k.id] = k; });
  var TAMANHOS = [];
  MODELOS.forEach(function (m) { [m.min, m.max].forEach(function (s) { if (TAMANHOS.indexOf(s) < 0) TAMANHOS.push(s); }); });
  TAMANHOS.sort(function (a, b) { return a - b; });

  var modNome = function (mod) { return mod && MODS[mod] ? MODS[mod].nome : 'Modalidade a confirmar'; };
  var modIc = function (mod) { return mod && MODS[mod] ? MODS[mod].ic : 'i-tro'; };
  var tamTxt = function (m) { return m.min === m.max ? m.min + ' cm' : m.min + ' a ' + m.max + ' cm'; };
  var compo = function (med, tro) {
    var a = [];
    if (med) a.push(med + (med === 1 ? ' medalha' : ' medalhas'));
    if (tro) a.push(tro + (tro === 1 ? ' troféu' : ' troféus'));
    return a.join(' + ');
  };
  var descDe = function (de, por) { return de > 0 ? Math.floor((1 - por / de) * 100) : 0; };
  function precoPecas(pecas) {
    var r = { de: 0, por: 0, med: 0, tro: 0 };
    pecas.forEach(function (p) {
      var m = M[p[0]]; if (!m) return;
      r.de += m.de * p[1]; r.por += m.por * p[1];
      if (m.tipo === 'm') r.med += p[1]; else r.tro += p[1];
    });
    return r;
  }
  var mundialDe = function (cm) { return MUNDIAL.filter(function (w) { return w.cm === cm; })[0]; };

  /* ======================================================================
     Carrinho (salvo neste aparelho)
     ====================================================================== */
  var KEY = 'achei-carrinho-v1';
  var cart = [];
  function valido(it) {
    if (!it || !(it.q > 0)) return false;
    if (it.t === 'm') return !!M[it.id];
    if (it.t === 'w') return !!mundialDe(it.cm);
    if (it.t === 'k') return !!K[it.id] && (!it.p || it.p.every(function (p) { return M[p[0]] && p[1] > 0; }));
    return false;
  }
  try {
    var raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (Array.isArray(raw)) cart = raw.filter(valido);
  } catch (e) { cart = []; }
  function chave(it) {
    if (it.t === 'm') return 'm:' + it.id;
    if (it.t === 'w') return 'w:' + it.cm;
    return 'k:' + it.id + (it.p ? ':' + it.p.map(function (p) { return p.join('*'); }).join(',') : '');
  }
  function linha(key) { return cart.filter(function (c) { return chave(c) === key; })[0]; }
  function salvar() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    pintarCarrinho();
  }
  function unidade(it) {
    if (it.t === 'm') return { de: M[it.id].de, por: M[it.id].por };
    if (it.t === 'w') { var w = mundialDe(it.cm); return { de: w.de, por: w.por }; }
    if (it.p) { var pp = precoPecas(it.p); return { de: pp.de, por: pp.por }; }
    return { de: K[it.id].de, por: K[it.id].por };
  }
  function totais() {
    var t = { de: 0, por: 0, wDe: 0, wPor: 0, linhas: cart.length };
    cart.forEach(function (it) {
      var u = unidade(it);
      if (it.t === 'w') { t.wDe += u.de * it.q; t.wPor += u.por * it.q; }
      else { t.de += u.de * it.q; t.por += u.por * it.q; }
    });
    return t;
  }
  function adicionar(it, q) {
    var ex = linha(chave(it));
    if (ex) ex.q += q; else { it.q = q; cart.push(it); }
    salvar();
  }
  function definir(key, q) {
    var ex = linha(key); if (!ex) return;
    q = Math.max(0, Math.min(99999, Math.round(q) || 0));
    if (q === 0) cart.splice(cart.indexOf(ex), 1); else ex.q = q;
    salvar();
  }
  var qtd = function (key) { var ex = linha(key); return ex ? ex.q : 0; };
  function nomeLinha(it) {
    if (it.t === 'm') { var m = M[it.id]; return m.nome + ' (' + m.min + ' cm)'; }
    if (it.t === 'w') return 'Troféu Mundial -70% (' + it.cm + ' cm)';
    var k = K[it.id];
    return 'Kit ' + k.nome + (k.mod ? ' (' + modNome(k.mod) + ')' : '') + (personalizado(it) ? ', peças personalizadas' : '');
  }
  function personalizado(it) {
    var k = K[it.id];
    return !!(it.p && k.pecas && JSON.stringify(it.p) !== JSON.stringify(k.pecas));
  }

  /* ======================================================================
     Relógio e bônus
     ====================================================================== */
  var faseAgora = function () { return A.fase(A.agora()); };
  var janelaVista = function () { var f = faseAgora(); return f >= 0 && f <= 2 ? f : 0; };

  function bonusCurto(v) {
    var p = pacoteDe(v);
    if (!p) return 'Bônus a partir de R$ 1.300';
    var f = faseAgora(), r0 = calc(v, 0), s;
    if (f === 1 || f === 2) s = '<b>' + calc(v, f).medalhas + '</b> medalhas agora · ' + p.m + ' no pacote';
    else s = '<b>' + p.m + '</b> medalhas no pacote · <b>' + r0.medalhas + '</b> na 1ª hora';
    if (p.t) s += ' · ' + p.t + ' troféus';
    s += ' · +' + r0.extras.length + (r0.extras.length > 1 ? ' extras' : ' extra');
    return s;
  }

  function v2p(v) {
    var n = MARCAS.length - 1;
    v = Math.max(0, Math.min(MARCAS[n], v));
    for (var i = 0; i < n; i++) if (v <= MARCAS[i + 1]) return (i + (v - MARCAS[i]) / (MARCAS[i + 1] - MARCAS[i])) / n;
    return 1;
  }
  function trilho(v) {
    var n = MARCAS.length - 1, rot = ['', '1,3', '1,5', '2', '3', '5★', '7,5', '10', '15'];
    var li = MARCAS.map(function (m, i) {
      if (!i) return '';
      return '<li class="' + (v >= m ? 'on' : '') + (m === A.MIN_MUNDIAL ? ' is-mun' : '') + '" style="--x:' + (i / n * 100) + '%"><span>' + rot[i] + '</span></li>';
    }).join('');
    return '<div class="rl" style="--p:' + (v2p(v) * 100).toFixed(2) + '%"><div class="rl-tr"><i></i></div><ol aria-hidden="true">' + li + '</ol></div>' +
      '<p class="fine rl-n">Pacotes em mil reais. ★ R$ 5.000 libera o Mundial.</p>';
  }

  // Painel "o que você garante" (página do kit, do modelo e carrinho)
  function resumo(extra, titulo, rotulo) {
    var t = totais(), vc = t.por + extra, v = vc / 100;
    var f = faseAgora(), w = janelaVista(), p = pacoteDe(v), r = calc(v, w);
    var h = '<div class="rs">';
    if (titulo) h += '<p class="rs-t">' + titulo + '</p>';
    h += '<p class="rs-v">' + rotulo + ': <b>' + centavos(vc) + '</b></p>';
    if (p) {
      h += '<div class="rs-big"><div><b class="gold-text">' + r.medalhas + '</b><span>medalhas grátis ' + (f >= 0 && f <= 2 ? 'agora' : JANELAS[w].na) + '</span></div>' +
        '<div><b>' + p.t + '</b><span>troféus grátis</span></div></div>';
      var js = [];
      [0, 1, 2].forEach(function (i) { if (f > i && f <= 2) return; js.push((i === 0 ? 'na 1ª hora' : i === 1 ? 'em 24h' : 'em 48h') + ': <b>' + calc(v, i).medalhas + '</b>'); });
      h += '<p class="rs-sub">Medalhas no pacote: <b>' + p.m + '</b> · ' + js.join(' · ') + '</p>';
      h += '<ul class="rs-x">' + PACOTES.filter(function (k) { return k.min <= p.min; }).map(function (k) {
        return '<li>' + ico(k.ic) + '<span>' + k.x + '</span></li>';
      }).join('') + '<li class="new">' + ico('i-bolt') + '<span>Chaveiro extra da modalidade (janela)</span></li></ul>';
    } else {
      h += '<p class="rs-sub">Bônus a partir de R$ 1.300. Abaixo disso, a compra sai com o desconto da campanha.</p>';
    }
    h += trilho(v);
    var nx = proximo(p);
    if (nx) {
      var r0 = calc(nx.min, 0);
      h += '<p class="nudge">' + ico('i-gift') + '<span>Próximo: <b>+ ' + centavos(nx.min * 100 - vc) + '</b> = ' + nx.m + ' medalhas (' + r0.medalhas + ' na 1ª hora)' + (nx.t ? ' e ' + nx.t + ' troféus' : '') + ', mais: ' + lower1(nx.x) + '.</span></p>';
    } else {
      h += '<p class="nudge">' + ico('i-gift') + '<span>Você chegou ao <b>maior pacote</b>. Acima de R$ 15.000, mantém o último pacote.</span></p>';
    }
    if (v >= A.MIN_MUNDIAL) h += '<p class="nudge nudge--m is-on">' + ico('i-unlock') + '<span><b>Troféu Mundial a 70% OFF liberado.</b> Escolha o tamanho no carrinho.</span></p>';
    else h += '<p class="nudge nudge--m">' + ico('i-lock') + '<span>Com mais <b>' + centavos(A.MIN_MUNDIAL * 100 - vc) + '</b> em outros produtos e kits, o Troféu Mundial a 70% OFF fica liberado.</span></p>';
    return h + '</div>';
  }

  /* ======================================================================
     Ilustrações (sem foto, a loja desenha a peça; a foto entra com o catálogo oficial)
     ====================================================================== */
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  var CORPOS = [
    'M32 20h56v24c0 22-13 38-28 40-15-2-28-18-28-40z',
    'M60 8c26 14 36 44 26 72-4 12-12 20-26 24-14-4-22-12-26-24C24 52 34 22 60 8z',
    'M34 40h52v30c0 17-12 29-26 33-14-4-26-16-26-33z'
  ];
  var CY = [50, 56, 70];
  function desenhoTrofeu(m) {
    var v = hash(m.id) % 3, cy = CY[v];
    return '<svg class="art" viewBox="0 0 120 150" aria-hidden="true">' +
      '<ellipse cx="60" cy="141" rx="42" ry="5" fill="rgba(0,0,0,.55)"/>' +
      '<rect x="28" y="122" width="64" height="16" rx="2.5" fill="#15120f" stroke="rgba(214,169,77,.45)"/>' +
      '<rect x="42" y="127" width="36" height="6" rx="1" fill="url(#gGold)"/>' +
      '<path d="M52 96h16l-2 26H54z" fill="url(#gGoldV)"/>' +
      (v === 0 ? '<path d="M54 80h12v18H54z" fill="url(#gGoldV)"/>' : '') +
      (v === 2 ? '<path d="M60 4l7 12 14 2-10 10 2.6 14L60 36l-13.6 6L49 28 39 18l14-2z" fill="url(#gGold)"/>' : '') +
      '<path d="' + CORPOS[v] + '" fill="url(#gGoldV)"/><path d="' + CORPOS[v] + '" fill="none" stroke="rgba(255,243,207,.55)"/>' +
      '<circle cx="60" cy="' + cy + '" r="20" fill="#100d0a" stroke="url(#gGold)" stroke-width="2.5"/>' +
      '<svg x="46" y="' + (cy - 14) + '" width="28" height="28" viewBox="0 0 24 24" class="art-ic"><use href="#' + modIc(m.mod) + '"/></svg></svg>';
  }
  function desenhoMedalha(m) {
    return '<svg class="art" viewBox="0 0 120 150" aria-hidden="true">' +
      '<path d="M36 0h18l14 56H50z" fill="#a3121e"/><path d="M84 0H66L52 56h18z" fill="#d21f2d"/>' +
      '<rect x="48" y="50" width="24" height="10" rx="3" fill="url(#gGoldV)"/>' +
      '<circle cx="60" cy="98" r="40" fill="url(#gGold)"/><circle cx="60" cy="98" r="31" fill="#100d0a"/>' +
      '<circle cx="60" cy="98" r="35.5" fill="none" stroke="rgba(11,10,9,.4)" stroke-dasharray="2 3"/>' +
      '<svg x="43" y="81" width="34" height="34" viewBox="0 0 24 24" class="art-ic"><use href="#' + modIc(m.mod) + '"/></svg></svg>';
  }
  function arte(m) {
    if (FOTOS[m.id]) return '<img src="' + esc(FOTOS[m.id]) + '" alt="" loading="lazy" decoding="async">';
    return m.tipo === 'm' ? desenhoMedalha(m) : desenhoTrofeu(m);
  }
  function arteKit(k, med, tro) {
    if (k.img) return '<img src="' + esc(k.img) + '" alt="" loading="lazy" decoding="async">';
    med = med === undefined ? k.med : med; tro = tro === undefined ? k.tro : tro;
    return '<span class="kt-art"><svg class="kt-wm" aria-hidden="true"><use href="#' + modIc(k.mod) + '"/></svg>' +
      (med ? '<span class="kt-q"><b>' + med + '</b><small>medalhas</small></span>' : '') +
      (med && tro ? '<span class="kt-plus">+</span>' : '') +
      (tro ? '<span class="kt-q"><b>' + tro + '</b><small>troféus</small></span>' : '') + '</span>';
  }
  function preco(de, por, aPartir) {
    return '<p class="pr">' + (aPartir ? '<span class="pr-ap">a partir de</span>' : '') + '<span class="pr-de">De <s>' + centavos(de) + '</s></span><span class="pr-por"><i>por</i> <b>' + centavos(por) + '</b></span></p>';
  }
  function passo(key, q, nome, act) {
    act = act || '';
    return '<div class="stp" role="group" aria-label="Quantidade de ' + esc(nome) + '">' +
      '<button type="button" data-act="' + act + 'dec" data-key="' + esc(key) + '" aria-label="Diminuir">' + ico('i-minus') + '</button>' +
      '<input type="text" inputmode="numeric" value="' + q + '" data-act="' + act + 'qty" data-key="' + esc(key) + '" aria-label="Quantidade de ' + esc(nome) + '">' +
      '<button type="button" data-act="' + act + 'inc" data-key="' + esc(key) + '" aria-label="Aumentar">' + ico('i-plus') + '</button></div>';
  }

  /* ======================================================================
     Cards
     ====================================================================== */
  function acaoModelo(m) {
    var q = qtd('m:' + m.id);
    if (!q) return '<button class="pd-add" type="button" data-act="add-m" data-id="' + m.id + '">' + ico('i-plus') + '<span>Adicionar ' + m.min + ' cm</span></button>';
    return passo('m:' + m.id, q, m.nome);
  }
  function cardModelo(m) {
    var q = qtd('m:' + m.id);
    return '<li class="pd' + (q ? ' in' : '') + '" data-id="' + m.id + '">' +
      '<a class="pd-art" href="#/p/' + m.id + '" tabindex="-1" aria-hidden="true"><span class="off">-' + m.desc + '%</span>' + arte(m) +
      (FOTOS[m.id] ? '' : '<span class="pd-il">Ilustração</span>') + '</a>' +
      '<div class="pd-tx"><a class="pd-n" href="#/p/' + m.id + '">' + esc(m.nome) + '</a>' +
      '<span class="pd-m">' + tamTxt(m) + ' · ' + (m.tipo === 'm' ? 'Medalha' : 'Troféu') + (m.mod ? '' : ' · a classificar') + '</span>' +
      preco(m.de, m.por, m.min !== m.max) + '</div>' +
      '<div class="pd-act">' + acaoModelo(m) + '</div></li>';
  }
  function cardKit(k) {
    return '<li class="kt' + (k.mundial ? ' is-mundial' : '') + '">' +
      '<a class="kt-ph" href="#/kit/' + k.id + '" tabindex="-1" aria-hidden="true"><span class="off">-' + k.desc + '%</span>' + arteKit(k) + '</a>' +
      '<div class="kt-tx"><span class="kt-mod">' + ico(modIc(k.mod)) + esc(modNome(k.mod)) + '</span>' +
      '<a class="kt-n" href="#/kit/' + k.id + '">' + esc(k.nome) + '</a>' +
      '<span class="kt-c">' + compo(k.med, k.tro) + '</span>' + preco(k.de, k.por) +
      '<p class="kt-b">' + bonusCurto(k.por / 100) + '</p>' +
      (k.mundial ? '<p class="kt-mun">' + ico('i-unlock') + 'Libera o Troféu Mundial -70%</p>' : '') +
      '<a class="kt-go" href="#/kit/' + k.id + '">Ver kit ' + ico('arr') + '</a></div></li>';
  }

  /* ======================================================================
     Vitrine
     ====================================================================== */
  var VS = { tab: 'todos', mod: '', q: '', tam: '', v: 0, n: 48 };
  var ABAS = [['todos', 'Todos'], ['trofeus', 'Troféus'], ['medalhas', 'Medalhas'], ['kits', 'Kits']];
  function vitrine(q) {
    VS.tab = ABAS.some(function (a) { return a[0] === q.get('tab'); }) ? q.get('tab') : 'todos';
    VS.mod = q.get('mod') || ''; VS.q = q.get('q') || ''; VS.tam = q.get('tam') || '';
    VS.v = +q.get('v') || 0; VS.n = 48;
    if (VS.mod && VS.mod !== 'classificar' && !MODS[VS.mod]) VS.mod = '';
    return '<section class="lj-head wrap"><p class="eyebrow">Pré-venda · preços de campanha</p>' +
      '<h1 class="d lj-h1" tabindex="-1">Vitrine <span class="serif">da Próxima Conquista</span></h1>' +
      '<p class="lede">Troféus, medalhas e kits com 15% a 30% OFF. Monte o carrinho agora e compre na abertura, 16/11 às 20h.</p></section>' +
      '<div class="wrap lj-sticky"><div class="lj-tabs" id="vTabs">' + ABAS.map(function (a) {
        return '<button type="button" data-act="tab" data-v="' + a[0] + '">' + a[1] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="lj-chips-wrap"><div class="lj-chips" id="vChips"></div></div>' +
      '<div class="wrap lj-tools" id="vTools">' +
      '<label class="lj-search"><svg aria-hidden="true"><use href="#i-search"/></svg><span class="sr">Buscar por nome ou tamanho</span><input type="search" id="vBusca" placeholder="Buscar: Craque, 25 cm" autocomplete="off" value="' + esc(VS.q) + '"></label>' +
      '<label class="lj-sel"><span class="sr">Tamanho</span><select id="vTam"><option value="">Tamanho</option>' + TAMANHOS.map(function (s) {
        return '<option value="' + s + '"' + (String(s) === VS.tam ? ' selected' : '') + '>' + s + ' cm</option>';
      }).join('') + '</select></label></div>' +
      '<div id="vBody"></div>';
  }
  function filtraModelos() {
    var toks = norm(VS.q).split(/[,\s]+/).filter(Boolean), cm = null, words = [];
    toks.forEach(function (t) { var mm = t.match(/^(\d{1,3})(cm)?$/); if (mm) cm = +mm[1]; else if (t !== 'cm') words.push(t); });
    var tam = VS.tam ? +VS.tam : null;
    return MODELOS.filter(function (m) {
      if (VS.tab === 'trofeus' && m.tipo !== 't') return false;
      if (VS.tab === 'medalhas' && m.tipo !== 'm') return false;
      if (VS.mod) { if (VS.mod === 'classificar' ? m.mod !== null : m.mod !== VS.mod) return false; }
      if (tam !== null && (tam < m.min || tam > m.max)) return false;
      if (cm !== null && (cm < m.min || cm > m.max)) return false;
      if (words.length) {
        var n = norm(m.nome + ' ' + (m.mod ? MODS[m.mod].nome : '') + (m.tipo === 'm' ? ' medalha' : ' trofeu'));
        if (!words.every(function (w) { return n.indexOf(w) >= 0; })) return false;
      }
      return true;
    });
  }
  function filtraKits() {
    var ks = KITS.filter(function (k) { return !VS.mod || (VS.mod === 'classificar' ? !k.mod : k.mod === VS.mod); });
    if (VS.v) ks = ks.slice().sort(function (a, b) { return Math.abs(a.por / 100 - VS.v) - Math.abs(b.por / 100 - VS.v); });
    return ks;
  }
  function urlVitrine() {
    var q = [];
    if (VS.tab !== 'todos') q.push('tab=' + VS.tab);
    if (VS.mod) q.push('mod=' + VS.mod);
    if (VS.q) q.push('q=' + encodeURIComponent(VS.q));
    if (VS.tam) q.push('tam=' + VS.tam);
    if (VS.v && VS.tab === 'kits') q.push('v=' + VS.v);
    return '#/vitrine' + (q.length ? '?' + q.join('&') : '');
  }
  function pintarVitrine() {
    try { history.replaceState(null, '', urlVitrine()); } catch (e) {}
    navAtiva();
    $$('#vTabs button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === VS.tab ? 'true' : 'false'); });
    // contagem por modalidade, na aba atual
    var conta = {}, total = 0, kits = VS.tab === 'kits';
    (kits ? KITS : MODELOS).forEach(function (x) {
      if (!kits && VS.tab === 'trofeus' && x.tipo !== 't') return;
      if (!kits && VS.tab === 'medalhas' && x.tipo !== 'm') return;
      var k = x.mod || 'classificar'; conta[k] = (conta[k] || 0) + 1; total++;
    });
    var chips = [{ id: '', nome: 'Todas', ic: null }].concat(C.modalidades, [SEM_MOD]);
    $('#vChips').innerHTML = chips.map(function (c) {
      var n = c.id ? (conta[c.id] || 0) : total;
      if (c.id === 'classificar' && !n) return '';
      return '<button type="button" data-act="mod" data-v="' + c.id + '" aria-pressed="' + (VS.mod === c.id) + '"' + (n ? '' : ' class="is-empty"') + '>' +
        (c.ic ? ico(c.ic) : '') + '<span>' + c.nome + '</span><small>' + n + '</small></button>';
    }).join('');
    $('#vTools').hidden = kits;
    var h = '';
    if (kits) {
      var ks = filtraKits();
      h += '<section class="wrap lj-sec"><header class="lj-sec-h"><h2 class="d">' + (VS.v ? 'Kits perto de ' + reais(VS.v) : 'Kits prontos') + '</h2>' +
        '<p class="lede">Kits montados para cada tipo de evento, com o bônus de pré-venda que cada valor garante.</p></header>' +
        (ks.length ? '<ul class="kt-grid">' + ks.map(cardKit).join('') + '</ul>' : vazio('Nenhum kit para esta modalidade ainda.')) + '</section>';
    } else {
      if (VS.tab === 'todos' && !VS.q && !VS.tam) {
        var kr = filtraKits();
        if (kr.length) h += '<section class="lj-sec lj-sec--rail"><header class="wrap lj-sec-h lj-sec-h--row"><h2 class="d">Kits prontos</h2>' +
          '<a class="link" href="#/vitrine?tab=kits' + (VS.mod ? '&mod=' + VS.mod : '') + '">Ver todos os kits</a></header>' +
          '<div class="kt-rail-wrap"><ul class="kt-rail" id="ktRail">' + kr.map(cardKit).join('') + '</ul></div></section>';
      }
      var ms = filtraModelos();
      h += '<section class="wrap lj-sec"><p class="lj-count"><b>' + ms.length + '</b> ' + (ms.length === 1 ? 'modelo' : 'modelos') + '. Preços de campanha, por unidade.' +
        (VS.mod === 'classificar' ? ' Modelos cuja modalidade ainda não veio no catálogo.' : '') + '</p>' +
        (ms.length ? '<ul class="pd-grid" id="pdGrid">' + ms.slice(0, VS.n).map(cardModelo).join('') + '</ul>' +
          (ms.length > VS.n ? '<div class="lj-more"><button class="btn btn--ink-out" type="button" data-act="more"><span>Mostrar mais ' + Math.min(48, ms.length - VS.n) + ' de ' + (ms.length - VS.n) + '</span><span class="ar"><svg><use href="#i-plus"/></svg><svg><use href="#i-plus"/></svg></span></button></div>' : '')
          : vazio(VS.mod && !VS.q && !VS.tam ? 'Os modelos de ' + esc(modNome(VS.mod)) + ' entram com o catálogo oficial.' : 'Nenhum modelo encontrado. Tente outro nome ou tamanho.')) + '</section>';
    }
    $('#vBody').innerHTML = h;
    A.fogo.kick();
  }
  function vazio(txt) { return '<div class="lj-empty">' + ico('i-search') + '<p>' + txt + '</p></div>'; }
  function pintarCard(id) {
    $$('.pd[data-id="' + id + '"]').forEach(function (li) {
      var m = M[id], q = qtd('m:' + id);
      li.classList.toggle('in', !!q);
      $('.pd-act', li).innerHTML = acaoModelo(m);
    });
  }

  /* ======================================================================
     Página do modelo
     ====================================================================== */
  var PS = { id: null, q: 1 };
  function produto(id) {
    var m = M[id];
    if (!m) return naoAchei('Modelo não encontrado.');
    PS.id = id; PS.q = m.tipo === 'm' ? 10 : 1;
    var rap = m.tipo === 'm' ? [10, 50, 100, 500] : [1, 5, 10];
    return '<section class="wrap lj-pg">' +
      '<a class="lj-back" href="#/vitrine' + (m.tipo === 'm' ? '?tab=medalhas' : '') + '">' + ico('i-back') + 'Vitrine</a>' +
      '<div class="lj-pg-grid"><div class="lj-pg-main">' +
      '<div class="pg-hero"><div class="pg-art"><span class="off">-' + m.desc + '%</span>' + arte(m) + (FOTOS[m.id] ? '' : '<span class="pd-il">Ilustração</span>') + '</div>' +
      '<div class="pg-info"><p class="kt-mod">' + ico(modIc(m.mod)) + esc(m.mod ? modNome(m.mod) : 'Modalidade a classificar') + ' · ' + (m.tipo === 'm' ? 'Medalha' : 'Troféu') + '</p>' +
      '<h1 class="d pg-h" tabindex="-1">' + esc(m.nome) + '</h1>' +
      '<p class="pg-tam">' + tamTxt(m) + '</p>' + preco(m.de, m.por, m.min !== m.max) +
      '<p class="fine">Preço de campanha por unidade' + (m.min !== m.max ? ', no tamanho de ' + m.min + ' cm. Os outros tamanhos (até ' + m.max + ' cm) entram com o catálogo oficial.' : '.') + '</p>' +
      '<div class="pg-buy">' + passo('p', PS.q, m.nome, 'p-') +
      '<div class="pg-rap">' + rap.map(function (n) { return '<button type="button" data-act="p-plus" data-n="' + n + '">+' + n + '</button>'; }).join('') + '</div></div>' +
      '<button class="btn" type="button" data-act="add-p" id="pAdd"><span>Adicionar</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></button>' +
      '<p class="pg-in" id="pIn"></p></div></div></div>' +
      '<aside class="lj-pg-side" id="pRes"></aside></div></section>';
  }
  function pintarProduto() {
    var m = M[PS.id]; if (!m) return;
    var inp = $('[data-act="p-qty"]'); if (inp && document.activeElement !== inp) inp.value = PS.q;
    $('#pAdd span').textContent = 'Adicionar ' + PS.q + ' · ' + centavos(m.por * PS.q);
    var no = qtd('m:' + m.id);
    $('#pIn').innerHTML = no ? ico('i-check') + 'Você já tem ' + no + ' no carrinho. <a href="#/carrinho">Ver carrinho</a>' : '';
    $('#pRes').innerHTML = resumo(m.por * PS.q, 'Adicionando ' + PS.q + ', você garante', totais().por ? 'Seu carrinho com este item' : 'Pedido com este item');
  }

  /* ======================================================================
     Página do kit
     ====================================================================== */
  var KS = { id: null, mult: 1, pecas: null };
  function kitPagina(id) {
    var k = K[id];
    if (!k) return naoAchei('Kit não encontrado.');
    KS.id = id; KS.mult = 1; KS.pecas = k.pecas ? k.pecas.map(function (p) { return p.slice(); }) : null;
    return '<section class="wrap lj-pg">' +
      '<a class="lj-back" href="#/vitrine?tab=kits' + (k.mod ? '&mod=' + k.mod : '') + '">' + ico('i-back') + 'Kits</a>' +
      '<div class="lj-pg-grid"><div class="lj-pg-main">' +
      '<div class="pg-hero pg-hero--kit"><div class="pg-art kt-ph' + (k.mundial ? ' is-mundial-art' : '') + '" id="kArt"></div>' +
      '<div class="pg-info"><p class="kt-mod">' + ico(modIc(k.mod)) + esc(modNome(k.mod)) + '</p>' +
      '<h1 class="d pg-h" tabindex="-1">' + esc(k.nome) + '</h1>' +
      '<p class="pg-tam" id="kCompo"></p><div id="kPreco"></div>' +
      '<p class="kt-b" id="kBonus"></p>' + (k.mundial ? '<p class="kt-mun kt-mun--lg">' + ico('i-unlock') + 'Este kit libera o Troféu Mundial -70%</p>' : '') +
      '<div class="pg-mult" role="group" aria-label="Quantos kits">' + [1, 2, 3, 5].map(function (n) {
        return '<button type="button" data-act="k-mult" data-n="' + n + '">Kit × ' + n + '</button>';
      }).join('') + '</div>' +
      '<button class="btn" type="button" data-act="add-k" id="kAdd"><span>Adicionar kit</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></button>' +
      '<p class="pg-in" id="kIn"></p></div></div>' +
      '<section class="pc-sec"><h2 class="d">Peças do kit</h2>' +
      (KS.pecas ? '<p class="fine">Ajuste as quantidades ou troque um modelo. O preço do kit acompanha.</p><ul class="pc-list" id="kPecas"></ul>'
        : '<div class="lj-empty lj-empty--left">' + ico('i-gift') + '<p>A lista de peças deste kit entra com o catálogo oficial. Por enquanto, ele vai para o carrinho fechado, pelo preço do kit: ' + compo(k.med, k.tro) + '.</p></div>') +
      '</section></div>' +
      '<aside class="lj-pg-side" id="kRes"></aside></div></section>';
  }
  function kitPreco() {
    var k = K[KS.id];
    if (KS.pecas) { var p = precoPecas(KS.pecas); return p; }
    return { de: k.de, por: k.por, med: k.med, tro: k.tro };
  }
  function pintarKit() {
    var k = K[KS.id]; if (!k) return;
    var p = kitPreco(), d = descDe(p.de, p.por);
    $('#kArt').innerHTML = '<span class="off">-' + d + '%</span>' + arteKit(k, p.med, p.tro) + (k.img ? '<span class="kt-ref">Foto de referência</span>' : '');
    $('#kCompo').textContent = compo(p.med, p.tro);
    $('#kPreco').innerHTML = preco(p.de, p.por) + '<p class="fine">Preço de campanha do kit' + (KS.pecas && JSON.stringify(KS.pecas) !== JSON.stringify(k.pecas) ? ', com as suas mudanças' : '') + '.</p>';
    $('#kBonus').innerHTML = bonusCurto(p.por / 100);
    $$('[data-act="k-mult"]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-n') === KS.mult ? 'true' : 'false'); });
    $('#kAdd span').textContent = 'Adicionar ' + (KS.mult > 1 ? KS.mult + ' kits' : 'kit') + ' · ' + centavos(p.por * KS.mult);
    var no = cart.filter(function (c) { return c.t === 'k' && c.id === k.id; }).reduce(function (s, c) { return s + c.q; }, 0);
    $('#kIn').innerHTML = no ? ico('i-check') + 'Você já tem ' + no + (no > 1 ? ' kits' : ' kit') + ' deste no carrinho. <a href="#/carrinho">Ver carrinho</a>' : '';
    if (KS.pecas) {
      $('#kPecas').innerHTML = KS.pecas.map(function (pc, i) {
        var m = M[pc[0]];
        return '<li class="pc">' +
          '<a class="pc-art" href="#/p/' + m.id + '" tabindex="-1" aria-hidden="true">' + arte(m) + '</a>' +
          '<div class="pc-tx"><a class="pc-n" href="#/p/' + m.id + '">' + esc(m.nome) + '</a>' +
          '<span class="pc-m">' + m.min + ' cm · -' + m.desc + '% · De <s>' + centavos(m.de) + '</s> por ' + centavos(m.por) + '</span>' +
          (m.tipo === 'm' ? '<div class="pg-rap pg-rap--sm">' + [10, 50, 100, 500].map(function (n) { return '<button type="button" data-act="pc-plus" data-i="' + i + '" data-n="' + n + '">+' + n + '</button>'; }).join('') + '</div>' : '') +
          '</div>' +
          '<div class="pc-q">' + passo(String(i), pc[1], m.nome, 'pc-') + '<b class="pc-t">' + centavos(m.por * pc[1]) + '</b></div>' +
          '<button type="button" class="pc-swap" data-act="pc-trocar" data-i="' + i + '">' + ico('i-swap') + 'Trocar</button></li>';
      }).join('');
    }
    $('#kRes').innerHTML = resumo(p.por * KS.mult, 'Adicionando ' + (KS.mult > 1 ? 'estes kits' : 'este kit') + ', você garante', totais().por ? 'Seu carrinho com o kit' : 'Pedido com o kit');
    A.fogo.kick();
  }

  // Trocar peça do kit
  var dlg = $('#dlgTrocar'), trocaI = -1;
  function abrirTroca(i) {
    trocaI = i;
    var atual = M[KS.pecas[i][0]];
    $('#dlgTrocarT').textContent = 'Trocar ' + atual.nome;
    $('#dlgBusca').value = '';
    listarTroca();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    setTimeout(function () { $('#dlgBusca').focus(); }, 30);
  }
  function listarTroca() {
    var atual = M[KS.pecas[trocaI][0]], b = norm($('#dlgBusca').value.trim());
    var lista = MODELOS.filter(function (m) {
      return m.tipo === atual.tipo && (!atual.mod || m.mod === atual.mod || (atual.tipo === 't' && m.mod === null)) && (!b || norm(m.nome).indexOf(b) >= 0);
    });
    $('#dlgLista').innerHTML = lista.map(function (m) {
      return '<li><button type="button" data-troca="' + m.id + '"' + (m.id === atual.id ? ' aria-current="true"' : '') + '>' +
        '<span class="dl-art">' + arte(m) + '</span><span class="dl-tx"><b>' + esc(m.nome) + '</b><small>' + m.min + ' cm · ' + esc(m.mod ? modNome(m.mod) : 'a classificar') + '</small></span>' +
        '<span class="dl-pr">' + centavos(m.por) + '</span></button></li>';
    }).join('') || '<li class="dl-vazio">Nenhum modelo encontrado.</li>';
  }
  $('#dlgBusca').addEventListener('input', listarTroca);
  $('#dlgLista').addEventListener('click', function (e) {
    var b = e.target.closest('[data-troca]'); if (!b) return;
    var id = b.getAttribute('data-troca'), q = KS.pecas[trocaI][1];
    var dup = -1;
    KS.pecas.forEach(function (p, j) { if (p[0] === id && j !== trocaI) dup = j; });
    if (dup >= 0) { KS.pecas[dup][1] += q; KS.pecas.splice(trocaI, 1); }
    else KS.pecas[trocaI][0] = id;
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    pintarKit();
    avisar('Peça trocada por ' + M[id].nome + '.');
  });

  /* ======================================================================
     Bônus
     ====================================================================== */
  var BN_VALORES = [1300, 1500, 3000, 5000, 10000, 15000];
  var BN = { v: 3000, mod: 'futebol', verso: false };
  var KEY_MODS = [['i-soccer', 'FUTEBOL', 'Futebol'], ['i-bike', 'CICLISMO', 'Ciclismo'], ['i-racket', 'BEACH TENNIS', 'Beach tennis'], ['i-star', 'SUA MODALIDADE', 'Outras']];
  function chaveiro() {
    return '<div class="g g--key on bn-key">' +
      '<button class="key" id="key" type="button" data-act="key" aria-pressed="false" aria-label="Chaveiro da modalidade, frente. Toque para ver o verso.">' +
      '<span class="key-in"><span class="key-face key-front"><svg viewBox="0 0 200 260" aria-hidden="true">' +
      '<circle cx="100" cy="30" r="20" fill="none" stroke="url(#gGold)" stroke-width="6"/><rect x="94" y="46" width="12" height="22" rx="6" fill="none" stroke="url(#gGold)" stroke-width="4.5"/>' +
      '<path d="M100 66 160 88v64c0 44-27 72-60 88-33-16-60-44-60-88V88z" fill="url(#gGold)"/><path d="M100 78 150 96v56c0 37-22 61-50 75-28-14-50-38-50-75V96z" fill="#14110d"/>' +
      '<circle cx="100" cy="80" r="4.5" fill="#0b0a09"/><svg x="62" y="102" width="76" height="76" viewBox="0 0 24 24" class="key-ic"><use href="#i-soccer" id="keyIc"/></svg>' +
      '<text x="100" y="200" text-anchor="middle" class="key-word">CAMPEÃO</text></svg></span>' +
      '<span class="key-face key-back"><svg viewBox="0 0 200 260" aria-hidden="true">' +
      '<circle cx="100" cy="30" r="20" fill="none" stroke="url(#gGold)" stroke-width="6"/><rect x="94" y="46" width="12" height="22" rx="6" fill="none" stroke="url(#gGold)" stroke-width="4.5"/>' +
      '<path d="M100 66 160 88v64c0 44-27 72-60 88-33-16-60-44-60-88V88z" fill="url(#gGold)"/><path d="M100 78 150 96v56c0 37-22 61-50 75-28-14-50-38-50-75V96z" fill="#e5dccd"/>' +
      '<circle cx="100" cy="80" r="4.5" fill="#0b0a09"/><text x="100" y="128" text-anchor="middle" class="key-b1">PRÓXIMA</text>' +
      '<text x="100" y="152" text-anchor="middle" class="key-b2">Conquista</text><text x="100" y="182" text-anchor="middle" class="key-b3" id="keyMod">FUTEBOL · 2026</text>' +
      '<text x="100" y="204" text-anchor="middle" class="key-b3">ACHEI TROFÉUS</text></svg></span></span></button>' +
      '<div class="g-tx"><b>Chaveiro da modalidade</b><span>a partir de R$ 1.300</span></div>' +
      '<p class="key-hint" id="keyHint">Frente · toque na imagem para ver o verso.</p>' +
      '<div class="key-mods" role="group" aria-label="Modalidade do chaveiro">' + KEY_MODS.map(function (k, i) {
        return '<button type="button" data-act="key-mod" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + k[2] + '</button>';
      }).join('') + '</div><p class="fine">Imagem ilustrativa</p></div>';
  }
  function bonus(q) {
    var vq = Math.round((+q.get('v') || 0) / 100);
    BN.v = BN_VALORES.indexOf(vq) >= 0 ? vq : 3000;
    var t = totais(), vc = t.por / 100, pc = pacoteDe(vc);
    var cards = PACOTES.map(function (p) {
      return '<article class="bn-pk' + (pc === p ? ' is-me' : '') + '" data-min="' + p.min + '">' +
        '<header><h3 class="d">' + reais(p.min) + '</h3>' +
        (pc === p ? '<span class="bn-tag bn-tag--me">Seu carrinho</span>' : '') +
        (p.min === A.MIN_MUNDIAL ? '<span class="bn-tag">Libera o Mundial -70%</span>' : '') + '</header>' +
        '<div class="bn-ph' + (p.t ? '' : ' bn-ph--1') + '">' +
        '<figure><img src="' + foto('medalhas.webp') + '" width="1000" height="951" alt="" loading="lazy" decoding="async"><b>' + p.m + '</b></figure>' +
        (p.t ? '<figure class="bn-ph-t"><img src="' + foto('cut/podio.webp') + '" width="900" height="947" alt="" loading="lazy" decoding="async"><b>' + p.t + '</b></figure>' : '') + '</div>' +
        '<p class="bn-q">' + p.m + ' medalhas' + (p.t ? ' e ' + p.t + ' troféus' : '') + '</p>' +
        '<p class="bn-x">' + ico(p.ic) + '<span>+ ' + lower1(p.x) + '</span></p></article>';
    }).join('');
    return '<section class="lj-head wrap"><p class="eyebrow">Quanto mais você compra, mais leva</p>' +
      '<h1 class="d lj-h1" tabindex="-1">Bônus <span class="serif">que sobem com o pedido</span></h1>' +
      '<p class="lede">Oito pacotes de medalhas e troféus grátis, com extras que se somam. Na abertura, a janela de velocidade soma por cima.</p>' +
      (t.por ? '<a class="bn-me" href="#/carrinho">' + ico('i-cart') + '<span>Seu carrinho: <b>' + centavos(t.por) + '</b>' + (pc ? ' · pacote de ' + reais(pc.min) : ' · faltam ' + centavos(A.MIN_BONUS * 100 - t.por) + ' para o primeiro pacote') + '</span></a>' : '') +
      '</section>' +
      '<section class="wrap lj-sec"><div class="bn-grid" id="bnPk">' + cards + '</div>' +
      '<p class="fine">Fotos de referência: medalhas de metal padrão e troféus padrão de 15 cm, grátis e sem arte por evento.</p></section>' +
      '<section class="wrap lj-sec bn-rules-sec"><div class="bn-rules">' + chaveiro() +
      '<div class="bn-r-col"><h2 class="d">Como funciona</h2><ul class="bn-r">' +
      '<li><b>Vale o maior pacote</b><span>Medalhas e troféus não somam.</span></li>' +
      '<li><b>Extras acumulam</b><span>Os do pacote e os dos anteriores.</span></li>' +
      '<li><b>Janela soma</b><span>A partir de R$ 1.300.</span></li></ul>' +
      '<p class="fine">Extras em desenho, limitados ao estoque. Valor do pedido: produtos pelo preço pago, sem Mundial, sem frete e sem juros. Cashback de 10% a partir de R$ 3.000: não vale de setembro a novembro nem acumula.</p></div></div></section>' +
      '<section class="wrap lj-sec"><header class="lj-sec-h"><h2 class="d">O mesmo pedido <span class="serif">em cada janela</span></h2></header>' +
      '<div class="cmp-chips bn-chips" role="group" aria-label="Valor do pedido"><span class="cmp-lbl">Valor do pedido</span>' + BN_VALORES.map(function (v) {
        return '<button type="button" data-act="bn-v" data-v="' + v + '" aria-pressed="' + (v === BN.v) + '">' + A.milhar(v) + '</button>';
      }).join('') + '</div><div class="bn-ws" id="bnWs"></div>' +
      '<p class="fine">Sorteios sujeitos a regulamento e autorização.</p></section>';
  }
  function pintarJanelas() {
    var f = faseAgora(), v = BN.v;
    $$('[data-act="bn-v"]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-v') === v ? 'true' : 'false'); });
    try { history.replaceState(null, '', '#/bonus?v=' + v * 100); } catch (e) {}
    $('#bnWs').innerHTML = [0, 1, 2].map(function (i) {
      var r = calc(v, i);
      var st = f < 0 ? (i === 0 ? 'A primeira a abrir' : '') : f > i ? (f >= 3 ? 'Encerrada' : 'Fechada') : f === i ? 'Agora' : '';
      return '<article class="bn-w' + (i === 0 ? ' bn-w--1' : '') + (f === i ? ' is-now' : '') + (f > i ? ' is-closed' : '') + '">' +
        '<p class="w-state">' + st + '</p><h3 class="d">' + JANELAS[i].nome + '</h3>' +
        '<p class="bn-wn"><b>' + r.medalhas + '</b> medalhas</p>' +
        '<p class="bn-wt">' + r.trofeus + ' troféus e +1 chaveiro</p>' +
        '<ul class="w-list w-list--s">' + r.sorteios.map(function (s) { return '<li>' + s.replace(/ \((proposta|quantidades propostas)\)/, '') + '</li>'; }).join('') + '</ul></article>';
    }).join('');
    A.fogo.kick();
  }

  /* ======================================================================
     Carrinho
     ====================================================================== */
  function miniatura(it) {
    if (it.t === 'm') return arte(M[it.id]);
    if (it.t === 'w') return '<img src="' + foto('cut/rings.webp') + '" alt="" loading="lazy">';
    var k = K[it.id];
    return k.img ? arteKit(k) : '<span class="kt-mini">' + ico(modIc(k.mod)) + '<b>Kit</b></span>';
  }
  function carrinho() {
    var t = totais();
    var h = '<section class="lj-head wrap"><p class="eyebrow">Seu pedido da pré-venda</p>' +
      '<h1 class="d lj-h1" tabindex="-1">Carrinho</h1></section>';
    if (!cart.length) {
      return h + '<section class="wrap lj-sec"><div class="lj-empty lj-empty--big">' + ico('i-cart') +
        '<p>Seu carrinho está vazio. Monte o pedido agora e compre na abertura, 16/11 às 20h.</p>' +
        '<div class="hero-cta"><a class="btn" href="#/vitrine?tab=kits"><span>Ver kits prontos</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></a>' +
        '<a class="link" href="#/vitrine">Ver a vitrine</a></div></div></section>';
    }
    var mund = t.por >= A.MIN_MUNDIAL * 100;
    var rows = cart.map(function (it) {
      var key = chave(it), u = unidade(it), meta;
      if (it.t === 'm') { var m = M[it.id]; meta = m.min + ' cm · ' + (m.tipo === 'm' ? 'Medalha' : 'Troféu') + ' · ' + centavos(u.por) + ' cada'; }
      else if (it.t === 'w') meta = 'Liberado com R$ 5.000 em outros produtos. Não conta para os pacotes.' + (mund ? '' : ' <b class="ct-warn">Volte a R$ 5.000 para manter o preço.</b>');
      else { var k = K[it.id], pp = it.p ? precoPecas(it.p) : k; meta = compo(pp.med, pp.tro) + (personalizado(it) ? ' · peças personalizadas' : '') + ' · ' + centavos(u.por) + ' o kit'; }
      var href = it.t === 'm' ? '#/p/' + it.id : it.t === 'k' ? '#/kit/' + it.id : '../#mundial';
      return '<li class="ct-row' + (it.t === 'w' ? ' ct-row--w' : '') + '">' +
        '<a class="ct-art" href="' + href + '" tabindex="-1" aria-hidden="true">' + miniatura(it) + '</a>' +
        '<div class="ct-tx"><a class="ct-n" href="' + href + '">' + esc(nomeLinha(it)) + '</a><span class="ct-m">' + meta + '</span></div>' +
        '<div class="ct-q">' + passo(key, it.q, nomeLinha(it)) + '</div>' +
        '<div class="ct-t"><s>' + centavos(u.de * it.q) + '</s><b>' + centavos(u.por * it.q) + '</b></div>' +
        '<button type="button" class="ct-rm" data-act="rm" data-key="' + esc(key) + '" aria-label="Tirar ' + esc(nomeLinha(it)) + ' do carrinho">' + ico('i-trash') + '</button></li>';
    }).join('');
    return h + '<section class="wrap lj-sec"><div class="ct-grid"><div class="ct-main">' +
      '<ul class="ct-list">' + rows + '</ul>' +
      '<div class="ct-foot"><a class="link" href="#/vitrine">Continuar comprando</a><button type="button" class="ct-clear" data-act="clear">' + ico('i-trash') + 'Esvaziar carrinho</button></div>' +
      '<div class="ct-mun' + (mund ? ' is-on' : '') + '">' + caixaMundial(t) + '</div></div>' +
      '<aside class="ct-side" id="ctSide">' + ladoCarrinho(t) + '</aside></div></section>';
  }
  function caixaMundial(t) {
    var mund = t.por >= A.MIN_MUNDIAL * 100;
    var h = '<div class="ct-mun-in"><img src="' + foto('cut/rings.webp') + '" alt="Troféu Mundial dourado em forma de anéis" loading="lazy">' +
      '<div><p class="kt-mod">' + ico(mund ? 'i-unlock' : 'i-lock') + (mund ? 'Liberado no seu pedido' : 'Oferta desbloqueável') + '</p>' +
      '<h2 class="d">Troféu Mundial <span class="gold-text">-70%</span></h2>';
    if (mund) {
      h += '<p class="fine">Escolha o tamanho. O Mundial não conta para os pacotes.</p><div class="ct-mun-sz">' + MUNDIAL.map(function (w) {
        var q = qtd('w:' + w.cm);
        return '<button type="button" data-act="add-w" data-cm="' + w.cm + '"><b>' + w.cm + ' cm</b><s>' + centavos(w.de) + '</s><span>' + centavos(w.por) + '</span>' + (q ? '<i>' + q + ' no carrinho</i>' : '<i>Adicionar</i>') + '</button>';
      }).join('') + '</div>';
    } else {
      h += '<p>Faltam <b>' + centavos(A.MIN_MUNDIAL * 100 - t.por) + '</b> em outros produtos e kits para liberar. De R$ 239,20 por R$ 71,76 no tamanho de 22 cm.</p>' +
        '<a class="link" href="#/vitrine?tab=kits">Ver kits que liberam o Mundial</a>';
    }
    return h + '</div></div>';
  }
  function ladoCarrinho(t) {
    var f = faseAgora(), w = janelaVista(), v = t.por / 100, r = calc(v, w), p = r.p;
    var h = '<div class="ct-tot"><p class="ct-l">Valor do pedido</p><p class="ct-v">' + centavos(t.por) + '</p>' +
      '<p class="ct-eco">De <s>' + centavos(t.de) + '</s> · economia de <b>' + centavos(t.de - t.por) + '</b></p>' +
      (t.wPor ? '<p class="ct-w">+ Troféu Mundial: <b>' + centavos(t.wPor) + '</b> · total <b>' + centavos(t.por + t.wPor) + '</b></p>' : '') + '</div>';
    if (p) {
      h += '<div class="ct-pk"><p class="ct-l">Pacote de ' + reais(p.min) + '</p><table class="ct-wt"><thead><tr><th scope="col"></th>' + [0, 1, 2].map(function (i) {
        return '<th scope="col" class="' + (i === w ? 'is-w' : '') + (f > i && f <= 2 ? ' is-off' : '') + '">' + JANELAS[i].nome + '</th>';
      }).join('') + '</tr></thead><tbody><tr><th scope="row">Medalhas</th>' + [0, 1, 2].map(function (i) {
        return '<td class="' + (i === w ? 'is-w' : '') + (f > i && f <= 2 ? ' is-off' : '') + '">' + calc(v, i).medalhas + '</td>';
      }).join('') + '</tr><tr><th scope="row">Troféus</th>' + [0, 1, 2].map(function (i) {
        return '<td class="' + (i === w ? 'is-w' : '') + (f > i && f <= 2 ? ' is-off' : '') + '">' + p.t + '</td>';
      }).join('') + '</tr></tbody></table>' +
        '<ul class="rs-x">' + PACOTES.filter(function (k) { return k.min <= p.min; }).map(function (k) { return '<li>' + ico(k.ic) + '<span>' + k.x + '</span></li>'; }).join('') +
        '<li class="new">' + ico('i-bolt') + '<span>Chaveiro extra da modalidade (janela)</span></li></ul>' +
        '<p class="ct-l">Sorteios ' + JANELAS[w].na + '</p><ul class="w-list w-list--s">' + r.sorteios.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
        '<p class="fine">Sujeito a regulamento e autorização.</p></div>';
    } else {
      h += '<p class="nudge">' + ico('i-gift') + '<span>Bônus a partir de <b>R$ 1.300</b>. Faltam ' + centavos(A.MIN_BONUS * 100 - t.por) + ' para 10 medalhas grátis e o chaveiro da modalidade.</span></p>';
    }
    h += trilho(v);
    var nx = proximo(p);
    if (p && nx) h += '<p class="nudge">' + ico('i-gift') + '<span>Faltam <b>' + centavos(nx.min * 100 - t.por) + '</b> para o pacote de ' + compo(nx.m, nx.t) + ', mais: ' + lower1(nx.x) + '.</span></p>';
    // fechar o pedido
    var msg = A.wa(mensagem());
    if (f < 0) {
      h += '<div class="ct-cta"><p class="ct-open">A compra abre em <b>16/11, às 20h</b>. Seu carrinho fica salvo neste aparelho.</p>' +
        '<a class="btn" href="' + GRUPO + '" target="_blank" rel="noopener" data-cta="grupo"><span>Entrar no grupo</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></a>' +
        '<a class="link" href="' + msg + '" target="_blank" rel="noopener">Enviar este carrinho no WhatsApp</a></div>';
    } else if (f <= 2) {
      h += '<div class="ct-cta"><p class="ct-open">Pré-venda aberta: você está comprando <b>' + JANELAS[f].na + '</b>.</p>' +
        '<a class="btn" href="' + msg + '" target="_blank" rel="noopener"><span>Finalizar no WhatsApp</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></a>' +
        '<a class="link" href="' + GRUPO + '" target="_blank" rel="noopener" data-cta="grupo">Entrar no grupo</a></div>';
    } else {
      h += '<div class="ct-cta"><p class="ct-open">A pré-venda foi encerrada em 18/11, às 20h.</p></div>';
    }
    return h + '<p class="fine">Valor do pedido: produtos pelo preço pago, sem Mundial, sem frete e sem juros. Frete à parte, pago quando o pedido for realizado. Pagamento à vista ou parcelado no cartão, com juros pagos pelo cliente.</p>';
  }
  function mensagem() {
    var t = totais(), w = janelaVista(), r = calc(t.por / 100, w);
    var l = ['Olá! Quero comprar na pré-venda Próxima Conquista da Achei Troféus.', ''];
    cart.slice(0, 40).forEach(function (it) { l.push('• ' + it.q + '× ' + nomeLinha(it) + ' — ' + centavos(unidade(it).por * it.q)); });
    if (cart.length > 40) l.push('… e mais ' + (cart.length - 40) + ' itens');
    l.push('', 'Valor do pedido: ' + centavos(t.por) + (t.wPor ? ' + Troféu Mundial ' + centavos(t.wPor) : ''));
    if (r.p) l.push('Pacote de ' + reais(r.p.min) + ': ' + r.medalhas + ' medalhas e ' + r.trofeus + ' troféus grátis ' + JANELAS[w].na + '.');
    return l.join('\n');
  }

  function naoAchei(txt) {
    return '<section class="wrap lj-sec"><div class="lj-empty lj-empty--big">' + ico('i-search') + '<h1 class="d" tabindex="-1">' + txt + '</h1>' +
      '<a class="btn" href="#/vitrine"><span>Voltar para a vitrine</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></a></div></section>';
  }

  /* ======================================================================
     Barra do carrinho, cabeçalho e aviso
     ====================================================================== */
  var rota = { r: 'vitrine' };
  function pintarCarrinho() {
    var t = totais(), n = cart.length;
    var cn = $('#cartN'); cn.hidden = !n; cn.textContent = n;
    $('#cartT').textContent = n ? centavos(t.por + t.wPor) : 'Carrinho';
    var bar = $('#cartBar');
    if (!n || rota.r === 'carrinho') { bar.classList.remove('is-on'); bar.setAttribute('aria-hidden', 'true'); return; }
    var v = t.por / 100, p = pacoteDe(v), nx = proximo(p);
    var de = p ? p.min : 0, ate = nx ? nx.min : de, frac = nx ? Math.max(0, Math.min(1, (v - de) / (ate - de))) : 1;
    bar.innerHTML = '<div class="wrap lj-bar-in"><div class="lj-bar-v"><b>' + centavos(t.por + t.wPor) + '</b><span>' + n + (n > 1 ? ' itens' : ' item') + '</span></div>' +
      '<div class="lj-bar-p"><p>' + (p ? 'Pacote de ' + reais(p.min) + ' · ' + calc(v, janelaVista()).medalhas + ' medalhas grátis' : 'Bônus a partir de R$ 1.300') +
      (nx ? ' · faltam ' + centavos(nx.min * 100 - t.por) + ' para ' + compo(nx.m, nx.t) : '') + '</p><i style="--f:' + (frac * 100).toFixed(1) + '%"></i></div>' +
      '<a class="btn btn--sm" href="#/carrinho"><span>Ver carrinho</span><span class="ar"><svg><use href="#arr"/></svg><svg><use href="#arr"/></svg></span></a></div>';
    bar.classList.add('is-on'); bar.removeAttribute('aria-hidden');
  }
  function navAtiva() {
    var r = rota.r, kits = (r === 'vitrine' && VS.tab === 'kits') || r === 'kit';
    $$('[data-nav]').forEach(function (a) {
      var k = a.getAttribute('data-nav');
      var on = k === 'kits' ? kits : k === 'vitrine' ? (r === 'vitrine' || r === 'p') && !kits : k === r;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  var faseVista = faseAgora();
  function tique() {
    var t = A.agora(), f = A.fase(t), txt, link = $('#ann a');
    if (f < 0) {
      var r = partes(A.T_ABRE - t);
      txt = 'A compra abre em 16/11 às 20h · faltam <b>' + (r.d ? r.d + 'd ' : '') + p2(r.h) + 'h ' + p2(r.m) + 'min ' + p2(r.s) + 's</b>. Já dá para montar o carrinho.';
      link.textContent = 'Entrar no grupo para comprar na abertura'; link.hidden = false;
    } else if (f <= 2) {
      var w = partes(JANELAS[f].fim - t);
      txt = 'Pré-venda aberta · você está comprando <b>' + JANELAS[f].na + '</b> · ' + (f < 2 ? 'esta janela fecha' : 'termina') + ' em <b>' + (w.d ? w.d + 'd ' : '') + p2(w.h) + ':' + p2(w.m) + ':' + p2(w.s) + '</b>.';
      link.textContent = 'Entrar no grupo'; link.hidden = false;
    } else {
      txt = 'A pré-venda foi encerrada em 18/11, às 20h.'; link.hidden = true;
    }
    $('#annTxt').innerHTML = txt;
    $('#ann').classList.toggle('is-live', f >= 0 && f <= 2);
    if (f !== faseVista) { faseVista = f; render(false); }
  }

  var toastT;
  function avisar(html) {
    var el = $('#toast');
    el.innerHTML = html;
    el.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove('is-on'); }, 2800);
  }

  /* ======================================================================
     Rotas
     ====================================================================== */
  function lerRota() {
    var h = location.hash.replace(/^#/, '') || '/vitrine';
    var i = h.indexOf('?'), path = i >= 0 ? h.slice(0, i) : h, qs = i >= 0 ? h.slice(i + 1) : '';
    var parts = path.split('/').filter(Boolean);
    return { r: parts[0] || 'vitrine', id: parts[1] ? decodeURIComponent(parts[1]) : null, q: new URLSearchParams(qs) };
  }
  function render(topo) {
    var R = lerRota();
    if (['vitrine', 'kit', 'p', 'bonus', 'carrinho'].indexOf(R.r) < 0) R = { r: 'vitrine', id: null, q: new URLSearchParams() };
    rota = R;
    var html, title = 'Comprar';
    if (R.r === 'vitrine') { html = vitrine(R.q); title = VS.tab === 'kits' ? 'Kits' : 'Vitrine'; }
    else if (R.r === 'kit') { html = kitPagina(R.id); title = K[R.id] ? 'Kit ' + K[R.id].nome : 'Kit'; }
    else if (R.r === 'p') { html = produto(R.id); title = M[R.id] ? M[R.id].nome : 'Modelo'; }
    else if (R.r === 'bonus') { html = bonus(R.q); title = 'Bônus'; }
    else { html = carrinho(); title = 'Carrinho'; }
    app.innerHTML = html;
    document.title = title + ' · Pré-venda Próxima Conquista · Achei Troféus';
    if (R.r === 'vitrine') pintarVitrine();
    if (R.r === 'p') pintarProduto();
    if (R.r === 'kit') pintarKit();
    if (R.r === 'bonus') pintarJanelas();
    navAtiva();
    pintarCarrinho();
    if (topo !== false) {
      window.scrollTo(0, 0);
      var h1 = $('h1', app); if (h1) h1.focus({ preventScroll: true });
    }
    A.fogo.kick();
  }
  window.addEventListener('hashchange', function () { render(true); });

  /* ======================================================================
     Ações
     ====================================================================== */
  function rePintar() {
    if (rota.r === 'carrinho') {
      var y = window.scrollY; render(false); window.scrollTo(0, y);
    } else if (rota.r === 'p') pintarProduto();
    else if (rota.r === 'kit') pintarKit();
  }
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT') return;
    var act = b.getAttribute('data-act'), key = b.getAttribute('data-key');
    switch (act) {
      case 'tab': VS.tab = b.getAttribute('data-v'); VS.n = 48; if (VS.tab !== 'kits') VS.v = 0; pintarVitrine(); break;
      case 'mod': VS.mod = b.getAttribute('data-v'); VS.n = 48; pintarVitrine(); break;
      case 'more': VS.n += 48; pintarVitrine(); break;
      case 'add-m': {
        var m = M[b.getAttribute('data-id')];
        adicionar({ t: 'm', id: m.id }, 1); pintarCard(m.id);
        avisar(ico('i-check') + m.nome + ' (' + m.min + ' cm) no carrinho. <a href="#/carrinho">Ver carrinho</a>');
        var inp = $('.pd[data-id="' + m.id + '"] input'); if (inp) inp.focus();
        break;
      }
      case 'inc': case 'dec': {
        definir(key, qtd(key) + (act === 'inc' ? 1 : -1));
        if (key.indexOf('m:') === 0 && rota.r === 'vitrine') { pintarCard(key.slice(2)); var st = $('.pd[data-id="' + key.slice(2) + '"] [data-act="' + act + '"]') || $('.pd[data-id="' + key.slice(2) + '"] .pd-add'); if (st) st.focus(); }
        else rePintar();
        break;
      }
      case 'rm': definir(key, 0); rePintar(); avisar('Item retirado do carrinho.'); break;
      case 'clear': if (window.confirm('Esvaziar o carrinho?')) { cart = []; salvar(); rePintar(); } break;
      case 'p-inc': case 'p-dec': PS.q = Math.max(1, PS.q + (act === 'p-inc' ? 1 : -1)); pintarProduto(); break;
      case 'p-plus': PS.q += +b.getAttribute('data-n'); pintarProduto(); break;
      case 'add-p': {
        var mp = M[PS.id];
        adicionar({ t: 'm', id: mp.id }, PS.q); pintarProduto();
        avisar(ico('i-check') + PS.q + '× ' + mp.nome + ' no carrinho. <a href="#/carrinho">Ver carrinho</a>');
        break;
      }
      case 'k-mult': KS.mult = +b.getAttribute('data-n'); pintarKit(); break;
      case 'pc-inc': case 'pc-dec': {
        var i = +key, pc = KS.pecas[i];
        pc[1] = Math.max(0, pc[1] + (act === 'pc-inc' ? 1 : -1));
        if (!pc[1] && KS.pecas.length > 1) KS.pecas.splice(i, 1); else if (!pc[1]) pc[1] = 1;
        pintarKit(); break;
      }
      case 'pc-plus': KS.pecas[+b.getAttribute('data-i')][1] += +b.getAttribute('data-n'); pintarKit(); break;
      case 'pc-trocar': abrirTroca(+b.getAttribute('data-i')); break;
      case 'add-k': {
        var k = K[KS.id], it = { t: 'k', id: k.id };
        if (KS.pecas) it.p = KS.pecas.map(function (p) { return p.slice(); });
        adicionar(it, KS.mult); pintarKit();
        avisar(ico('i-check') + (KS.mult > 1 ? KS.mult + ' kits ' : 'Kit ') + k.nome + ' no carrinho. <a href="#/carrinho">Ver carrinho</a>');
        break;
      }
      case 'add-w': {
        var cm = +b.getAttribute('data-cm');
        adicionar({ t: 'w', cm: cm }, 1); rePintar();
        avisar(ico('i-check') + 'Troféu Mundial de ' + cm + ' cm a 70% OFF no carrinho.');
        break;
      }
      case 'bn-v': BN.v = +b.getAttribute('data-v'); pintarJanelas(); break;
      case 'key': {
        var back = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', back ? 'true' : 'false');
        BN.verso = back; chaveiroRotulo(); break;
      }
      case 'key-mod': {
        var km = KEY_MODS[+b.getAttribute('data-i')];
        $$('[data-act="key-mod"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $('#keyIc').setAttribute('href', '#' + km[0]);
        $('#keyMod').textContent = km[1] + ' · 2026';
        BN.mod = km[2].toLowerCase(); chaveiroRotulo(); break;
      }
    }
  });
  function chaveiroRotulo() {
    var k = $('#key'); if (!k) return;
    var back = k.getAttribute('aria-pressed') === 'true';
    k.setAttribute('aria-label', 'Chaveiro de ' + BN.mod + ', ' + (back ? 'verso' : 'frente') + '. Toque para ver ' + (back ? 'a frente' : 'o verso') + '.');
    $('#keyHint').textContent = (back ? 'Verso' : 'Frente') + ' · toque na imagem para ver ' + (back ? 'a frente' : 'o verso') + '.';
  }

  // Digitação: busca, tamanho e quantidades
  var buscaT;
  app.addEventListener('input', function (e) {
    var el = e.target;
    if (el.id === 'vBusca') {
      clearTimeout(buscaT);
      buscaT = setTimeout(function () { VS.q = el.value.trim(); VS.n = 48; pintarVitrine(); }, 160);
      return;
    }
    var act = el.getAttribute('data-act');
    if (!act) return;
    var d = el.value.replace(/\D/g, '').slice(0, 5);
    if (el.value !== d) el.value = d;
    if (act === 'p-qty' && d) { PS.q = Math.max(1, +d); pintarProduto(); }
  });
  app.addEventListener('change', function (e) {
    var el = e.target, act = el.getAttribute('data-act'), key = el.getAttribute('data-key');
    if (el.id === 'vTam') { VS.tam = el.value; VS.n = 48; pintarVitrine(); return; }
    if (act === 'qty') {
      definir(key, +el.value || 0);
      if (key.indexOf('m:') === 0 && rota.r === 'vitrine') pintarCard(key.slice(2)); else rePintar();
    }
    if (act === 'p-qty') { PS.q = Math.max(1, +el.value || 1); pintarProduto(); }
    if (act === 'pc-qty') {
      var pc = KS.pecas[+key]; pc[1] = Math.max(1, +el.value || 1); pintarKit();
    }
  });
  app.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('input[data-act]')) e.target.blur();
  });

  /* ======================================================================
     Fogo nas melhores ofertas: kits que liberam o Mundial, Mundial liberado
     no carrinho, pacote de R$ 5.000 e a janela da 1ª hora nos bônus
     ====================================================================== */
  var acabou = function () { return faseAgora() >= 3; };
  var trilhoKits = function (el) { var r = el.closest('.kt-rail-wrap'); return r ? r.getBoundingClientRect() : null; };
  A.fogo.emVolta({ items: function () { return $$('.kt.is-mundial'); }, clip: trilhoKits, heat: 1.1, size: .95, out: acabou });
  A.fogo.emVolta({ items: function () { return $$('.ct-mun.is-on'); }, heat: 1.25, size: 1, out: acabou });
  A.fogo.emVolta({ items: function () { return $$('.bn-pk[data-min="5000"]'); }, heat: 1, size: 1, out: acabou });
  A.fogo.emVolta({ items: function () { return $$('.bn-w--1'); }, heat: 1.2, size: 1, out: function () { return faseAgora() >= 1; } });

  // Carrinho alterado em outra aba do navegador
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    try { var raw2 = JSON.parse(e.newValue || '[]'); cart = Array.isArray(raw2) ? raw2.filter(valido) : []; } catch (err) { cart = []; }
    var y = window.scrollY; render(false); window.scrollTo(0, y);
  });

  render(true);
  tique();
  setInterval(tique, 1000);
})();
