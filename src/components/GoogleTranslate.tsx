'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    const googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'fr,de,en,ar,eu,zh-CN,es,fa,hi,it,ja,oc,pt,ru,tr,no,ro',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      }
    };

    // The script in layout.tsx will call this function once it has loaded.
    window.googleTranslateElementInit = googleTranslateElementInit;

    // If the script is already loaded (e.g., on navigation), initialize it directly.
    if (window.google && window.google.translate) {
      googleTranslateElementInit();
    }
  }, []);

  return <div id="google_translate_element"></div>;
}
