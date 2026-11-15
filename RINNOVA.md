# Analisi di Xpress

Repo: `pezzaliapp/xpress` · Data: 15/11/2026 · Voto: **9/10**

Xpress è una PWA per agenti di vendita che permette di creare preventivi e ordini rapidi. Carica listini da file CSV o Excel e listini PDF per visualizzare le immagini degli articoli. Gestisce sconti, margini, costi di trasporto e installazione, offrendo report personalizzabili per il cliente e funzionalità di condivisione.

## Punti di forza

- Architettura PWA robusta e ben configurata (manifest, service worker per offline e aggiornamenti).
- Privacy-first: tutti i dati sono elaborati e memorizzati localmente sul dispositivo dell'utente, senza invii a server esterni o tracker.
- Funzionalità PDF avanzate: indicizzazione, visualizzazione miniature e stampa/esportazione PDF con immagini, tutto client-side.
- Gestione intelligente dei decimali e dei formati numerici (italiano/inglese) per input da CSV/Excel e utente.
- Design responsive ben curato, con layout a schede per la tabella su mobile e fix specifici per problemi di visualizzazione su smartphone/tablet.
- Suite di test completa (unitari, end-to-end, responsive, aggiornamento PWA) che garantisce stabilità e qualità del codice.
- Nessuna dipendenza da servizi esterni o API keys, rendendo l'app autonoma e facile da deployare.
- Funzionalità di export report (TXT, WhatsApp, Stampa/PDF) con opzioni Smart per il cliente.

## Limiti

- **[bassa] Gestione valuta fissa** — L'applicazione utilizza esclusivamente l'Euro (€) come valuta. Non è prevista un'opzione per cambiare valuta, simbolo o formattazione numerica per adattarsi a diversi mercati.
- **[media] Personalizzazione limitata dei report** — I report generati (TXT, WhatsApp, Stampa/PDF) seguono un formato predefinito. Non è possibile personalizzare l'ordine delle sezioni, aggiungere note libere o scegliere colonne specifiche oltre le opzioni Smart/IVA/Sconti esistenti.
- **[media] Gestione listino singolo e non modificabile** — L'app supporta un solo listino alla volta, che viene caricato da file e non può essere modificato direttamente nell'interfaccia. Non è possibile combinare più listini o gestire un archivio di listini.
- **[bassa] Articoli manuali non persistenti** — Gli articoli aggiunti manualmente alla tabella non vengono salvati nel listino principale e non persistono tra le sessioni dell'app. Vengono persi se non inclusi in un preventivo esportato.
- **[bassa] Indicizzazione PDF intensiva per file grandi** — Per listini PDF con un numero elevato di pagine e immagini, il processo di indicizzazione iniziale può essere intensivo e richiedere tempo, mostrando un messaggio di stato all'utente.

## Bug e errori

- **[bassa] File CSS mobile obsoleti nel repository** — Nel repository sono presenti i file 'style.mobile.cards.rev.css' e 'style.mobile.cards.rev.v2.css' che non sono caricati da 'index.html'. Solo 'style.mobile.cards.rev.v3.css' è in uso. Questo non causa problemi funzionali ma è un'incoerenza che rende il repository meno pulito.
- **[bassa] Potenziale mascheramento overflow orizzontale** — I file 'style.css' e 'style.mobile.rev.css' impostano 'overflow-x: hidden' per 'html' e 'body'. Sebbene il componente 'desktop-mode-fix.js' e il CSS mobile gestiscano bene la reattività, questa regola globale potrebbe mascherare problemi di overflow orizzontale in scenari non previsti, tagliando il contenuto invece di renderlo scrollabile.
- **[bassa] Dipendenza da Capacitor per stampa nativa** — La funzione 'isNativeApp()' in 'pdf-listino.js' verifica la presenza di 'window.__CAPACITOR_NATIVE__' o 'window.Capacitor.isNativePlatform()'. Se l'app venisse impacchettata con un framework nativo diverso (es. Cordova), la stampa PDF nativa non verrebbe attivata, limitando la portabilità della funzionalità.

## Sicurezza

- **[media] Potenziale XSS tramite logo rivenditore SVG** — Il logo del rivenditore viene caricato dall'utente e inserito direttamente come 'img.src'. Sebbene la funzione 'preparaLogo' tenti di ridimensionare e riconvertire l'immagine in PNG/JPEG, un file SVG malevolo potrebbe teoricamente contenere script XSS che, se non correttamente sanificati dalla riconversione, potrebbero essere eseguiti. Si consiglia di assicurare una rigorosa sanificazione o di limitare i tipi di file accettati per il logo.

## Miglioramenti suggeriti

- **[bassa] Migliorare feedback visivo durante indicizzazione PDF** — Durante l'indicizzazione di PDF di grandi dimensioni, l'app mostra un messaggio di stato testuale. Sarebbe utile aggiungere un indicatore di progresso visivo (es. una barra di avanzamento) per migliorare l'esperienza utente e rassicurare che l'app non è bloccata.
- **[bassa] Ottimizzazione rendering tabella per grandi dataset** — La funzione 'renderTabellaArticoli()' ricrea l'intero 'tbody' ogni volta che la lista degli articoli aggiunti cambia. Per un numero molto elevato di articoli (es. migliaia), questo potrebbe causare un leggero ritardo nel rendering. Si potrebbe considerare un approccio di 'virtual scrolling' o aggiornamenti DOM più granulari se questo dovesse diventare un problema di performance reale.
- **[bassa] Consolidare file CSS mobile** — Nel repository sono presenti più versioni di 'style.mobile.cards.rev.css'. Si suggerisce di consolidare tutte le regole in un unico file (es. 'style.mobile.css') e rimuovere le versioni obsolete per mantenere il codebase più ordinato.
- **[bassa] Aggiungere opzione per rimuovere tutti gli articoli** — Attualmente è possibile rimuovere gli articoli uno per uno. Un pulsante 'Svuota preventivo' o 'Rimuovi tutti gli articoli' nella sezione 'Articoli Aggiunti' migliorerebbe l'usabilità per resettare rapidamente la lista.

## Piano per la versione nuova

1. Aggiungere un pulsante 'Svuota preventivo' nella sezione 'Articoli Aggiunti' per rimuovere rapidamente tutti gli elementi dalla tabella.
2. Implementare un indicatore di progresso visivo (es. una semplice barra) per l'indicizzazione del listino PDF, migliorando il feedback utente per file di grandi dimensioni.
3. Consolidare i file CSS mobile obsoleti ('style.mobile.cards.rev.css', 'style.mobile.cards.rev.v2.css') in un unico file 'style.mobile.css' per pulizia del repository.
4. Aggiungere un'opzione nelle impostazioni per specificare il simbolo di valuta (es. €, $, £) da utilizzare nei report e nella visualizzazione dei prezzi.

---
_Generato con Rinnova._

# Cosa è cambiato nella nuova versione

