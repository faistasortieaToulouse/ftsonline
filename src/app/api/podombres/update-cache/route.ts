import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";

// Utiliser une constante pour le chemin du cache
const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_PATH = path.join(CACHE_DIR, "podombres-cache.json");

// Désactiver la mise en cache de cette route par Next.js (important !)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const parser = new Parser();
    // Flux Ausha de la librairie Ombres Blanches
    const feed = await parser.parseURL("https://feed.ausha.co/kk2J1iKdlOXE");

    // Extraire et formater les épisodes
    const episodes = feed.items.map(item => ({
      titre: item.title || "Sans titre",
      date: item.isoDate || item.pubDate || new Date().toISOString(),
      description: item.contentSnippet || item.description || "", // contentSnippet est souvent plus propre pour l'affichage
      audioUrl: item.enclosure?.url || "",
      guid: item.guid || item.link || Math.random().toString(),
    }));

    // 1. S'assurer que le dossier /data existe
    await fs.mkdir(CACHE_DIR, { recursive: true });

    // 2. Écrire le cache en une seule opération
    await fs.writeFile(CACHE_PATH, JSON.stringify(episodes), "utf-8");

    console.log(`✅ Cache podombres mis à jour : ${episodes.length} épisodes`);

    return NextResponse.json({ 
      success: true,
      totalEpisodes: episodes.length, 
      episodes 
    }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Erreur update-cache podombres:", err);
    return NextResponse.json(
      { error: "Échec du scraping RSS", details: err.message },
      { status: 500 }
    );
  }
}
