/* Achei Troféus — cadastro para entrar no grupo da pré-venda (7 passos)

   Porta fiel da captação da página oficial da oferta: o mesmo contrato com o servidor
   (POST /achei-trofeus/api/lead, aceite, quiz, whatsapp, evento; GET /achei-trofeus/api/saude),
   o mesmo regulamento (v1, com o SHA-256 dos bytes publicados enviado no aceite) e as mesmas
   chaves no aparelho (at_sessao, at_outbox, at_cadastro). Só o visual é o desta página.
   Abre pelos botões [data-cta="grupo"] e pelo endereço #cadastro (a loja usa ../#cadastro).
   Sem o servidor (prévia local, arquivo único), o cadastro avisa que a conexão falhou e guarda
   os dados no aparelho para reenviar, exatamente como na página oficial. */
(() => {
  'use strict';
  const API = '/achei-trofeus/api';
  const REG_VERSAO = 'v1', REG_URL = `/achei-trofeus/regulamento/${REG_VERSAO}/conteudo.html`;
  const META_PIXEL_ID = ''; /* Pixel desligado, como na página oficial. */
  const LEAD_QUENTE = {value:200, currency:'BRL'}; /* Igual a LEAD_QUENTE_VALOR e LEAD_QUENTE_MOEDA do servidor. */
  const QUIZ = [
    {id:'tempo_conhece', q:'Há quanto tempo conhece a Achei Troféus?', a:['Conheci agora','Menos de 6 meses','6 meses a 1 ano','1 a 3 anos','Mais de 3 anos']},
    {id:'ja_comprou', q:'Você já comprou conosco?', a:['Sim, mais de uma vez','Sim, uma vez','Ainda não']},
    {id:'quando_evento', q:'Para quando é o evento que usará os troféus?', a:['Em até 30 dias','1 a 3 meses','3 a 6 meses','6 a 12 meses','Ainda sem data']},
    {id:'eventos_ano', q:'Quantos eventos você faz no ano?', a:['1','2 a 3','4 a 6','7 a 12','Mais de 12']},
    {id:'area_interesse', q:'Qual sua área de maior interesse?', a:['Futebol e futsal','Vôlei','Beach tennis','Futevôlei','Corrida','Tênis','Ciclismo','Basquete','Padel','Lutas','Pescaria','Pôquer e baralho','Agro','Corporativo e homenagens','Outra']}
  ];
  const RETRY_MS = [1000, 3000, 8000];
  const SESSION_KEY = 'at_sessao', OUT_KEY = 'at_outbox', OUT_MAX = 5, OUT_TTL = 48 * 36e5;
  const el = id => document.getElementById(`cap-${id}`);
  const dlg = document.getElementById('cap');
  if (!dlg) return;
  const uuid = () => {
    const b = crypto.getRandomValues(new Uint8Array(16));
    return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  };
  const read = (store, key) => { try { return JSON.parse(window[store].getItem(key)); } catch { return null; } };
  const write = (store, key, val) => { try { window[store].setItem(key, JSON.stringify(val)); } catch { /* Sem armazenamento: segue em memória. */ } };

  /* Sessão anônima: origem, respostas, lead_id e token. Nome, WhatsApp e e-mail nunca entram aqui.
     O cadastro fica também em localStorage para a retomada real: "Sair e continuar depois". */
  const S = Object.assign({sessao:uuid(), attr:null, cliente:null, lead_id:null, token:null, grupo_url:null, aceite:null, respostas:{}, passo:0, ev:{}}, read('sessionStorage', SESSION_KEY));
  const RESUME_KEY = 'at_cadastro', RESUME_TTL = 30 * 864e5;
  const resume = read('localStorage', RESUME_KEY);
  if (!S.lead_id && resume?.lead_id && resume.token && Date.now() - resume.ts < RESUME_TTL) {
    Object.assign(S, {cliente:resume.cliente, lead_id:resume.lead_id, token:resume.token, grupo_url:resume.grupo_url, aceite:resume.aceite, respostas:resume.respostas || {}, passo:resume.passo || 0});
  }
  if (S.lead_id && !S.token) Object.assign(S, {lead_id:null, cliente:null, aceite:null, respostas:{}, passo:0}); /* Sessão anterior ao token: refaz o contato. */
  const save = () => {
    write('sessionStorage', SESSION_KEY, S);
    if (S.lead_id) write('localStorage', RESUME_KEY, {cliente:S.cliente, lead_id:S.lead_id, token:S.token, grupo_url:S.grupo_url, aceite:S.aceite, respostas:S.respostas, passo:S.passo, ts:Date.now()});
  };
  const forget = () => {
    Object.assign(S, {lead_id:null, token:null, cliente:null, aceite:null, respostas:{}, passo:0});
    try { localStorage.removeItem(RESUME_KEY); } catch { /* Sem armazenamento: nada a apagar. */ }
    save();
  };
  if (!S.attr) {
    const q = new URLSearchParams(location.search), attr = {referrer:document.referrer, pagina:location.pathname};
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(k => { attr[k] = q.get(k) || ''; });
    S.attr = attr;
  }
  save();
  const cookie = name => (document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`)) || [])[1] || '';

  async function post(path, body, timeout = 15000) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
    try {
      const res = await fetch(`${API}/${path}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), keepalive:true, signal:ctl.signal});
      return {status:res.status, data:await res.json().catch(() => ({}))};
    } catch { return {status:0, data:{}}; } finally { clearTimeout(t); }
  }
  const transient = s => s === 0 || s === 408 || s >= 500;
  const accepted = r => r.status >= 200 && r.status < 300 && r.data.ok === true;
  async function sendRetry(path, body, onRetry) {
    let r = await post(path, body);
    for (const ms of RETRY_MS) {
      if (!transient(r.status)) break;
      onRetry?.();
      await new Promise(done => setTimeout(done, ms));
      r = await post(path, body);
    }
    return r;
  }

  /* Eventos de funil: uma vez por sessão, sem dado pessoal, sem travar a tela. */
  const evBusy = {};
  async function ev(tipo) {
    if (S.ev[tipo] || evBusy[tipo]) return;
    evBusy[tipo] = true;
    const body = {sessao:S.sessao, tipo};
    if (S.lead_id) body.lead_id = S.lead_id;
    let r = await post('evento', body);
    if (!accepted(r) && transient(r.status)) {
      await new Promise(done => setTimeout(done, 2000));
      r = await post('evento', body);
    }
    if (accepted(r)) { S.ev[tipo] = 1; save(); }
    evBusy[tipo] = false;
  }

  /* Fila do aparelho: contém dado pessoal, só existe após o consentimento e sai no aceite do servidor. */
  const outList = () => {
    const list = read('localStorage', OUT_KEY);
    return Array.isArray(list) ? list.filter(i => Date.now() - i.ts < OUT_TTL) : [];
  };
  const outDrop = id => write('localStorage', OUT_KEY, outList().filter(i => i.id !== id));
  const outPut = (id, body) => write('localStorage', OUT_KEY, [...outList().filter(i => i.id !== id), {id, ts:Date.now(), body}].slice(-OUT_MAX));
  const adopt = (data) => {
    S.lead_id = data.lead_id;
    S.token = data.token;
    S.grupo_url = /^https:\/\//.test(data.grupo_url || '') ? data.grupo_url : null;
    S.aceite = data.aceite === true ? REG_VERSAO : null;
    save();
  };
  let sendingId = null;
  const replaying = new Set();
  async function replay() {
    for (const item of outList()) {
      if (item.id === sendingId || replaying.has(item.id)) continue;
      replaying.add(item.id);
      post('lead', item.body, 20000).then(r => {
        if (accepted(r)) {
          outDrop(item.id);
          if (item.id === S.cliente && !S.lead_id && r.data.lead_id) { adopt(r.data); if (dlg.open && !sendingId) render(); }
        } else if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429) outDrop(item.id);
        replaying.delete(item.id);
      });
    }
  }

  /* Tela */
  let busy = false, opener = null, openedAt = 0, retryFn = null;
  const live = (msg, bad) => { el('live').textContent = msg; el('live').classList.toggle('bad', !!bad); if (bad) (el('retry').hidden ? el('live') : el('retry')).scrollIntoView({block:'nearest'}); };
  const failure = (msg, fn) => { retryFn = fn; el('retry').hidden = !fn; live(msg, true); };
  const clearFailure = () => { live(''); retryFn = null; el('retry').hidden = true; };
  const QUIZ_SHORT = {tempo_conhece:'Conhece a Achei há', ja_comprou:'Já comprou', quando_evento:'Evento', eventos_ano:'Eventos por ano', area_interesse:'Área de interesse'};
  let editing = null, phone = '', lastKey = null, lastRank = 0, capDepth = 0, popping = false, unlockTimer = 0;
  function animateStage(dir) {
    const st = el('stage');
    st.classList.remove('go-next', 'go-back');
    void st.offsetWidth;
    st.classList.add(dir);
    st.addEventListener('animationend', () => st.classList.remove(dir), {once:true});
  }
  function render() {
    const reg = !!S.lead_id && S.aceite !== REG_VERSAO;
    const n = S.lead_id && !reg ? (editing ?? Math.min(S.passo, QUIZ.length)) : -1;
    const contact = !S.lead_id, done = n === QUIZ.length, q = QUIZ[n];
    const now = contact ? 0 : reg ? 1 : n + 2;
    const key = contact ? 'c' : reg ? 'r' : editing !== null ? `e${editing}` : done ? 'd' : `q${n}`;
    const rank = contact ? 0 : reg ? 1 : editing !== null ? 8 : done ? 7 : n + 2;
    if (key !== lastKey) {
      if (lastKey && !popping) { history.pushState({cap:1}, ''); capDepth++; }
      if (lastKey) animateStage(rank < lastRank || popping ? 'go-back' : 'go-next');
      lastKey = key; lastRank = rank;
    }
    dlg.classList.toggle('is-reg', reg);
    const shown = done ? 7 : now + 1;
    el('bar').setAttribute('aria-valuenow', shown);
    el('bar').firstElementChild.style.transform = `scaleX(${shown / 7})`;
    el('step').textContent = done ? 'Cadastro concluído' : editing !== null ? 'Corrigir resposta' : `Passo ${shown} de 7`;
    el('title').textContent = contact ? 'Para onde mandamos o aviso?' : reg ? 'Regulamento' : done ? (S.grupo_url ? 'Falta só entrar' : 'Cadastro feito') : q.q;
    el('sub').textContent = contact ? 'A pré-venda abre em 16/11, às 20h. Depois do contato vêm o regulamento e 5 perguntas.'
      : reg ? 'Leia até o fim para continuar.'
      : done ? (S.grupo_url ? 'Toque no botão e entre no grupo para comprar na abertura: 16/11, às 20h.' : 'Ainda não há link do grupo. Volte a esta página antes de 16/11.')
      : editing !== null ? 'Toque na opção certa.' : 'Toque em uma opção. O que você já respondeu fica salvo.';
    el('form').hidden = !contact;
    el('reg').hidden = !reg;
    el('read').hidden = !reg;
    el('opts').hidden = contact || reg || done;
    el('final').hidden = !done;
    el('group').hidden = !(done && S.grupo_url);
    if (done && S.grupo_url) el('group').href = S.grupo_url;
    el('back').hidden = contact || reg || done || (n === 0 && editing === null);
    el('back').textContent = editing !== null ? 'Voltar ao resumo' : 'Voltar';
    el('exit').hidden = contact || done;
    clearTimeout(unlockTimer);
    if (q) {
      el('opts').classList.toggle('two', q.a.length > 6);
      el('opts').replaceChildren(...q.a.map(a => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ghost cap-opt'; b.textContent = a; b.disabled = true;
        b.setAttribute('aria-pressed', String(S.respostas[q.id] === a));
        b.addEventListener('click', () => answer(n, a, b));
        return b;
      }));
      /* Segundo toque de um duplo toque não responde a pergunta seguinte. */
      unlockTimer = setTimeout(() => el('opts').querySelectorAll('button').forEach(b => { b.disabled = false; }), 350);
    }
    if (done) renderSummary();
    dlg.scrollTop = 0;
    el('title').focus({preventScroll:true});
    if (reg) showReg();
  }
  function renderSummary() {
    const row = (label, value, fix) => {
      const li = document.createElement('li'), box = document.createElement('span'), s = document.createElement('small'), b = document.createElement('b'), btn = document.createElement('button');
      s.textContent = label; b.textContent = value; box.append(s, b);
      btn.type = 'button'; btn.className = 'cap-fixbtn'; btn.textContent = 'Corrigir';
      btn.setAttribute('aria-label', `Corrigir: ${label}`);
      btn.addEventListener('click', fix);
      li.append(box, btn);
      return li;
    };
    el('sum').replaceChildren(
      row('WhatsApp', phone ? mask(phone) : 'O que você informou', () => { el('fix').hidden = false; el('fixw').value = phone ? mask(phone) : ''; el('fixw').focus(); }),
      ...QUIZ.map((q, i) => row(QUIZ_SHORT[q.id], S.respostas[q.id] || '-', () => { editing = i; clearFailure(); render(); }))
    );
    el('fix').hidden = true;
  }

  /* Regulamento: exibe os bytes publicados e envia o SHA-256 deles; a API confere com o texto vigente. */
  let regHash = null, regLoading = false, regEnd = false, regMs = 0, regFrom = 0;
  function paintRead() {
    const box = el('reg-box').getBoundingClientRect(), view = dlg.getBoundingClientRect();
    const pct = regEnd ? 100 : Math.max(0, Math.min(99, Math.round((view.bottom - box.top) / box.height * 100)));
    el('read').textContent = regEnd ? 'Você leu 100%' : `Você leu ${pct}%. Role até o fim para liberar o aceite`;
  }
  dlg.addEventListener('scroll', () => { if (dlg.classList.contains('is-reg') && regHash) paintRead(); }, {passive:true});
  async function showReg() {
    if (!regFrom && dlg.open) regFrom = performance.now();
    if (regHash) { paintRead(); return; }
    if (regLoading) return;
    regLoading = true;
    el('reg-text').innerHTML = '<div class="cap-skel" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>';
    try {
      const res = await fetch(REG_URL, {cache:'no-cache'});
      if (!res.ok) throw new Error(String(res.status));
      const bytes = await res.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      regHash = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
      el('reg-text').innerHTML = new TextDecoder().decode(bytes);
      el('reg-text').classList.add('cap-loaded');
      clearFailure();
      paintRead();
      ev('regulamento_visto');
      new IntersectionObserver((items, io) => {
        if (!items.some(i => i.isIntersecting)) return;
        io.disconnect();
        regEnd = true;
        el('regok').disabled = false; el('regsend').disabled = false;
        paintRead();
        live('Você chegou ao fim. Marque a caixa e toque em Continuar.');
      }, {root:dlg}).observe(el('reg-end'));
    } catch {
      failure('Não conseguimos carregar o regulamento. Confira a internet e tente de novo.', showReg);
    } finally { regLoading = false; }
  }
  el('regok').addEventListener('change', () => { if (el('regok').checked) fieldError('regok', ''); });
  el('reg').addEventListener('submit', async e => {
    e.preventDefault();
    if (busy || !regEnd) return;
    if (!el('regok').checked) { fieldError('regok', 'Marque o aceite para continuar.'); el('regok').focus(); return; }
    fieldError('regok', '');
    clearFailure();
    busy = true;
    el('regsend').setAttribute('aria-busy', 'true'); el('regsend').textContent = 'Salvando…';
    live('Salvando seu aceite…');
    const tempo = Math.round(regMs + (regFrom ? performance.now() - regFrom : 0));
    const r = await sendRetry('aceite', {lead_id:S.lead_id, token:S.token, regulamento_versao:REG_VERSAO, regulamento_hash:regHash, rolou_ate_fim:true, tempo_leitura_ms:tempo}, () => live('Conexão instável. Tentando de novo…'));
    busy = false;
    el('regsend').removeAttribute('aria-busy'); el('regsend').textContent = 'Continuar';
    if (accepted(r)) { S.aceite = REG_VERSAO; save(); ev('regulamento_aceito'); clearFailure(); render(); return; }
    if (r.status === 403) { sessionLost(); return; }
    if (r.status === 409) { failure('O regulamento foi atualizado. Recarregue a página para ler a versão atual.', () => location.reload()); return; }
    live(r.status === 429 ? 'Muitas tentativas. Aguarde um minuto e toque em Continuar.' : 'Seu aceite não foi salvo: falhou a conexão. Confira a internet e toque em Continuar.', true);
  });

  function fieldError(name, msg) {
    const input = el(name), err = el(`${name}-e`);
    err.textContent = msg; err.classList.toggle('on', !!msg);
    input.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  }
  const digits = v => { let d = v.replace(/\D/g, ''); if (d.length > 11 && d.startsWith('55')) d = d.slice(2); return d.replace(/^0+/, '').slice(0, 11); };
  const mask = d => d.length < 3 ? (d ? `(${d}` : '') : d.length < 7 ? `(${d.slice(0,2)}) ${d.slice(2)}` : d.length < 11 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  const validPhone = d => /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(d);
  el('whats').addEventListener('input', e => {
    const i = e.target, before = digits(i.value.slice(0, i.selectionStart)).length;
    i.value = mask(digits(i.value));
    let pos = 0, seen = 0;
    while (pos < i.value.length && seen < before) { if (/\d/.test(i.value[pos])) seen++; pos++; }
    if (i === document.activeElement) i.setSelectionRange(pos, pos);
  });
  el('form').addEventListener('input', () => ev('form_inicio'), {once:true});
  el('form').addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    clearFailure();
    const nome = el('nome').value.trim(), wa = digits(el('whats').value), email = el('email').value.trim();
    const checks = [
      fieldError('nome', nome.length >= 2 ? '' : 'Informe seu nome.') || 'nome',
      fieldError('whats', validPhone(wa) ? '' : 'Use DDD e número: (11) 91234-5678.') || 'whats',
      fieldError('email', !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Confira o e-mail ou deixe em branco.') || 'email',
      fieldError('lgpd', el('lgpd').checked ? '' : 'Para continuar, marque a autorização.') || 'lgpd'
    ];
    const bad = checks.find(c => c !== true);
    if (bad) { el(bad).focus(); return; }
    S.cliente = S.cliente || uuid(); save();
    const a = S.attr, body = {nome, whatsapp:wa, email, consentimento:true, website:el('site').value,
      utm_source:a.utm_source, utm_medium:a.utm_medium, utm_campaign:a.utm_campaign, utm_content:a.utm_content, utm_term:a.utm_term,
      fbclid:a.fbclid, fbp:cookie('_fbp'), fbc:cookie('_fbc'), referrer:a.referrer, pagina:a.pagina,
      lead_id_cliente:S.cliente, elapsed_ms:Math.round(performance.now() - openedAt)};
    busy = true; sendingId = S.cliente;
    outPut(S.cliente, body);
    el('send').setAttribute('aria-disabled', 'true'); el('send').setAttribute('aria-busy', 'true'); el('send').textContent = 'Enviando…';
    live('Enviando seu cadastro…');
    const r = await sendRetry('lead', body, () => live('Conexão instável. Tentando de novo…'));
    busy = false; sendingId = null;
    el('send').removeAttribute('aria-disabled'); el('send').removeAttribute('aria-busy'); el('send').textContent = 'Continuar';
    if (accepted(r) && r.data.lead_id) {
      phone = wa;
      outDrop(S.cliente); adopt(r.data); S.passo = 0; save();
      clearFailure(); render();
      return;
    }
    if (r.status === 429) { live('Muitas tentativas. Aguarde um minuto e toque em Continuar.', true); return; }
    if (r.status >= 400 && r.status < 500 && r.status !== 408) {
      outDrop(S.cliente);
      live(typeof r.data.erro === 'string' && r.data.erro ? r.data.erro : 'Não conseguimos gravar esses dados. Confira e tente de novo.', true);
      return;
    }
    live('Seu cadastro ainda não foi gravado: falhou a conexão. Confira a internet e toque em Continuar. Os dados ficam só neste aparelho e reenviamos quando você voltar à página.', true);
  });

  /* Só depois do consentimento e só com ID preenchido. O event_id é o mesmo do CAPI, para a Meta deduplicar. */
  function pixelQuente() {
    if (!META_PIXEL_ID || S.pixelQuente) return;
    if (!window.fbq) {
      const f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
      window._fbq = f; f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
      const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.append(s);
      window.fbq('init', META_PIXEL_ID);
    }
    window.fbq('trackCustom', 'lead-quente', LEAD_QUENTE, {eventID:`lq-${S.lead_id}`});
    S.pixelQuente = true; save();
  }

  async function answer(n, resposta, btn) {
    if (busy) return;
    const q = QUIZ[n];
    clearFailure();
    if (S.respostas[q.id] === resposta) { next(n); return; }
    busy = true; btn.setAttribute('aria-busy', 'true');
    el('opts').querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', String(b === btn)); b.setAttribute('aria-disabled', 'true'); });
    live('Salvando sua resposta…');
    const r = await sendRetry('quiz', {lead_id:S.lead_id, token:S.token, pergunta:q.id, resposta, ordem:n + 1}, () => live('Conexão instável. Tentando de novo…'));
    busy = false; btn.removeAttribute('aria-busy');
    el('opts').querySelectorAll('button').forEach(b => { b.removeAttribute('aria-disabled'); });
    if (accepted(r)) { S.respostas[q.id] = resposta; save(); live(''); if (r.data.quente === true) pixelQuente(); next(n); return; }
    if (r.status === 403) { sessionLost(); return; }
    if (r.status === 409) { S.aceite = null; save(); render(); return; }
    el('opts').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === S.respostas[q.id])));
    failure(r.status === 429 ? 'Muitas tentativas. Aguarde um minuto e tente de novo.' : 'Esta resposta não foi salva: falhou a conexão. Confira a internet e tente de novo. As anteriores continuam salvas.', () => answer(n, resposta, btn));
  }
  function sessionLost() {
    forget(); editing = null;
    render();
    live('Sua sessão não vale mais. Preencha o contato de novo.', true);
  }
  function next(n) {
    if (editing !== null) { editing = null; render(); return; }
    S.passo = n + 1; save();
    if (S.passo === QUIZ.length) ev('quiz_fim');
    render();
  }

  el('retry').addEventListener('click', () => retryFn?.());
  function retreat() {
    if (editing !== null) { editing = null; }
    else if (S.lead_id && S.aceite === REG_VERSAO && S.passo > 0) { S.passo = Math.min(S.passo, QUIZ.length) - 1; save(); }
    else return false;
    clearFailure();
    popping = true; render(); popping = false;
    return true;
  }
  addEventListener('popstate', () => {
    if (!dlg.open) { capDepth = 0; return; }
    capDepth = Math.max(0, capDepth - 1);
    if (!retreat()) dlg.close();
  });
  el('back').addEventListener('click', () => { if (busy) return; if (capDepth > 1) history.back(); else retreat(); });
  el('x').addEventListener('click', () => dlg.close());
  el('exit').addEventListener('click', () => dlg.close());
  el('group').addEventListener('click', () => ev('grupo_clique'));
  el('fixw').addEventListener('input', e => { e.target.value = mask(digits(e.target.value)); });
  el('fix').addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    const wa = digits(el('fixw').value);
    if (!fieldError('fixw', validPhone(wa) ? '' : 'Use DDD e número: (11) 91234-5678.')) { el('fixw').focus(); return; }
    busy = true; el('fixsend').textContent = 'Salvando…';
    const r = await sendRetry('whatsapp', {lead_id:S.lead_id, token:S.token, whatsapp:wa}, () => live('Conexão instável. Tentando de novo…'));
    busy = false; el('fixsend').textContent = 'Salvar WhatsApp';
    if (r.status === 403) { sessionLost(); return; }
    if (!accepted(r)) { live('O WhatsApp não foi corrigido. Confira a internet e tente de novo.', true); return; }
    phone = wa; renderSummary(); live('WhatsApp corrigido.');
  });
  dlg.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
  dlg.addEventListener('close', () => {
    if (regFrom) { regMs += performance.now() - regFrom; regFrom = 0; }
    if (!busy) clearFailure();
    editing = null; lastKey = null;
    document.documentElement.classList.remove('cap-open');
    if (capDepth > 0) { const d = capDepth; capDepth = 0; history.go(-d); }
    opener?.focus();
  });
  dlg.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const items = [...dlg.querySelectorAll('a[href],button:not(:disabled),input:not([tabindex="-1"]):not(:disabled),[tabindex="0"]')].filter(x => x.offsetParent !== null);
    const first = items[0], last = items[items.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === first || cur === el('title'))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
  });

  function openCap(from) {
    if (dlg.open) return;
    ev('cta');
    opener = from;
    if (!openedAt) openedAt = performance.now();
    dlg.showModal();
    document.documentElement.classList.add('cap-open');
    history.pushState({cap:1}, ''); capDepth = 1;
    render();
    /* Quem volta com o cadastro já feito vê o link do grupo se ele tiver sido liberado. */
    if (S.lead_id && !S.grupo_url) fetch(`${API}/saude`).then(r => r.json()).then(d => {
      if (/^https:\/\//.test(d.grupo_url || '')) { S.grupo_url = d.grupo_url; save(); if (dlg.open) render(); }
    }).catch(() => {});
  }
  document.querySelectorAll('[data-cta="grupo"]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openCap(b); }));
  const fromHash = () => {
    if (location.hash !== '#cadastro') return;
    history.replaceState(null, '', location.pathname + location.search);
    openCap(document.querySelector('.hero [data-cta="grupo"]'));
  };
  addEventListener('hashchange', fromHash);
  fromHash();

  ev('view');
  replay();
  addEventListener('online', replay);
})();
