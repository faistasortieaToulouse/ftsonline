'use client';

import { useEffect } from 'react';

export function GoogleTranslate() {
  useEffect(() => {
    // Empêcher initialisation multiple
    if (document.getElementById("google-translate-script")) {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,de,en,ar,eu,zh-CN,es,fa,hi,it,ja,oc,pt,ru,tr,no,ro',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      }
      return;
    }

    // Ajouter le script Google Translate
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    document.body.appendChild(script);

    // Fonction callback appelée par Google
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,de,en,ar,eu,zh-CN,es,fa,hi,it,ja,oc,pt,ru,tr,no,ro',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  return <div id="google_translate_element"></div>;
}
