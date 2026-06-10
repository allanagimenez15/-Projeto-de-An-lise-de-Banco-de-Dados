/* ============================================================
   STARBUCKS DATABASE — script.js
   Autora: Allana Gimenez Machado
   ============================================================ */

// ── DATABASE (localStorage simula o MySQL no front-end) ────────────────────
const STORE_KEY = 'sbdb_v3';
let DB;

function initDB() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) { DB = JSON.parse(s); return; }
  } catch (e) {}

  DB = {
    insumos: [
      { id:1,  nome:'Leite Integral',        un:'ml', emb:1000, preco:5.50,  estoque:10000, min:1000 },
      { id:2,  nome:'Xarope de Baunilha',    un:'ml', emb:700,  preco:65.00, estoque:2100,  min:350  },
      { id:3,  nome:'Café Espresso (Grãos)', un:'un', emb:1,    preco:0.80,  estoque:200,   min:30   },
      { id:4,  nome:'Calda de Caramelo',     un:'g',  emb:1000, preco:45.00, estoque:3000,  min:200  },
      { id:5,  nome:'Gelo (Saco)',           un:'g',  emb:5000, preco:13.00, estoque:15000, min:2000 },
      { id:6,  nome:'Copo + Tampa Bolha',    un:'un', emb:1,    preco:1.10,  estoque:150,   min:20   },
      { id:7,  nome:'Canudo',               un:'un', emb:1,    preco:0.10,  estoque:300,   min:50   },
      { id:8,  nome:'Leite de Aveia',        un:'ml', emb:1000, preco:12.00, estoque:5000,  min:500  },
      { id:9,  nome:'Xarope de Caramelo',    un:'ml', emb:700,  preco:55.00, estoque:1400,  min:200  },
      { id:10, nome:'Creme Chantilly',       un:'ml', emb:500,  preco:18.00, estoque:2000,  min:250  },
    ],
    produtos: [
      { id:1, nome:'Iced Caramel Macchiato', tam:'Grande', preco:22.00 },
      { id:2, nome:'Cappuccino',             tam:'Médio',  preco:18.50 },
      { id:3, nome:'Oat Latte',             tam:'Grande', preco:24.00 },
    ],
    receitas: [
      { id:1,  pid:1, iid:1,  qtd:240   }, { id:2,  pid:1, iid:2,  qtd:22.2 },
      { id:3,  pid:1, iid:3,  qtd:2     }, { id:4,  pid:1, iid:4,  qtd:20   },
      { id:5,  pid:1, iid:5,  qtd:250   }, { id:6,  pid:1, iid:6,  qtd:1    },
      { id:7,  pid:1, iid:7,  qtd:1     },
      { id:8,  pid:2, iid:1,  qtd:180   }, { id:9,  pid:2, iid:3,  qtd:2    },
      { id:10, pid:2, iid:10, qtd:60    }, { id:11, pid:2, iid:6,  qtd:1    },
      { id:12, pid:2, iid:7,  qtd:1     },
      { id:13, pid:3, iid:8,  qtd:240   }, { id:14, pid:3, iid:3,  qtd:2    },
      { id:15, pid:3, iid:9,  qtd:15    }, { id:16, pid:3, iid:6,  qtd:1    },
      { id:17, pid:3, iid:7,  qtd:1     },
    ],
    movs: [], vendas: [],
    nxt: { ins:11, prd:4, rec:18, mov:1, vnd:1 }
  };
  save();
}

// ── PERSISTÊNCIA ───────────────────────────────────────────────────────────
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }

// ── HELPERS ────────────────────────────────────────────────────────────────
const ins  = id  => DB.insumos.find(i => i.id === id);
const prd  = id  => DB.produtos.find(p => p.id === id);
const recs = pid => DB.receitas.filter(r => r.pid === pid);
const cu   = i   => i.preco / i.emb;

