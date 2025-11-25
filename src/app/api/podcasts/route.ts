import { NextResponse } from "next/server";
import Parser from "rss-parser";
import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const rssParser = new Parser();
const xmlParser = new XMLParser({ ignoreAttributes: false, allowBooleanAttributes: true });

async function fetchOmbresBlanches(): Promise<PodcastEpisode[]> {
  try {
    const feed = await rssParser.parseURL("https://feed.ausha.co/les-podcasts-d-ombres-blanches");
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

async function fetchTerraNova(): Promise<PodcastEpisode[]> {
  try {
    const res = await fetch("https://www.vodio.fr/rss/terranova");
    const xml = await res.text();
    const parsed = xmlParser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    return (Array.isArray(items) ? items : [items]).map((item: any) => ({
      librairie: "Terra Nova",
      titre: item.title ?? "",
      date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
      audioUrl: item.enclosure?.["@_url"] ?? "",
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

    const [obEpisodes, tnEpisodes] = await Promise.all([
      fetchOmbresBlanches(),
      fetchTerraNova(),
    ]);

    let allEpisodes = [...obEpisodes, ...tnEpisodes];

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
