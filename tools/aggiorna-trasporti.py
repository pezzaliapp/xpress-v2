#!/usr/bin/env python3
"""Rigenera trasporti-dati.js (e trasporti-comuni.js) per Xpress.

Uso:
  python3 tools/aggiorna-trasporti.py <cartella calcolo-trasporti> <configuratore-preventivi.html>

- Tariffe pallet/groupage, pesi e misure, regioni: dalla cartella data/ dell'app Calcolo trasporti.
- Codice articolo -> prodotto del calcolo trasporti, categoria e costi di installazione,
  comuni e CAP: dal configuratore preventivi Cormach.
Non fa parte dell'app pubblicata.
"""
import json, re, sys, pathlib

ct = pathlib.Path(sys.argv[1]) / "data"
html = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8")
out = pathlib.Path(__file__).resolve().parent.parent

def blocco(id_):
    m = re.search(r'<script id="%s"[^>]*>(.*?)</script>' % id_, html, re.S)
    if not m: sys.exit("blocco %s non trovato nel configuratore" % id_)
    return m.group(1)

cfg = json.loads(blocco("dati"))
dati = {n: json.loads((ct / f"{n}.json").read_text(encoding="utf-8")) for n in ["listini", "pallet", "groupage", "articoli", "geo"]}
ids = {a["id"] for a in dati["articoli"]}

codici = {}
for p in cfg["prodotti"]:
    x = {"k": p.get("k", "nessuna")}
    if p.get("t") and p["t"] in ids: x["t"] = p["t"]
    if p.get("ti"): x["ti"] = 1                      # trasporto incluso
    if p.get("tic"): x["tic"] = p["tic"]              # trasporto incluso se abbinati
    if p.get("tf") is not None: x["tf"] = p["tf"]     # trasporto a importo fisso
    codici[p["c"]] = x

pkg = {
    "fonte": "App Calcolo trasporti (dati al %s) + configuratore preventivi (%s)" % (dati["listini"].get("aggiornato", "?"), cfg.get("listinoRif", "")),
    **dati,
    "codici": codici,
    "install": cfg["install"],
}
js = "/* Xpress · dati per il calcolo di trasporto e installazione. Generato da tools/aggiorna-trasporti.py: non modificare a mano. */\n"
js += "window.XPRESS_TRASPORTI = " + json.dumps(pkg, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";\n"
(out / "trasporti-dati.js").write_text(js, encoding="utf-8")

com = blocco("comuni").strip()
(out / "trasporti-comuni.js").write_text(
    "/* Xpress · comuni italiani con sigla provincia e CAP (Comune|SIGLA|cap,cap). Generato da tools/aggiorna-trasporti.py. */\n"
    "window.XPRESS_COMUNI = " + json.dumps(com, ensure_ascii=False).replace("</", "<\\/") + ";\n", encoding="utf-8")
print("articoli trasporto:", len(dati["articoli"]), "· codici:", len(codici), "· con prodotto:", sum(1 for c in codici.values() if "t" in c))
