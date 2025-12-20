import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["dc:date", "dcDate"],
      ["media:content", "mediaContent"],
      ["enclosure", "enclosure"],
    ],
  },
});

const FEEDS = [
  { url: "https://www.lemonde.fr/rss/une.xml", source: "Le Monde" },
  { url: "https://www.francetvinfo.fr/titres.rss", source: "Franceinfo" },
  { url: "https://www.sudouest.fr/rss/essentiel/rss.xml", source: "Sud Ouest" },
  { url: "https://www.ladepeche.fr/rss.xml", source: "La Dépêche du Midi" },
  { url: "https://www.20minutes.fr/feeds/rss-toulouse.xml", source: "20 Minutes Toulouse" },
];

// chemin de l'image par défaut pour Sud Ouest
const DEFAULT_SUDOUEST_IMAGE = "/images/catesudouest.jpg";

function extractImage(item: any, feedSource: string): string | null {
  // 1️⃣ enclosure standard
  if (item.enclosure?.url) return item.enclosure.url;

  // 2️⃣ mediaContent (peut être tableau ou objet)
  const media = item.mediaContent;
  if (media) {
    if (Array.isArray(media)) {
      for (const m of media) {
        if (m?.url) return m.url;
        if (m?.$?.url) return m.$.url;
      }
    } else {
      if (media.url) return media.url;
      if (media.$?.url) return media.$.url;
    }
  }

  // 3️⃣ image dans contentEncoded
  if (typeof item.contentEncoded === "string") {
    const match = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/i);
    if (match) return match[1];
  }

  // 4️⃣ image par défaut si Sud Ouest
  if (feedSource === "Sud Ouest") {
    return DEFAULT_SUDOUEST_IMAGE;
  }

  // sinon pas d'image
  return null;
}

function normalizeDate(item: any, feed: any): string {
  const raw =
    item.pubDate ||
    item.isoDate ||
    item.dcDate ||
    feed.lastBuildDate ||
    feed.pubDate ||
    null;

  const date = raw ? new Date(raw) : null;
  return date && !isNaN(date.getTime())
    ? date.toISOString()
    : new Date().toISOString();
}

export async function GET() {
  const articles: any[] = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items || []) {
        articles.push({
          id: crypto.randomUUID(),
          title: item.title ?? "Sans titre",
          description:
            item.contentSnippet ||
            item.contentEncoded ||
            parsed.description ||
            "",
          publishedAt: normalizeDate(item, parsed),
          image: extractImage(item, feed.source),
          url: item.link,
          source: feed.source,
        });
      }
    } catch (err) {
      console.error(`Erreur flux : ${feed.source}`, err);
    }
  }

  // tri chronologique
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
  );

  return NextResponse.json(articles, { status: 200 });
}
