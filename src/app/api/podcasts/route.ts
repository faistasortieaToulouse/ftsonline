import { NextResponse } from "next/server";
import Parser from "rss-parser";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const parser = new Parser();

// --- Ombres Blanches avec rss-parser ---
async function fetchOmbresBlanches(): Promise<PodcastEpisode[]> {
  try {
    const feed = await parser.parseURL("https://feed.ausha.co/les-podcasts-d-ombres-blanches");
    return feed.items.map(item => ({
      librairie: "Ombres Blanches",
      titre: item.title ?? "",
      date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
      audioUrl: item.enclosure?.url ?? "",
      description: item.contentSnippet ?? item.content ?? "",
    }));
  } catch (err) {
    console.error("⚠️ Erreur Ombres Blanches:", err);
    return [];
  }
}

// --- Terra Nova avec xml2js (plus tolérant) ---
async function fetchTerraNova(): Promise<PodcastEpisode[]> {
  try {
    const res = await fetch("https://www.vodio.fr/rss/terranova");
    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });

    const items = parsed?.rss?.channel?.item ?? [];
    return (Array.isArray(items) ? items : [items]).map((item: any) => ({
      librairie: "Terra Nova",
      titre: item.title ?? "",
      date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
      audioUrl: item.enclosure?.$.url ?? "",
      description: item.description ?? "",
    }));
  } catch (err) {
    console.error("⚠️ Erreur Terra Nova:", err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const librairieFilter = searchParams.get("librairie") || "";
    const dateMin = searchParams.get("dateMin");

    const [obEpisodes, tnEpisodes] = await Promise.all([
      fetchOmbresBlanches(),
      fetchTerraNova(),
    ]);

    let allEpisodes = [...obEpisodes, ...tnEpisodes];

    // 🔎 Filtrage
    if (query) {
      allEpisodes = allEpisodes.filter(
        ep =>
          ep.titre.toLowerCase().includes(query) ||
          ep.description.toLowerCase().includes(query)
      );
    }
    if (librairieFilter) {
      allEpisodes = allEpisodes.filter(ep => ep.librairie === librairieFilter);
    }
    if (dateMin) {
      const minDate = new Date(dateMin);
      allEpisodes = allEpisodes.filter(ep => new Date(ep.date) >= minDate);
    }

    // Tri par date
    allEpisodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedEpisodes = allEpisodes.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedEpisodes,
      metadata: {
        totalEpisodes: allEpisodes.length,
        page,
        limit,
        totalPages: Math.ceil(allEpisodes.length / limit),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erreur globale API podcasts:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors du traitement des flux RSS." },
      { status: 500 }
    );
  }
}
