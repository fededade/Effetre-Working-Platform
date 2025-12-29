# Effetre Work Platform

Sistema di gestione pratiche per Effetre Properties SRLS.

## 🚀 Deploy su Vercel

1. Collega questo repository a Vercel
2. Deploy automatico - nessuna configurazione necessaria

## 🔧 Servizi Utilizzati

### Firebase (Firestore)
- **Progetto**: gestionale-effetre
- **Uso**: Database pratiche e utenti

### EmailJS
- **Uso**: Recupero password via email

## 📝 Note sulla Sicurezza

Le API key di Firebase e EmailJS sono **client-side keys**, progettate per essere esposte nel browser:

- **Firebase**: La sicurezza è gestita dalle [Firestore Security Rules](https://console.firebase.google.com/project/gestionale-effetre/firestore/rules)
- **EmailJS**: La public key è progettata per l'uso frontend

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
