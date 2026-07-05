# 🧪 Ambiente di Collaudo (Staging)

Questo documento spiega come funziona la **copia di lavoro** del gestionale: sviluppi e test avvengono sulla copia, con un **database separato**, senza mai interrompere o rischiare il gestionale ufficiale. Quando una modifica è collaudata, viene promossa a ufficiale con un merge.

## Come funziona

```
branch "staging"          branch "main"
      │                        │
      ▼                        ▼
URL di anteprima Vercel   Sito ufficiale
(banner arancione 🧪)     (nessun banner)
      │                        │
      ▼                        ▼
Firebase DI PROVA         Firebase UFFICIALE
(gestionale-effetre-      (gestionale-effetre)
 staging)
```

- Il file `public/env-config.js` riconosce **dal dominio** se la pagina gira in collaudo o in produzione e collega il database giusto.
- Sono considerati COLLAUDO: `localhost`, gli URL di anteprima Vercel dei branch (contengono `-git-`) e qualsiasi dominio contenente `staging`. Tutto il resto è PRODUZIONE.
- In collaudo compare sempre un **banner arancione** in alto: *"🧪 AMBIENTE DI COLLAUDO"*. **Se non vedi il banner, sei sul database ufficiale: non fare test.**
- Sicurezza *fail-closed*: se il progetto Firebase di prova non è ancora configurato, l'ambiente di collaudo **non collega nessun database** (banner rosso, modalità locale) — mai quello ufficiale.
- Override manuale (per casi particolari): aggiungi `?env=staging` o `?env=production` all'URL; la scelta vale per la sessione del browser.

## Configurazione iniziale (da fare una sola volta)

### 1. Crea il progetto Firebase di prova
1. Vai su [console.firebase.google.com](https://console.firebase.google.com) → **Aggiungi progetto** → nome: `gestionale-effetre-staging` (Analytics non necessario).
2. Nel progetto: **Firestore Database → Crea database** → stessa regione del progetto ufficiale (es. `europe-west`) → per il collaudo va bene la modalità test.
3. **Impostazioni progetto → Le tue app → Aggiungi app → Web** (icona `</>`), nome libero (es. "Gestionale Staging") → copia il blocco `firebaseConfig`.

### 2. Incolla la configurazione nella copia
Apri `public/env-config.js` e sostituisci i valori `REPLACE_ME` nel blocco `STAGING_FIREBASE_CONFIG` con quelli copiati (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).

### 3. Vercel
- Il repository è già collegato a Vercel: ogni push sul branch `staging` genera automaticamente un URL di anteprima del tipo `effetre-working-platform-git-staging-<account>.vercel.app`. Lo trovi in **Vercel → Deployments** (etichetta *Preview*).
- Per l'analisi documentale AI in collaudo: **Settings → Environment Variables** → aggiungi `GEMINI_API_KEY` anche per l'ambiente **Preview** (puoi usare la stessa chiave o una dedicata).

### 4. Primo accesso
All'apertura dell'URL di anteprima l'app inizializza automaticamente gli utenti sul database di prova (stesse utenze iniziali). I dati di prova partono vuoti: crea qualche pratica finta per i test.

## Flusso di lavoro quotidiano

1. **Sviluppo**: le modifiche si fanno sul branch `staging` (mai direttamente su `main`).
2. **Push** → Vercel pubblica l'anteprima aggiornata in ~1 minuto.
3. **Test** sull'URL di anteprima (banner arancione visibile): creare/modificare/cancellare pratiche è sicuro, il database ufficiale non viene toccato.
4. **Promozione a ufficiale**: quando tutto funziona, si apre una Pull Request `staging → main` e si fa il merge. Vercel aggiorna il sito ufficiale automaticamente, senza interruzione del servizio (deploy atomico).
5. Il branch `staging` resta vivo per il ciclo successivo.

### Rollback
Se dopo un merge qualcosa non va: **Vercel → Deployments → deployment precedente → "Promote to Production"** (istantaneo), poi si corregge con calma su `staging`.

## Note

- **EmailJS** (recupero password) usa le stesse credenziali in entrambi gli ambienti: in collaudo le email partono solo per gli utenti di prova. Se vuoi isolarlo del tutto, crea un template/servizio EmailJS separato.
- **Regole Firestore**: il progetto di prova in modalità test è aperto; per il progetto ufficiale valuta regole più restrittive (oggi sono `allow read, write: if true`).
- **`api/gemini.js`** è identico nei due ambienti; cambia solo l'eventuale chiave nelle env var Vercel (Production vs Preview).

## Import automatico da OptiRoute

Il gestionale importa ogni ora (e all'avvio, badge in basso a destra) i sopralluoghi CONFERMATI che OptiRoute scrive nella collection Firestore `optiroute_sync`: le pratiche nuove vengono create in `pratiche_items` nel formato standard (numero "826.361", codice ISP, stato disponibile), quelle esistenti vengono aggiornate (giorno, ordine, telefono, referente, note) con voce nello storico. I documenti importati vengono marcati `importato: true` (mai duplicati). Import manuale: click sul badge o `window.importaDaOptiRoute()` in console.