function custoPrd(pid) {
  return recs(pid).reduce((s, r) => {
    const i = ins(r.iid);
    return s + (i ? r.qtd * cu(i) : 0);
  }, 0);
}

function stockSt(i) {
  if (i.estoque <= i.min)     return 'danger';
  if (i.estoque <= i.min * 2) return 'warn';
  return 'ok';
}

const f2  = n         => Number(n).toFixed(2);
const fn  = (n, d=2)  => Number(n).toFixed(d);
const fmtDate = ts    => new Date(ts).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
const lowItems = ()   => DB.insumos.filter(i => stockSt(i) === 'danger');

// ── TOAST ──────────────────────────────────────────────────────────────────
function toast(msg, err = false) {
  const r = document.getElementById('toast-root');
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : '');
  t.textContent = msg;
  r.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .4s';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, 3200);
}

// ── NAV ACTIVE ─────────────────────────────────────────────────────────────
function setActive(el) {
  setTimeout(() => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }, 50);
}

// IntersectionObserver — reveals + nav highlight
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      document.querySelectorAll('.nav-item').forEach(n => {
        const href = n.getAttribute('href');
        if (href === '#' + id) n.classList.add('active');
        else if (href && href.startsWith('#')) n.classList.remove('active');
      });
    }
  });
}, { threshold: 0.35 });
document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

// ── RENDER ALL ─────────────────────────────────────────────────────────────
function renderAll() {
  renderDashboard();
  renderVendas();
  renderEstoque();
  renderMovs();
  renderAnalise();
  updateLowBadge();
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function renderDashboard() {
  const totalV = DB.vendas.length;
  const totalR = DB.vendas.reduce((s, v) => s + v.receita, 0);
  const totalL = DB.vendas.reduce((s, v) => s + v.lucro,   0);
  const low    = lowItems();

  animNum('m-vendas',  totalV);
  animNum('m-receita', 'R$ ' + f2(totalR), true);
  animNum('m-lucro',   'R$ ' + f2(totalL), true);
  animNum('m-alertas', low.length);

  document.getElementById('stock-updated').textContent =
    'Atualizado ' + new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

  const alertWrap = document.getElementById('dash-alert-wrap');
  alertWrap.innerHTML = low.length
    ? `<div class="alert">
        <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span><b>${low.length} insumo(s) crítico(s):</b> ${low.map(i => i.nome).join(', ')}</span>
       </div>` : '';

  // tabela mini estoque
  const tb = document.getElementById('stock-mini-tbody');
  tb.innerHTML = DB.insumos.map(i => {
    const st    = stockSt(i);
    const pct   = Math.min(100, Math.round(i.estoque / (i.min * 3) * 100));
    const color = st === 'ok' ? 'var(--ok)' : st === 'warn' ? 'var(--warn)' : 'var(--danger)';
    return `<tr>
      <td>${i.nome}</td>
      <td><div class="bar-cell">
        <div class="bar-track"><div class="bar-fill" id="bar-dash-${i.id}" style="width:${pct}%;background:${color}"></div></div>
        <span class="bar-val" style="color:${color};font-size:11px">${fn(i.estoque,0)} ${i.un}</span>
      </div></td>
      <td><span class="badge b-${st}">${st==='ok'?'Normal':st==='warn'?'Baixo':'Crítico'}</span></td>
    </tr>`;
  }).join('');

  renderFeed('feed-dash', 6);
}

function animNum(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = val;
    const card = el.closest('.mcard');
    if (card) {
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 600);
    }
  }
}

