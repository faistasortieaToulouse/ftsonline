'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'en', label: 'Anglais' },
  { code: 'ar', label: 'Arabe' },
  { code: 'zh-CN', label: 'Chinois (simpl.)' },
  { code: 'es', label: 'Espagnol' },
  { code: 'it', label: 'Italien' },
  { code: 'ja', label: 'Japonais' },
  { code: 'pt', label: 'Portugais' },
  { code: 'ru', label: 'Russe' },
  { code: 'tr', label: 'Turc' },
];

const EXTRA_LANGS = [
  { code: 'eu', label: 'Basque' },
  { code: 'ko', label: 'Coréen' },
  { code: 'fa', label: 'Farci' },
  { code: 'el', label: 'Grec' },
  { code: 'hi', label: 'Hindi' },
  { code: 'id', label: 'Indonésien' },
  { code: 'nl', label: 'Néerlandais' },
  { code: 'oc', label: 'Occitan' },
  { code: 'pl', label: 'Polonais' },
  { code: 'ro', label: 'Roumain' },
  { code: 'sv', label: 'Suédois' },
  { code: 'th', label: 'Thaïlandais' },
  { code: 'vi', label: 'Vietnamien' },
];

/* --- FONCTIONS COOKIES DYNAMIQUES --- */
function setCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  let cookie = `${name}=${value};path=/;`;
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `expires=${d.toUTCString()};`;
  }
  document.cookie = `${cookie}domain=${host};`;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const expiredCookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
  document.cookie = `${expiredCookie}domain=${host};`;
}

export default function GoogleTranslateCustom() {
  const [selectedLang, setSelectedLang] = useState('fr');
  const [scriptReady, setScriptReady] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    setCurrentDomain(window.location.hostname);
    const cookie = getCookie('googtrans');
    const currentLang = cookie?.split('/')[2];

    if (!cookie || !currentLang) {
      setCookie('googtrans', '/fr/fr', 7);
    }

    setSelectedLang(currentLang || 'fr');
    setScriptReady(true);

    // Intervalle pour forcer la disparition de la barre native si elle réapparaît
    const interval = setInterval(() => {
      const banner = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (banner) banner.style.display = 'none';
      document.body.style.top = '0px';
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const changeLang = (lang: string) => {
    if (lang === selectedLang) return;

    if (lang === 'fr') {
      deleteCookie('googtrans');
      deleteCookie('googtrans_save');
      window.location.hash = ''; // Nettoie l'URL
      setSelectedLang('fr');
      window.location.reload();
    } else {
      setCookie('googtrans', `/fr/${lang}`, 7);
      window.location.reload();
    }
  };

  return (
    <>
      <style jsx global>{`
        /* 1. Cache la barre de sélection massive et les iframes natives */
        iframe.goog-te-banner-frame,
        .goog-te-banner-frame,
        .goog-te-menu-frame,
        #goog-gt-tt,
        .skiptranslate[style*="visibility: visible"] {
          display: none !important;
          visibility: hidden !important;
        }

        /* 2. Empêche le décalage du contenu vers le bas */
        body {
          top: 0px !important;
          position: static !important;
        }

        /* 3. Cache les éléments de l'UI par défaut de Google */
        .goog-te-gadget, 
        .goog-te-gadget-simple, 
        .goog-logo-link, 
        .goog-te-gadget-icon {
          display: none !important;
        }
        
        /* 4. Supprime la surbrillance bleue au survol des textes */
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <div id="google_translate_element" style={{ display: 'none' }} />

      {scriptReady && (
        <>
          <Script
            src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'fr',
                  autoDisplay: false, // Empêche l'affichage automatique de la barre
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `}
          </Script>
        </>
      )}

      {/* TON INTERFACE PERSONNALISÉE */}
      <div className="google-translate-custom flex flex-wrap items-center gap-2">
        <select
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          className="px-2 py-1 rounded border shadow-sm bg-white text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <option value="" disabled>Traduire</option>
          {LANGS.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>

        {selectedLang !== 'fr' && (
          <button
            onClick={() => changeLang('fr')}
            className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border"
          >
            FR
          </button>
        )}

        <button
          onClick={() => setShowExtra(!showExtra)}
          className="text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-800"
        >
          {showExtra ? 'Réduire' : 'Autres'}
        </button>

        <button
          onClick={() => setHelpOpen(true)}
          className="ml-auto p-1 text-slate-400 hover:text-slate-600 transition-colors"
          title="Besoin d'aide ?"
        >
          ❓
        </button>
      </div>

      {showExtra && (
        <select
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          className="mt-2 px-2 py-1 rounded border shadow-sm bg-white text-slate-900 text-sm w-full transition-all focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Langues supplémentaires</option>
          {EXTRA_LANGS.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      )}

      {/* MODALE D'AIDE */}
      {helpOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setHelpOpen(false)}
        >
          <div 
            className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🧭 Aide à la traduction
            </h3>
            
            <p className="text-sm mb-4 leading-relaxed text-slate-600">
              Si la traduction reste bloquée ou affiche une barre indésirable, videz le cache de votre navigateur pour le site :
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-xs font-mono text-blue-600 break-all">
              {currentDomain}
            </div>

            <ul className="text-sm space-y-3 mb-6 text-slate-700">
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">1.</span> 
                Cliquez sur le cadenas 🔒 à gauche de l'adresse URL.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">2.</span> 
                Sélectionnez "Cookies et données de site".
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-600">3.</span> 
                Supprimez tout et rafraîchissez la page.
              </li>
            </ul>

            <button 
              onClick={() => setHelpOpen(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Continuer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
