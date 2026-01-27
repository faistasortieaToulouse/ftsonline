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
  // Application au domaine actuel (marche pour Vercel et Localhost)
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

    const interval = setInterval(() => {
      const bannerFrame = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement | null;
      if (bannerFrame) {
        bannerFrame.style.display = 'none';
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const changeLang = (lang: string) => {
    if (lang === selectedLang) return;

    if (lang === 'fr') {
      deleteCookie('googtrans');
      deleteCookie('googtrans_save');
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
        .goog-te-banner-frame.skiptranslate,
        body > .skiptranslate,
        iframe.goog-te-banner-frame,
        iframe#\\:1\\.container {
          display: none !important;
          visibility: hidden !important;
        }
        body {
          top: 0px !important;
          position: relative !important;
        }
        .goog-te-overlay, .goog-logo-link, .goog-te-gadget-icon {
          display: none !important;
        }
        .goog-te-gadget {
          font-size: 0 !important;
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
                  autoDisplay: false,
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `}
          </Script>
        </>
      )}

      <div className="google-translate-custom flex flex-wrap items-center gap-2 mt-4">
        <select
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          className="px-2 py-1 rounded border shadow-sm bg-white text-slate-900 hover:bg-slate-50 transition-colors text-sm"
        >
          <option value="" disabled>Traduire la page</option>
          {LANGS.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>

        {selectedLang !== 'fr' && (
          <button
            onClick={() => changeLang('fr')}
            className="px-2 py-1 text-xs rounded bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            Original (FR)
          </button>
        )}

        <button
          onClick={() => setShowExtra(!showExtra)}
          className="text-xs underline text-blue-600"
        >
          {showExtra ? 'Moins' : 'Plus de langues'}
        </button>

        <button
          onClick={() => setHelpOpen(true)}
          className="text-xs text-slate-400 ml-auto flex items-center gap-1 hover:text-slate-600 transition-colors"
        >
          ❓ Aide
        </button>
      </div>

      {showExtra && (
        <select
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          className="mt-2 px-2 py-1 rounded border shadow-sm bg-white text-slate-900 text-sm w-full transition-all"
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
            
            <p className="text-sm mb-4 leading-relaxed">
              Si la traduction ne s'affiche pas correctement, vous pouvez réinitialiser le service en supprimant les données du site :
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-xs font-mono break-all">
              Domaine : {currentDomain}
            </div>

            <ul className="text-sm space-y-3 mb-6">
              <li className="flex gap-2">
                <span className="font-bold">1.</span> 
                Cliquez sur le cadenas 🔒 à gauche de l'adresse URL.
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span> 
                Sélectionnez "Cookies et données de site".
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span> 
                Supprimez les données liées à ce domaine et rafraîchissez la page.
              </li>
            </ul>

            <button 
              onClick={() => setHelpOpen(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