function renderFeed(containerId, limit = 999) {
  const el    = document.getElementById(containerId);
  const items = [...DB.movs].reverse().slice(0, limit);
  if (!items.length) {
    el.innerHTML = '<div class="feed-empty">Nenhuma movimentação registrada ainda.<br>Registre uma venda para começar.</div>';
    return;
  }
  el.innerHTML = items.map((m, idx) => `
    <div class="feed-item ${idx === 0 ? 'new-entry' : ''}">
      <div class="feed-icon ${m.tipo === 'saida' ? 'fi-out' : 'fi-in'}">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2">
          ${m.tipo === 'saida'
            ? '<polyline points="17 11 21 7 17 3"/><line x1="21" y1="7" x2="9" y2="7"/><polyline points="7 21 3 15 7 9"/><line x1="3" y1="15" x2="15" y2="15"/>'
            : '<polyline points="12 5 12 19"/><polyline points="5 12 12 5 19 12"/>'}
        </svg>
      </div>
      <div class="feed-desc"><b>${m.inome}</b><span>${m.motivo}</span></div>
      <div class="feed-qty ${m.tipo === 'saida' ? 'neg' : 'pos'}">${m.tipo === 'saida' ? '−' : '+'}${fn(m.qtd,1)} ${m.un}</div>
      <div class="feed-time">${fmtDate(m.ts)}</div>
    </div>`).join('');
}

// ── VENDAS ─────────────────────────────────────────────────────────────────
const QTY = {};

function renderVendas() {
  const grid = document.getElementById('vendas-grid');
  grid.innerHTML = DB.produtos.map(p => {
    if (!QTY[p.id]) QTY[p.id] = 1;
    const custo    = custoPrd(p.id);
    const lucro    = p.preco - custo;
    const ings     = recs(p.id);
    const canSell  = ings.every(r => { const i = ins(r.iid); return i && i.estoque >= r.qtd * QTY[p.id]; });
    const ingList  = ings.map(r => { const i = ins(r.iid); return i ? `${i.nome} (${fn(r.qtd,1)} ${i.un})` : '?'; }).join(' · ');
    const q        = QTY[p.id];
    return `<div class="vcard" id="vc-${p.id}">
      <div class="vcard-shimmer"></div>
      <div class="vcard-name">${p.nome}</div>
      <div class="vcard-size">${p.tam}</div>
      <div class="vcard-nums">
        <div class="vn-item"><span class="vn-label">Custo</span><span class="vn-val">R$ ${f2(custo)}</span></div>
        <div class="vn-item"><span class="vn-label">Venda</span><span class="vn-val">R$ ${f2(p.preco)}</span></div>
        <div class="vn-item"><span class="vn-label">Lucro</span><span class="vn-val green">R$ ${f2(lucro)}</span></div>
      </div>
      <div class="vcard-ings">${ingList}</div>
      <div class="qty-row">
        <button class="qty-btn" onclick="chgQty(${p.id},-1)">−</button>
        <span class="qty-n" id="qn-${p.id}">${q}</span>
        <button class="qty-btn" onclick="chgQty(${p.id},1)">+</button>
        <span class="qty-label">unidades · Total: R$ ${f2(p.preco * q)}</span>
      </div>
      ${!canSell ? `<div class="no-stock-warn">⚠ Estoque insuficiente para ${q} unidade(s)</div>` : ''}
      <button class="sell-btn" onclick="vender(${p.id})" ${!canSell ? 'disabled' : ''}>
        Registrar Venda — ${q}x R$ ${f2(p.preco * q)}
      </button>
    </div>`;
  }).join('');
}

function chgQty(pid, d) {
  QTY[pid] = Math.max(1, (QTY[pid] || 1) + d);
  renderVendas();
}

