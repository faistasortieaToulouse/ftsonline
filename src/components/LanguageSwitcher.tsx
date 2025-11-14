'use client';

import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const changeLang = (lang: string) => {
    const pathParts = pathname.split("/").slice(2).join("/");
    router.push(`/${lang}/${pathParts}`);
  };

  return (
    <select
      onChange={(e) => changeLang(e.target.value)}
      defaultValue={pathname.split("/")[1]}
      className="border rounded p-2"
    >
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
      <option value="de">🇩🇪 Deutsch</option>
      <option value="es">🇪🇸 Español</option>
      <option value="ar">🇸🇦 العربية</option>
      <option value="zh-CN">🇨🇳 中文</option>
      <option value="fa">🇮🇷 فارسی</option>
      <option value="hi">🇮🇳 हिन्दी</option>
      <option value="it">🇮🇹 Italiano</option>
      <option value="ja">🇯🇵 日本語</option>
      <option value="oc">🇫🇷 Occitan</option>
      <option value="pt">🇵🇹 Português</option>
      <option value="ru">🇷🇺 Русский</option>
      <option value="tr">🇹🇷 Türkçe</option>
      <option value="no">🇳🇴 Norsk</option>
      <option value="ro">🇷🇴 Română</option>
    </select>
  );
}
