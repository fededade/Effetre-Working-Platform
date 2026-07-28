# Effetre Work Platform — note per Claude

Gestionale pratiche immobiliari di Effetre Properties SRLS. Interfaccia e
contenuti sono in **italiano**: label, messaggi d'errore, commenti e messaggi
di commit vanno scritti in italiano.

## Flusso di lavoro Git

- Sviluppa sempre su un branch di feature, mai direttamente su `main`.
- **Apri una pull request** e lascia che sia il merge della PR a portare il
  lavoro su `main`. Non fare push diretti su `main` se non richiesto
  esplicitamente.
- `main` è collegato a Vercel con **deploy automatico in produzione**: ogni
  commit su `main` va online.
- I merge sono squash: il titolo del commit su `main` finisce con `(#N)`.

## Struttura

```
public/                       servito staticamente da Vercel (outputDirectory)
  index.html                  Gestione Pratiche - React + JSX in-browser
  analisi.html                Analisi Documentale AI - React + JSX in-browser
  planimetry_tool_v2.html     Tool Planimetria - JS vanilla, no framework
api/gemini.js                 funzione serverless: proxy per Google Gemini
vercel.json                   nessuna build, nessun framework
```

Non c'è build step, né `package.json`, né test automatici: ogni pagina è un
singolo file HTML autosufficiente con CSS e JS inline. Le dipendenze arrivano
da CDN (pdf.js 3.11.174, jsPDF 2.5.1, React 18 + Babel standalone, Firebase
10.7.1 compat, Tailwind, Chart.js, JSZip, EmailJS).

Per modificare una pagina si edita direttamente il suo HTML. Sono file grossi
(`index.html` ~6.6k righe, `planimetry_tool_v2.html` ~5.5k): cerca il punto
giusto con grep invece di leggerli per intero.

### Attenzione

- `@babel/standalone` è **pinnato a 7.26.4** in `index.html` e `analisi.html`:
  le versioni successive causavano schermata bianca (commit c7703c8). Non
  sbloccare la versione.
- La `GEMINI_API_KEY` sta solo nelle Environment Variables di Vercel e non deve
  mai finire nel codice client: le chiamate passano da `/api/gemini`.
- Le chiavi Firebase ed EmailJS sono client-side per progetto (la sicurezza è
  demandata alle Firestore Rules); non è un errore trovarle nell'HTML.

## planimetry_tool_v2.html

Wizard a 6 step: 1 caricamento file → 2 calibrazione e perimetrazione su canvas
→ 3 indicazione del Nord → 4 confini → 5 dettagli immobile → 6 riepilogo e
export. Su mobile gli step 3 e 4 sono saltati (`VALID_STEP_IDS`).

Concetti chiave:

- `allPageSources[]` — una entry per pagina, da PDF (multipagina) o immagine.
- `pageStates{}` — stato per pagina (`shapes`, `annotations`, `measurements`,
  `scalePPM`). Le variabili globali `shapes` / `annotations` / … contengono
  **solo la pagina corrente**: `savePageState()` / `loadPageState()` fanno il
  travaso a ogni cambio pagina. Chi legge tutte le pagine deve chiamare prima
  `savePageState()`.
- `renderPageComposite(pageIndex)` — ricompone una pagina qualsiasi (sfondo +
  annotazioni + poligoni con aree + misure) su un canvas offscreen, senza
  toccare il canvas live. È usata sia dal viewer dello step 4 sia dall'export
  PDF: se cambia il rendering, cambialo qui una volta sola.
- Lo step 4 ha un viewer con zoom/pan e selettore di pagina (funzioni `pv*`);
  lo step 3 usa ancora uno snapshot statico del canvas (`updatePreviewImages`).
- Le sessioni si salvano/ricaricano come JSON che incorpora i file sorgente in
  base64 (`buildSessionSnapshot` / `applySessionSnapshot`).

## Verificare le modifiche

Non essendoci test, verifica nel browser. Le pagine hanno bisogno delle CDN,
quindi servile via HTTP (non `file://`):

```
python3 -m http.server 8000 --directory public
```

Per un controllo di sintassi rapido sul JS inline, estrai il blocco `<script>`
e passalo a `node --check`.
