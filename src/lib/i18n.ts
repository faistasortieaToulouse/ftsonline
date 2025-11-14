import fr from "@/locales/fr.json";
import fr from "@/locales/de.json";
import fr from "@/locales/en.json";
import fr from "@/locales/ar.json";
import fr from "@/locales/eu.json";
import fr from "@/locales/zh-CN.json";
import fr from "@/locales/es.json";
import fr from "@/locales/fa.json";
import fr from "@/locales/hi.json";
import fr from "@/locales/it.json";
import fr from "@/locales/ja.json";
import fr from "@/locales/oc.json";
import fr from "@/locales/pt.json";
import fr from "@/locales/ru.json";
import fr from "@/locales/tr.json";
import fr from "@/locales/no.json";
import fr from "@/locales/ro.json";

const dictionaries = { fr, en, de, es /* ... */ };

export async function getDictionary(locale: keyof typeof dictionaries) {
  return dictionaries[locale];
}
