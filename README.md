# Xpress

PWA per agenti di vendita derivata da [CSVXpressSmart](https://github.com/pezzaliapp/CSVXpressSmart):
stessa logica e stesse funzioni (sconti, margini, trasporto/installazione, modalità Smart,
report TXT/WhatsApp), **più il listino PDF con le immagini degli articoli**.

## Novità rispetto a CSVXpressSmart: listino PDF con immagini

- Si carica il listino PDF (es. il listino Cormach) accanto al listino CSV/Excel.
- Il PDF viene letto **nel browser** con PDF.js e indicizzato: per ogni codice articolo
  l'app trova la pagina e ritaglia la foto del prodotto.
- La miniatura compare **accanto al codice** nella tabella articoli e nell'anteprima
  dell'articolo selezionato; toccandola si apre l'immagine grande e la pagina intera.
- Nuovi pulsanti **"Stampa / PDF con immagini"** e **"Stampa (No Marg.)"**: stesso testo dei
  report TXT, con la foto a fianco di ogni articolo (dal dialogo di stampa si può salvare in PDF).
- I codici si riconoscono anche se Excel ha tolto gli zeri iniziali (1100313 = 01100313);
  se il CSV ha la colonna *Pagine*, quella pagina ha la precedenza.
- **Riservatezza**: il PDF non viene mai inviato a nessun server. Resta nella memoria locale
  (IndexedDB) di quel dispositivo, insieme all'indice e alle miniature, e si rimuove con
  "Rimuovi listino PDF" o togliendo la spunta "Ricorda il listino PDF". Il `.gitignore`
  esclude PDF/CSV/Excel perché nessun listino finisca nel repository.

Report WhatsApp e TXT restano solo testo (come nell'originale): le immagini sono nella stampa.

## Destinazione e trasporto automatico

- Riquadro **Destinazione e trasporto** prima della scelta degli articoli: CAP o comune
  (oppure regione e provincia) e il trasporto di ogni articolo aggiunto si calcola da solo.
- Stesse regole dell'app [Calcolo trasporti](https://github.com/pezzaliapp/calcolo-trasporti):
  pallet o groupage, soluzione più conveniente, adeguamento tariffe trasportatori,
  preavviso, assicurazione all risk, supplemento località disagiata, arrotondamento all'euro.
- Tutti gli articoli viaggiano in un'unica spedizione: il costo totale viene ripartito
  sulle righe (colonna «Trasp.», importo unitario) in proporzione al trasporto di ciascuna.
- Opzionale: **installazione automatica** per categoria di macchina (smontagomme +
  equilibratrice in coppia a prezzo ridotto), dai costi del configuratore preventivi.
- I calcoli di Xpress non cambiano: il modulo compila solo i campi Trasp./Inst.
  Una riga corretta a mano non viene più sovrascritta (pulsante «Ricalcola tutto»).
- Dati inclusi in `trasporti-dati.js` e `trasporti-comuni.js` (funzionano offline e nel
  listino agenti). Se l'app Calcolo trasporti è pubblicata sullo stesso sito
  (`../calcolo-trasporti/`), le tariffe vengono lette da lì, sempre aggiornate.
- Per rigenerare i dati inclusi:
  `python3 tools/aggiorna-trasporti.py <cartella calcolo-trasporti> <configuratore-preventivi.html>`

## Caratteristiche

- **Import CSV o Excel** (.csv, .xlsx, .xlsm, .xls)
- Riconoscimento intelligente colonne (italiano/inglese, varianti case-insensitive)
- Calcolo prezzo netto, margine percentuale, sconto equivalente cliente
- Trasporto e installazione opzionali
- Memoria locale (IndexedDB): l'ultimo listino caricato resta disponibile
- Export report TXT e WhatsApp
- **Offline-first**: funziona senza connessione dopo il primo caricamento
- **Privacy first**: nessun account, nessun tracker, nessuna telemetria, nessuna richiesta
  a servizi esterni. Listini e preventivi restano sul dispositivo

## Pubblicazione su Cloudflare Pages

PWA completamente statica: nessun build, nessun npm, nessun Worker o Function.

1. Genera/usa uno ZIP del progetto (index.html alla radice dello ZIP)
2. Cloudflare Pages → Create project → **Direct Upload** → trascina lo ZIP

Il file `_headers` applica CSP, header di sicurezza e le regole di cache
(`service-worker.js` e `index.html` sempre rivalidati, `vendor/` e `icon/` a cache lunga).

Ad ogni nuova pubblicazione ricordarsi di:
1. incrementare `CACHE_VERSION` in `service-worker.js`
2. incrementare `data-ver` in `index.html`

Così il service worker installa la nuova shell, elimina le cache vecchie e la pagina
si aggiorna da sola.

## Test

Richiedono Google Chrome installato e un server statico locale:

```bash
python3 -m http.server 8899 --bind 127.0.0.1   # oppure: node tests/serve-with-headers.mjs 8898
node tests/logic.test.js       # calcoli, report, export, parsing
node tests/browser.test.mjs    # end-to-end in Chrome headless (import, TXT, offline, responsive)
node tests/update.test.mjs     # aggiornamento PWA e pulizia cache
```


## Colonne supportate

Campi obbligatori:
- **Codice** (alias: code, codiceArt, codArticolo, id)
- **Prezzo** (alias: prezzo, prezzoLordo, prezzo_EUR, price, importo, listino)

Campi opzionali:
- **Descrizione** (alias: description, desc, articolo)
- **CostoTrasporto** (alias: trasporto, shipping, spedizione)
- **CostoInstallazione** (alias: installazione, installation, montaggio)
- **Famiglia, Categoria, Pagine** (preparati per futuri filtri)

Tutti i nomi sono riconosciuti **senza maiuscole/minuscole** e con o senza spazi.

## Licenza

MIT — vedi [LICENSE](LICENSE).

## Autore

Alessandro Pezzali — https://www.alessandropezzali.it

## Listino per gli agenti

Nella sezione **Listino per gli agenti** (si apre da sola dopo aver caricato il listino CSV/Excel):

1. Sconto 1 e Sconto 2 d'acquisto (stessa logica in cascata di Xpress).
2. Come calcolare il prezzo di vendita: **margine** sul prezzo di vendita, **ricarico** sul costo oppure **sconto** al cliente sul listino.
3. Sconto massimo che gli agenti possono applicare e titolo del listino.

L'anteprima mostra lordo, costo, vendita e margine (solo a te) e avvisa se qualche articolo finisce sopra il listino o sotto costo.

**Crea listino agenti (HTML)** genera un unico file `.html` da condividere: dentro c'è **Xpress completo** (ricerca, tabella, trasporto/installazione, report WhatsApp/TXT, stampa con immagini) con il listino a prezzi di vendita e, se è caricato il listino PDF, le foto dei prodotti. Si apre da solo nel browser, anche offline.

Nell'edizione agenti: il prezzo mostrato è quello di vendita; Sc.1, Sc.2, Marg.%, Vend. e Diff. non esistono; l'agente applica solo lo **sconto cliente** fino al massimo impostato; non ci sono caricamento listini, PDF, pagina intera né i report "No Marg.".
Nel file non ci sono prezzo lordo, costo, margine né il PDF. Le librerie di importazione (Excel, CSV, PDF) non sono incluse.