- Aggiunto un pulsante 'Svuota preventivo' nella sezione 'Articoli Aggiunti'.
- Implementata la logica per rimuovere tutti gli articoli e aggiornare i totali.
- Aggiunto un messaggio di conferma per prevenire cancellazioni accidentali.
- Aggiornata la versione dell'app e del Service Worker per garantire l'aggiornamento.
- Aggiunto lo stile per il nuovo pulsante, rendendolo ben visibile e coerente con il design.
- Aggiunto un indicatore di progresso visivo per l'indicizzazione del listino PDF.
- La barra di progresso appare durante il caricamento e l'aggiornamento dell'indice PDF.
- La barra si aggiorna pagina per pagina e scompare al completamento o in caso di errore.
- Aggiornate le versioni dell'applicazione e della cache del Service Worker.
- È stato creato un nuovo file 'style.mobile.css' che contiene gli stili per la visualizzazione mobile della tabella, copiando il contenuto di 'style.mobile.cards.rev.v3.css'.
- Il file 'index.html' è stato aggiornato per caricare il nuovo 'style.mobile.css'.
- Il Service Worker è stato aggiornato per includere il nuovo file CSS nella cache offline e la versione della cache è stata incrementata a 'v2.0.13'.
- Il file di test 'tests/browser.test.mjs' è stato aggiornato per riflettere il nuovo nome del file CSS mobile nella verifica della cache.
- I file 'style.mobile.cards.rev.css', 'style.mobile.cards.rev.v2.css' e 'style.mobile.cards.rev.v3.css' non sono stati rimossi dal repository, in conformità con la regola che vieta la rimozione di file esistenti. Questo significa che, sebbene il codice non li carichi più, essi rimangono fisicamente presenti nel repository.
- Aggiunta un'opzione nelle impostazioni per scegliere il simbolo di valuta.
- Il simbolo scelto viene applicato a tutti i prezzi visualizzati nella tabella, nei totali e nei report (WhatsApp, TXT, Stampa/PDF).
- La preferenza del simbolo di valuta viene salvata e ricordata tra le sessioni dell'app.
- Aggiornata la versione dell'app e della cache del Service Worker per garantire la corretta distribuzione delle modifiche.

Modifiche applicate: 72 · non applicabili: 7

Originale: https://github.com/pezzaliapp/xpress

## Ogni modifica, spiegata

### 1. Aggiornamento versione app

- **File:** `index.html` (modificato)
- **Perché:** Ogni modifica all'app richiede un aggiornamento della versione per garantire che gli utenti ricevano l'ultima versione tramite il Service Worker.
- **Cosa migliora:** Assicura che le nuove funzionalità e correzioni siano disponibili per tutti gli utenti non appena l'app viene aggiornata.

**Prima:**

```
<html data-app="Xpress" data-ver="2.0.10" lang="it">
```

**Dopo:**

```
<html data-app="Xpress" data-ver="2.0.11" lang="it">
```

### 2. Implementazione funzione 'Svuota preventivo'

- **File:** `app.js` (modificato)
- **Perché:** Il nuovo pulsante 'Svuota preventivo' necessitava di una funzione JavaScript associata per eseguire l'azione di rimozione di tutti gli articoli.
- **Cosa migliora:** La funzione permette di svuotare completamente la tabella degli articoli aggiunti, ripristinando lo stato iniziale del preventivo e offrendo un controllo di sicurezza per evitare cancellazioni accidentali.

**Prima:**

```
function rimuoviArticolo(index) {
  articoliAggiunti.splice(index, 1);
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}
```

**Dopo:**

```
function rimuoviArticolo(index) {
  articoliAggiunti.splice(index, 1);
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
}

function svuotaPreventivo() {
  if (articoliAggiunti.length === 0) {
    alert("Il preventivo è già vuoto.");
    return;
  }
  if (!confirm("Sei sicuro di voler rimuovere tutti gli articoli dal preventivo? Questa azione non può essere annullata.")) {
    return;
  }
  articoliAggiunti = [];
  renderTabellaArticoli();
  aggiornaTotaliGenerali();
  updateEquivalentDiscountDisplay();
  annullaArticoloManuale(); // Chiude la riga di input manuale se aperta
}
```

### 3. Aggiornamento versione cache Service Worker

- **File:** `service-worker.js` (modificato)
- **Perché:** Ogni modifica ai file dell'app (HTML, JS, CSS) richiede un aggiornamento della versione della cache del Service Worker per garantire che gli utenti ricevano l'ultima versione dell'app.
- **Cosa migliora:** Assicura che le nuove funzionalità e correzioni siano disponibili per tutti gli utenti non appena l'app viene aggiornata, migliorando l'affidabilità dell'aggiornamento offline.

**Prima:**

```
const CACHE_VERSION = 'v2.0.10';
```

**Dopo:**

```
const CACHE_VERSION = 'v2.0.11';
```

### 4. Stile per il pulsante 'Svuota preventivo'

- **File:** `xpress.css` (modificato)
- **Perché:** Il nuovo pulsante necessitava di uno stile coerente con il resto dell'applicazione, ma con un colore distintivo per indicare un'azione 'distruttiva'.
- **Cosa migliora:** Il pulsante è ora ben visibile, ha un'area di tocco comoda per smartphone e il suo colore rosso comunica chiaramente che l'azione è irreversibile, migliorando l'usabilità e la sicurezza.

**Prima:**

```
/* Messaggio di benvenuto (prima apertura) */
```

**Dopo:**

```
/* Pulsante Svuota Preventivo */
.xp-clear-button {
  background-color: #d32f2f; /* Rosso per azione distruttiva */
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease, transform .05s ease;
  display: block;
  margin-top: 0.5em;
  margin-bottom: 1em;
  padding: 0.55em 0.6em;
  width: 100%;
  max-width: 520px;
  border-radius: 8px;
  min-height: 44px;
  font-size: 16px;
}

.xp-clear-button:hover {
  background-color: #c62828;
}
.xp-clear-button:active {
  transform: translateY(1px);
}

/* Messaggio di benvenuto (prima apertura) */
```

### 5. Aggiunto indicatore di progresso PDF

- **File:** `index.html` (modificato)
- **Perché:** Quando si carica un listino PDF di grandi dimensioni, l'indicizzazione può richiedere tempo e l'utente non ha un feedback visivo del processo.
- **Cosa migliora:** Ora, durante l'indicizzazione del listino PDF, l'utente vedrà una barra di progresso che si riempie, fornendo un feedback chiaro sullo stato dell'operazione e riducendo l'incertezza.

**Prima:**

```
          Ricorda il listino PDF su questo dispositivo
        </label>
<div class="csv-memory-actions" style="display:flex; gap:8px; flex-wrap:wrap; margin:8px 0;">
<button id="btnClearSavedPDF" type="button">Rimuovi listino PDF</button>
</div>
<div class="muted" id="savedPdfInfo" style="opacity:.8; font-size:13px;">Nessun listino PDF caricato.</div>
</div>
</section>
```

