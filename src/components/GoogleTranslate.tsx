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

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
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

  if (!mounted) return <div className="min-h-[140px]" />;

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
            className="px-3 py-2 text-xs font-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            FR
          </button>
        </div>

        {/* LIGNE 2 : AUTRES LANGUES (BLEU) + BESOIN D'AIDE ? */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
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
            className="whitespace-nowrap text-[10px] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 font-medium italic underline underline-offset-2"
          >
            ❓ besoin d'aide ?
          </button>
        </div>

        {/* MENTION GOOGLE TRANSLATE */}
        <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1.5 px-1">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/translate_24dp.png"
            alt="Google Translate"
            width={14}
            height={14}
          />
          <span>Traduction fournie par Google Translate</span>
        </div>
      </div>

      {/* ✅ Modale d’aide (popup) */}
      {helpOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center backdrop-blur-sm"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="bg-white text-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-[92%] relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-3 right-4 text-2xl font-light text-slate-400 hover:text-slate-800"
            >
              ×
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🧭 Aide : Réinitialiser Google Translate
            </h3>
            
            <p className="mb-4 text-sm leading-relaxed">
              Si la traduction reste bloquée, supprime le cookie du site 
              <code className="mx-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-blue-600">
                faistasortieatoulouse.online
              </code>.
            </p>

            <ul className="space-y-3 mb-5 text-sm">
              <li className="flex gap-2">
                <span className="font-bold">Chrome / Edge :</span> 
                <span>🔒 à gauche de l’adresse → <em>Cookies et données de site</em> → Supprimer le site.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">Firefox :</span> 
                <span>🔒 → <em>Effacer les cookies et données du site</em>.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">Safari :</span> 
                <span>Réglages → Confidentialité → Gérer les données → Supprimer le site.</span>
              </li>
            </ul>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm">
              🌍 <strong>Depuis la barre Google Translate :</strong> clique sur ⚙️ → 
              <em> Afficher la page originale</em>. 
              Si ça ne suffit pas, supprime le cookie comme indiqué ci-dessus.
            </div>

            <button 
              onClick={() => setHelpOpen(false)}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
