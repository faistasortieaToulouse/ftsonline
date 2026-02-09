import { NextResponse } from "next/server";
import fs from "fs/promises"; // Utilise la version promise pour éviter de bloquer le thread
import path from "path";
import xml2js from "xml2js";

const CACHE_FILE = path.join(process.cwd(), "data", "podterra-cache.json");
const RSS_URL = "https://www.vodio.fr/rssmedias.php?valeur=636";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1️⃣ Fetch direct du flux (Le serveur n'a pas besoin de proxy CORS)
    const res = await fetch(RSS_URL, {
      next: { revalidate: 0 }, // Empêche Next.js de mettre en cache le XML lui-même
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!res.ok) throw new Error(`Erreur récupération RSS: ${res.status}`);

    const xml = await res.text();
    const parsed = await xml2js.parseStringPromise(xml);
    const items = parsed.rss.channel[0].item || [];

    // 2️⃣ Extraction des épisodes
    const episodes = items.map((item: any) => ({
      guid: item.guid?.[0]?._ || item.guid?.[0] || Math.random().toString(),
      titre: item.title?.[0] || "Sans titre",
      date: item.pubDate?.[0] || "",
      description: item["content:encoded"]?.[0] || item.description?.[0] || "",
      audioUrl: item.enclosure?.[0]?.$?.url || "",
      image: item["itunes:image"]?.[0]?.$?.href || null,
      link: item.link?.[0] || null,
    }));

    // 3️⃣ Sauvegarde cache
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(episodes, null, 2), "utf-8");

    return NextResponse.json({ totalEpisodes: episodes.length, episodes });

  } catch (err: any) {
    console.error("Erreur update-cache podterra:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