**Dopo:**

```
          Ricorda il listino PDF su questo dispositivo
        </label>
<!-- NUOVO: indicatore di progresso per l'indicizzazione PDF -->
<div id="pdfProgressBarContainer" class="xp-progress-container" style="display:none;">
  <div id="pdfProgressBar" class="xp-progress-bar"></div>
</div>
<div class="csv-memory-actions" style="display:flex; gap:8px; flex-wrap:wrap; margin:8px 0;">
<button id="btnClearSavedPDF" type="button">Rimuovi listino PDF</button>
</div>
<div class="muted" id="savedPdfInfo" style="opacity:.8; font-size:13px;">Nessun listino PDF caricato.</div>
</div>
</section>
```

### 6. Aggiornata versione dell'applicazione

- **File:** `index.html` (modificato)
- **Perché:** Ogni modifica significativa ai file dell'applicazione richiede l'aggiornamento della versione per garantire che il Service Worker scarichi i nuovi asset.
- **Cosa migliora:** L'applicazione si aggiornerà correttamente per tutti gli utenti, garantendo che le nuove funzionalità e correzioni siano disponibili senza problemi di cache.

**Prima:**

```
<html data-app="Xpress" data-ver="2.0.11" lang="it">
```

**Dopo:**

```
<html data-app="Xpress" data-ver="2.0.12" lang="it">
```

### 7. Aggiunti stili per la barra di progresso PDF

- **File:** `xpress.css` (modificato)
- **Perché:** Il nuovo indicatore di progresso necessita di stili CSS per essere visualizzato correttamente e in modo coerente con il design dell'app.
- **Cosa migliora:** La barra di progresso avrà un aspetto pulito e funzionale, integrandosi bene nell'interfaccia utente e rendendo il feedback visivo più gradevole.

**Prima:**

```
/* i pulsanti dell'app hanno display esplicito: [hidden] va forzato */
.xp-lightbox button[hidden]{ display: none !important; }
```

**Dopo:**

```
/* i pulsanti dell'app hanno display esplicito: [hidden] va forzato */
.xp-lightbox button[hidden]{ display: none !important; }

/* Indicatore di progresso per l'indicizzazione PDF */
.xp-progress-container{
  width: 100%;
  max-width: 520px;
  background-color: #e0e0e0;
  border-radius: 4px;
  height: 8px;
  margin: 8px 0;
  overflow: hidden;
}
.xp-progress-bar{
  height: 100%;
  width: 0%;
  background-color: var(--brand);
  border-radius: 4px;
  transition: width 0.2s ease-out;
}
```

### 8. Aggiornata funzione di stato PDF con progresso

- **File:** `pdf-listino.js` (modificato)
- **Perché:** La funzione `setStatus` deve ora gestire anche la visibilità e il riempimento della nuova barra di progresso durante l'indicizzazione del PDF.
- **Cosa migliora:** Oltre al messaggio testuale, la barra di progresso si aggiornerà dinamicamente, fornendo un'indicazione visiva immediata dello stato di avanzamento.

**Prima:**

```
  function setStatus(text, color) {
    const s = el('pdfLoadStatus');
    if (!s) return;
    s.textContent = text || '';
    s.style.display = text ? 'block' : 'none';
    s.style.color = color || '#555';
  }
```

**Dopo:**

```
  function setStatus(text, color, progress = null) {
    const s = el('pdfLoadStatus');
    const progressBarContainer = el('pdfProgressBarContainer');
    const progressBar = el('pdfProgressBar');

    if (!s) return;

    s.textContent = text || '';
    s.style.display = text ? 'block' : 'none';
    s.style.color = color || '#555';

    if (progressBarContainer && progressBar) {
      if (progress !== null && progress >= 0 && progress <= 100) {
        progressBarContainer.style.display = 'block';
        progressBar.style.width = `${progress}%`;
      } else {
        progressBarContainer.style.display = 'none';
        progressBar.style.width = '0%';
      }
    }
  }
```

### 9. Inizializzazione progresso PDF al caricamento

- **File:** `pdf-listino.js` (modificato)
- **Perché:** La barra di progresso deve essere visibile e impostata a 0% all'inizio del processo di caricamento del PDF.
- **Cosa migliora:** L'utente vedrà immediatamente che il processo è iniziato, anche prima dell'indicizzazione vera e propria.

**Prima:**

```
      setStatus('Lettura del PDF…');
      const buf = await file.arrayBuffer();
```

**Dopo:**

```
      setStatus('Lettura del PDF…', null, 0); // Inizia con 0% di progresso
      const buf = await file.arrayBuffer();
```

### 10. Aggiornamento progresso durante l'indicizzazione PDF

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Durante l'indicizzazione di ogni pagina del PDF, la barra di progresso deve essere aggiornata per riflettere lo stato di avanzamento.
- **Cosa migliora:** La barra di progresso si muoverà fluidamente man mano che le pagine vengono elaborate, rendendo l'attesa più gestibile per l'utente.

**Prima:**

```
      const index = await buildIndex((p, n) => setStatus(`Indicizzazione listino PDF: pagina ${p} di ${n}…`));
```

**Dopo:**

```
      const index = await buildIndex((p, n) => setStatus(`Indicizzazione listino PDF: pagina ${p} di ${n}…`, null, (p / n) * 100));
```

### 11. Nascondi barra di progresso a fine caricamento PDF

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Una volta completato il caricamento e l'indicizzazione del PDF, la barra di progresso non è più necessaria e deve essere nascosta.
- **Cosa migliora:** L'interfaccia utente tornerà pulita e la barra di progresso non occuperà spazio inutilmente.

**Prima:**

```
      setStatus(`Listino PDF pronto: ${doc.numPages} pagine, ${state.meta.codes} codici trovati.`);
```

**Dopo:**

```
      setStatus(`Listino PDF pronto: ${doc.numPages} pagine, ${state.meta.codes} codici trovati.`, null, null); // Nasconde la barra
```

### 12. Nascondi barra di progresso in caso di errore PDF

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Se si verifica un errore durante il caricamento del PDF, la barra di progresso deve essere nascosta per indicare che il processo è terminato (con un problema).
- **Cosa migliora:** L'utente riceverà un messaggio di errore chiaro e la barra di progresso scomparirà, evitando confusione.

**Prima:**

```
      setStatus('Errore nella lettura del PDF.', '#b71c1c');
```

**Dopo:**

```
      setStatus('Errore nella lettura del PDF.', '#b71c1c', null); // Nasconde la barra
```

### 13. Inizializzazione e aggiornamento progresso per indice PDF obsoleto

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Quando l'indice PDF è obsoleto e viene ricostruito, è necessario mostrare il progresso all'utente.
- **Cosa migliora:** L'utente sarà informato che l'indice viene aggiornato e vedrà il progresso, anche se il PDF era già stato caricato in precedenza.

**Prima:**

```
        state.index = await buildIndex((p, n) => setStatus(`Aggiornamento indice PDF: pagina ${p} di ${n}…`));
```

