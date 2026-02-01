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

/* --- UTILITAIRES COOKIES --- */
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
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
      const cookie = getCookie('googtrans');
      const currentLang = cookie?.split('/')[2];
      setSelectedLang(currentLang || 'fr');
      setScriptReady(true);
    }

    const interval = setInterval(() => {
      const frames = document.querySelectorAll('.goog-te-banner-frame, #goog-gt-tt, .goog-te-menu-frame, .skiptranslate');
      frames.forEach((f) => {
        const frame = f as HTMLElement;
        frame.style.display = 'none';
        frame.style.visibility = 'hidden';
        frame.style.pointerEvents = 'none';
      });
      
      if (document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const changeLang = (lang: string) => {
    if (lang === selectedLang) return;

    // Cas du retour au Français : Action immédiate
    if (lang === 'fr') {
      deleteCookie('googtrans');
      deleteCookie('googtrans_save');
      window.location.hash = ''; 
      window.location.reload();
      return;
    }

    // --- SÉCURITÉ : Demande de confirmation ---
    const allLangs = [...LANGS, ...EXTRA_LANGS];
    const targetLabel = allLangs.find(l => l.code === lang)?.label || lang;
    
    const hasConfirmed = window.confirm(
      `Traduire la page en ${targetLabel} ?\n\nNote : La page sera actualisée pour appliquer la traduction.`
    );

    if (hasConfirmed) {
      setCookie('googtrans', `/fr/${lang}`, 7);
      window.location.reload();
    } else {
      // On réinitialise l'affichage du select si l'utilisateur annule
      setSelectedLang(selectedLang);
    }
  };

  return (
    <>
      <style jsx global>{`
        iframe.goog-te-banner-frame,
        .goog-te-banner-frame,
        .goog-te-menu-frame,
        #goog-gt-tt,
        .skiptranslate,
        .goog-te-spinner-pos {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        .goog-te-gadget, .goog-logo-link {
          display: none !important;
        }
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
                  autoDisplay: false,
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `}
          </Script>
        </>
      )}

      <div className="google-translate-custom flex flex-wrap items-center gap-2">
        <select
          onChange={(e) => changeLang(e.target.value)}
          value={selectedLang}
          className="px-2 py-1 rounded border shadow-sm bg-white text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium outline-none"
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
          {showExtra ? 'Réduire' : 'Autres Langues'}
        </button>

        <button
          onClick={() => setHelpOpen(true)}
          className="ml-auto p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          ❓ besoin d'aide
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
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">🧭 Aide à la traduction</h3>
            <p className="text-sm mb-4 text-slate-600">En cas de problème, videz les cookies pour ce domaine :</p>
            <div className="bg-slate-50 p-2 rounded mb-4 text-xs font-mono text-blue-600">{currentDomain}</div>
            <button onClick={() => setHelpOpen(false)} className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold">Continuer</button>
          </div>
        </div>
      )}
    </>
  );
}
