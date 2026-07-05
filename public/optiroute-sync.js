// ============================================================
// 📥 IMPORT AUTOMATICO DA OPTIROUTE — Effetre Work Platform
// ============================================================
// OptiRoute scrive i sopralluoghi CONFERMATI nella collection
// `optiroute_sync` di questo stesso Firestore. Questo modulo:
//   1. ogni ora (e all'avvio) legge i documenti non ancora importati
//   2. li converte in pratiche nel formato del gestionale e li
//      inserisce/aggiorna in `pratiche_items` (la UI si aggiorna da
//      sola grazie all'onSnapshot già presente)
//   3. marca i documenti come importati (idempotente: mai duplicati)
//
// Manuale: window.importaDaOptiRoute() dalla console.
// ============================================================

(function () {
    'use strict';

    var INTERVALLO_MS = 60 * 60000; // 1 ora
    var RITARDO_AVVIO_MS = 20000;   // attesa dopo il caricamento pagina
    var running = false;

    function log(msg) {
        console.log('[OptiRoute-Sync] ' + msg);
    }

    // "826361" -> "826.361" (formato numero pratica del gestionale)
    function formattaNumero(codice) {
        codice = String(codice || '').replace(/\D/g, '');
        if (codice.length > 3) {
            return codice.slice(0, -3) + '.' + codice.slice(-3);
        }
        return codice;
    }

    function componiNote(d) {
        var parti = [];
        if (d.ora_inizio) parti.push('Sopralluogo ore ' + d.ora_inizio + (d.ora_fine ? '-' + d.ora_fine : ''));
        if (d.telefono) parti.push('Tel: ' + d.telefono);
        if (d.referente) parti.push('Referente: ' + d.referente);
        if (d.progetto) parti.push(d.progetto);
        if (d.note) parti.push(d.note);
        return parti.join(' | ');
    }

    async function importaDaOptiRoute() {
        if (running) { log('import già in corso, salto'); return; }
        if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
            log('Firebase non ancora inizializzato');
            return;
        }
        running = true;
        var db = firebase.firestore();
        var nuove = 0, aggiornate = 0, errori = 0;

        try {
            var snap = await db.collection('optiroute_sync')
                .where('importato', '==', false).get();

            if (snap.empty) {
                log('Nessun sopralluogo nuovo da importare');
                aggiornaBadge(0, 0);
                running = false;
                return;
            }
            log(snap.size + ' sopralluoghi confermati da importare...');

            for (var i = 0; i < snap.docs.length; i++) {
                var doc = snap.docs[i];
                var d = doc.data();
                try {
                    var numero = formattaNumero(d.codice || doc.id);
                    var note = componiNote(d);

                    // Esiste già una pratica con questo numero?
                    var esistenti = await db.collection('pratiche_items')
                        .where('numero', '==', numero).get();

                    if (!esistenti.empty) {
                        // Aggiorna i dati di sopralluogo della pratica esistente
                        var pDoc = esistenti.docs[0];
                        var storico = (pDoc.data().storico || []).concat([{
                            data: new Date().toLocaleString('it-IT'),
                            utente: 'OptiRoute',
                            azione: 'Aggiornamento',
                            dettagli: 'Sopralluogo confermato: ' + (d.giorno || d.data || '') +
                                      (d.ora_inizio ? ' ore ' + d.ora_inizio : '')
                        }]);
                        await pDoc.ref.update({
                            giorno: d.giorno || pDoc.data().giorno || '',
                            nOrdine: d.ordine || pDoc.data().nOrdine || null,
                            telefono: d.telefono || '',
                            referente: d.referente || '',
                            note: note || pDoc.data().note || '',
                            coordinate: (d.lng && d.lat) ? [d.lng, d.lat] : (pDoc.data().coordinate || null),
                            storico: storico
                        });
                        aggiornate++;
                    } else {
                        // Nuova pratica nel formato del gestionale
                        var id = Date.now() + i;
                        await db.collection('pratiche_items').doc(String(id)).set({
                            id: id,
                            nOrdine: d.ordine || null,
                            numero: numero,
                            codice: 'ISP',
                            comune: d.comune || 'NON SPECIFICATO',
                            indirizzo: d.indirizzo || '',
                            intestati: d.cliente || 'NON SPECIFICATO',
                            giorno: d.giorno || d.data || '',
                            note: note,
                            osservazioni: '',
                            telefono: d.telefono || '',
                            referente: d.referente || '',
                            coordinate: (d.lng && d.lat) ? [d.lng, d.lat] : null,
                            stato: 'disponibile',
                            utenteAssegnato: null,
                            storico: [{
                                data: new Date().toLocaleString('it-IT'),
                                utente: 'OptiRoute',
                                azione: 'Import',
                                dettagli: 'Sopralluogo confermato importato da OptiRoute (' +
                                          (d.giorno || d.data || '') +
                                          (d.ora_inizio ? ' ore ' + d.ora_inizio : '') + ')'
                            }]
                        });
                        nuove++;
                    }

                    // Marca il documento sync come importato (idempotenza)
                    await doc.ref.update({
                        importato: true,
                        importato_il: new Date().toISOString()
                    });
                } catch (e) {
                    errori++;
                    console.error('[OptiRoute-Sync] Errore su ' + doc.id + ':', e);
                }
            }

            log('Import completato: ' + nuove + ' nuove, ' + aggiornate +
                ' aggiornate' + (errori ? ', ' + errori + ' errori' : ''));
            aggiornaBadge(nuove, aggiornate);
        } catch (e) {
            console.error('[OptiRoute-Sync] Errore lettura optiroute_sync:', e);
        } finally {
            running = false;
        }
    }

    // Badge discreto in basso a destra con l'esito dell'ultimo import
    function aggiornaBadge(nuove, aggiornate) {
        var el = document.getElementById('optiroute-sync-badge');
        if (!el) {
            el = document.createElement('div');
            el.id = 'optiroute-sync-badge';
            el.style.cssText =
                'position:fixed;bottom:10px;right:10px;z-index:2147483000;' +
                'background:#0f172a;color:#e2e8f0;font:11px/1.4 sans-serif;' +
                'padding:5px 10px;border-radius:8px;opacity:.85;cursor:pointer;';
            el.title = 'Import automatico sopralluoghi da OptiRoute (ogni ora). Click per importare ora.';
            el.onclick = function () { importaDaOptiRoute(); };
            document.body.appendChild(el);
        }
        var ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        el.textContent = '🔄 OptiRoute ' + ora + ' — ' +
            (nuove || aggiornate ? ('+' + nuove + ' / ~' + aggiornate) : 'nessuna novità');
    }

    // Esposto per uso manuale dalla console
    window.importaDaOptiRoute = importaDaOptiRoute;

    // Avvio: attende Firebase, primo import dopo un breve ritardo, poi ogni ora
    function avvia() {
        setTimeout(importaDaOptiRoute, RITARDO_AVVIO_MS);
        setInterval(importaDaOptiRoute, INTERVALLO_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', avvia);
    } else {
        avvia();
    }
})();
