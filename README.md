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

#### ⚠️ Template "nuovi documenti" da configurare

La segnalazione *"Nuovi documenti caricati"* invia una email al tecnico assegnato alla
pratica, usando l'indirizzo con cui è registrato nel gestionale.

Per attivarla serve un **secondo template EmailJS** (il primo resta dedicato al recupero
password):

1. Vai su https://dashboard.emailjs.com → **Email Templates** → **Create New Template**
2. Nel corpo del messaggio usa queste variabili:

   | Variabile | Contenuto |
   |-----------|-----------|
   | `{{to_email}}` | email del tecnico (destinatario) |
   | `{{to_name}}` | nome del tecnico |
   | `{{numero_pratica}}` | numero della perizia |
   | `{{codice}}` | codice pratica (ISP, PER, APE...) |
   | `{{comune}}` | comune dell'immobile |
   | `{{indirizzo}}` | indirizzo dell'immobile |
   | `{{descrizione}}` | descrizione dei documenti caricati |
   | `{{caricato_da}}` | chi ha effettuato il caricamento |
   | `{{data_caricamento}}` | data e ora della segnalazione |
   | `{{from_name}}` | mittente (Effetre Properties) |

3. Copia l'**ID del template** e incollalo in `public/index.html`, in `EMAILJS_CONFIG`:

```js
TEMPLATE_ID_DOCUMENTI: "template_xxxxxxx"   // <-- incolla qui
```

Finché il campo resta vuoto la segnalazione viene comunque registrata sulla pratica e
notificata dentro il gestionale, ma **l'email non parte** (l'operatore riceve un avviso
esplicito a schermo).

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
