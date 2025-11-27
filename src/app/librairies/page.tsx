import { NextResponse } from "next/server";
import Parser from "rss-parser";

const RSS_URL = "https://rss.ausha.co/rss/librairie-mollat";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const librairie = searchParams.get("librairie") || "";
  const dateMin = searchParams.get("dateMin")
    ? new Date(searchParams.get("dateMin")!)
    : null;

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(RSS_URL);

    const allEpisodes: PodcastEpisode[] = feed.items.map((item) => ({
      librairie: "Librairie Mollat",
      titre: item.title || "Sans titre",
      date: item.pubDate || "",
      audioUrl: item.enclosure?.url || "",
      description: item.contentSnippet || "",
    }));

    let filtered = [...allEpisodes];

    if (q) {
      filtered = filtered.filter(
        (ep) =>
          ep.titre.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q)
      );
    }

    if (librairie) {
      filtered = filtered.filter((ep) => ep.librairie === librairie);
    }

    if (dateMin) {
      filtered = filtered.filter((ep) => new Date(ep.date) >= dateMin);
    }

    const totalEpisodes = filtered.length;
    const totalPages = Math.ceil(totalEpisodes / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginated,
      metadata: {
        totalEpisodes,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Erreur RSS:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Impossible de charger le flux audio.",
      },
      { status: 500 }
    );
  }
}
