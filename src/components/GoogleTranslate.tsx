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

    const hasConfirmed = window.confirm(`Traduire en ${targetLabel} ?`);

    if (hasConfirmed) {
      setSecureCookie('googtrans', `/fr/${lang}`, 7);
      window.location.reload();
    }
  };

  if (!mounted) return <div className="min-h-[110px]" />;

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }} />
      <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="lazyOnload" />
      <Script id="google-translate-init" strategy="lazyOnload">
        {`function googleTranslateElementInit() { new google.translate.TranslateElement({pageLanguage: 'fr', autoDisplay: false}, 'google_translate_element'); }`}
      </Script>

      <div className="google-translate-custom flex flex-col gap-2 w-full max-w-[320px] ml-auto p-2 bg-white rounded-xl shadow-sm border border-slate-200">
        
        {/* LIGNE 1 : LANGUES PRINCIPALES + BOUTON FR */}
        <div className="flex gap-1.5 items-center">
          <select
            onChange={(e) => changeLang(e.target.value)}
            value={LANGS.find(l => l.code === selectedLang) ? selectedLang : ''}
            className="flex-1 px-2 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100"
          >
            {!LANGS.find(l => l.code === selectedLang) && <option value="">🌍 Langue choisie...</option>}
            {LANGS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code === 'fr' ? '🇫🇷 ' : ''}{lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => changeLang('fr')}
            title="Revenir en Français"
            className="px-3 py-2 text-xs font-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            FR
          </button>
        </div>

        {/* LIGNE 2 : AUTRES LANGUES (BLEU) + BESOIN D'AIDE ? */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex flex-col">
            <select
              onChange={(e) => changeLang(e.target.value)}
              value={EXTRA_LANGS.find(l => l.code === selectedLang) ? selectedLang : ''}
              className="w-full px-2 py-1.5 text-[11px] font-bold bg-blue-50/50 border border-dashed border-blue-200 rounded-lg text-blue-600 outline-none hover:bg-blue-50 transition-colors"
            >
              <option value="" className="text-blue-600">AUTRES LANGUES...</option>
              {EXTRA_LANGS.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-800">{lang.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setHelpOpen(true)}
            className="whitespace-nowrap text-[10px] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 font-medium italic"
          >
            ❓ <span>besoin d'aide</span>
          </button>
        </div>
      </div>

      {/* MODAL D'AIDE */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setHelpOpen(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-[280px] w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 mb-2 italic">Aide Traduction</h3>
            <p className="text-xs text-slate-500 mb-4">
              Si la traduction est bloquée, utilisez le bouton <strong>FR</strong> pour réinitialiser ou rafraîchissez la page.
              <code className="block mt-2 p-2 bg-slate-50 rounded text-[10px] text-blue-500 font-mono">{currentDomain}</code>
            </p>
            <button onClick={() => setHelpOpen(false)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm transition-transform active:scale-95">
              FERMER
            </button>
          </div>
        </div>
      )}
    </>
  );
}