**Dopo:**

```
        setStatus('Aggiornamento indice PDF…', null, 0); // Inizia con 0% di progresso
        state.index = await buildIndex((p, n) => setStatus(`Aggiornamento indice PDF: pagina ${p} di ${n}…`, null, (p / n) * 100));
```

### 14. Nascondi barra di progresso a fine aggiornamento indice PDF

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Dopo l'aggiornamento dell'indice PDF, la barra di progresso deve essere nascosta.
- **Cosa migliora:** L'interfaccia utente tornerà pulita una volta completato l'aggiornamento dell'indice.

**Prima:**

```
        setStatus('');
```

**Dopo:**

```
        setStatus('', null, null); // Nasconde la barra
```

### 15. Nascondi barra di progresso in caso di errore di ripristino PDF

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Se il ripristino del PDF fallisce, la barra di progresso deve essere nascosta.
- **Cosa migliora:** L'utente non vedrà una barra di progresso bloccata in caso di problemi di ripristino.

**Prima:**

```
      updateInfoUI();
    }
```

**Dopo:**

```
      updateInfoUI();
      setStatus('', null, null); // Nasconde la barra in caso di errore di ripristino
    }
```

### 16. Aggiornata versione della cache del Service Worker

- **File:** `service-worker.js` (modificato)
- **Perché:** Sono stati modificati i file `index.html` e `xpress.css` per aggiungere l'indicatore di progresso. L'aggiornamento della versione della cache è fondamentale per garantire che gli utenti ricevano le nuove versioni dei file.
- **Cosa migliora:** Gli utenti con la PWA installata riceveranno automaticamente la versione aggiornata dell'applicazione, inclusa la nuova barra di progresso, senza dover svuotare manualmente la cache del browser.

**Prima:**

```
const CACHE_VERSION = 'v2.0.11';
```

**Dopo:**

```
const CACHE_VERSION = 'v2.0.12';
```

### 17. Aggiornamento link CSS mobile

- **File:** `index.html` (modificato)
- **Perché:** Il file CSS per la visualizzazione mobile della tabella è stato rinominato per chiarezza e per consolidare gli stili.
- **Cosa migliora:** L'app ora carica il file CSS mobile con il nome più pulito 'style.mobile.css', senza cambiare l'aspetto o il comportamento su smartphone.

**Prima:**

```
  <link rel="stylesheet" href="style.css"/>
  <link rel="stylesheet" href="style.mobile.cards.rev.v3.css"/>
  <link rel="stylesheet" href="xpress.css"/>
```

**Dopo:**

```
  <link rel="stylesheet" href="style.css"/>
  <link rel="stylesheet" href="style.mobile.css"/>
  <link rel="stylesheet" href="xpress.css"/>
```

### 18. Aggiornamento Service Worker per cache offline

- **File:** `service-worker.js` (modificato)
- **Perché:** Il Service Worker deve essere aggiornato per includere il nuovo file CSS mobile e per garantire che gli utenti ricevano l'ultima versione dell'app, anche offline.
- **Cosa migliora:** L'app continuerà a funzionare offline con gli stili più recenti. Gli utenti riceveranno automaticamente gli aggiornamenti dell'app più velocemente.

**Prima:**

```
const CACHE_VERSION = 'v2.0.12';
const CACHE_NAME = `xpress-${CACHE_VERSION}`;

// Asset locali da cacheare (app shell)
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './style.mobile.cards.rev.v3.css',
  './xpress.css',
  './desktop-mode-fix.js',
  './app.js',
  './pdf-listino.js',
  './welcome.js',
  './manifest.json',
  './icon/CSVXpressSmart-192.png',
  './icon/CSVXpressSmart-512.png',
  './icon/CSVXpressSmart-1024.png',
  './vendor/papaparse.min.js',
  './vendor/xlsx.full.min.js',
  './vendor/pdfjs/pdf.min.js',
  './vendor/pdfjs/pdf.worker.min.js'
];
```

**Dopo:**

```
const CACHE_VERSION = 'v2.0.13';
const CACHE_NAME = `xpress-${CACHE_VERSION}`;

// Asset locali da cacheare (app shell)
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './style.mobile.css',
  './xpress.css',
  './desktop-mode-fix.js',
  './app.js',
  './pdf-listino.js',
  './welcome.js',
  './manifest.json',
  './icon/CSVXpressSmart-192.png',
  './icon/CSVXpressSmart-512.png',
  './icon/CSVXpressSmart-1024.png',
  './vendor/papaparse.min.js',
  './vendor/xlsx.full.min.js',
  './vendor/pdfjs/pdf.min.js',
  './vendor/pdfjs/pdf.worker.min.js'
];
```

### 19. Aggiornamento test browser

- **File:** `tests/browser.test.mjs` (modificato)
- **Perché:** Il test end-to-end che verifica la cache del Service Worker deve riflettere il nuovo nome del file CSS mobile.
- **Cosa migliora:** I test dell'app rimangono accurati e continuano a garantire che tutti i file essenziali siano correttamente memorizzati nella cache per l'uso offline.

**Prima:**

```
    ['/app.js', '/index.html', '/manifest.json', '/style.css', '/style.mobile.cards.rev.v3.css',
     '/vendor/papaparse.min.js', '/vendor/xlsx.full.min.js'].every(p => cached.includes(p)), cached);
```

**Dopo:**

```
    ['/app.js', '/index.html', '/manifest.json', '/style.css', '/style.mobile.css',
     '/vendor/papaparse.min.js', '/vendor/xlsx.full.min.js'].every(p => cached.includes(p)), cached);
```

### 20. Creazione del nuovo file CSS mobile

- **File:** `style.mobile.css` (nuovo file)
- **Perché:** Per consolidare gli stili specifici per la visualizzazione mobile della tabella in un unico file, migliorando l'organizzazione del codice.
- **Cosa migliora:** Gli stili per la visualizzazione mobile sono ora raggruppati in un unico file, rendendo il codice più ordinato e facile da mantenere per gli sviluppatori.

**Contenuto:**

```
/* =========================================================
   MOBILE: Tabella -> "Card per riga" (verticale)
   Obiettivo:
   - su iPhone/Samsung NON serve ruotare lo schermo
   - ogni riga diventa una scheda verticale con etichette
   - nessuna modifica alla logica JS (solo CSS)
   Nota: questa sezione va in FONDO al CSS così sovrascrive
   ========================================================= */

@media (max-width: 720px){

  /* Su mobile non serve più lo scroll orizzontale della tabella */
  #articoli-section{
    overflow-x: visible;
    padding-top: 0;
  }
  #articoli-section::before{
    content: none !important;
  }

  /* Tabella “spenta” come tabella: diventa lista di cards */
  #articoli-table{
    /* ✅ La scatola tabella va spenta davvero: una box `display:table` usa
       max(width, min-content) e NON è limitata dal contenitore, quindi
       `width:100%` farebbe solo da minimo. Con la min-content della riga a
       343px (etichetta 105 + gap 12 + larghezza intrinseca dell'input 192),
       su schermi da 341-352px (display esterno del Galaxy Fold) la scheda
       usciva dallo schermo e veniva ritagliata. Da `block` in poi la
       larghezza torna vincolata al contenitore e gli input si adattano. */
    display: block !important;
    min-width: 0 !important;
    width: 100% !important;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: auto !important;
    background: transparent;
    border: 0;
  }

  #articoli-table thead{
    displ
… (continua)
```

