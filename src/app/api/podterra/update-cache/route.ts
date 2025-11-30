import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";

const CACHE_FILE = path.join(process.cwd(), "data", "podterra-cache.json");
const RSS_URL = "https://www.vodio.fr/rssmedias.php?valeur=636";

export async function GET() {
  try {
    // 1️⃣ Fetch du flux via le proxy (évite 403)
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(RSS_URL)}`;
    const res = await fetch(`http://localhost:9002${proxyUrl}`);
    if (!res.ok) throw new Error(`Erreur récupération RSS: ${res.status}`);

    const xml = await res.text();
    const parsed = await xml2js.parseStringPromise(xml);
    const items = parsed.rss.channel[0].item || [];

    // 2️⃣ Extraction des épisodes
    const episodes = items.map((item: any) => ({
      guid: item.guid?.[0] || "",
      titre: item.title?.[0] || "Sans titre",
      date: item.pubDate?.[0] || "",
      description:
        item["content:encoded"]?.[0] ||
        item.description?.[0] ||
        "",
      audioUrl: item.enclosure?.[0]?.$?.url || item["media:content"]?.[0]?.$?.url || "",
      image: item["itunes:image"]?.[0]?.$?.href || item.image?.[0]?.url?.[0] || null,
      link: item.link?.[0] || null,
    }));

    // 3️⃣ Sauvegarde cache
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(episodes, null, 2), "utf-8");

    return NextResponse.json({ totalEpisodes: episodes.length, episodes });

  } catch (err: any) {
    console.error("Erreur update-cache podterra:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
