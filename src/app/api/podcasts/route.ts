// src/app/api/podcasts/route.ts
import { NextResponse } from "next/server";
import Parser from "rss-parser";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const parser = new Parser();

async function fetchPodcast(librairie: string, rssUrl: string): Promise<PodcastEpisode[]> {
  try {
    const feed = await parser.parseURL(rssUrl);

    return feed.items.map(item => ({
      librairie,
      titre: item.title ?? "",
      date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
      audioUrl: item.enclosure?.url ?? "",
      description: item.contentSnippet ?? item.content ?? "",
    }));
  } catch (error) {
    console.error(`⚠️ Erreur lors du fetch du flux ${librairie}:`, error);
    // Fallback : on retourne un tableau vide pour ce flux
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
      fetchPodcast("Ombres Blanches", "https://feed.ausha.co/les-podcasts-d-ombres-blanches"),
      fetchPodcast("Terra Nova", "https://www.vodio.fr/rss/terranova"),
    ]);

    let allEpisodes = [...obEpisodes, ...tnEpisodes];

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

    allEpisodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
