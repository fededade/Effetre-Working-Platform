// ============================================================
// ⚙️ CONFIGURAZIONE PER-AMBIENTE — Effetre Work Platform
// ============================================================
// Questo file decide se la pagina sta girando in PRODUZIONE
// (gestionale ufficiale, database reale) o in COLLAUDO/STAGING
// (copia di lavoro, database di prova) e fornisce alle pagine
// la configurazione Firebase corretta.
//
// REGOLE DI RILEVAMENTO (in ordine):
//   1. Parametro URL ?env=staging o ?env=production (ricordato
//      per tutta la sessione del browser)
//   2. localhost / 127.0.0.1                    → COLLAUDO
//   3. dominio contenente "-git-" (preview Vercel di un branch)
//      o la parola "staging"                    → COLLAUDO
//   4. qualsiasi altro dominio                  → PRODUZIONE
//
// ⚠️ IMPORTANTE: se NON vedi il banner arancione in alto,
//    sei collegato al DATABASE UFFICIALE. Non fare test!
// ============================================================

(function () {
    'use strict';

    // ------------------------------------------------------------
    // 🟢 PRODUZIONE — progetto Firebase ufficiale (dati reali)
    // ------------------------------------------------------------
    var PRODUCTION_FIREBASE_CONFIG = {
        apiKey: "AIzaSyAxuZxv3_7w4cR01W4dRrGOJ3-qbSsL868",
        authDomain: "gestionale-effetre.firebaseapp.com",
        projectId: "gestionale-effetre",
        storageBucket: "gestionale-effetre.firebasestorage.app",
        messagingSenderId: "418072647086",
        appId: "1:418072647086:web:bbba16fa2e6c6140fee43f",
        measurementId: "G-DYSPC79396"
    };

    // ------------------------------------------------------------
    // 🟠 COLLAUDO / STAGING — progetto Firebase di prova
    // ------------------------------------------------------------
    // ✅ Configurato: progetto "gestionale-effetre-staging".
    // I dati di collaudo vivono qui, completamente separati dal
    // database ufficiale. Istruzioni in STAGING.md.
    // ------------------------------------------------------------
    var STAGING_FIREBASE_CONFIG = {
        apiKey: "AIzaSyBREzp0X64Y2zazMGSDZXLpg59Y6gnOqXw",
        authDomain: "gestionale-effetre-staging.firebaseapp.com",
        projectId: "gestionale-effetre-staging",
        storageBucket: "gestionale-effetre-staging.firebasestorage.app",
        messagingSenderId: "821519797248",
        appId: "1:821519797248:web:b8a7ed1beaff22c1e65ce5"
    };

    // ------------------------------------------------------------
    // Rilevamento ambiente
    // ------------------------------------------------------------
    var host = (window.location.hostname || '').toLowerCase();
    var envOverride = null;

    try {
        var urlEnv = new URLSearchParams(window.location.search).get('env');
        if (urlEnv === 'staging' || urlEnv === 'production') {
            sessionStorage.setItem('effetre_env_override', urlEnv);
        }
        envOverride = sessionStorage.getItem('effetre_env_override');
    } catch (e) { /* sessionStorage non disponibile: ignora */ }

    var isStaging;
    if (envOverride === 'staging') {
        isStaging = true;
    } else if (envOverride === 'production') {
        isStaging = false;
    } else {
        isStaging =
            host === 'localhost' ||
            host === '127.0.0.1' ||
            host.indexOf('-git-') !== -1 ||   // preview di branch su Vercel
            host.indexOf('staging') !== -1;   // dominio/progetto dedicato al collaudo
    }

    var stagingConfigured = STAGING_FIREBASE_CONFIG.projectId !== 'REPLACE_ME';

    // In collaudo NON si usa MAI la configurazione di produzione:
    // se il progetto di staging non è configurato, meglio nessun database
    // (la pagina resta in modalità locale) che scrivere su quello ufficiale.
    var firebaseConfig;
    if (isStaging) {
        firebaseConfig = stagingConfigured ? STAGING_FIREBASE_CONFIG : null;
    } else {
        firebaseConfig = PRODUCTION_FIREBASE_CONFIG;
    }

    window.EFFETRE_ENV = {
        name: isStaging ? 'staging' : 'production',
        isStaging: isStaging,
        stagingConfigured: stagingConfigured,
        firebaseConfig: firebaseConfig
    };

    console.log(
        '%c[EFFETRE] Ambiente: ' + window.EFFETRE_ENV.name.toUpperCase() +
        ' — Database: ' + (firebaseConfig ? firebaseConfig.projectId : 'NESSUNO (staging non configurato)'),
        'font-weight:bold; color:' + (isStaging ? '#d97706' : '#059669')
    );

    // ------------------------------------------------------------
    // Banner visivo di collaudo
    // ------------------------------------------------------------
    function injectBanner() {
        if (!isStaging) return; // In produzione nessun banner

        var banner = document.createElement('div');
        banner.id = 'effetre-env-banner';

        if (stagingConfigured) {
            banner.style.cssText =
                'position:fixed;top:0;left:0;right:0;z-index:2147483647;' +
                'background:#f59e0b;color:#1f2937;font:bold 13px/1.4 sans-serif;' +
                'text-align:center;padding:6px 12px;box-shadow:0 2px 6px rgba(0,0,0,.25);';
            banner.textContent =
                '🧪 AMBIENTE DI COLLAUDO — database di prova (' +
                STAGING_FIREBASE_CONFIG.projectId +
                '): le modifiche NON toccano il gestionale ufficiale';
        } else {
            banner.style.cssText =
                'position:fixed;top:0;left:0;right:0;z-index:2147483647;' +
                'background:#dc2626;color:#fff;font:bold 13px/1.4 sans-serif;' +
                'text-align:center;padding:6px 12px;box-shadow:0 2px 6px rgba(0,0,0,.25);';
            banner.textContent =
                '⚠️ COLLAUDO NON CONFIGURATO — nessun database collegato (modalità locale). ' +
                'Configura il progetto Firebase di prova in env-config.js (vedi STAGING.md)';
        }

        document.body.appendChild(banner);
        // Sposta il contenuto sotto il banner
        document.body.style.paddingTop = (banner.offsetHeight || 32) + 'px';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectBanner);
    } else {
        injectBanner();
    }
})();
