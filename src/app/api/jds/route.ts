import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type JDSEvent = {
  title: string;
  description?: string;
  url: string;
  image?: string;
  categories?: string[];
};

export async function GET() {
  try {
    const res = await fetch("https://www.jds.fr/toulouse/agenda/agenda-du-jour/-aujourdhui_JPJ", {
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Erreur JDS", details: errText }, { status: res.status });
    }

    const html = await res.text();
    // 👉 Mets ton console.log ici
    console.log(html.substring(0, 2000));
    const $ = cheerio.load(html);

    const events: JDSEvent[] = [];

    $("article.agenda-item").each((_, el) => {
      const title = $(el).find("a.titre").text().trim();
      const url = $(el).find("a.titre").attr("href");
      const description = $(el).find("span.description").text().trim();
      const image = $(el).find("a.image img").attr("src");
      const categories = $(el).find(".rubriques span").map((_, s) => $(s).text().trim()).get();

      if (title) {
        events.push({
          title,
          description,
          url: url ? `https://www.jds.fr${url}` : "",
          image,
          categories,
        });
      }
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur", details: String(error) }, { status: 500 });
  }
}