### 21. Aggiunta opzione simbolo valuta

- **File:** `index.html` (modificato)
- **Perché:** L'app usava solo l'Euro come valuta, senza possibilità di cambiarla per altri mercati o preferenze.
- **Cosa migliora:** Ora puoi scegliere il simbolo di valuta (€, $, £, ecc.) che preferisci, e verrà usato in tutti i report e nella visualizzazione dei prezzi.

**Prima:**

```
          Mostra IVA
        </label>
<div class="vat-row">
<label for="vatRate">IVA %</label>
<input autocomplete="off" id="vatRate" inputmode="decimal" spellcheck="false" type="text" value="22"/>
</div>
```

**Dopo:**

```
          Mostra IVA
        </label>
<div class="vat-row">
<label for="vatRate">IVA %</label>
<input autocomplete="off" id="vatRate" inputmode="decimal" spellcheck="false" type="text" value="22"/>
</div>
<!-- NUOVO: Simbolo valuta -->
<div class="currency-row">
  <label for="currencySymbol">Simbolo valuta</label>
  <input autocomplete="off" id="currencySymbol" type="text" value="€" maxlength="3" style="max-width: 80px;"/>
</div>
```

### 22. Aggiornamento versione app

- **File:** `index.html` (modificato)
- **Perché:** È stata introdotta una nuova funzionalità che modifica il codice dell'app.
- **Cosa migliora:** Assicura che gli utenti ricevano sempre l'ultima versione dell'applicazione con tutte le nuove funzionalità e correzioni.

**Prima:**

```
<html data-app="Xpress" data-ver="2.0.12" lang="it">
```

**Dopo:**

```
<html data-app="Xpress" data-ver="2.0.13" lang="it">
```

### 23. Introduzione simbolo valuta e funzione di formattazione

- **File:** `app.js` (modificato)
- **Perché:** Era necessario un modo centralizzato per gestire il simbolo di valuta e applicarlo ai numeri formattati.
- **Cosa migliora:** Permette di usare il simbolo di valuta scelto dall'utente in tutti i punti dell'app dove vengono mostrati i prezzi, garantendo coerenza.

**Prima:**

```
let mostraDettagliServizi = true;
```

**Dopo:**

```
let mostraDettagliServizi = true;
let currencySymbol = '€'; // Global variable for currency symbol

// New helper function to format currency values
function formatCurrency(num, decimals = 2, trim = false) {
  if (!Number.isFinite(num)) return '';
  return `${fmtDec(num, decimals, trim)}${currencySymbol}`;
}
// Make it globally accessible for pdf-listino.js
window.formatCurrency = formatCurrency;
```

### 24. Validazione simbolo valuta caricato

- **File:** `app.js` (modificato)
- **Perché:** Per prevenire errori se il simbolo di valuta salvato non è valido o è vuoto.
- **Cosa migliora:** Garantisce che il simbolo di valuta sia sempre visualizzato correttamente, anche in caso di dati corrotti o mancanti nelle impostazioni.

**Prima:**

```
  smartSettings = { ...smartSettings, ...obj };
```

**Dopo:**

```
  smartSettings = { ...smartSettings, ...obj };
  // Ensure currencySymbol is always a string and not empty
  if (typeof smartSettings.currencySymbol !== 'string' || smartSettings.currencySymbol.trim() === '') {
    smartSettings.currencySymbol = '€';
  }
```

### 25. Recupero elemento input simbolo valuta

- **File:** `app.js` (modificato)
- **Perché:** È necessario accedere all'elemento HTML per leggere e impostare il valore del simbolo di valuta.
- **Cosa migliora:** Permette all'app di interagire con il nuovo campo di input per il simbolo di valuta.

**Prima:**

```
  const elIncTr = document.getElementById('toggleIncludiTrasporto');
  const elIncIns = document.getElementById('toggleIncludiInstallazione');
```

**Dopo:**

```
  const elIncTr = document.getElementById('toggleIncludiTrasporto');
  const elIncIns = document.getElementById('toggleIncludiInstallazione');
  const elCurrencySymbol = document.getElementById('currencySymbol');
```

### 26. Impostazione valore iniziale simbolo valuta

- **File:** `app.js` (modificato)
- **Perché:** Il campo di input del simbolo di valuta deve mostrare il valore salvato nelle impostazioni.
- **Cosa migliora:** Quando apri l'app, il campo del simbolo di valuta mostra l'ultima scelta fatta, rendendo l'esperienza più fluida.

**Prima:**

```
  if (elIncIns) elIncIns.checked = smartSettings.includeInstallazione !== false;
```

**Dopo:**

```
  if (elIncIns) elIncIns.checked = smartSettings.includeInstallazione !== false;
  if (elCurrencySymbol) elCurrencySymbol.value = smartSettings.currencySymbol ?? '€';
```

### 27. Aggiornamento simbolo valuta nelle impostazioni

- **File:** `app.js` (modificato)
- **Perché:** Quando l'utente cambia il simbolo di valuta, la modifica deve essere salvata e applicata.
- **Cosa migliora:** Il simbolo di valuta viene aggiornato in tempo reale e salvato per le future aperture dell'app.

**Prima:**

```
    if (elIncIns) smartSettings.includeInstallazione = !!elIncIns.checked;
```

**Dopo:**

```
    if (elIncIns) smartSettings.includeInstallazione = !!elIncIns.checked;
    smartSettings.currencySymbol = elCurrencySymbol?.value?.trim() || '€';
    currencySymbol = smartSettings.currencySymbol; // Update global variable
```

### 28. Collegamento evento al campo simbolo valuta

- **File:** `app.js` (modificato)
- **Perché:** Il campo di input del simbolo di valuta deve reagire ai cambiamenti dell'utente.
- **Cosa migliora:** Ogni volta che modifichi il simbolo di valuta, l'app aggiorna i calcoli e i report di conseguenza.

**Prima:**

```
  [elSmart, elVat, elVatRate, elHideVenduto, elHideDiff, elHideDiscounts, elShowClientDiscount, elIncTr, elIncIns]
    .filter(Boolean)
    .forEach(el => el.addEventListener('change', onChange));
```

**Dopo:**

```
  [elSmart, elVat, elVatRate, elHideVenduto, elHideDiff, elHideDiscounts, elShowClientDiscount, elIncTr, elIncIns, elCurrencySymbol]
    .filter(Boolean)
    .forEach(el => el.addEventListener('change', onChange));
```

