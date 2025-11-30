// src/app/api/podmollat2/update-cache/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";

// Cache spécifique Mollat
const CACHE_FILE = path.join(process.cwd(), "data", "podmollat2-cache.json");
// RSS Mollat (remplace ici par le flux correct si besoin)
const RSS_URL = "https://www.vodio.fr/rssmedias.php?valeur=626";

export async function GET() {
  try {
    const res = await fetch(RSS_URL);
    if (!res.ok) throw new Error(`Impossible de récupérer le flux RSS: ${res.status}`);
    const xml = await res.text();

    const parsed = await xml2js.parseStringPromise(xml);
    const items = parsed.rss.channel[0].item || [];

    const episodes = items.map((item: any) => ({
      guid: item.guid?.[0] || "",
      titre: item.title?.[0] || "Sans titre",
      date: item.pubDate?.[0] || "",
      description: item["content:encoded"]?.[0] || item.description?.[0] || "",
      audioUrl: item.enclosure?.[0]?.$?.url || item["media:content"]?.[0]?.$?.url || "",
      image: item["itunes:image"]?.[0]?.$?.href || item.image?.[0]?.url?.[0] || null,
      link: item.link?.[0] || null,
    }));

    // Écriture cache
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(episodes, null, 2), "utf-8");

    // 🔥 Renvoie avec audioUrl transformé pour proxy
    const dataWithProxy = episodes.map(ep => ({
      ...ep,
      audioUrl: ep.audioUrl ? `/api/proxy-audio?url=${encodeURIComponent(ep.audioUrl)}` : "",
    }));

    return NextResponse.json({ totalEpisodes: dataWithProxy.length, data: dataWithProxy });
  } catch (err: any) {
    console.error("[Mollat Update Cache] Erreur:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
