import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type JDSEvent = {
  title: string;
  date?: string;
  place?: string;
  url: string;
};

export async function GET() {
  try {
    const res = await fetch("https://www.jds.fr/toulouse/agenda/agenda-du-jour/-aujourdhui_JPJ", {
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API JDS :", errText);
      return NextResponse.json({ error: "Erreur API JDS", details: errText }, { status: res.status });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const events: JDSEvent[] = [];

    // Exemple : chaque événement est dans un bloc <article>
    $("article.agenda-item").each((_, el) => {
      const title = $(el).find("h3").text().trim();
      const date = $(el).find(".date").text().trim();
      const place = $(el).find(".lieu").text().trim();
      const url = $(el).find("a").attr("href");

      if (title) {
        events.push({
          title,
          date,
          place,
          url: url ? `https://www.jds.fr${url}` : "https://www.jds.fr/toulouse/agenda/agenda-du-jour/-aujourdhui_JPJ",
        });
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur", details: String(error) }, { status: 500 });
  }
}