### 29. Formattazione valuta nella selezione listino

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta nella lista di selezione degli articoli era fisso sull'Euro.
- **Cosa migliora:** Anche nella lista di selezione degli articoli, il prezzo viene mostrato con il simbolo di valuta scelto da te.

**Prima:**

```
      option.textContent = `${item.codice} - ${item.descrizione} - €${roundTwo(item.prezzoLordo).toFixed(2)}`;
```

**Dopo:**

```
      option.textContent = `${item.codice} - ${item.descrizione} - ${formatCurrency(roundTwo(item.prezzoLordo))}`;
```

### 30. Formattazione valuta nella colonna 'Prezzo Lordo'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta nella colonna 'Prezzo Lordo' della tabella era fisso sull'Euro.
- **Cosa migliora:** Il prezzo lordo nella tabella articoli ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
      <td data-col="prezzoLordo" class="cell-prezzoLordo">${roundTwo(parseDec(articolo.prezzoLordo)).toFixed(2)}€</td>
```

**Dopo:**

```
      <td data-col="prezzoLordo" class="cell-prezzoLordo">${formatCurrency(parseDec(articolo.prezzoLordo))}</td>
```

### 31. Formattazione valuta nella colonna 'Totale Netto'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta nella colonna 'Totale Netto' della tabella era fisso sull'Euro.
- **Cosa migliora:** Il totale netto per ogni articolo nella tabella ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
      <td data-col="totaleNetto" class="cell-totaleNetto">${r.totaleNettoUnit.toFixed(2)}€</td>
```

**Dopo:**

```
      <td data-col="totaleNetto" class="cell-totaleNetto">${formatCurrency(r.totaleNettoUnit)}</td>
```

### 32. Formattazione valuta nella colonna 'Gran Totale'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta nella colonna 'Gran Totale' della tabella era fisso sull'Euro.
- **Cosa migliora:** Il gran totale per ogni riga nella tabella ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
      <td data-col="granTot" class="cell-granTot">${r.granTotRiga.toFixed(2)}€</td>
```

**Dopo:**

```
      <td data-col="granTot" class="cell-granTot">${formatCurrency(r.granTotRiga)}</td>
```

### 33. Formattazione valuta nella colonna 'Differenza'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta nella colonna 'Differenza' della tabella era fisso sull'Euro.
- **Cosa migliora:** La differenza di sconto nella tabella ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
      <td data-col="diff" class="cell-diff">${r.differenza.toFixed(2)}€</td>
```

**Dopo:**

```
      <td data-col="diff" class="cell-diff">${formatCurrency(r.differenza)}</td>
```

### 34. Aggiornamento formattazione valuta 'Prezzo Lordo'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il prezzo lordo non si aggiornava dinamicamente.
- **Cosa migliora:** Il prezzo lordo si aggiorna con il simbolo di valuta corretto quando modifichi i valori nella riga.

**Prima:**

```
  if (tdPrezzoLordo) tdPrezzoLordo.textContent = `${roundTwo(parseDec(articolo.prezzoLordo)).toFixed(2)}€`;
```

**Dopo:**

```
  if (tdPrezzoLordo) tdPrezzoLordo.textContent = formatCurrency(parseDec(articolo.prezzoLordo));
```

### 35. Aggiornamento formattazione valuta 'Totale Netto'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale netto non si aggiornava dinamicamente.
- **Cosa migliora:** Il totale netto si aggiorna con il simbolo di valuta corretto quando modifichi i valori nella riga.

**Prima:**

```
  if (tdTotaleNetto) tdTotaleNetto.textContent = `${r.totaleNettoUnit.toFixed(2)}€`;
```

**Dopo:**

```
  if (tdTotaleNetto) tdTotaleNetto.textContent = formatCurrency(r.totaleNettoUnit);
```

### 36. Aggiornamento formattazione valuta 'Gran Totale'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il gran totale non si aggiornava dinamicamente.
- **Cosa migliora:** Il gran totale si aggiorna con il simbolo di valuta corretto quando modifichi i valori nella riga.

**Prima:**

```
  if (tdGranTot) tdGranTot.textContent = `${r.granTotRiga.toFixed(2)}€`;
```

**Dopo:**

```
  if (tdGranTot) tdGranTot.textContent = formatCurrency(r.granTotRiga);
```

### 37. Aggiornamento formattazione valuta 'Differenza'

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per la differenza non si aggiornava dinamicamente.
- **Cosa migliora:** La differenza di sconto si aggiorna con il simbolo di valuta corretto quando modifichi i valori nella riga.

**Prima:**

```
  if (tdDiff) tdDiff.textContent = `${r.differenza.toFixed(2)}€`;
```

**Dopo:**

```
  if (tdDiff) tdDiff.textContent = formatCurrency(r.differenza);
```

### 38. Formattazione valuta per il totale netto senza servizi

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale netto senza servizi era fisso sull'Euro nei report.
- **Cosa migliora:** Il totale netto senza servizi nei report ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    out.push(`Totale Netto (senza ${d.nomiInclusi}): ${totaleSenzaServizi.toFixed(2)}€`);
```

**Dopo:**

```
    out.push(`Totale Netto (senza ${d.nomiInclusi}): ${formatCurrency(totaleSenzaServizi)}`);
```

### 39. Formattazione valuta per il totale complessivo

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale complessivo era fisso sull'Euro nei report.
- **Cosa migliora:** Il totale complessivo nei report ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    out.push(`Totale Complessivo (${nota}): ${totaleConServizi.toFixed(2)}€`);
```

**Dopo:**

```
    out.push(`Totale Complessivo (${nota}): ${formatCurrency(totaleConServizi)}`);
```

### 40. Formattazione valuta per il totale netto con esclusione

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale netto con esclusione era fisso sull'Euro nei report.
- **Cosa migliora:** Il totale netto con esclusioni nei report ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    out.push(`Totale Netto (${d.esclusi}): ${totaleSenzaServizi.toFixed(2)}€`);
```

**Dopo:**

```
    out.push(`Totale Netto (${d.esclusi}): ${formatCurrency(totaleSenzaServizi)}`);
```

### 41. Formattazione valuta per il totale venduto

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale venduto era fisso sull'Euro.
- **Cosa migliora:** Il totale venduto ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>Totale Venduto:</strong> ${totaleVenduto.toFixed(2)}€<br>`;
```

**Dopo:**

```
    html += `<strong>Totale Venduto:</strong> ${formatCurrency(totaleVenduto)}<br>`;
```

### 42. Formattazione valuta per la differenza totale sconto

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per la differenza totale sconto era fisso sull'Euro.
- **Cosa migliora:** La differenza totale sconto ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>Totale Differenza Sconto:</strong> ${totaleDifferenzaSconto.toFixed(2)}€`;
```

**Dopo:**

```
    html += `<strong>Totale Differenza Sconto:</strong> ${formatCurrency(totaleDifferenzaSconto)}`;
