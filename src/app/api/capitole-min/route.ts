import { NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const keywords = ["ciné", "conf", "expo"];

const getEventImage = (title: string | undefined) => {
  if (!title) return "/images/capitole/capitole-default.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capitole-cine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capitole-conf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capitole-expo.jpg";
  return "/images/capitole/capitole-default.jpg";
};

export async function GET() {
  try {
    const url = "https://www.ut-capitole.fr/accueil/campus/espace-media/actualites/agenda-colloque-conference-seminaire";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const $ = cheerio.load(html);

    const events: any[] = [];

    // Modifier le sélecteur selon la structure HTML réelle des événements
    $(".actualite-list .actualite-item").each((_, el) => {
      const title = $(el).find(".actualite-title").text().trim();
      const link = $(el).find("a").attr("href");
      const description = $(el).find(".actualite-excerpt").text().trim() || "évènement ouvert à tout type de public extérieur à l'université";
      const date = $(el).find(".actualite-date").text().trim();
      const location = $(el).find(".actualite-location").text().trim() || "Toulouse";

      if (title && keywords.some(k => title.toLowerCase().includes(k))) {
        events.push({
          id: title + date,
          title,
          description,
          url: link ? (link.startsWith("http") ? link : "https://www.ut-capitole.fr" + link) : url,
          start: date,
          end: null,
          location,
          image: getEventImage(title),
          source: "Université Toulouse Capitole"
        });
      }
    });

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("UT Capitole Agenda error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
