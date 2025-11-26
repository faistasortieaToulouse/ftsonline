import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

type RawItem = Parser.Item;

interface Event {
id: string;
title: string;
description: string;
start: string;
end: string | null;
location: string | null;
image: string | null;
url: string;
source: string;
}

const RSS_URL = "[https://www.canal-u.tv/chaines/ut2j/rss](https://www.canal-u.tv/chaines/ut2j/rss)";

async function fetchImageFromPage(url: string): Promise<string | null> {
try {
const res = await fetch(url);
if (!res.ok) return null;
const html = await res.text();
const $ = cheerio.load(html);

// Cherche l'image principale : souvent .field-name-field-image img
const img = $(".field-name-field-image img").first().attr("src");
return img ? (img.startsWith("http") ? img : `https://www.canal-u.tv${img}`) : null;

} catch {
return null;
}
}

export async function GET(req: NextRequest) {
const parser = new Parser();

try {
const feed = await parser.parseURL(RSS_URL);
const events: Event[] = await Promise.all(
  (feed.items || [])
    .map(async (item: RawItem) => {
      const pubDate = item.pubDate ? new Date(item.pubDate) : null;
      const url = item.link || "";
      let image: string | null = null;

      // Tenter de récupérer l'image depuis la page si le flux ne la fournit pas
      image = await fetchImageFromPage(url);

      return {
        id: item.guid || url || item.title || Math.random().toString(),
        title: item.title || "Untitled",
        description: item.contentSnippet || item.content || item.summary || "",
        start: pubDate ? pubDate.toISOString() : "",
        end: null,
        location: null,
        image,
        url,
        source: "UT2J‑Canal‑U",
      };
    })
);

return NextResponse.json(events.filter(ev => ev.start));

} catch (err: any) {
console.error("Erreur lors de la récupération du RSS UT2J :", err);
return NextResponse.json(
{ error: "Impossible de récupérer les événements UT2J" },
{ status: 500 }
);
}
}
