# Effetre Work Platform

Sistema di gestione pratiche per Effetre Properties SRLS.

> 🧪 **Ambiente di collaudo**: lo sviluppo avviene sul branch `staging` con un database Firebase separato, senza toccare il gestionale ufficiale. Il file `public/env-config.js` seleziona automaticamente il database in base al dominio. Guida completa in [STAGING.md](STAGING.md).

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
- **Uso**: Recupero password via email

### Google Gemini API
- **Uso**: Analisi AI di atti e visure catastali
- **Sicurezza**: La chiave API è sul server (Environment Variable), non visibile agli utenti

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
