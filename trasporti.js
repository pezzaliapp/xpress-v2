/*
 * Xpress · Destinazione e trasporto
 * Calcola in automatico il trasporto (e, se richiesto, l'installazione) degli
 * articoli aggiunti, con le stesse regole dell'app "Calcolo trasporti":
 * pallet o groupage, scelta della soluzione più conveniente, maggiorazione
 * trasportatori, preavviso, assicurazione, supplemento località disagiata,
 * arrotondamento all'euro.
 *
 * NON cambia i calcoli di Xpress: compila soltanto i campi "Trasp." e "Inst."
 * di ogni riga (importi unitari), come se li scrivesse l'utente. Il costo della
 * spedizione unica viene ripartito sulle righe in proporzione al peso di
 * trasporto di ciascuna. Una riga corretta a mano non viene più toccata
 * (finché non si preme "Ricalcola").
 *
 * Dati: trasporti-dati.js (copia inclusa, funziona offline) ed eventuale
 * aggiornamento dalla cartella dell'app Calcolo trasporti sullo stesso sito.
 */
(function () {
  'use strict';
  const T0 = window.XPRESS_TRASPORTI;
  const sec = document.getElementById('trasporto-section');
  if (!T0 || !sec) return;

  const D = { listini: T0.listini, pallet: T0.pallet, groupage: T0.groupage, articoli: T0.articoli, geo: T0.geo };
  const CODICI = T0.codici || {};
  const INSTALL = T0.install || {};
  const DATI_VERSIONE = D.pallet && D.pallet.versione;
  const KEY = 'xpress-trasporti-v1';
  const $ = (id) => document.getElementById(id);
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const num = (v, d = 0) => { const n = Number(String(v == null ? '' : v).replace(',', '.')); return Number.isFinite(n) ? n : d; };
  const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = (v) => Number(v).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  const itN = (v) => Number(v).toLocaleString('it-IT', { maximumFractionDigits: 2 });
  const INST_LABEL = { assetto: 'assetto', forbice: 'sollevatore a doppia forbice', pfa: 'sollevatore PFA', colonne: 'colonne mobili', platorello: 'smontagomme a platorello', piatto: 'smontagomme a piatto', equil: 'equilibratrice', truck: 'truck / heavy duty', '2colonne': 'ponte a due colonne' };

  let ART = new Map(D.articoli.map((a) => [a.id, a]));

  /* ---------------- impostazioni (salvate sul dispositivo) ---------------- */
  const S = Object.assign({ reg: '', prov: '', luogo: '', auto: true, inst: false, pre: false, ass: false, dis: false, disEur: 0 }, (() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  })());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* */ } };

  /* ================= Calcolo (logica dell'app Calcolo trasporti) ================= */
  function palletClass(kg, h) {
    if (kg <= 150) return h <= 60 ? 'MINI' : h <= 80 ? 'QUARTER' : h <= 120 ? 'HALF' : h <= 160 ? 'MEDIUM' : 'LIGHT';
    if (kg <= 300) return h <= 80 ? 'QUARTER' : h <= 120 ? 'HALF' : h <= 160 ? 'MEDIUM' : 'LIGHT';
    if (kg <= 450) return h <= 120 ? 'HALF' : h <= 160 ? 'MEDIUM' : 'LIGHT';
    if (kg <= 600) return h <= 160 ? 'MEDIUM' : 'LARGE';
    if (kg <= 750) return 'LARGE';
    if (kg <= 900) return 'FULL';
    if (kg <= 1050) return 'BIG';
    return 'MEGA';
  }
  function palletAreaPct(m2) {
    const TB = [[1.28, 0], [1.39, 10], [1.59, 30], [1.89, 50], [2.27, 80], [2.51, 100], [2.87, 130], [3.07, 150], [3.84, 200]];
    for (const [max, pct] of TB) if (m2 <= max + 0.005) return pct;
    return null;
  }
  function palletWeightPct(kg) { if (kg <= 1200) return 0; if (kg <= 1800) return Math.ceil((kg - 1200) / 100) * 10; return null; }
  function palletPkg(kg, l1, l2, h) {
    kg = num(kg);
    if (![l1, l2, h].every((x) => x > 0)) return null;
    const long = Math.max(l1, l2), short = Math.min(l1, l2);
    if (h > 240 || kg > 1800 || long > 300) return null;
    const wPct = palletWeightPct(kg);
    if (long > 240) { if (short > 120) return null; return { type: 'MEGA', pct: Math.max(long <= 270 ? 300 : 320, wPct) }; }
    const area = Math.round(l1 * l2 / 100) / 100;
    let aPct = palletAreaPct(area);
    if (aPct === null) return null;
    const type = palletClass(kg, h);
    if (type === 'MINI' || type === 'QUARTER') aPct = 0;
    return { type, pct: Math.max(aPct, wPct) };
  }
  const pieces = (a) => { const o = []; ((a && a.colli) || []).forEach((c) => { for (let i = 0; i < (c.n || 1); i++) o.push(c); }); return o; };
  const totKg = (a) => (a && a.colli ? pieces(a).reduce((s, c) => s + num(c.kg), 0) : num(a && a.kg));
  function productPallets(a) {
    if (!a) return null;
    if (a.colli) { const ps = pieces(a); if (!ps.length) return null; const r = ps.map((c) => palletPkg(c.kg, c.l, c.p, c.h)); return r.every(Boolean) ? r : null; }
    if (a.groupage) { const m = a.misure; const o = Array.isArray(m) && m.length === 3 ? palletPkg(a.kg, m[0], m[1], m[2]) : null; return o ? [o] : null; }
    if (a.pallet) return [{ type: a.pallet, pct: 0, fixed: true }];
    return null;
  }
  function palletRate(reg, pl) {
    const rates = D.pallet.tariffe[reg] || {};
    if (pl.fixed) return rates[pl.type] != null ? rates[pl.type] : null;
    const exact = rates[`${pl.type} + ${pl.pct}%`];
    if (pl.pct && exact != null) return exact;
    return rates[pl.type] != null ? rates[pl.type] * (1 + pl.pct / 100) : null;
  }
  function productGroupage(a) {
    if (a && a.colli) {
      const ps = pieces(a); if (!ps.length) return null;
      const area = ps.reduce((s, c) => s + c.l * c.p / 10000, 0);
      const longest = Math.max(...ps.map((c) => Math.max(c.l, c.p) / 100));
      return { ml: r2(Math.max(area / 2.4, longest > 2.4 ? longest : 0)), q: r2(totKg(a) / 100), b: ps.length };
    }
    if (a && a.groupage) return { ml: num(a.groupage.ml), q: num(a.groupage.quintali), b: num(a.groupage.bancali, 1) };
    if (a && a.pallet) return { ml: 0.6, q: num(a.kg) / 100, b: 1 };
    return null;
  }
  function findGroupage(prov, reg) {
    for (const z of D.groupage.zone || []) for (const g of z.gruppi) {
      if (g.province.includes(prov)) return { zona: z, gruppo: g };
      if (g.tutte && reg && norm(g.regione) === norm(reg)) return { zona: z, gruppo: g };
    }
    return null;
  }
  function groupageBand(zona, ml, q, b) {
    const f = zona.fasce;
    const idx = (v, arr) => { if (!(v > 0) || !arr) return { i: 0, over: false }; const i = arr.findIndex((l) => v <= l + 1e-9); return i === -1 ? { i: arr.length - 1, over: true } : { i, over: false }; };
    const r = [idx(ml, f.ml), idx(b, f.bancali), idx(q, f.quintali)];
    const i = Math.max(...r.map((x) => x.i));
    return { i, over: r.some((x) => x.over), ml: f.ml[i], b: f.bancali[i], q: f.quintali[i] };
  }
  function decide(art, mode, reg, prov) {
    const pal = productPallets(art), grp = productGroupage(art);
    if (!pal) return grp ? { svc: 'groupage' } : { svc: 'quote' };
    if (art.soloPallet || !grp) return { svc: 'pallet', pal };
    if (mode === 'groupage') return { svc: 'groupage' };
    if (mode === 'pallet' || !reg) return { svc: 'pallet', pal };
    const rates = pal.map((pl) => palletRate(reg, pl));
    if (rates.some((x) => x == null)) return { svc: 'groupage' };
    const hit = findGroupage(prov, reg);
    if (!hit) return { svc: 'pallet', pal };
    const band = groupageBand(hit.zona, grp.ml, grp.q, grp.b);
    return rates.reduce((a, b) => a + b, 0) <= hit.gruppo.prezzi[band.i] ? { svc: 'pallet', pal } : { svc: 'groupage' };
  }
  const needsProvince = (reg) => !(D.groupage.zone || []).some((z) => z.gruppi.some((g) => g.tutte && norm(g.regione) === norm(reg)));

  /* cart: [{ art, qty }] -> { ok, total, raw, lines[], notes[], infos[], used:Set } */
  function computeMode(cart, mode) {
    const R = { ok: false, total: 0, lines: [], notes: [], infos: [], used: new Set() };
    const reg = S.reg, prov = S.prov;
    const magg = num(D.listini && D.listini.maggiorazioneFornitori && D.listini.maggiorazioneFornitori.pct, 0);
    const c = cart.map((x) => Object.assign({}, x, decide(x.art, mode, reg, prov)));
    let tot = 0, priced = false;

    const pal = c.filter((x) => x.svc === 'pallet');
    if (pal.length) {
      const reg0 = D.pallet.regole;
      let sub = 0, n = 0;
      for (const x of pal) {
        const rs = x.pal.map((pl) => palletRate(reg, pl));
        if (rs.some((v) => v == null)) { R.notes.push(`Tariffa pallet non trovata per ${x.art.nome}.`); return R; }
        const v = rs.reduce((a, b) => a + b, 0) * x.qty;
        sub += v; n += x.pal.length * x.qty;
        const lab = x.pal.length === 1 ? `pallet ${x.pal[0].type}${!x.pal[0].fixed && x.pal[0].pct ? ' +' + x.pal[0].pct + '%' : ''}` : `${x.pal.length} colli su pallet`;
        R.lines.push({ t: `${x.qty > 1 ? x.qty + ' × ' : ''}${x.art.nome}`, s: lab, v: r2(v) });
      }
      if (magg) { const m = sub * magg / 100; sub += m; R.lines.push({ t: `Adeguamento tariffe trasportatori +${itN(magg)}%`, v: r2(m), minor: true }); }
      const sped = Math.ceil(n / reg0.maxPalletPerSpedizione);
      if (sped > 1) R.infos.push(`${n} pallet: massimo ${reg0.maxPalletPerSpedizione} per spedizione, calcolate ${sped} spedizioni.`);
      if (S.pre) { const v = reg0.preavvisoEuro * sped; sub += v; R.lines.push({ t: 'Preavviso telefonico', v: r2(v), minor: true }); }
      if (S.ass) { const v = sub * reg0.assicurazionePct / 100; sub += v; R.lines.push({ t: `Assicurazione all risk pallet ${reg0.assicurazionePct}%`, v: r2(v), minor: true }); }
      tot += sub; priced = true; R.used.add('pallet');
    }

    const grp = c.filter((x) => x.svc === 'groupage');
    if (grp.length) {
      if (needsProvince(reg) && !prov) { R.notes.push('Scegli la provincia: il groupage ha tariffe diverse per provincia.'); return R; }
      const hit = findGroupage(prov, reg);
      if (!hit) { R.notes.push('Nessuna tariffa groupage per questa provincia.'); return R; }
      let ml = 0, q = 0, b = 0;
      for (const x of grp) { const g = productGroupage(x.art); ml += g.ml * x.qty; q += g.q * x.qty; b += g.b * x.qty; }
      const band = groupageBand(hit.zona, r2(ml), r2(q), Math.round(b));
      let v = hit.gruppo.prezzi[band.i];
      R.lines.push({ t: `Groupage: ${grp.map((x) => (x.qty > 1 ? x.qty + ' × ' : '') + x.art.nome).join(', ')}`, s: `carico ${itN(r2(ml))} m, ${Math.round(b)} bancali, ${itN(r2(q))} q · fascia fino a ${itN(band.ml)} m`, v: r2(v) });
      if (magg) { const m = v * magg / 100; v += m; R.lines.push({ t: `Adeguamento tariffe trasportatori +${itN(magg)}%`, v: r2(m), minor: true }); }
      if (band.over) R.notes.push("Il carico supera l'ultima fascia del listino groupage: la cifra è minima, va chiesta una quotazione.");
      if (S.ass) { const a = v * D.groupage.regole.assicurazionePct / 100; v += a; R.lines.push({ t: `Assicurazione all risk groupage ${D.groupage.regole.assicurazionePct}%`, v: r2(a), minor: true }); }
      if (reg === 'SICILIA') R.infos.push('Sicilia: tariffa groupage per resa intermodale.');
      const lung = /SUD|ISOLE/i.test(hit.zona.zona) ? 16 : 12;
      R.infos.push(`Groupage: a destino deve poter accedere un automezzo lungo fino a ${lung} m.`);
      tot += v; priced = true; R.used.add('groupage');
    }
    if (c.some((x) => x.svc === 'quote')) { R.notes.push(`Imballo non disponibile per ${c.filter((x) => x.svc === 'quote').map((x) => x.art.nome).join(', ')}: trasporto da chiedere.`); return R; }
    if (!priced) return R;
    if (S.dis && num(S.disEur) > 0) { const v = r2(num(S.disEur)); tot += v; R.lines.push({ t: 'Supplemento località disagiata / oltre 30 km', v, minor: true }); }
    else if (S.dis) R.infos.push('Località disagiata o oltre 30 km dal capoluogo: possibile supplemento, da confermare.');
    const rounded = Math.round(tot);
    if (Math.abs(rounded - tot) >= 0.005) R.lines.push({ t: 'Arrotondamento', v: r2(rounded - tot), minor: true });
    R.raw = tot; R.total = rounded; R.ok = true;
    return R;
  }
  /* come l'app Calcolo trasporti: tre soluzioni, si propone la più conveniente */
  function compute(cart) {
    const all = ['auto', 'groupage', 'pallet'].map((m) => computeMode(cart, m));
    const valid = all.filter((R) => R.ok && !R.notes.length);
    if (!valid.length) return all.find((R) => R.notes.length) || all[0];
    const best = valid.reduce((a, b) => (b.total < a.total - 0.005 ? b : a), valid[0]);
    const arts = cart.map((x) => x.art);
    const noSp = arts.filter((a) => a.noSponda).map((a) => a.nome);
    if (noSp.length) best.infos.push(`Scarico senza sponda idraulica per ${noSp.join(', ')}: a destino serve un mezzo di sollevamento.`);
    const prev = arts.filter((a) => a.preventivo).map((a) => a.nome);
    if (prev.length && (best.used.has('groupage'))) best.infos.push(`${prev.join(', ')}: prodotto di grandi dimensioni, stima da confermare con il trasportatore.`);
    return best;
  }

  /* ================= Righe del preventivo ================= */
  const rows = () => (typeof articoliAggiunti !== 'undefined' && Array.isArray(articoliAggiunti) ? articoliAggiunti : []);
  function infoCodice(codice) {
    let c = String(codice == null ? '' : codice).trim();
    if (CODICI[c]) return CODICI[c];
    if (/^\d{5,7}$/.test(c)) { c = c.padStart(8, '0'); if (CODICI[c]) return CODICI[c]; }   // zeri iniziali persi da Excel
    return null;
  }
  const qtyOf = (a) => Math.max(1, parseInt(a.quantita || 1, 10) || 1);

  let LAST = null;
  function calcola() {
    const L = rows();
    const codes = L.map((a) => (infoCodice(a.codice) ? String(a.codice).trim().padStart(8, '0') : ''));
    const res = { righe: [], tr: null, cart: [], incl: [], noDati: [], quota: [], inst: [], instNote: [] };
    L.forEach((a, i) => {
      const info = infoCodice(a.codice);
      const r = { i, a, info, tr: undefined, ins: undefined };
      res.righe.push(r);
      if (!info) { res.noDati.push(a); return; }
      const incl = info.ti || (info.tic && info.tic.every((c) => codes.includes(c)));
      if (incl) { r.tr = 0; res.incl.push(a); }
      else if (info.tf != null) r.trFisso = num(info.tf);
      else if (info.t && ART.get(info.t)) res.cart.push({ art: ART.get(info.t), qty: qtyOf(a), r });
      else if (info.k !== 'nessuna') res.quota.push(a);
      else res.noDati.push(a);
    });

    // trasporto della spedizione unica, ripartito sulle righe
    if (S.reg && res.cart.length) {
      const R = compute(res.cart.map((x) => ({ art: x.art, qty: x.qty })));
      res.tr = R;
      if (R.ok) {
        const w = res.cart.map((x) => { const s = compute([{ art: x.art, qty: x.qty }]); return s.ok ? s.raw : 0; });
        const W = w.reduce((s, v) => s + v, 0);
        let assegnato = 0;
        res.cart.forEach((x, k) => {
          const quota = W > 0 ? R.total * w[k] / W : R.total / res.cart.length;
          x.r.tr = r2(quota / x.qty);
          assegnato += x.r.tr * x.qty;
        });
        const diff = r2(R.total - assegnato);
        const uno = res.cart.find((x) => x.qty === 1);
        if (diff && uno) uno.r.tr = r2(uno.r.tr + diff);
      }
    }
    res.righe.forEach((r) => { if (r.trFisso != null) r.tr = r.trFisso; });

    // installazione: costo per categoria; smontagomme + equilibratrice installati in coppia
    if (S.inst) {
      const unita = [];
      res.righe.forEach((r) => {
        const k = r.info && r.info.k;
        if (!k || k === 'nessuna') return;
        if (k === 'richiesta') { res.instNote.push(r.a); return; }
        if (!(k in INSTALL)) return;
        r.insTot = 0;
        for (let u = 0; u < qtyOf(r.a); u++) unita.push({ r, k, c: num(INSTALL[k]) });
      });
      let sm = unita.filter((u) => u.k === 'piatto' || u.k === 'platorello').sort((x, y) => y.c - x.c);
      const eq = unita.filter((u) => u.k === 'equil');
      const coppie = Math.min(sm.length, eq.length);
      for (let p = 0; p < coppie && INSTALL.coppia != null; p++) {
        const a = sm[p], b = eq[p], tot = a.c + b.c, cp = num(INSTALL.coppia);
        a.c = r2(cp * a.c / tot); b.c = r2(cp - a.c); a.coppia = b.coppia = true;
      }
      unita.forEach((u) => { u.r.insTot += u.c; if (u.coppia) u.r.coppia = true; });
      res.righe.forEach((r) => { if (r.insTot != null) r.ins = r2(r.insTot / qtyOf(r.a)); });
      res.coppie = INSTALL.coppia != null ? coppie : 0;
    }
    return res;
  }

  /* scrive gli importi nelle righe (solo dove serve) senza toccare i calcoli di Xpress */
  function applica(res) {
    const tb = document.querySelector('#articoli-table tbody');
    const fmt = (v) => (typeof fmtDec === 'function' ? fmtDec(v, 2, true) : String(v));
    const setField = (r, field, v) => {
      if (v === undefined) return false;
      if (Math.abs(num(r.a[field]) - v) < 0.005) return false;
      r.a[field] = v;
      const inp = tb && tb.querySelector(`tr[data-index="${r.i}"] input[data-field="${field}"]`);
      if (inp && document.activeElement !== inp) inp.value = fmt(v);
      return true;
    };
    res.righe.forEach((r) => {
      let ch = false;
      if (S.auto && !r.a.__trManuale) {
        // importo calcolato; se non è più calcolabile, azzero quello messo in automatico prima
        const v = r.tr !== undefined ? r.tr : (r.a.__trAuto ? 0 : undefined);
        ch = setField(r, 'costoTrasporto', v) || ch;
        if (r.tr !== undefined) r.a.__trAuto = true; else delete r.a.__trAuto;
      }
      if (S.inst && !r.a.__insManuale) {
        const v = r.ins !== undefined ? r.ins : (r.a.__insAuto ? 0 : undefined);
        ch = setField(r, 'costoInstallazione', v) || ch;
        if (r.ins !== undefined) r.a.__insAuto = true; else delete r.a.__insAuto;
      }
      if (ch && typeof aggiornaCalcoliRiga === 'function') aggiornaCalcoliRiga(r.i);
    });
  }

  /* ================= Riquadro risultato ================= */
  function destLabel() {
    const r = D.geo.find((x) => x.id === S.reg);
    if (!r) return '';
    if (S.luogo && S.luogoProv === S.prov) return S.luogo;
    const p = r.province.find((x) => x.sigla === S.prov);
    return p ? `${p.nome} (${p.sigla}), ${r.nome}` : r.nome;
  }
  const nomeRiga = (a) => `${a.codice}${a.descrizione ? ' ' + String(a.descrizione).slice(0, 40) : ''}`;
  function mostra(res) {
    const box = $('trEsito');
    const L = rows();
    let h = '';
    if (!S.auto && !S.inst) { box.innerHTML = '<p class="tr-hint">Calcolo automatico spento: trasporto e installazione si scrivono a mano nella tabella.</p>'; return; }
    if (!S.reg) h += '<p class="tr-hint">Scegli la destinazione: il trasporto di ogni articolo si calcola da solo quando lo aggiungi.</p>';
    else if (!L.length) h += `<p class="tr-hint">Destinazione <b>${esc(destLabel())}</b>. Aggiungi gli articoli: il trasporto si calcola da solo.</p>`;
    else if (S.auto) {
      const R = res.tr;
      if (R && R.ok) {
        h += `<div class="tr-tot"><span>Trasporto stimato · ${esc(destLabel())}</span><b>${eur(R.total)}</b><small>IVA esclusa · ripartito sulle righe</small></div>`;
        h += '<div class="tr-lines">' + R.lines.map((l) => `<div class="tr-ln${l.minor ? ' minor' : ''}"><span>${esc(l.t)}${l.s ? `<small>${esc(l.s)}</small>` : ''}</span><span>${eur(l.v)}</span></div>`).join('') + '</div>';
      } else if (R) {
        h += `<p class="tr-warn">${esc(R.notes.join(' ') || 'Trasporto non calcolabile: inseriscilo a mano.')}</p>`;
      } else if (!res.cart.length) {
        h += `<p class="tr-hint">Destinazione <b>${esc(destLabel())}</b>.</p>`;
      }
      const notes = [];
      if (R && R.ok) R.notes.forEach((n) => notes.push(['warn', n]));
      if (R) R.infos.forEach((n) => notes.push(['', n]));
      if (res.incl.length) notes.push(['ok', `Trasporto incluso per ${res.incl.map(nomeRiga).join(', ')}.`]);
      if (res.quota.length) notes.push(['warn', `Trasporto da chiedere per ${res.quota.map(nomeRiga).join(', ')}: scrivilo a mano nella riga.`]);
      if (res.noDati.length) notes.push(['', `Senza dati di trasporto (accessori o articoli fuori catalogo): ${res.noDati.map(nomeRiga).join(', ')}. Se serve, scrivi il trasporto a mano.`]);
      h += notes.map(([c, n]) => `<p class="tr-note ${c}">${esc(n)}</p>`).join('');
    }
    if (S.inst && L.length) {
      if (res.coppie) h += `<p class="tr-note ok">Smontagomme + equilibratrice installati in coppia${res.coppie > 1 ? ' × ' + res.coppie : ''}: ${eur(INSTALL.coppia)} la coppia.</p>`;
      if (res.instNote.length) h += `<p class="tr-note warn">Installazione su richiesta per ${res.instNote.map(nomeRiga).join(', ')}.</p>`;
      if (L.some((a) => { const i = infoCodice(a.codice); return i && i.k === 'colonne'; })) h += '<p class="tr-note ok">Colonne mobili: preinstallazione in Cormach e trasporto inclusi.</p>';
    }
    const manuali = L.filter((a) => (S.auto && a.__trManuale) || (S.inst && a.__insManuale));
    if (manuali.length) h += `<p class="tr-note">Righe corrette a mano (non ricalcolate): ${manuali.map(nomeRiga).join(', ')}. <button type="button" class="tr-link" id="trReset">Ricalcola tutto</button></p>`;
    if (L.length && S.reg) h += `<p class="tr-ref">Stima su ${esc(rifListini(res.tr))}. Consegna a piano strada entro 30 km dal capoluogo di provincia.</p>`;
    box.innerHTML = h;
  }
  function rifListini(R) {
    const sv = (D.listini && D.listini.servizi) || {};
    const out = [];
    if (!R || !R.used || R.used.has('pallet') || !R.used.size) if (sv.pallet) out.push(`pallet listino ${String(sv.pallet.riferimento).toLowerCase()}`);
    if (R && R.used && R.used.has('groupage') && sv.groupage) out.push(`groupage listino ${String(sv.groupage.riferimento).toLowerCase()}`);
    return out.join(', ') || 'listini trasporti';
  }

  /* ================= Aggancio a Xpress ================= */
  let busy = false;
  function aggiorna() {
    if (busy) return;
    busy = true;
    try {
      const res = calcola();
      LAST = res;
      applica(res);
      mostra(res);
    } catch (e) { console.warn('[Trasporti]', e); }
    finally { busy = false; }
  }
  // ogni volta che Xpress ricalcola i totali (articolo aggiunto, tolto, quantità...) aggiorno prima trasporto/installazione
  const orig = window.aggiornaTotaliGenerali;
  if (typeof orig === 'function') {
    window.aggiornaTotaliGenerali = function () { aggiorna(); return orig.apply(this, arguments); };
  }
  const ricalcolaTutto = () => { if (typeof window.aggiornaTotaliGenerali === 'function') window.aggiornaTotaliGenerali(); else aggiorna(); };

  // una riga corretta a mano non viene più sovrascritta
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement) || !t.closest('#articoli-table')) return;
    const a = rows()[parseInt(t.dataset.index || '-1', 10)];
    if (!a) return;
    if (t.dataset.field === 'costoTrasporto') a.__trManuale = true;
    if (t.dataset.field === 'costoInstallazione') a.__insManuale = true;
  }, true);

  /* ================= Destinazione: regione, provincia, CAP/comune ================= */
  function fillReg() {
    $('trReg').innerHTML = '<option value="">Scegli la regione</option>' + D.geo.map((r) => `<option value="${esc(r.id)}">${esc(r.nome)}</option>`).join('');
    $('trReg').value = S.reg;
    fillProv();
  }
  function fillProv() {
    const r = D.geo.find((x) => x.id === S.reg), sel = $('trProv');
    if (!r) { sel.innerHTML = '<option value="">Prima la regione</option>'; sel.disabled = true; return; }
    sel.disabled = false;
    if (r.province.length === 1) S.prov = r.province[0].sigla;
    sel.innerHTML = '<option value="">Scegli la provincia</option>' + r.province.map((p) => `<option value="${p.sigla}">${esc(p.nome)} (${p.sigla})</option>`).join('');
    sel.value = S.prov;
  }
  let COM = null, CAPM = null;
  function comuni() {
    if (COM) return COM;
    const txt = String(window.XPRESS_COMUNI || '').trim();
    COM = txt ? txt.split('\n').map((l) => { const [n, s, c] = l.split('|'); return { n, s, c: (c || '').split(','), k: norm(n) }; }) : [];
    CAPM = new Map();
    COM.forEach((x) => x.c.forEach((c) => { if (c && !CAPM.has(c)) CAPM.set(c, x); }));
    return COM;
  }
  const provBySigla = (sg) => { for (const r of D.geo) { const p = r.province.find((x) => x.sigla === sg); if (p) return { r, p }; } return null; };
  function trovaLuogo(txt) {
    const COMx = comuni();
    const raw = String(txt || '').toLowerCase();
    const m5 = raw.replace(/(\d)[\s.]+(?=\d)/g, '$1').match(/\b\d{5}\b/);
    if (m5) {
      const cap = m5[0], c = CAPM.get(cap);
      if (c) { const f = provBySigla(c.s); if (f) return Object.assign({}, f, { luogo: `${c.n} (${c.s})` }); }
      const pre = COMx.find((x) => x.c.some((z) => z.slice(0, 3) === cap.slice(0, 3)));
      if (pre) { const f = provBySigla(pre.s); if (f) return Object.assign({}, f, { luogo: `CAP ${cap} (${pre.s})` }); }
      return null;
    }
    const k = norm(raw.replace(/\b(provincia|comune|citt[aà])\s+(di|de)\b/g, ' '));
    if (k.length < 2) return null;
    if (k.length === 2) return provBySigla(k);
    for (const r of D.geo) for (const p of r.province) if (norm(p.nome) === k && /\bprovincia\b/.test(raw)) return { r, p };
    const exact = COMx.find((x) => x.k === k);
    if (exact) { const f = provBySigla(exact.s); if (f) return Object.assign({}, f, { luogo: `${exact.n} (${exact.s})` }); }
    for (const r of D.geo) for (const p of r.province) if (norm(p.nome) === k) return { r, p };
    const best = k.length >= 4 ? COMx.find((x) => x.k.startsWith(k)) : null;
    if (best) { const f = provBySigla(best.s); if (f) return Object.assign({}, f, { luogo: `${best.n} (${best.s})` }); }
    return null;
  }
  function risolviLuogo() {
    const inp = $('trLuogo'), v = inp.value.trim();
    if (!v) return;
    const f = trovaLuogo(v);
    const msg = $('trLuogoMsg');
    if (!f) { msg.textContent = `Non trovo «${v}». Prova con il CAP o scegli regione e provincia.`; msg.hidden = false; return; }
    msg.hidden = true;
    S.reg = f.r.id; S.prov = f.p.sigla; S.luogo = f.luogo || ''; S.luogoProv = f.p.sigla;
    inp.value = '';
    fillReg(); save(); ricalcolaTutto();
  }

  /* ================= Interfaccia ================= */
  function syncUI() {
    $('trAuto').checked = !!S.auto; $('trInst').checked = !!S.inst;
    $('trPre').checked = !!S.pre; $('trAss').checked = !!S.ass; $('trDis').checked = !!S.dis;
    $('trDisRow').hidden = !S.dis;
    $('trDisEur').value = num(S.disEur) > 0 ? String(S.disEur) : '';
    if (S.pre || S.ass || S.dis) $('trOpt').open = true;
  }
  function init() {
    fillReg(); syncUI();
    $('trReg').addEventListener('change', (e) => { S.reg = e.target.value; S.prov = ''; S.luogo = ''; fillProv(); save(); ricalcolaTutto(); });
    $('trProv').addEventListener('change', (e) => { S.prov = e.target.value; S.luogo = ''; save(); ricalcolaTutto(); });
    $('trLuogo').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); risolviLuogo(); } });
    $('trLuogo').addEventListener('change', risolviLuogo);
    $('trLuogo').addEventListener('input', () => { if (/^\s*\d{5}\s*$/.test($('trLuogo').value)) risolviLuogo(); });
    [['trAuto', 'auto'], ['trInst', 'inst'], ['trPre', 'pre'], ['trAss', 'ass'], ['trDis', 'dis']].forEach(([id, k]) => {
      $(id).addEventListener('change', (e) => { S[k] = e.target.checked; save(); syncUI(); ricalcolaTutto(); });
    });
    $('trDisEur').addEventListener('input', (e) => { S.disEur = Math.max(0, num(e.target.value)); save(); ricalcolaTutto(); });
    $('trEsito').addEventListener('click', (e) => {
      if (e.target.id !== 'trReset') return;
      rows().forEach((a) => { delete a.__trManuale; delete a.__insManuale; });
      ricalcolaTutto();
    });
    ricalcolaTutto();
    aggiornaDatiDalSito();
  }

  /* Tariffe sempre fresche: se l'app Calcolo trasporti è pubblicata sullo stesso sito
     (…/calcolo-trasporti/), ne leggo i dati aggiornati. Altrimenti resta la copia inclusa. */
  async function aggiornaDatiDalSito() {
    if (!/^https?:$/.test(location.protocol) || (typeof XPRESS_AGENT !== 'undefined' && XPRESS_AGENT)) return;
    try {
      const base = new URL('../calcolo-trasporti/data/', location.href).href;
      const get = async (n) => { const r = await fetch(`${base}${n}.json?v=${Date.now()}`, { cache: 'no-store' }); if (!r.ok) throw new Error(n); return r.json(); };
      const [listini, pallet, groupage, articoli, geo] = await Promise.all(['listini', 'pallet', 'groupage', 'articoli', 'geo'].map(get));
      if (pallet.versione !== DATI_VERSIONE || groupage.versione !== DATI_VERSIONE || !Array.isArray(articoli) || !articoli.length) return;
      Object.assign(D, { listini, pallet, groupage, articoli, geo });
      ART = new Map(D.articoli.map((a) => [a.id, a]));
      ricalcolaTutto();
    } catch (e) { /* app trasporti non raggiungibile: uso la copia inclusa */ }
  }

  window.XpressTrasporti = { calcola, compute, trovaLuogo, stato: S, ultimo: () => LAST, aggiorna: ricalcolaTutto };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
