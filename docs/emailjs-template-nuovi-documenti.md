# Template EmailJS — "Nuovi documenti caricati"

Questo template invia al tecnico assegnato l'avviso che sono stati caricati nuovi
documenti su una perizia. Serve **una sola configurazione**, poi il gestionale funziona
da solo.

> ℹ️ EmailJS **non espone API** per creare i template: vanno creati dal dashboard.
> Per questo il contenuto è già pronto qui sotto da copiare e incollare.

---

## ⚠️ Unico passaggio obbligatorio

Nel campo **Template ID** devi inserire esattamente:

```
template_nuovi_documenti
```

Questo ID è già configurato nel codice (`EMAILJS_CONFIG.TEMPLATE_ID_DOCUMENTI` in
`public/index.html`). Se usi un ID diverso l'email non parte e devi aggiornare
anche il codice.

---

## Passaggi

1. Vai su <https://dashboard.emailjs.com> e accedi con l'account Effetre.
2. Menu **Email Templates** → pulsante **Create New Template**.
3. Apri la scheda **Settings** e imposta il **Template ID** su `template_nuovi_documenti`.
   Dai al template un nome riconoscibile, es. *Nuovi documenti pratica*.
4. Torna alla scheda **Content** e compila i campi come indicato sotto.
5. Premi **Save**.

---

## Campi da compilare

### Scheda "Content"

| Campo | Valore da inserire |
|-------|--------------------|
| **Subject** | `Nuovi documenti - Pratica {{numero_pratica}} ({{comune}})` |
| **Content** | il blocco HTML più sotto (usa il pulsante **Code Editor** / `</>` per incollare l'HTML) |

### Scheda "Settings"

| Campo | Valore da inserire |
|-------|--------------------|
| **Template ID** | `template_nuovi_documenti` |
| **To Email** | `{{to_email}}` |
| **From Name** | `{{from_name}}` |
| **From Email** | lascia la casella di default del servizio email collegato |
| **Reply To** | lascia vuoto (oppure l'indirizzo dell'ufficio) |
| **Cc / Bcc** | vuoti |

> Il servizio email resta quello già collegato e usato per il recupero password
> (`service_eak01rs`): non serve crearne un altro.

---

## Contenuto HTML da incollare

Nell'editor del **Content**, passa alla modalità codice (pulsante `</>` **Code Editor**)
e incolla esattamente questo:

```html
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f4f4f5;padding:24px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <tr>
      <td style="background-color:#1a1a1a;padding:24px 28px;border-bottom:4px solid #d4af37;">
        <p style="margin:0;color:#d4af37;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;font-weight:bold;">Effetre Properties</p>
        <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:bold;">Nuovi documenti caricati</p>
      </td>
    </tr>

    <tr>
      <td style="padding:28px;">
        <p style="margin:0 0 18px;color:#1f2937;font-size:15px;">Ciao <strong>{{to_name}}</strong>,</p>
        <p style="margin:0 0 22px;color:#1f2937;font-size:15px;line-height:1.6;">
          sono stati caricati nuovi documenti per una perizia che stai lavorando.
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;">
          <tr>
            <td style="padding:8px 16px;color:#6b7280;font-size:13px;width:120px;">Pratica</td>
            <td style="padding:8px 16px;color:#111827;font-size:15px;font-weight:bold;">{{numero_pratica}}</td>
          </tr>
          <tr>
            <td style="padding:8px 16px;color:#6b7280;font-size:13px;">Codice</td>
            <td style="padding:8px 16px;color:#111827;font-size:14px;">{{codice}}</td>
          </tr>
          <tr>
            <td style="padding:8px 16px;color:#6b7280;font-size:13px;">Comune</td>
            <td style="padding:8px 16px;color:#111827;font-size:14px;">{{comune}}</td>
          </tr>
          <tr>
            <td style="padding:8px 16px 16px;color:#6b7280;font-size:13px;">Indirizzo</td>
            <td style="padding:8px 16px 16px;color:#111827;font-size:14px;">{{indirizzo}}</td>
          </tr>
        </table>

        <p style="margin:24px 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:bold;">Documenti caricati</p>
        <p style="margin:0;padding:14px 16px;background-color:#eef2ff;border-left:4px solid #6366f1;border-radius:4px;color:#1e1b4b;font-size:14px;line-height:1.6;">
          {{descrizione}}
        </p>

        <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
          Caricati da <strong style="color:#374151;">{{caricato_da}}</strong> il {{data_caricamento}}.
        </p>

        <p style="margin:22px 0 0;color:#1f2937;font-size:14px;line-height:1.6;">
          Accedi al gestionale per consultarli e conferma la presa visione sulla pratica.
        </p>
      </td>
    </tr>

    <tr>
      <td style="background-color:#f8fafc;padding:18px 28px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
          Messaggio automatico del gestionale pratiche Effetre Properties SRLS.<br>
          Non rispondere a questa email.
        </p>
      </td>
    </tr>

  </table>
</div>
```

---

## Variabili usate

Sono esattamente quelle che il gestionale invia. Non aggiungerne altre: una variabile
non prevista resterebbe vuota nell'email.

| Variabile | Contenuto |
|-----------|-----------|
| `{{to_email}}` | email di registrazione del tecnico assegnato (destinatario) |
| `{{to_name}}` | nome del tecnico |
| `{{from_name}}` | mittente, sempre "Effetre Properties" |
| `{{numero_pratica}}` | numero della perizia |
| `{{codice}}` | codice pratica (ISP, PER, APE, VAL...) |
| `{{comune}}` | comune dell'immobile |
| `{{indirizzo}}` | indirizzo dell'immobile |
| `{{descrizione}}` | descrizione dei documenti scritta dall'operatore |
| `{{caricato_da}}` | chi ha effettuato la segnalazione |
| `{{data_caricamento}}` | data e ora della segnalazione |

---

## Verifica

1. Nel dashboard EmailJS usa **Test It** sul template: compila i campi con valori finti
   (metti un tuo indirizzo in `to_email`) e controlla che l'email arrivi formattata bene.
2. Nel gestionale, apri una pratica presa in carico da un tecnico e premi
   **📎 Nuovi documenti** → **Segnala e avvisa il tecnico**.
   - Se l'email parte compare `✅ Segnalazione registrata — Email inviata a ...`
   - Se qualcosa non va compare un avviso con il motivo, l'ID del template e il servizio
     usati: la segnalazione resta comunque registrata sulla pratica e notificata in-app.

## In caso di errore

| Messaggio | Causa e rimedio |
|-----------|-----------------|
| `The template ID not found` | il Template ID non è `template_nuovi_documenti`: correggilo nelle Settings del template |
| `The recipient address is empty` | il campo **To Email** del template non è impostato a `{{to_email}}` |
| `Il tecnico assegnato non ha un'email di registrazione` | manca l'email nella scheda utente del gestionale (Gestione Utenti) |
| `The service ID not found` | il servizio email collegato è stato rimosso o rinominato su EmailJS |
