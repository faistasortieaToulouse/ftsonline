import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import de from "@/locales/de.json";
import es from "@/locales/es.json";
// ... importe toutes les autres langues

const dictionaries = { fr, en, de, es /* ... */ };

export async function getDictionary(locale: keyof typeof dictionaries) {
  return dictionaries[locale];
}
