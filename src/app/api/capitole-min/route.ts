import { NextResponse } from "next/server";
import Parser from "rss-parser";

const keywords = ["ciné", "cine", "conf", "expo"];

const getEventImage = (title?: string) => {
  if (!title) return "/images/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capicine.jpg";
  if (lower.includes("conf")) return "/images/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capiexpo.jpg";
  return "/images/capidefaut.jpg";
};

function parseEventDate(item: any): Date | null {
  const possibleFields = ["ev:startdate", "ev:date", "dc:date", "pubDate"];
  for (const field of possibleFields) {
    if (item[field]) {
      const date = new Date(item[field]);
      if (!isNaN(date.getTime())) return date;
    }
  }
  return null;
}

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
    today.setHours(0, 0, 0, 0); // pour comparer les dates sans l'heure
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 31);

    const events = feed.items
      .filter((item) => item.title && keywords.some((k) => item.title.toLowerCase().includes(k)))
      .map((item) => {
        const startDate = parseEventDate(item);
        return {
          id: item.guid || item.link || item.title,
          title: item.title?.trim(),
          description: item.contentSnippet || "Événement ouvert à tous",
          url: item.link,
          image: getEventImage(item.title),
          start: startDate ? startDate.toISOString() : null,
          end: null,
          location: null,
          source: "Université Toulouse Capitole",
        };
      })
      .filter((ev) => ev.start)
      .filter((ev) => {
        const start = new Date(ev.start!);
        return start >= today && start <= maxDate;
      })
      .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Flux UT Capitole inaccessible :", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les événements." },
      { status: 500 }
    );
  }
}