function vender(pid) {
  const p    = prd(pid);
  const q    = QTY[pid] || 1;
  const ings = recs(pid);

  for (const r of ings) {
    const i = ins(r.iid);
    if (!i || i.estoque < r.qtd * q) {
      toast('Estoque insuficiente: ' + (i ? i.nome : 'insumo'), true);
      return;
    }
  }

  // animação shimmer no card
  const vc = document.getElementById('vc-' + pid);
  vc.classList.add('selling');
  setTimeout(() => vc.classList.remove('selling'), 900);

  // deduzir estoque e registrar movimentações
  for (const r of ings) {
    const i      = ins(r.iid);
    const deducao = r.qtd * q;
    i.estoque = Math.max(0, i.estoque - deducao);
    DB.movs.push({
      id: DB.nxt.mov++, tipo: 'saida',
      iid: i.id, inome: i.nome, un: i.un,
      qtd: deducao,
      motivo: `Venda: ${q}x ${p.nome} (${p.tam})`,
      ts: Date.now()
    });
    flashBar(i.id);
  }

  const custo = custoPrd(pid);
  DB.vendas.push({
    id: DB.nxt.vnd++, pid,
    pnome: p.nome, tam: p.tam, qtd: q,
    receita: p.preco * q,
    custo: custo * q,
    lucro: (p.preco - custo) * q,
    ts: Date.now()
  });

  save();
  toast(`✓ ${q}x ${p.nome} vendido(s)! Lucro: R$ ${f2((p.preco - custo) * q)}`);
  QTY[pid] = 1;
  renderAll();
}

function flashBar(iid) {
  setTimeout(() => {
    document.querySelectorAll(`[id$="-${iid}"]`).forEach(b => {
      b.style.transition = 'none';
      b.style.background = 'var(--gold)';
      setTimeout(() => { b.style.transition = 'width .8s cubic-bezier(.4,0,.2,1),background .8s'; }, 50);
    });
  }, 200);
}

// ── ESTOQUE ────────────────────────────────────────────────────────────────
function renderEstoque() {
  const tb = document.getElementById('estoque-tbody');
  tb.innerHTML = DB.insumos.map(i => {
    const st    = stockSt(i);
    const pct   = Math.min(100, Math.round(i.estoque / (i.min * 3) * 100));
    const color = st === 'ok' ? 'var(--ok)' : st === 'warn' ? 'var(--warn)' : 'var(--danger)';
    return `<tr>
      <td><b style="color:var(--gd)">${i.nome}</b></td>
      <td>${i.un}</td>
      <td><div class="bar-cell">
        <div class="bar-track"><div class="bar-fill" id="bar-est-${i.id}" style="width:${pct}%;background:${color}"></div></div>
        <span class="bar-val" style="color:${color}">${fn(i.estoque,1)}</span>
      </div></td>
      <td style="color:var(--tl)">${fn(i.min,0)} ${i.un}</td>
      <td>R$ ${fn(cu(i),4)}</td>
      <td><span class="badge b-${st}">${st==='ok'?'Normal':st==='warn'?'Baixo':'Crítico'}</span></td>
      <td style="display:flex;gap:6px;align-items:center;">
        <button class="btn btn-g" style="font-size:11px;padding:5px 12px;" onclick="openAporte(${i.id})">+ Abastecer</button>
        <button class="btn btn-g" style="font-size:11px;padding:5px 12px;" onclick="openInsumoModal(${i.id})">Editar</button>
      </td>
    </tr>`;
  }).join('');
}

// ── MOVIMENTAÇÕES ──────────────────────────────────────────────────────────
function renderMovs() {
  document.getElementById('all-mov-count').textContent = DB.movs.length + ' registros';
  renderFeed('all-feed');
}