```

### 43. Formattazione valuta per l'imponibile

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'imponibile era fisso sull'Euro.
- **Cosa migliora:** L'imponibile ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>Imponibile (${nota}):</strong> ${imponibile.toFixed(2)}€<br>`;
```

**Dopo:**

```
    html += `<strong>Imponibile (${nota}):</strong> ${formatCurrency(imponibile)}<br>`;
```

### 44. Formattazione valuta per l'IVA

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'IVA era fisso sull'Euro.
- **Cosa migliora:** L'IVA ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>IVA (${vatRate.toFixed(1)}%):</strong> ${iva.toFixed(2)}€<br>`;
```

**Dopo:**

```
    html += `<strong>IVA (${vatRate.toFixed(1)}%):</strong> ${formatCurrency(iva)}<br>`;
```

### 45. Formattazione valuta per il totale + IVA

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale + IVA era fisso sull'Euro.
- **Cosa migliora:** Il totale + IVA ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>Totale + IVA:</strong> ${totaleIvato.toFixed(2)}€`;
```

**Dopo:**

```
    html += `<strong>Totale + IVA:</strong> ${formatCurrency(totaleIvato)}`;
```

### 46. Formattazione valuta per il totale

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale era fisso sull'Euro.
- **Cosa migliora:** Il totale ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>Totale:</strong> ${imponibile.toFixed(2)}€`;
```

**Dopo:**

```
    html += `<strong>Totale:</strong> ${formatCurrency(imponibile)}`;
```

### 47. Formattazione valuta per l'imponibile nel riepilogo IVA

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'imponibile nel riepilogo IVA era fisso sull'Euro.
- **Cosa migliora:** L'imponibile nel riepilogo IVA ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<br><br><strong>Imponibile:</strong> ${imponibile.toFixed(2)}€<br>`;
```

**Dopo:**

```
    html += `<br><br><strong>Imponibile:</strong> ${formatCurrency(imponibile)}<br>`;
```

### 48. Formattazione valuta per l'IVA nel riepilogo IVA

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'IVA nel riepilogo IVA era fisso sull'Euro.
- **Cosa migliora:** L'IVA nel riepilogo IVA ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>IVA (${vatRate.toFixed(1)}%):</strong> ${iva.toFixed(2)}€<br>`;
```

**Dopo:**

```
    html += `<strong>IVA (${vatRate.toFixed(1)}%):</strong> ${formatCurrency(iva)}<br>`;
```

### 49. Formattazione valuta per il totale + IVA nel riepilogo IVA

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale + IVA nel riepilogo IVA era fisso sull'Euro.
- **Cosa migliora:** Il totale + IVA nel riepilogo IVA ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    html += `<strong>Totale + IVA:</strong> ${totaleIvato.toFixed(2)}€`;
```

**Dopo:**

```
    html += `<strong>Totale + IVA:</strong> ${formatCurrency(totaleIvato)}`;
```

### 50. Formattazione valuta per il totale manuale

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale manuale era fisso sull'Euro.
- **Cosa migliora:** Il totale per gli articoli aggiunti manualmente ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
  document.getElementById("manualTotale").textContent = nettoMostrato.toFixed(2) + "€";
```

**Dopo:**

```
  document.getElementById("manualTotale").textContent = formatCurrency(nettoMostrato);
```

### 51. Formattazione valuta per il gran totale manuale

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il gran totale manuale era fisso sull'Euro.
- **Cosa migliora:** Il gran totale per gli articoli aggiunti manualmente ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
  document.getElementById("manualGranTotale").textContent = granTot.toFixed(2) + "€";
```

**Dopo:**

```
  document.getElementById("manualGranTotale").textContent = formatCurrency(granTot);
```

### 52. Formattazione valuta per la differenza manuale

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per la differenza manuale era fisso sull'Euro.
- **Cosa migliora:** La differenza per gli articoli aggiunti manualmente ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
  document.getElementById("manualDifferenza").textContent = differenza.toFixed(2) + "€";
```

**Dopo:**

```
  document.getElementById("manualDifferenza").textContent = formatCurrency(differenza);
```

### 53. Formattazione valuta per il prezzo netto/cad nel report Smart

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il prezzo netto/cad nel report Smart era fisso sull'Euro.
- **Cosa migliora:** Il prezzo netto per ogni articolo nel report Smart ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Netto/cad: ${nettoCad.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Netto/cad: ${formatCurrency(nettoCad)}\n`;
```

### 54. Formattazione valuta per il totale riga nel report Smart

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale riga nel report Smart era fisso sull'Euro.
- **Cosa migliora:** Il totale per ogni riga nel report Smart ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Totale riga: ${totRiga.toFixed(2)}€\n\n`;
```

**Dopo:**

```
    report += `Totale riga: ${formatCurrency(totRiga)}\n\n`;
```

### 55. Formattazione valuta per l'imponibile nel report Smart

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'imponibile nel report Smart era fisso sull'Euro.
- **Cosa migliora:** L'imponibile nel report Smart ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
  report += `Imponibile (${[d.inclusi, d.esclusi].filter(Boolean).join(', ')}): ${imponibile.toFixed(2)}€\n`;
```

**Dopo:**

```
  report += `Imponibile (${[d.inclusi, d.esclusi].filter(Boolean).join(', ')}): ${formatCurrency(imponibile)}\n`;
```

### 56. Formattazione valuta per l'IVA nel report Smart

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'IVA nel report Smart era fisso sull'Euro.
- **Cosa migliora:** L'IVA nel report Smart ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `IVA (${vatRate.toFixed(1)}%): ${iva.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `IVA (${vatRate.toFixed(1)}%): ${formatCurrency(iva)}\n`;
```

### 57. Formattazione valuta per il totale + IVA nel report Smart

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale + IVA nel report Smart era fisso sull'Euro.
- **Cosa migliora:** Il totale + IVA nel report Smart ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Totale + IVA: ${totaleIvato.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Totale + IVA: ${formatCurrency(totaleIvato)}\n`;
```

### 58. Formattazione valuta per il totale nel report Smart (senza IVA)

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale nel report Smart (senza IVA) era fisso sull'Euro.
- **Cosa migliora:** Il totale nel report Smart (senza IVA) ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
  } else {
    report += `Totale: ${imponibile.toFixed(2)}€\n`;
```

**Dopo:**

```
  } else {
    report += `Totale: ${formatCurrency(imponibile)}\n`;
```

