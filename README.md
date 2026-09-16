# Effetre Work Platform

Sistema di gestione pratiche per Effetre Properties SRLS.

## 📁 Struttura

```
effetre-work-platform/
├── public/
│   ├── index.html      → Gestione Pratiche (/)
│   └── analisi.html    → Analisi Documentale AI (/analisi)
├── api/
│   └── gemini.js       → Proxy sicuro per Gemini API
├── vercel.json         → Configurazione Vercel
└── README.md
```

## 🚀 Deploy su Vercel

1. Collega questo repository a Vercel
2. **Configura la variabile d'ambiente** (vedi sotto)
3. Deploy automatico

### ⚠️ IMPORTANTE: Configurare GEMINI_API_KEY

Su Vercel, vai in **Settings → Environment Variables** e aggiungi:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | La tua chiave API Google Gemini |

**Come ottenere la chiave:**
1. Vai su https://aistudio.google.com/apikey
2. Clicca "Create API Key"
3. Copia e incolla su Vercel

## 🔧 Servizi Utilizzati

### Firebase (Firestore)
- **Progetto**: gestionale-effetre
- **Uso**: Database pratiche e utenti

### EmailJS
- **Uso**: Recupero password via email + avviso "nuovi documenti caricati" al tecnico

#### ⚠️ Template "nuovi documenti" da creare (una tantum)

La segnalazione *"Nuovi documenti caricati"* invia una email al tecnico assegnato alla
pratica, usando l'indirizzo con cui è registrato nel gestionale.

Serve un **secondo template EmailJS** (il primo resta dedicato al recupero password).
EmailJS non permette di creare template via API, quindi va creato dal dashboard — ma
oggetto e contenuto HTML sono **già pronti da incollare**:

👉 **[docs/emailjs-template-nuovi-documenti.md](docs/emailjs-template-nuovi-documenti.md)**

In sintesi:

1. <https://dashboard.emailjs.com> → **Email Templates** → **Create New Template**
2. Nelle **Settings** imposta il **Template ID** esattamente a `template_nuovi_documenti`
   (è già configurato nel codice: non serve modificare `public/index.html`)
   e **To Email** a `{{to_email}}`
3. Incolla oggetto e contenuto HTML dal file sopra, poi **Save**

Il servizio email resta quello già collegato (`service_eak01rs`): non serve crearne uno nuovo.

Finché il template non esiste la segnalazione viene comunque registrata sulla pratica e
notificata dentro il gestionale, ma **l'email non parte**: l'operatore riceve a schermo un
avviso con il motivo dell'errore, l'ID del template e il servizio usati.

### Google Gemini API
- **Uso**: Analisi AI di atti e visure catastali
- **Sicurezza**: La chiave API è sul server (Environment Variable), non visibile agli utenti

## 🗂️ Funzionalità gestione pratiche

- **Ricerca**: filtra per numero, n. ordine, codice, **comune**, indirizzo, intestati,
  osservazioni, note e tecnico assegnato. Insensibile a maiuscole e accenti; digitando
  più parole vengono mostrate solo le pratiche che le contengono tutte.
- **Flag urgenza** (solo amministratori): contrassegna una pratica come urgente. Viene
  evidenziata con un pallino arancione lampeggiante, un badge `🔥 URGENTE` e una barra
  arancione sulla riga. Ogni attivazione/rimozione è tracciata nello storico.
- **Nuovi documenti caricati**: l'operatore/amministratore segnala i nuovi documenti su
  una pratica presa in carico; il tecnico assegnato riceve una email (vedi EmailJS) e una
  notifica in-app, e può confermare con *Presa visione*.
- **Note cronologiche**: ogni nota viene salvata come nuova voce con **data, ora e utente**
  che l'ha inserita. Le note precedenti non vengono mai sovrascritte. Solo gli
  amministratori possono eliminare una singola nota, e l'eliminazione resta nello storico.
- **Vista mobile**: sotto i 768px l'elenco pratiche diventa un insieme di schede, una
  per pratica, che mostrano per intero numero, codice, **comune**, indirizzo, badge di
  stato, assegnatario e ultima nota. I pulsanti azione stanno tutti nello schermo con
  area di tocco di almeno 44px. L'intestazione si compatta con un menu ☰ e i filtri sono
  a scomparsa, con il conteggio di quelli attivi. Oltre i 768px (tablet in orizzontale,
  desktop) ricompare la tabella completa.
- **Presa in carico senza sovrapposizioni**: l'assegnazione avviene tramite una transazione
  Firestore sul singolo documento. Se un'altra persona ha già preso la pratica,
  l'operazione viene rifiutata con un avviso invece di sovrascrivere l'assegnazione.

## 📝 Note sulla Sicurezza

- **Firebase**: Le API key sono client-side (sicurezza gestita dalle Firestore Rules)
- **EmailJS**: Public key progettata per l'uso frontend
- **Gemini API**: ✅ Chiave protetta sul server (Environment Variable)

## 🔒 Architettura Sicura per Gemini

```
[Browser] → /api/gemini → [Vercel Function] → Google Gemini API
                              ↑
                    GEMINI_API_KEY (segreta)
```

Gli utenti non vedono mai la chiave API. Tutte le richieste passano dal proxy server.

## 🔒 Configurazione Firebase Security Rules

Assicurati che le regole Firestore siano configurate correttamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo utenti autenticati o con dominio specifico
    match /{document=**} {
      allow read, write: if true; // Modifica secondo le tue esigenze
    }
  }
}
```

## 📧 Template EmailJS

Il template deve includere queste variabili:
- `{{to_email}}` - Email destinatario
- `{{to_name}}` - Nome utente  
- `{{password}}` - Password da recuperare

---

© 2024 Effetre Properties SRLS - Vigevano (PV)