// ── ANÁLISE ────────────────────────────────────────────────────────────────
function renderAnalise() {
  const tb = document.getElementById('analise-tbody');
  tb.innerHTML = DB.produtos.map(p => {
    const custo  = custoPrd(p.id);
    const lucro  = p.preco - custo;
    const margem = p.preco > 0 ? lucro / p.preco * 100 : 0;
    const vs     = DB.vendas.filter(v => v.pid === p.id);
    const qtdT   = vs.reduce((s, v) => s + v.qtd, 0);
    const lucroT = vs.reduce((s, v) => s + v.lucro, 0);
    return `<tr>
      <td><b style="color:var(--gd)">${p.nome}</b></td>
      <td>${p.tam}</td>
      <td>R$ ${f2(custo)}</td>
      <td>R$ ${f2(p.preco)}</td>
      <td style="color:var(--ok);font-weight:500">R$ ${f2(lucro)}</td>
      <td><span class="badge ${margem>50?'b-ok':margem>30?'b-warn':'b-danger'}">${fn(margem,1)}%</span></td>
      <td style="text-align:center;font-weight:500">${qtdT}</td>
      <td style="color:var(--ok);font-weight:500">R$ ${f2(lucroT)}</td>
    </tr>`;
  }).join('');

  const comp = document.getElementById('analise-comp');
  comp.innerHTML = DB.produtos.map(p => {
    const ings  = recs(p.id);
    const total = ings.reduce((s, r) => { const i = ins(r.iid); return s + (i ? r.qtd * cu(i) : 0); }, 0);
    const rows  = ings.map(r => {
      const i = ins(r.iid); if (!i) return '';
      const c   = r.qtd * cu(i);
      const pct = total > 0 ? c / total * 100 : 0;
      return `<div class="comp-row">
        <span class="comp-name">${i.nome}</span>
        <div class="comp-track"><div class="comp-fill" style="width:${fn(pct,1)}%"></div></div>
        <span class="comp-cost">R$ ${f2(c)}</span>
        <span class="comp-pct">${fn(pct,1)}%</span>
      </div>`;
    }).join('');
    return `<div class="ac-product">
      <div class="ac-product-head"><h4>${p.nome}</h4><span>${p.tam} · Custo total: R$ ${f2(total)}</span></div>
      ${rows}
    </div>`;
  }).join('');
}

// ── BADGE ──────────────────────────────────────────────────────────────────
function updateLowBadge() {
  const b = document.getElementById('low-badge');
  const n = lowItems().length;
  b.style.display = n ? '' : 'none';
  b.textContent   = n;
}

// ── MODAL INSUMO ───────────────────────────────────────────────────────────
let editIns = null;

function openInsumoModal(id) {
  editIns = id;
  if (id) {
    const i = ins(id);
    document.getElementById('mi-title').textContent    = 'Editar Insumo';
    document.getElementById('mi-nome').value           = i.nome;
    document.getElementById('mi-unidade').value        = i.un;
    document.getElementById('mi-emb').value            = i.emb;
    document.getElementById('mi-preco').value          = i.preco;
    document.getElementById('mi-estoque').value        = i.estoque;
    document.getElementById('mi-min').value            = i.min;
  } else {
    document.getElementById('mi-title').textContent = 'Novo Insumo';
    ['mi-nome','mi-emb','mi-preco','mi-estoque','mi-min'].forEach(id => document.getElementById(id).value = '');
  }
  document.getElementById('ov-insumo').classList.add('open');
}

function saveInsumo() {
  const nome    = document.getElementById('mi-nome').value.trim();
  const un      = document.getElementById('mi-unidade').value;
  const emb     = parseFloat(document.getElementById('mi-emb').value);
  const preco   = parseFloat(document.getElementById('mi-preco').value);
  const estoque = parseFloat(document.getElementById('mi-estoque').value) || 0;
  const min     = parseFloat(document.getElementById('mi-min').value)     || 0;
  if (!nome || !emb || !preco) { toast('Preencha os campos obrigatórios', true); return; }
  if (editIns) {
    Object.assign(ins(editIns), { nome, un, emb, preco, estoque, min });
    toast('Insumo atualizado!');
  } else {
    DB.insumos.push({ id: DB.nxt.ins++, nome, un, emb, preco, estoque, min });
    toast('Insumo cadastrado!');
  }
  save(); closeOv('ov-insumo'); renderAll();
}

