import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const res = await fetch("https://www.jds.fr/toulouse/agenda/musique-et-concerts-96_B", {
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Erreur JDS", details: errText }, { status: res.status });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const events: any[] = [];

    $("article").each((_, el) => {
      const title = $(el).find("h2, h3").text().trim();
      const date = $(el).find(".bi-clock").parent().text().trim();
      const place = $(el).find(".bi-geo-alt").parent().text().trim();
      const price = $(el).find(".bi-currency-euro").parent().text().trim();
      const description = $(el).find(".description").text().trim();
      const url = $(el).find("a").attr("href");

      if (title) {
        events.push({
          title,
          date,
          place,
          price,
          description,
          url: url ? `https://www.jds.fr${url}` : null,
        });
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur", details: String(error) }, { status: 500 });
  }
}
