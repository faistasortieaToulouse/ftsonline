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
  if (window.location.protocol === 'https:') cookie += 'Secure;';
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
  const [mounted, setMounted] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
      const cookie = getCookie('googtrans');
      const currentLang = cookie?.split('/')[2];
      setSelectedLang(currentLang || 'fr');
    }
  }, []);

  const changeLang = (lang: string) => {
    if (!lang || lang === selectedLang) return;

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
    }
  };

  if (!mounted) return <div className="min-h-[60px]" />;

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />

      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
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

      <div className="google-translate-custom flex flex-col gap-1.5 w-full max-w-[300px] ml-auto p-1">
        {/* En-tête : Contrôles */}
        <div className="flex justify-between items-center px-0.5">
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight transition-colors"
          >
            {showExtra ? '× Masquer autres' : '+ Autres Langues'}
          </button>

          <button
            onClick={() => setHelpOpen(true)}
            className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            ❓ <span className="hidden sm:inline italic">besoin d'aide</span>
          </button>
        </div>

        {/* 1. SÉLECTEUR PRINCIPAL (LANGS) */}
        <div className="flex gap-1.5 items-center">
          <select
            onChange={(e) => changeLang(e.target.value)}
            value={LANGS.find(l => l.code === selectedLang) ? selectedLang : ''}
            className="flex-1 px-2 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg shadow-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          >
            {/* Si une langue Extra est choisie, on l'affiche ici pour ne pas perdre l'utilisateur */}
            {!LANGS.find(l => l.code === selectedLang) && (
               <option value="">🌍 Langue sélectionnée...</option>
            )}
            {LANGS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code === 'fr' ? '🇫🇷 ' : ''}{lang.label}
              </option>
            ))}
          </select>

          {selectedLang !== 'fr' && (
            <button
              onClick={() => changeLang('fr')}
              className="px-2.5 py-1.5 text-[10px] font-black bg-slate-800 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
            >
              FR
            </button>
          )}
        </div>

        {/* 2. SÉLECTEUR SECONDAIRE (EXTRA_LANGS) - Visible seulement sur demande */}
        {showExtra && (
          <div className="flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-[9px] font-bold text-slate-400 ml-1 mb-0.5 uppercase">Plus de choix :</label>
            <select
              onChange={(e) => changeLang(e.target.value)}
              value={EXTRA_LANGS.find(l => l.code === selectedLang) ? selectedLang : ''}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-600 outline-none hover:bg-white transition-colors"
            >
              <option value="" disabled>Choisir une langue spécifique...</option>
              {EXTRA_LANGS.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* MODAL D'AIDE */}
      {helpOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setHelpOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-2xl shadow-2xl max-w-[280px] w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed text-left">
              Si la traduction ne s'active pas :
              <br />1. Cliquez sur <strong>FR</strong> pour réinitialiser.
              <br />2. Actualisez la page.
              <br />3. Videz vos cookies pour <strong>{currentDomain}</strong>.
            </p>
            <button
              onClick={() => setHelpOpen(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-transform"
            >
              OK, J'AI COMPRIS
            </button>
          </div>
        </div>
      )}
    </>
  );
}
