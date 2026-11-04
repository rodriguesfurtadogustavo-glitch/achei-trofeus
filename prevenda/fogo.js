/* Achei Troféus — fogo compartilhado (pré-venda e loja)

   ACHEI.fogo.sprites(n, rampa)   gradientes de chama prontos para desenhar
   ACHEI.fogo.emVolta(grupo)      chamas pelo contorno dos elementos do grupo
   ACHEI.fogo.kick()              avisa que a página mudou (ex.: nova aba na loja)

   Um grupo é { items(): [elementos], heat, size, light?, r?, rect?(el), mark?(el), out?(el), clip?(el) }.
   clip(el) devolve a caixa que recorta o fogo na horizontal (ex.: um trilho com rolagem lateral).
   items() é chamado a cada quadro, então elementos que entram e saem da página
   (troca de aba, filtro) ganham e perdem o fogo sozinhos. Um canvas fixo por cima
   da página desenha tudo: tabelas e caixas cortariam o que sai da borda. O miolo
   de cada elemento é limpo a cada quadro para o texto continuar legível.
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

  var groups = [], cv = null, ctx = null, SC = .6, VW = 0, VH = 0, NS = 24, SPR = null, SPR_L = null, gen = 0;
  var raf = 0, last = 0, pend = false;
  var store = window.WeakMap ? new WeakMap() : null;
  function state(el) {
    var s = store.get(el);
    if (!s) { s = { ps: [], acc: 0, off: null, tg: null, rad: 0, radGen: -1, built: false }; store.set(el, s); }
    return s;
  }

  function setup() {
    if (cv) return true;
    if (!window.HTMLCanvasElement || !store) return false;
    cv = document.createElement('canvas');
    cv.className = 'fire-ring'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    ctx = cv.getContext('2d');
    SPR = sprites(NS); SPR_L = sprites(NS, CLARO);
    size();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', function () { size(); kick(); });
    document.addEventListener('visibilitychange', kick);
    return true;
  }
  function size() {
    VW = window.innerWidth; VH = window.innerHeight;
    cv.width = Math.round(VW * SC); cv.height = Math.round(VH * SC);
    gen++;
  }

  function targets() {
    var list = [];
    groups.forEach(function (g) {
      (g.items() || []).forEach(function (el) {
        if (!el) return;
        var s = state(el);
        var off = g.out ? !!g.out(el) : false;
        if (off !== s.off) {
          s.off = off;
          (g.mark ? g.mark(el) : [el]).forEach(function (m) { m.classList.toggle('on-fire', !off); });
        }
        if (s.radGen !== gen) {
          var r = g.r;
          if (r === undefined || r === null) { r = parseFloat(getComputedStyle(el).borderTopLeftRadius); if (isNaN(r)) r = 0; }
          s.rad = r; s.radGen = gen;
        }
        var R = g.rect ? g.rect(el) : el.getBoundingClientRect();
        var Cl = g.clip ? g.clip(el) : null;
        var fora = !R || R.width <= 0 || R.bottom < -140 || R.top > VH + 140 || R.right < -60 || R.left > VW + 60 ||
          (Cl && (R.right < Cl.left || R.left > Cl.right));
        if (fora) { s.ps.length = 0; s.built = false; return; }
        list.push({ g: g, s: s, R: R, C: Cl });
      });
    });
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

  function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }

  function draw(list, time) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(SC, 0, 0, SC, 0, 0);
    list.forEach(function (t) {
      var R = t.R, s0 = t.s, light = !!t.g.light, i, p, k, rd, rw, rh;
      var sp = light ? SPR_L : SPR;
      ctx.save();
      if (t.C) { ctx.beginPath(); ctx.rect(t.C.left, -10000, t.C.width, 20000); ctx.clip(); }
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      for (i = 0; i < s0.ps.length; i++) {
        p = s0.ps[i]; k = p.t / p.life;
        rd = p.r * (1 - k * .65); rw = rd * .8; rh = rd * 1.7;
        ctx.globalAlpha = (k < .12 ? k / .12 : Math.pow(1 - k, 1.1)) * (light ? .78 : .75);
        ctx.drawImage(sp[Math.min(NS - 1, Math.floor(k * NS))], R.left + p.x - rw, R.top + p.y - rh * .7, rw * 2, rh * 2);
      }
      ctx.globalAlpha = 1;
      // miolo limpo: o fogo fica em volta, o texto continua legível
      ctx.globalCompositeOperation = 'destination-out';
      rr(R.left + 2, R.top + 2, R.width - 4, R.height - 4, Math.max(0, s0.rad - 2));
      ctx.fill();
      if (s0.off) { ctx.restore(); return; }
      // borda em brasa
      ctx.globalCompositeOperation = light ? 'source-over' : 'lighter';
      var fl = .55 + .25 * Math.sin(time * 9 + R.left * .01) + .15 * Math.sin(time * 23);
      rr(R.left + .5, R.top + .5, R.width - 1, R.height - 1, s0.rad);
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255, 90, 10, ' + (.16 * fl) + ')'; ctx.stroke();
      ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255, 150, 50, ' + fl + ')'; ctx.stroke();
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(now) {
    raf = 0;
    var dt = Math.min(.05, (now - last) / 1000 || .016), time = now / 1000;
    last = now;
    var list = targets(), busy = false;
    list.forEach(function (t) { step(t, dt, time); if (!t.s.off || t.s.ps.length) busy = true; });
    draw(list, time);
    if (busy && !document.hidden) raf = requestAnimationFrame(loop);
  }

  // Movimento reduzido: fogo já formado e parado, redesenhado só quando a página mexe
  function still() {
    pend = false;
    var list = targets();
    list.forEach(function (t) {
      if (t.s.built) return;
      for (var n = 0; n < 50; n++) step(t, 1 / 60, n / 60);
      t.s.built = true;
    });
    draw(list, 0);
  }

  function kick() {
    if (!cv || document.hidden) return;
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
