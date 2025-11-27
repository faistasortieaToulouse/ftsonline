import { NextResponse } from "next/server";
import Parser from "rss-parser";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const rssParser = new Parser();

// --- Fonction générique via proxy ---
async function fetchViaProxy(url: string, librairie: string, baseUrl: string): Promise<PodcastEpisode[]> {
  try {
    const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
    const feed = await rssParser.parseURL(proxyUrl);

    return feed.items.map(item => ({
      librairie,
      titre: item.title ?? "",
      date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
      audioUrl: item.enclosure?.url ?? "",
      description: item.contentSnippet ?? item.content ?? "",
    }));
  } catch (err) {
    console.error(`⚠️ Erreur ${librairie}:`, err);
    return [{
      librairie,
      titre: "Flux indisponible",
      date: new Date().toISOString(),
      audioUrl: "",
      description: `Le flux RSS de ${librairie} est inaccessible.`
    }];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const librairieFilter = searchParams.get("librairie") || "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const [ob, tn, mdm, mollat] = await Promise.all([
      fetchViaProxy("https://feed.ausha.co/kk2J1iKdlOXE", "Ombres Blanches", baseUrl),
      fetchViaProxy("https://www.vodio.fr/rssmedias.php?valeur=636", "Terra Nova", baseUrl),
      fetchViaProxy("https://feed.ausha.co/BnYn5Uw5W3WO", "Marathon des mots", baseUrl),
      fetchViaProxy("https://feed.ausha.co/lheure-des-livres-mollat", "Librairie Mollat", baseUrl),
    ]);

    let allEpisodes = [...ob, ...tn, ...mdm, ...mollat];

    // Filtrage
    if (query) {
      allEpisodes = allEpisodes.filter(
        ep => ep.titre.toLowerCase().includes(query) || ep.description.toLowerCase().includes(query)
      );
    }
    if (librairieFilter) {
      allEpisodes = allEpisodes.filter(ep => ep.librairie === librairieFilter);
    }

    // Tri par date décroissante
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
  } catch (err) {
    console.error("Erreur globale API podcasts:", err);
    return NextResponse.json(
      { success: false, message: "Erreur lors du traitement des flux RSS." },
      { status: 500 }
    );
  }
}
