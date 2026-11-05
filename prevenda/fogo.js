/* Achei Troféus — fogo compartilhado (pré-venda e loja)

   ACHEI.fogo.sprites(n, rampa)   gradientes de chama prontos para desenhar
   ACHEI.fogo.emVolta(grupo)      chamas pelo contorno dos elementos do grupo
   ACHEI.fogo.kick()              avisa que a página mudou (ex.: nova aba na loja)

   Um grupo é { items(): [elementos], heat, size, light?, r?, rect?(el), mark?(el), out?(el), host?(el) }.
   items() é chamado a cada quadro, então elementos que entram e saem da página
   (troca de aba, filtro) ganham e perdem o fogo sozinhos.

   Cada elemento em chamas ganha a própria camada (canvas) posicionada no documento,
   com folga em volta para as chamas subirem. Ela rola junto com a página, sem depender
   do desenho: no celular, a barra de endereço que aparece e some e a rolagem por toque
   não deslocam mais o fogo. A camada fica no <body> (tabelas e caixas não cortam as
   chamas) ou em host(el), quando o elemento está num trilho com rolagem lateral.
   O miolo de cada elemento é limpo a cada quadro para o texto continuar legível.
   Com movimento reduzido, o fogo aparece formado e parado. */
(function () {
  'use strict';
  var A = window.ACHEI = window.ACHEI || {};
  var RM = document.documentElement.classList.contains('rm');

  /* Gradientes radiais do miolo amarelo à ponta vermelha */
  function sprites(n, ramp) {
    var RAMP = ramp || [[255, 244, 210], [255, 224, 140], [255, 186, 66], [255, 138, 28], [246, 94, 12], [220, 56, 8], [158, 28, 6], [78, 12, 4]];
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), f = t * (RAMP.length - 1), k = Math.floor(f), m = f - k;
      var a = RAMP[k], b = RAMP[Math.min(k + 1, RAMP.length - 1)];
      var col = [0, 1, 2].map(function (j) { return Math.round(a[j] + (b[j] - a[j]) * m); }).join(',');
      var sc = document.createElement('canvas'); sc.width = sc.height = 64;
      var g = sc.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(' + col + ',1)'); gr.addColorStop(.38, 'rgba(' + col + ',.5)'); gr.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); out.push(sc);
    }
    return out;
  }
  // No fundo claro (creme), fogo aditivo some: tons saturados com mistura normal
  var CLARO = [[255, 196, 60], [255, 150, 30], [248, 110, 16], [232, 74, 10], [206, 44, 8], [170, 26, 6], [130, 16, 4], [90, 10, 4]];

  var groups = [], SC = .6, VW = 0, VH = 0, NS = 24, SPR = null, SPR_L = null, gen = 0, ready = false;
  var raf = 0, last = 0, pend = false;
  var store = window.WeakMap ? new WeakMap() : null;
  var layers = [];   // estados com camada criada (para esconder ou remover as que saem da página)

  function state(el) {
    var s = store.get(el);
    if (!s) { s = { el: el, ps: [], acc: 0, off: null, tg: null, rad: 0, radGen: -1, warm: false, cv: null, ctx: null, box: null, seen: 0 }; store.set(el, s); }
    return s;
  }

  function setup() {
    if (ready) return true;
    if (!window.HTMLCanvasElement || !store) return false;
    SPR = sprites(NS); SPR_L = sprites(NS, CLARO);
    size();
    // capture: pega também a rolagem lateral dos trilhos de cards, não só a da página
    document.addEventListener('scroll', kick, { passive: true, capture: true });
    window.addEventListener('resize', function () { size(); kick(); });
    window.addEventListener('load', kick);
    document.addEventListener('visibilitychange', kick);
    document.addEventListener('toggle', kick, true);   // <details> abrindo (tabela dos pacotes no celular)
    ready = true;
    return true;
  }
  function size() {
    var w = document.documentElement.clientWidth;
    VH = window.innerHeight;
    if (w !== VW) { VW = w; gen++; }   // a altura muda com a barra do celular: isso não mexe no layout
  }

  // Folga da camada em volta do elemento, proporcional ao tamanho das chamas
  function folga(g) {
    var s = g.size || 1;
    return { t: Math.round(120 * s + 24), l: Math.round(40 * s + 18), r: Math.round(40 * s + 18), b: Math.round(28 * s + 16) };
  }

  // Posiciona a camada do elemento no documento (ou no host). Só mexe no estilo quando muda.
  function colocar(s, g, R) {
    var host = g.host ? g.host(s.el) : null;
    if (!host) host = document.body;
    var body = host === document.body, x, y, maxW;
    if (body) {
      x = R.left + window.pageXOffset; y = R.top + window.pageYOffset; maxW = VW;
    } else {
      var hr = host.getBoundingClientRect();
      x = R.left - hr.left; y = R.top - hr.top; maxW = host.offsetWidth;
    }
    var m = s.m || (s.m = folga(g));
    // no <body>, não passa do topo do documento; num trilho, pode subir na folga do trilho (ele recorta)
    var bl = Math.max(0, Math.floor(x - m.l)), bt = body ? Math.max(0, Math.floor(y - m.t)) : Math.floor(y - m.t);
    var br = Math.min(maxW, Math.ceil(x + R.width + m.r)), bb = Math.ceil(y + R.height + m.b);
    var w = Math.max(1, br - bl), h = Math.max(1, bb - bt);
    if (!s.cv) {
      s.cv = document.createElement('canvas');
      s.cv.className = 'fire-ring'; s.cv.setAttribute('aria-hidden', 'true');
      s.ctx = s.cv.getContext('2d');
      layers.push(s);
    }
    var cv = s.cv, b = s.box;
    if (cv.parentNode !== host) { host.appendChild(cv); b = null; }
    if (!b || b.l !== bl || b.t !== bt) { cv.style.left = bl + 'px'; cv.style.top = bt + 'px'; }
    if (!b || b.w !== w || b.h !== h) {
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      cv.width = Math.max(1, Math.round(w * SC)); cv.height = Math.max(1, Math.round(h * SC));
    }
    if (cv.style.display) cv.style.display = '';
    s.box = { l: bl, t: bt, w: w, h: h };
    s.ox = x - bl; s.oy = y - bt;   // canto do elemento dentro da camada
  }

  // Elemento que não aparece (dentro de <details> fechado, display:none...) não pega fogo.
  // No celular, a tabela dos pacotes fica recolhida e o navegador ainda informa uma
  // posição para a linha escondida: sem isto, o fogo dela aparecia por cima de outros cards.
  function escondido(el) {
    if (el.checkVisibility) return !el.checkVisibility();
    var d = el.closest('details');
    while (d) {
      if (!d.open && !el.closest('summary')) return true;
      d = d.parentElement && d.parentElement.closest('details');
    }
    return !el.getClientRects().length;
  }

  var quadro = 0;
  function targets() {
    var list = [];
    quadro++;
    groups.forEach(function (g) {
      (g.items() || []).forEach(function (el) {
        if (!el) return;
        var s = state(el);
        var off = g.out ? !!g.out(el) : false;
        if (off !== s.off) {
          s.off = off;
          (g.mark ? g.mark(el) : [el]).forEach(function (m) { m.classList.toggle('on-fire', !off); });
        }
        var R = escondido(el) ? null : (g.rect ? g.rect(el) : el.getBoundingClientRect());
        var fora = !R || R.width <= 0 || R.bottom < -160 || R.top > VH + 160 || R.right < -60 || R.left > VW + 60;
        if (fora) { s.ps.length = 0; s.warm = false; return; }
        if (s.radGen !== gen) {
          var r = g.r;
          if (r === undefined || r === null) { r = parseFloat(getComputedStyle(el).borderTopLeftRadius); if (isNaN(r)) r = 0; }
          s.rad = r; s.radGen = gen;
        }
        colocar(s, g, R);
        s.seen = quadro;
        list.push({ g: g, s: s, R: R });
      });
    });
    // camadas de elementos que sumiram (troca de aba) ou saíram da tela
    for (var i = layers.length - 1; i >= 0; i--) {
      var s = layers[i];
      if (s.seen === quadro) continue;
      if (!s.el.isConnected) {
        if (s.cv.parentNode) s.cv.parentNode.removeChild(s.cv);
        layers.splice(i, 1); s.cv = null; s.box = null;
      } else if (s.cv.style.display !== 'none') s.cv.style.display = 'none';
    }
    return list;
  }

  // Ponto aleatório no contorno arredondado, com a normal para fora
  function spot(w, h, r, u01) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    var sw = w - 2 * r, sh = h - 2 * r, arc = Math.PI * r / 2;
    var segs = [sw, arc, sh, arc, sw, arc, sh, arc], L = 2 * sw + 2 * sh + 4 * arc;
    var u = u01 * L, i = 0;
    while (i < 7 && u > segs[i]) { u -= segs[i]; i++; }
    var k = segs[i] ? u / segs[i] : 0, a;
    switch (i) {
      case 0: return { x: r + k * sw, y: 0, nx: 0, ny: -1 };
      case 1: a = -Math.PI / 2 + k * Math.PI / 2; return { x: w - r + Math.cos(a) * r, y: r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
      case 2: return { x: w, y: r + k * sh, nx: 1, ny: 0 };
      case 3: a = k * Math.PI / 2; return { x: w - r + Math.cos(a) * r, y: h - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
      case 4: return { x: w - r - k * sw, y: h, nx: 0, ny: 1 };
      case 5: a = Math.PI / 2 + k * Math.PI / 2; return { x: r + Math.cos(a) * r, y: h - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
      case 6: return { x: 0, y: h - r - k * sh, nx: -1, ny: 0 };
      default: a = Math.PI + k * Math.PI / 2; return { x: r + Math.cos(a) * r, y: r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
    }
  }

  function step(t, dt, time) {
    var g = t.g, s0 = t.s, R = t.R;
    var heat = s0.off ? 0 : g.heat, s = g.size;
    var per = 2 * (R.width + R.height);
    // línguas de fogo: as partículas nascem agrupadas, e cada grupo oscila
    var n = Math.max(4, Math.round(per / 70));
    if (!s0.tg || s0.tg.length !== n) { s0.tg = []; for (var q = 0; q < n; q++) s0.tg.push({ ph: Math.random() * 6.28, sp: .5 + Math.random() }); }
    s0.acc += dt * per * .17 * heat;
    while (s0.acc >= 1) {
      s0.acc--;
      var j = Math.floor(Math.random() * n), tg = s0.tg[j];
      var u01 = ((j + .5 + (Math.random() + Math.random() - 1) * .22 + .3 * Math.sin(time * tg.sp + tg.ph)) / n) % 1;
      if (u01 < 0) u01 += 1;
      var p = spot(R.width, R.height, s0.rad, u01);
      var keep = p.ny < 0 ? .85 + .15 * -p.ny : .85 - .55 * p.ny;
      if (Math.random() > keep) continue;
      var under = p.ny > .5;
      s0.ps.push({
        x: p.x + p.nx * 2, y: p.y + p.ny * 2,
        vx: p.nx * (10 + Math.random() * 26) * s + (Math.random() - .5) * 10,
        vy: under ? (6 + Math.random() * 16) * s : -(40 + Math.random() * 70) * s + p.ny * (8 + Math.random() * 18) * s,
        r: (7 + Math.random() * 9) * (.6 + .4 * s) * (under ? .8 : 1),
        t: 0, life: under ? .28 + Math.random() * .25 : .35 + Math.random() * .5, ph: Math.random() * 6.28
      });
    }
    for (var i = s0.ps.length - 1; i >= 0; i--) {
      var q2 = s0.ps[i]; q2.t += dt;
      if (q2.t >= q2.life) { s0.ps.splice(i, 1); continue; }
      q2.vy -= 70 * s * dt;
      q2.vx *= 1 - dt * 2.2;
      q2.x += (q2.vx + Math.sin(time * 7 + q2.ph + q2.y * .05) * 9) * dt;
      q2.y += q2.vy * dt;
    }
  }
  // Ao entrar na tela, a camada já aparece com o fogo formado (sem "acender" do zero)
  function aquecer(t, time) {
    if (t.s.warm) return;
    for (var n = 0; n < 45; n++) step(t, 1 / 60, time - (45 - n) / 60);
    t.s.warm = true;
  }

  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }

  function draw(t, time) {
    var s0 = t.s, ctx = s0.ctx, R = t.R, light = !!t.g.light, i, p, k, rd, rw, rh;
    var ox = s0.ox, oy = s0.oy, sp = light ? SPR_L : SPR;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, s0.cv.width, s0.cv.height);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
    for (i = 0; i < s0.ps.length; i++) {
      p = s0.ps[i]; k = p.t / p.life;
      rd = p.r * (1 - k * .65); rw = rd * .8; rh = rd * 1.7;
      ctx.globalAlpha = (k < .12 ? k / .12 : Math.pow(1 - k, 1.1)) * (light ? .78 : .75);
      ctx.drawImage(sp[Math.min(NS - 1, Math.floor(k * NS))], ox + p.x - rw, oy + p.y - rh * .7, rw * 2, rh * 2);
    }
    ctx.globalAlpha = 1;
    // miolo limpo: o fogo fica em volta, o texto continua legível
    ctx.globalCompositeOperation = 'destination-out';
    rr(ctx, ox + 2, oy + 2, R.width - 4, R.height - 4, Math.max(0, s0.rad - 2));
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    if (s0.off) return;
    // borda em brasa
    ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
    var fl = .55 + .25 * Math.sin(time * 9 + ox * .01 + oy * .003) + .15 * Math.sin(time * 23);
    rr(ctx, ox + .5, oy + .5, R.width - 1, R.height - 1, s0.rad);
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255, 90, 10, ' + (.16 * fl) + ')'; ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255, 150, 50, ' + fl + ')'; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(now) {
    raf = 0;
    var dt = Math.min(.05, (now - last) / 1000 || .016), time = now / 1000;
    last = now;
    var list = targets(), busy = false;
    list.forEach(function (t) {
      aquecer(t, time);
      step(t, dt, time);
      draw(t, time);
      if (!t.s.off || t.s.ps.length) busy = true;
    });
    if (busy && !document.hidden) raf = requestAnimationFrame(loop);
  }

  // Movimento reduzido: fogo já formado e parado, redesenhado só quando a página mexe
  function still() {
    pend = false;
    targets().forEach(function (t) {
      if (!t.s.warm) { t.s.ps = []; for (var n = 0; n < 50; n++) step(t, 1 / 60, n / 60); t.s.warm = true; }
      draw(t, 0);
    });
  }

  function kick() {
    if (!ready || document.hidden) return;
    if (RM) { if (!pend) { pend = true; requestAnimationFrame(still); } return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  function emVolta(g) {
    if (!setup()) return;
    groups.push(g);
    kick();
  }

  A.fogo = { sprites: sprites, emVolta: emVolta, kick: kick };
})();
