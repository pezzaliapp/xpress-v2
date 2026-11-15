/*
 * Xpress · Listino per gli agenti
 * Preconfiguratore prezzi (sconti d'acquisto + margine, ricarico o sconto
 * listino) e creazione di un file HTML unico che funziona offline, con
 * ricerca e preventivo. Nel file finiscono SOLO i prezzi di vendita (ed
 * eventuali trasporto/installazione del listino): niente prezzo lordo,
 * costo o margine.
 */
(function () {
  'use strict';
  const KEY = 'xpress-agenti-cfg';
  const $ = id => document.getElementById(id);
  const num = v => { const n = Number(String(v == null ? '' : v).replace(/%/g, '').replace(',', '.').trim()); return isFinite(n) ? n : NaN; };
  const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let fmt; try { fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', useGrouping: 'always' }); } catch (e) { fmt = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }); }
  const money = n => fmt.format(Math.round((n || 0) * 100) / 100);

  function load() { try { return Object.assign({ s1: '', s2: '', mode: 'margin', value: '', maxDisc: '0', title: '' }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return { s1: '', s2: '', mode: 'margin', value: '', maxDisc: '0', title: '' }; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* */ } }
  let cfg = load();

  function round(p) { if (!isFinite(p) || p <= 0) return 0; return p < 10 ? Math.round(p * 10) / 10 : Math.round(p); }
  function check(c) {
    const s1 = num(c.s1 || 0), s2 = num(c.s2 || 0), v = num(c.value);
    if (!(s1 >= 0 && s1 < 100) || !(s2 >= 0 && s2 < 100)) return 'Gli sconti d\'acquisto devono essere tra 0 e 99.';
    if (c.mode !== 'list' && !(s1 > 0 || s2 > 0)) return 'Scrivi lo sconto d\'acquisto che ti fa il fornitore.';
    if (!isFinite(v) || v < 0) return 'Scrivi un valore valido per ' + (c.mode === 'margin' ? 'il margine' : c.mode === 'markup' ? 'il ricarico' : 'lo sconto') + '.';
    if ((c.mode === 'margin' || c.mode === 'list') && v >= 100) return 'Il valore deve essere inferiore al 100%.';
    return null;
  }
  // stessa logica di Xpress: netto = lordo × (1−s1) × (1−s2); margine sul prezzo di vendita
  function price(lordo, c) {
    const cost = lordo * (1 - (num(c.s1) || 0) / 100) * (1 - (num(c.s2) || 0) / 100);
    const v = num(c.value) / 100;
    let sell = c.mode === 'margin' ? cost / (1 - v) : c.mode === 'markup' ? cost * (1 + v) : lordo * (1 - v);
    sell = round(sell);
    return { list: lordo, cost, sell, margin: sell > 0 ? (sell - cost) / sell * 100 : 0 };
  }
  const items = () => (typeof listino !== 'undefined' && Array.isArray(listino)) ? listino : [];
  const lordoOf = a => (typeof parseDec === 'function' ? parseDec(a.prezzoLordo) : Number(a.prezzoLordo)) || 0;
  const srv = v => (typeof parseDec === 'function' ? parseDec(v || 0) : Number(v)) || 0;

  function preview() {
    const box = $('agentiPreview'); if (!box) return;
    const L = items();
    if (!L.length) { box.innerHTML = '<p class="agenti-hint">Carica prima il listino CSV o Excel.</p>'; return; }
    const err = check(cfg);
    if (err) { box.innerHTML = '<p class="agenti-hint">' + escH(err) + '</p>'; return; }
    const sample = [0, .25, .5, .75, 1].map(f => L[Math.floor(f * (L.length - 1))]).filter((p, i, a) => p && a.indexOf(p) === i);
    let over = 0, low = 0;
    for (const a of L) { const r = price(lordoOf(a), cfg); if (r.sell > r.list + 0.5) over++; if (r.sell < r.cost) low++; }
    box.innerHTML = '<p class="agenti-hint"><b>Anteprima (solo per te)</b> · ' + L.length + ' articoli</p>' +
      sample.map(a => { const r = price(lordoOf(a), cfg); return '<div class="agenti-row"><b>' + escH(a.codice) + '</b> ' + escH(String(a.descrizione).slice(0, 48)) + '<br><span>Lordo ' + money(r.list) + ' · costo ' + money(r.cost) + ' · <b>vendita ' + money(r.sell) + '</b> · margine ' + (Math.round(r.margin * 10) / 10).toString().replace('.', ',') + '%</span></div>'; }).join('') +
      (over ? '<p class="agenti-warn">Attenzione: ' + over + ' articoli avrebbero un prezzo sopra il listino.</p>' : '') +
      (low ? '<p class="agenti-err">Attenzione: ' + low + ' articoli verrebbero venduti sotto costo.</p>' : '');
  }

  // Foto dal listino PDF (se caricato): ridotte e senza doppioni, per tenere il file leggero
  async function collectImages(L, onStep) {
    const X = window.XpressPDF;
    if (!X || !X._state || !X._state.index) return null;
    const list = [], byCode = {}, seen = new Map();
    const shrink = url => new Promise(res => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 360 / Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.78));
      };
      im.onerror = () => res(null); im.src = url;
    });
    let n = 0;
    for (const a of L) {
      n++; if (onStep && n % 10 === 1) onStep(n, L.length);
      const url = await X.getThumb(a.codice, a.pagine).catch(() => null);
      if (!url) continue;
      let i = seen.get(url);
      if (i == null) { const small = await shrink(url); if (!small) continue; i = list.length; list.push(small); seen.set(url, i); }
      byCode[X.normCode(a.codice)] = i;
    }
    return { list, byCode };
  }

  // Un unico file HTML: l'app Xpress (stili e codice) + listino a prezzi di vendita + foto.
  async function buildHTML(onStep) {
    const L = items();
    const listinoAgenti = L.map(a => ({
      codice: a.codice, descrizione: a.descrizione, prezzoLordo: price(lordoOf(a), cfg).sell,
      sconto: 0, sconto2: 0, margine: 0, scontoCliente: 0,
      costoTrasporto: srv(a.costoTrasporto), costoInstallazione: srv(a.costoInstallazione),
      famiglia: a.famiglia || '', categoria: a.categoria || '', pagine: '', quantita: 1, venduto: 0
    }));
    const images = await collectImages(L, onStep);
    const pkg = {
      format: 'xpress/agenti', v: 1, createdAt: new Date().toISOString(),
      title: cfg.title || 'Listino agenti', maxDisc: Math.max(0, Math.min(100, num(cfg.maxDisc) || 0)),
      listino: listinoAgenti, images
    };
    const get = async u => { const r = await fetch(u, { cache: 'no-cache' }); if (!r.ok) throw new Error('File dell\'app mancante: ' + u); return r.text(); };
    const safe = t => t.replace(/<\/script/gi, '<\\/script');
    let html = await get('index.html');
    // fogli di stile locali -> incorporati
    for (const m of [...html.matchAll(/<link\b[^>]*>/gi)]) {
      if (!/rel="stylesheet"/i.test(m[0])) continue;
      const href = (m[0].match(/href="([^"]+)"/i) || [])[1];
      if (!href || /^(https?:)?\/\//.test(href)) continue;
      const css = await get(href);
      html = html.replace(m[0], () => `<style>/* ${href} */\n${css}\n</style>`);
    }
    // immagini locali della pagina (logo) -> incorporate
    for (const m of [...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)]) {
      const src = m[1];
      if (/^(data:|https?:|\/\/)/.test(src)) continue;
      try {
        const blob = await (await fetch(src.replace('-1024.png', '-192.png'))).blob();
        const durl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
        html = html.replace(m[0], () => m[0].replace(src, durl));
      } catch (_) { /* resta il testo alternativo */ }
    }
    // script: tengo solo quelli dell'app; niente librerie di importazione, benvenuto, preconfiguratore
    const keep = ['desktop-mode-fix.js', 'pdf-listino.js', 'app.js'];
    const tags = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/gi)];
    for (const m of tags) {
      const src = m[1];
      if (keep.includes(src)) { const code = await get(src); html = html.replace(m[0], () => `<script>/* ${src} */\n${safe(code)}\n</script>`); }
      else html = html.replace(m[0], '');
    }
    const data = JSON.stringify(pkg).replace(/</g, '\\u003c');
    html = html
      .replace(/<link[^>]*rel="manifest"[^>]*\/?>\s*/gi, '')
      .replace(/<link[^>]*rel="(apple-touch-icon|icon)"[^>]*\/?>/gi, '')
      .replace(/<body([^>]*)>/i, (m0) => `${m0}\n<script type="application/json" id="xpress-agent-package">${data}</script>`);
    return '<!-- Listino agenti creato con Xpress il ' + new Date().toLocaleDateString('it-IT') + ': contiene solo prezzi di vendita. -->\n' + html;
  }

  async function esporta() {
    const err = check(cfg); if (err) { alert(err); return; }
    if (!items().length) { alert('Carica prima il listino CSV o Excel.'); return; }
    const btn = $('btnAgentiExport'), label = btn.textContent;
    btn.disabled = true;
    try {
      const html = await buildHTML((n, t) => { btn.textContent = `Preparo le immagini ${n}/${t}…`; });
      const name = 'listino-agenti-' + new Date().toISOString().slice(0, 10) + '.html';
      const file = new File([html], name, { type: 'text/html' });
      btn.textContent = label;
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Listino agenti' }); return; } }
      catch (e) { if (e && e.name === 'AbortError') return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { alert('Non sono riuscito a creare il listino: ' + (e.message || e)); }
    finally { btn.disabled = false; btn.textContent = label; }
  }

  function syncUI() {
    const sec = $('agenti-section'); if (!sec) return;
    $('agS1').value = cfg.s1; $('agS2').value = cfg.s2; $('agValue').value = cfg.value; $('agMax').value = cfg.maxDisc; $('agTitle').value = cfg.title;
    sec.querySelectorAll('[data-agmode]').forEach(b => b.classList.toggle('on', b.dataset.agmode === cfg.mode));
    $('agValueLbl').textContent = { margin: 'Margine % sul prezzo di vendita', markup: 'Ricarico % sul costo', list: 'Sconto % al cliente sul listino' }[cfg.mode];
    $('btnAgentiExport').disabled = !items().length;
    preview();
  }

  function init() {
    const sec = $('agenti-section'); if (!sec) return;
    const bind = (id, k) => $(id).addEventListener('input', e => { cfg[k] = e.target.value; save(cfg); preview(); });
    bind('agS1', 's1'); bind('agS2', 's2'); bind('agValue', 'value'); bind('agMax', 'maxDisc'); bind('agTitle', 'title');
    sec.querySelectorAll('[data-agmode]').forEach(b => b.addEventListener('click', () => { cfg.mode = b.dataset.agmode; save(cfg); syncUI(); }));
    $('btnAgentiExport').addEventListener('click', esporta);
    syncUI();
  }

  // chiamate da app.js
  window.XpressAgenti = {
    aggiorna: syncUI,
    dopoCaricamento() {
      const sec = $('agenti-section'); if (!sec) return;
      sec.open = true; sec.classList.add('agenti-evidenzia'); syncUI();
      const s = $('agentiAsk'); if (s) s.hidden = false;
    },
    price, check, buildHTML
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
