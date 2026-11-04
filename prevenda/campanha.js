/* Achei Troféus — regras da campanha "Próxima Conquista"
   Fonte única para a página da pré-venda e para a loja (comprar/).
   Para mudar datas, pacotes, janelas, sorteios ou o Troféu Mundial, edite só aqui. */
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
    { min: 1300, m: 10, t: 0, x: 'Chaveiro da modalidade', ic: 'i-key' },
    { min: 1500, m: 15, t: 2, x: 'Boné, viseira ou munhequeira', ic: 'i-cap' },
    { min: 2000, m: 20, t: 3, x: 'Item da modalidade (bola, bolinhas ou similar)', ic: 'i-ball' },
    { min: 3000, m: 30, t: 5, x: '10% de cashback na próxima compra', ic: 'i-pct' },
    { min: 5000, m: 50, t: 10, x: 'Copo ou boné com a sua marca', ic: 'i-cup' },
    { min: 7500, m: 80, t: 15, x: 'Camisa autografada', ic: 'i-shirt' },
    { min: 10000, m: 120, t: 25, x: 'Visita ao bastidor ou camarote', ic: 'i-ticket' },
    { min: 15000, m: 200, t: 40, x: 'Gravação do nome em troféu ou copo', ic: 'i-laser' }
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

  var A = window.ACHEI = window.ACHEI || {};
  var exp = {
    T_ABRE: T_ABRE, T_H1: T_H1, T_H24: T_H24, T_FIM: T_FIM,
    WHATS: WHATS, MIN_BONUS: MIN_BONUS, MIN_MUNDIAL: MIN_MUNDIAL, MEDALHA_CENT: MEDALHA_CENT, TROFEU_CENT: TROFEU_CENT, MAIS_MEDALHAS: MAIS_MEDALHAS,
    PACOTES: PACOTES, JANELAS: JANELAS, SORTEIOS: SORTEIOS, MUNDIAL: MUNDIAL, MARCAS: MARCAS, ROTULOS: ROTULOS, RAIL_MAX: RAIL_MAX,
    $: $, $$: $$, RM: RM, clamp: clamp, milhar: milhar, reais: reais, centavos: centavos, pct: pct, lower1: lower1, ico: ico, wa: wa,
    agora: agora, fase: fase, partes: partes, p2: p2,
    pacoteDe: pacoteDe, proximo: proximo, calc: calc
  };
  for (var k in exp) A[k] = exp[k];
})();