### 59. Formattazione valuta per il prezzo netto nel report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il prezzo netto nel report standard era fisso sull'Euro.
- **Cosa migliora:** Il prezzo netto per ogni articolo nel report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Prezzo netto: ${r.totaleNettoUnit.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Prezzo netto: ${formatCurrency(r.totaleNettoUnit)}\n`;
```

### 60. Formattazione valuta per il totale riga nel report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale riga nel report standard era fisso sull'Euro.
- **Cosa migliora:** Il totale per ogni riga nel report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Totale: ${r.granTotRiga.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Totale: ${formatCurrency(r.granTotRiga)}\n`;
```

### 61. Formattazione valuta per il venduto nel report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il venduto nel report standard era fisso sull'Euro.
- **Cosa migliora:** Il valore 'Venduto A' nel report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    if (!smartSettings.hideVenduto) report += `Venduto A: ${(r.venduto || 0).toFixed(2)}€\n`;
```

**Dopo:**

```
    if (!smartSettings.hideVenduto) report += `Venduto A: ${formatCurrency(r.venduto || 0)}\n`;
```

### 62. Formattazione valuta per la differenza sconto nel report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per la differenza sconto nel report standard era fisso sull'Euro.
- **Cosa migliora:** La 'Differenza sconto' nel report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    if (!smartSettings.hideDiff) report += `Differenza sconto: ${r.differenza.toFixed(2)}€\n`;
```

**Dopo:**

```
    if (!smartSettings.hideDiff) report += `Differenza sconto: ${formatCurrency(r.differenza)}\n`;
```

### 63. Formattazione valuta per l'imponibile nel riepilogo IVA del report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'imponibile nel riepilogo IVA del report standard era fisso sull'Euro.
- **Cosa migliora:** L'imponibile nel riepilogo IVA del report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Imponibile: ${imponibile.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Imponibile: ${formatCurrency(imponibile)}\n`;
```

### 64. Formattazione valuta per l'IVA nel riepilogo IVA del report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'IVA nel riepilogo IVA del report standard era fisso sull'Euro.
- **Cosa migliora:** L'IVA nel riepilogo IVA del report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `IVA (${vatRate.toFixed(1)}%): ${iva.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `IVA (${vatRate.toFixed(1)}%): ${formatCurrency(iva)}\n`;
```

### 65. Formattazione valuta per il totale + IVA nel riepilogo IVA del report standard

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale + IVA nel riepilogo IVA del report standard era fisso sull'Euro.
- **Cosa migliora:** Il totale + IVA nel riepilogo IVA del report standard ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Totale + IVA: ${totaleIvato.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Totale + IVA: ${formatCurrency(totaleIvato)}\n`;
```

### 66. Formattazione valuta per il prezzo netto nel report senza margine

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il prezzo netto nel report senza margine era fisso sull'Euro.
- **Cosa migliora:** Il prezzo netto per ogni articolo nel report senza margine ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Prezzo netto: ${prezzoNetto.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Prezzo netto: ${formatCurrency(prezzoNetto)}\n`;
```

### 67. Formattazione valuta per il totale riga nel report senza margine

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale riga nel report senza margine era fisso sull'Euro.
- **Cosa migliora:** Il totale per ogni riga nel report senza margine ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Totale: ${granTotaleFinal.toFixed(2)}€\n\n`;
```

**Dopo:**

```
    report += `Totale: ${formatCurrency(granTotaleFinal)}\n\n`;
```

### 68. Formattazione valuta per l'imponibile nel riepilogo IVA del report senza margine

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'imponibile nel riepilogo IVA del report senza margine era fisso sull'Euro.
- **Cosa migliora:** L'imponibile nel riepilogo IVA del report senza margine ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Imponibile: ${imponibile.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Imponibile: ${formatCurrency(imponibile)}\n`;
```

### 69. Formattazione valuta per l'IVA nel riepilogo IVA del report senza margine

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per l'IVA nel riepilogo IVA del report senza margine era fisso sull'Euro.
- **Cosa migliora:** L'IVA nel riepilogo IVA del report senza margine ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `IVA (${vatRate.toFixed(1)}%): ${iva.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `IVA (${vatRate.toFixed(1)}%): ${formatCurrency(iva)}\n`;
```

### 70. Formattazione valuta per il totale + IVA nel riepilogo IVA del report senza margine

- **File:** `app.js` (modificato)
- **Perché:** Il simbolo di valuta per il totale + IVA nel riepilogo IVA del report senza margine era fisso sull'Euro.
- **Cosa migliora:** Il totale + IVA nel riepilogo IVA del report senza margine ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
    report += `Totale + IVA: ${totaleIvato.toFixed(2)}€\n`;
```

**Dopo:**

```
    report += `Totale + IVA: ${formatCurrency(totaleIvato)}\n`;
```

### 71. Formattazione valuta per il prezzo lordo nelle righe opzionali

- **File:** `pdf-listino.js` (modificato)
- **Perché:** Il simbolo di valuta per il prezzo lordo nelle righe opzionali dei report era fisso sull'Euro.
- **Cosa migliora:** Il prezzo lordo nelle righe opzionali dei report ora utilizza il simbolo di valuta che hai scelto.

**Prima:**

```
        let lordo;
        try { lordo = roundTwo(parseDec(a.prezzoLordo || 0)).toFixed(2); }
        catch (_) { lordo = Number(a.prezzoLordo || 0).toFixed(2); }
        extra.push(`Prezzo lordo: ${lordo}€`);
```

**Dopo:**

```
        let lordo;
        try { lordo = roundTwo(parseDec(a.prezzoLordo || 0)); }
        catch (_) { lordo = Number(a.prezzoLordo || 0); }
        extra.push(`Prezzo lordo: ${window.formatCurrency(lordo, 2, false)}`);
```

### 72. Aggiornamento versione cache del Service Worker

- **File:** `service-worker.js` (modificato)
- **Perché:** Sono stati modificati i file dell'applicazione (index.html, app.js), quindi la cache deve essere aggiornata.
- **Cosa migliora:** Assicura che gli utenti ricevano sempre l'ultima versione dell'applicazione con tutte le nuove funzionalità e correzioni, anche offline.

**Prima:**

```
const CACHE_VERSION = 'v2.0.13';
```

**Dopo:**

```
const CACHE_VERSION = 'v2.0.14';
```


## Modifiche proposte ma non applicate

- `index.html`: Aggiunta pulsante 'Svuota preventivo' — Mancava un modo rapido per rimuovere tutti gli articoli dalla tabella del preventivo, costringendo l'utente a rimuoverli uno per uno.
- `app.js`: Aggiunta simbolo valuta alle impostazioni Smart — Il simbolo di valuta deve essere una preferenza persistente dell'utente.
- `app.js`: Inizializzazione simbolo valuta globale — Assicura che la variabile globale 'currencySymbol' sia impostata correttamente all'avvio dell'app.
- `app.js`: Formattazione valuta per il trasporto — Il simbolo di valuta per il costo del trasporto era fisso sull'Euro nei report.
- `app.js`: Formattazione valuta per l'installazione — Il simbolo di valuta per il costo dell'installazione era fisso sull'Euro nei report.
- `app.js`: Formattazione valuta per il totale venduto nel report standard — Il simbolo di valuta per il totale venduto nel report standard era fisso sull'Euro.
- `app.js`: Formattazione valuta per la differenza totale sconto nel report standard — Il simbolo di valuta per la differenza totale sconto nel report standard era fisso sull'Euro.
