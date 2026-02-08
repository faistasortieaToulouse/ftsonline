'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Allemand', flag: '🇩🇪' },
  { code: 'en', label: 'Anglais', flag: '🇬🇧' },
  { code: 'ar', label: 'Arabe', flag: '🇸🇦' },
  { code: 'zh-CN', label: 'Chinois', flag: '🇨🇳' },
  { code: 'es', label: 'Espagnol', flag: '🇪🇸' },
  { code: 'it', label: 'Italien', flag: '🇮🇹' },
  { code: 'ja', label: 'Japonais', flag: '🇯🇵' },
  { code: 'pt', label: 'Portugais', flag: '🇵🇹' },
  { code: 'ru', label: 'Russe', flag: '🇷🇺' },
  { code: 'tr', label: 'Turc', flag: '🇹🇷' },
];

const EXTRA_LANGS = [
  { code: 'oc', label: 'Occitan', flag: '🛡️' }, 
  { code: 'eu', label: 'Basque', flag: '🇪🇸' },
  { code: 'ko', label: 'Coréen', flag: '🇰🇷' },
  { code: 'fa', label: 'Farci', flag: '🇮🇷' },
  { code: 'el', label: 'Grec', flag: '🇬🇷' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'id', label: 'Indonésien', flag: '🇮🇩' },
  { code: 'nl', label: 'Néerlandais', flag: '🇳🇱' },
  { code: 'pl', label: 'Polonais', flag: '🇵🇱' },
  { code: 'ro', label: 'Roumain', flag: '🇷🇴' },
  { code: 'sv', label: 'Suédois', flag: '🇸🇪' },
  { code: 'th', label: 'Thaïlandais', flag: '🇹🇭' },
  { code: 'vi', label: 'Vietnamien', flag: '🇻🇳' },
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
  
  // ✅ OUVERT PAR DÉFAUT (isCollapsed = false)
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    const target = allLangs.find((l) => l.code === lang);
    const targetLabel = target ? `${target.flag} ${target.label}` : lang;

    if (window.confirm(`Traduire en ${targetLabel} ?`)) {
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

      {/* POSITION CONSERVÉE (mt-28, relative, z-10) */}
      <div className={`google-translate-custom mt-28 mb-8 flex flex-col gap-2 w-[95%] sm:max-w-[500px] mx-auto sm:ml-auto p-5 bg-white rounded-2xl shadow-lg border border-slate-200 relative z-10 transition-all duration-300 ${isCollapsed ? 'max-h-[50px] overflow-hidden' : 'max-h-[500px]'}`}>
        
        {/* BOUTON DE RÉDUCTION DISCRET EN HAUT À DROITE */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-2 right-4 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-tighter"
        >
          {isCollapsed ? '▲ Déplier' : '▼ Plier'}
        </button>

        {/* TITRE VISIBLE MÊME SI PLIÉ (Optionnel, sinon le bouton suffit) */}
        {isCollapsed && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(false)}>
            <span className="text-xs font-bold text-slate-600">🌍 Traducteur</span>
          </div>
        )}

        {/* LE RESTE DU CONTENU : MASQUÉ SI PLIÉ */}
        <div className={isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible transition-opacity duration-500'}>
          {/* BLOC 1 : LANGUES PRINCIPALES */}
          <div className="flex gap-1.5 items-center mt-2">
            <select
              onChange={(e) => changeLang(e.target.value)}
              value={LANGS.find(l => l.code === selectedLang) ? selectedLang : ''}
              className="flex-1 px-2 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              {!LANGS.find(l => l.code === selectedLang) && <option value="fr">🇫🇷 Français</option>}
              {LANGS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <button onClick={() => changeLang('fr')} className="px-3 py-2 text-xs font-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              🇫🇷 FR
            </button>
          </div>

          {/* BLOC 2 : AUTRES LANGUES */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">
              Autres langues
            </span>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <select
                  onChange={(e) => changeLang(e.target.value)}
                  value={EXTRA_LANGS.find(l => l.code === selectedLang) ? selectedLang : 'oc'}
                  className="w-full px-2 py-1.5 text-[11px] font-bold bg-blue-50/50 border border-dashed border-blue-200 rounded-lg text-blue-600 outline-none hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {EXTRA_LANGS.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-slate-800">
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setHelpOpen(true)} 
                className="text-[10px] text-red-400 hover:text-blue-600 transition-colors flex flex-col sm:flex-row items-center sm:gap-1 font-medium italic underline underline-offset-2 text-right sm:text-left leading-tight"
              >
                <span className="whitespace-nowrap">besoin</span>
                <span>d'aide ?</span>
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1.5 px-1 font-medium italic">
            <img src="https://www.gstatic.com/images/branding/product/1x/translate_24dp.png" alt="Google Translate" width={14} height={14} />
            <span>Traduction par Google</span>
          </div>
        </div>
      </div>
      {/* ✅ MODALE D'AIDE : SOLUTION RADICALE POUR LE CENTRAGE ET LE Z-INDEX */}
      {helpOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-start justify-center p-4 pt-20"
          style={{ zIndex: 2147483647 }} // Valeur maximale possible pour être au-dessus de TOUT
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="bg-white text-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[85vh]"
            style={{ transform: 'translateY(0)' }} // S'assure qu'on ne subit pas de décalage parasite
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-2 right-4 text-3xl font-light text-slate-400 hover:text-slate-900 transition-colors p-1"
            >
              &times;
            </button>

            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 pr-8">
              🧭 Aide : Google Translate
            </h3>
            
            <div className="space-y-4 text-sm leading-relaxed">

              {/* NOUVEL AJOUT : INFO PLIAGE */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                <span className="text-xl">↕️</span>
                <p className="text-amber-900 font-medium">
                  Si le traducteur vous gêne, vous pouvez le <strong>plier</strong> ou le <strong>déplier</strong> avec les boutons 
                  <span className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white border rounded text-[11px] font-bold">▼ Plier</span> 
                  ou <span className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white border rounded text-[11px] font-bold">▲ Déplier</span>.
                </p>
              </div>

              <p>
                Si la traduction reste bloquée ou masque le menu, supprimez les cookies du site : 
                <code className="block mt-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-blue-600 text-center text-[10px] break-all">
                  faistasortieatoulouse.online
                </code>
              </p>

              <div className="space-y-3 border-l-2 border-slate-100 pl-3">
                <div className="flex flex-col">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Chrome / Edge</span> 
                  <span>🔒 à gauche de l’URL → <em>Cookies</em> → Supprimer.</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Firefox</span> 
                  <span>🔒 → <em>Effacer les cookies et données</em>.</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Safari</span> 
                  <span>Réglages → Confidentialité → Supprimer le site.</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[12px] italic">
                🌍 <strong>Note :</strong> Si la barre Google gêne la lecture, cliquez sur ⚙️ (dans la barre) puis sur 
                <em> "Afficher la page originale"</em>.
              </div>
            </div>

            <button onClick={() => setHelpOpen(false)} 
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
            J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}