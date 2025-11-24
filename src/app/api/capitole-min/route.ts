import { NextResponse } from "next/server";
import Parser from "rss-parser";

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
    const rssUrl = "https://www.ut-capitole.fr/adminsite/webservices/export_rss.jsp?NOMBRE=50&CODE_RUBRIQUE=1315555643369&LANGUE=0";
    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);

    const events = feed.items
      .filter(item =>
        item.title && keywords.some(k => item.title.toLowerCase().includes(k))
      )
      .map(item => ({
        id: item.guid || item.link || item.title,
        title: item.title,
        description: "évènement ouvert à tout type de public extérieur à l'université",
        url: item.link,
        image: getEventImage(item.title),
        start: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        end: null,
        location: null, // le flux ne fournit pas le lieu
        source: "Université Toulouse Capitole"
      }));

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Flux UT Capitole inaccessible :", err);
    return NextResponse.json({ error: "Impossible de récupérer les événements." }, { status: 500 });
  }
}
