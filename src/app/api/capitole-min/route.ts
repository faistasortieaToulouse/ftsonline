import { NextResponse } from "next/server";
import Parser from "rss-parser";

const keywords = ["ciné", "cine", "conf", "expo"];

const getEventImage = (title: string | undefined) => {
  if (!title) return "/images/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capicine.jpg";
  if (lower.includes("conf")) return "/images/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capiexpo.jpg";
  return "/images/capidefaut.jpg";
};

export async function GET() {
  try {
    const rssUrl =
      "https://www.ut-capitole.fr/adminsite/webservices/export_rss.jsp?NOMBRE=50&CODE_RUBRIQUE=1315555643369&LANGUE=0";

    const xml = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible)",
        Accept: "application/rss+xml, application/xml",
      },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    });

    const parser = new Parser();
    const feed = await parser.parseString(xml);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // minuit

    const events = feed.items
      .filter(
        (item) =>
          item.title &&
          keywords.some((k) => item.title.toLowerCase().includes(k))
      )
      .map((item) => {
        let startDate: Date | null = item.pubDate ? new Date(item.pubDate) : null;

        // 🔥 Correction demandée :
        // Si date invalide ou dépassée → remplacer par aujourd’hui
        if (!startDate || isNaN(startDate.getTime()) || startDate < today) {
          startDate = new Date(today);
        }

        return {
          id: item.guid || item.link || item.title,
          title: item.title?.trim(),
          description: item.contentSnippet || "Événement ouvert à tous",
          url: item.link,
          image: getEventImage(item.title),
          start: startDate.toISOString(),
          end: null,
          location: null,
          source: "Université Toulouse Capitole",
        };
      });

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Flux UT Capitole inaccessible :", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les événements." },
      { status: 500 }
    );
  }
}
