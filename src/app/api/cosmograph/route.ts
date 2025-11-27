// src/app/api/american-cosmograph/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { getCache, setCache } from "@/lib/serverCache";

const URL = "https://www.american-cosmograph.fr/";
const CACHE_KEY = "american-cosmograph";
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 heures

export async function GET() {
  // Vérification du cache
  const cached = getCache(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const res = await fetch(URL, {
      headers: { "User-Agent": "NextJS Scraper" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed with status ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const events: any[] = [];

    // Sélecteurs génériques, à adapter si le site change
    $(".event-item, article, .post").each((i, elem) => {
      const title = $(elem).find("h2, h3, .title").first().text().trim();
      const description = $(elem).find(".description, p").first().text().trim();
      const dateStr =
        $(elem).find(".date, time").first().attr("datetime") ||
        $(elem).find(".date, time").first().text().trim();
      const urlAttr = $(elem).find("a").first().attr("href");
      const url = urlAttr?.startsWith("http") ? urlAttr : URL + (urlAttr || "");

      if (title && dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime()) && date >= new Date()) {
          events.push({
            id: `cosmo-${i}`,
            title,
            description: description || "Événement ouvert à tous",
            date: date.toISOString(),
            url,
            source: "American Cosmograph",
          });
        }
      }
    });

    // Mise en cache
    setCache(CACHE_KEY, events, CACHE_TTL);

    return NextResponse.json({ total: events.length, events });
  } catch (err: any) {
    console.error("Erreur Scraping American Cosmograph :", err);
    return NextResponse.json(
      { error: "Erreur Scraping American Cosmograph : " + (err.message || err) },
      { status: 500 }
    );
  }
}
