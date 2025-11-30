// src/app/api/podmollat2/update-cache/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";

// Chemin cache local
const CACHE_FILE = path.join(process.cwd(), "data", "podmollat2-cache.json");
// RSS Mollat
const RSS_URL = "https://www.vodio.fr/rssmedias.php?valeur=626";

// Fonction pour extraire la date depuis la description si pubDate manquant
function extractDateFromDescription(desc: string): string {
  if (!desc) return "";
  const match = desc.match(/(\d{1,2}\s\w+\s\d{4})/); // ex: "15 mai 2025"
  if (match) {
    // Reformat en Date ISO
    try {
      const parts = match[1].split(" ");
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      // Conversion mois FR -> numéro mois
      const months: Record<string, string> = {
        janvier: "01", février: "02", mars: "03", avril: "04", mai: "05",
        juin: "06", juillet: "07", août: "08", septembre: "09", octobre: "10",
        novembre: "11", décembre: "12",
      };
      const monthNum = months[month.toLowerCase()] || "01";
      return `${year}-${monthNum}-${day.padStart(2,"0")}T00:00:00.000Z`;
    } catch {
      return "";
    }
  }
  return "";
}

export async function GET() {
  try {
    const res = await fetch(RSS_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Impossible de récupérer le flux RSS: ${res.status}`);
    const xml = await res.text();
    if (!xml.trim()) throw new Error("Flux RSS vide");

    const parsed = await xml2js.parseStringPromise(xml);
    const items = parsed?.rss?.channel?.[0]?.item || [];

    const episodes = items.map((item: any) => {
      const audioRaw = item.enclosure?.[0]?.$?.url || item["media:content"]?.[0]?.$?.url || "";
      const description = item["content:encoded"]?.[0] || item.description?.[0] || "";

      // Priorité : pubDate RSS, fallback description
      const dateStr = item.pubDate?.[0] || extractDateFromDescription(description);

      return {
        guid: item.guid?.[0] || item.link?.[0] || Math.random().toString(),
        titre: item.title?.[0] || "Sans titre",
        date: dateStr,
        description,
        audioUrl: audioRaw ? `/api/proxy-audio?url=${encodeURIComponent(audioRaw)}` : "",
        image: item["itunes:image"]?.[0]?.$?.href || item.image?.[0]?.url?.[0] || null,
        link: item.link?.[0] || null,
      };
    });

    // Écriture cache
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(episodes, null, 2), "utf-8");

    console.log(`[Mollat Update Cache] Cache mis à jour avec ${episodes.length} épisodes.`);
    return NextResponse.json({ data: episodes, totalEpisodes: episodes.length });

  } catch (err: any) {
    console.error("[Mollat Update Cache] Erreur:", err.message);
    return NextResponse.json({ data: [], totalEpisodes: 0, error: err.message }, { status: 500 });
  }
}