// ── MODAL APORTE ───────────────────────────────────────────────────────────
function openAporte(id) {
  const i = ins(id);
  document.getElementById('aporte-id').value    = id;
  document.getElementById('aporte-desc').textContent = i.nome + ' — Atual: ' + fn(i.estoque,1) + ' ' + i.un;
  document.getElementById('aporte-qtd').value   = '';
  document.getElementById('ov-aporte').classList.add('open');
}

function saveAporte() {
  const id  = parseInt(document.getElementById('aporte-id').value);
  const qtd = parseFloat(document.getElementById('aporte-qtd').value);
  if (!qtd || qtd <= 0) { toast('Informe uma quantidade válida', true); return; }
  const i = ins(id);
  i.estoque += qtd;
  DB.movs.push({ id: DB.nxt.mov++, tipo:'entrada', iid:i.id, inome:i.nome, un:i.un, qtd, motivo:'Aporte / Reabastecimento', ts:Date.now() });
  save(); closeOv('ov-aporte');
  toast(`✓ +${fn(qtd,1)} ${i.un} adicionado(s) a ${i.nome}`);
  renderAll();
}

// ── MODAL PRODUTO ──────────────────────────────────────────────────────────
let editPrd = null;

function openProdutoModal(id) {
  editPrd = id;
  document.getElementById('ing-list').innerHTML = '';
  if (id) {
    const p = prd(id);
    document.getElementById('mp-title').textContent = 'Editar Produto';
    document.getElementById('mp-nome').value        = p.nome;
    document.getElementById('mp-tam').value         = p.tam;
    document.getElementById('mp-preco').value       = p.preco;
    recs(id).forEach(r => addIngRow(r.iid, r.qtd));
  } else {
    document.getElementById('mp-title').textContent = 'Novo Produto';
    ['mp-nome','mp-preco'].forEach(id => document.getElementById(id).value = '');
    addIngRow();
  }
  document.getElementById('ov-produto').classList.add('open');
}

function addIngRow(selId = null, qty = null) {
  const list = document.getElementById('ing-list');
  const row  = document.createElement('div');
  row.className = 'ing-row';
  const opts = DB.insumos.map(i => `<option value="${i.id}"${i.id === selId ? ' selected' : ''}>${i.nome} (${i.un})</option>`).join('');
  row.innerHTML = `<select>${opts}</select><input type="number" step="0.01" placeholder="Qtd" value="${qty || ''}"><button onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(row);
}

function saveProduto() {
  const nome  = document.getElementById('mp-nome').value.trim();
  const tam   = document.getElementById('mp-tam').value;
  const preco = parseFloat(document.getElementById('mp-preco').value);
  const rows  = [...document.querySelectorAll('#ing-list .ing-row')];
  const ings  = rows
    .map(r => ({ iid: parseInt(r.querySelector('select').value), qtd: parseFloat(r.querySelector('input').value) }))
    .filter(r => r.qtd > 0);
  if (!nome || !preco)    { toast('Preencha nome e preço', true); return; }
  if (!ings.length)       { toast('Adicione pelo menos 1 ingrediente', true); return; }
  if (editPrd) {
    Object.assign(prd(editPrd), { nome, tam, preco });
    DB.receitas = DB.receitas.filter(r => r.pid !== editPrd);
    ings.forEach(r => DB.receitas.push({ id: DB.nxt.rec++, pid: editPrd, iid: r.iid, qtd: r.qtd }));
    toast('Produto atualizado!');
  } else {
    const pid = DB.nxt.prd++;
    DB.produtos.push({ id: pid, nome, tam, preco });
    ings.forEach(r => DB.receitas.push({ id: DB.nxt.rec++, pid, iid: r.iid, qtd: r.qtd }));
    toast('Produto cadastrado!');
  }
  save(); closeOv('ov-produto'); renderAll();
}

// ── UTILITÁRIOS ────────────────────────────────────────────────────────────
function closeOv(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.overlay').forEach(ov =>
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); })
);

// ── INIT ───────────────────────────────────────────────────────────────────
initDB();
renderAll();
