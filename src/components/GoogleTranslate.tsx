'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Allemand' },
  { code: 'en', label: 'Anglais' },
  { code: 'ar', label: 'Arabe' },
  { code: 'zh-CN', label: 'Chinois' },
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

function setSecureCookie(name: string, value: string, days?: number) {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  let cookie = `${name}=${value};path=/;SameSite=Lax;`;
  
  if (window.location.protocol === 'https:') {
    cookie += 'Secure;';
  }

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

export default function GoogleTranslateCustom() {
  const [selectedLang, setSelectedLang] = useState('fr');
  const [mounted, setMounted] = useState(false); // Pour éviter l'erreur d'hydratation #418
  const [showExtra, setShowExtra] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    setMounted(true); // Signale que le client a pris la main
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
      const cookie = getCookie('googtrans');
      const currentLang = cookie?.split('/')[2];
      setSelectedLang(currentLang || 'fr');
    }
  }, []);

  const changeLang = (lang: string) => {
    if (lang === selectedLang) return;

    if (lang === 'fr') {
      setSecureCookie('googtrans', '', -1);
      setSecureCookie('googtrans_save', '', -1);
      window.location.reload();
      return;
    }

    const allLangs = [...LANGS, ...EXTRA_LANGS];
    const targetLabel = allLangs.find((l) => l.code === lang)?.label || lang;

    const hasConfirmed = window.confirm(
      `Traduire la page en ${targetLabel} ?\n\nNote : La page sera actualisée.`
    );

    if (hasConfirmed) {
      setSecureCookie('googtrans', `/fr/${lang}`, 7);
      window.location.reload();
    } else {
      setSelectedLang(selectedLang);
    }
  };

  // Ne rien rendre tant que le composant n'est pas monté (Règle l'erreur #418)
  if (!mounted) return <div className="min-h-[75px]" />;

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />

      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload" // Chargement après tout le reste pour éviter le Quirks Mode précoce
      />
      <Script id="google-translate-init" strategy="lazyOnload">
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

      <div className="google-translate-custom flex flex-col gap-2 pt-2">
        <div className="flex justify-between items-center px-1">
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight"
          >
            {showExtra ? '× Réduire' : '+ Langues'}
          </button>

          <button
            onClick={() => setHelpOpen(true)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors text-xs"
          >
            ❓ besoin d'aide
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <select
            onChange={(e) => changeLang(e.target.value)}
            value={selectedLang}
            className="flex-1 px-2 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
          >
            {LANGS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code === 'fr' ? '🇫🇷 ' : ''}{lang.label}
              </option>
            ))}
          </select>

          {selectedLang !== 'fr' && (
            <button
              onClick={() => changeLang('fr')}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-colors"
            >
              FR
            </button>
          )}
        </div>

        {showExtra && (
          <select
            onChange={(e) => changeLang(e.target.value)}
            value={selectedLang}
            className="mt-1 px-2 py-1 text-xs bg-slate-50 border border-dashed border-slate-300 rounded text-slate-600 outline-none"
          >
            <option value="" disabled>Choisir une autre langue...</option>
            {EXTRA_LANGS.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        )}
      </div>

      {helpOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setHelpOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-2xl shadow-xl max-w-xs w-full animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900 mb-2 italic">Aide Traduction</h3>
            <p className="text-sm text-slate-500 mb-4">
              Si la traduction bloque, videz vos cookies ou actualisez la page.
              <code className="block mt-2 p-1.5 bg-slate-100 rounded text-blue-600 font-mono text-[10px]">
                {currentDomain}
              </code>
            </p>
            <button
              onClick={() => setHelpOpen(false)}
              className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}