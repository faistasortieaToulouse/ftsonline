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

// extrait la vraie date depuis item.content
function extractRealDate(html: string | undefined) {
  if (!html) return null;

  // Cas 1 : "14 novembre 2025 à 18:00"
  let match = html.match(/(\d{1,2} \w+ \d{4})(?: à (\d{2}:\d{2}))?/i);
  if (match) {
    const [_, dateStr, timeStr] = match;

    const final = timeStr ? `${dateStr} ${timeStr}` : dateStr;

    return final.trim();
  }

  // Cas 2 : "Du 14 novembre 2025 au 15 novembre 2025"
  match = html.match(/du (.*?) au (.*?)(<|$)/i);
  if (match) {
    return match[1].trim();
  }

  return null;
}

export async function GET() {
  try {
    const rssUrl =
      "https://www.ut-capitole.fr/adminsite/webservices/export_rss.jsp?NOMBRE=50&CODE_RUBRIQUE=1315555643369&LANGUE=0";

    const xml = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/rss+xml, application/xml"
      }
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    });

    const parser = new Parser({ customFields: { item: ["content"] } });
    const feed = await parser.parseString(xml);

    const events = feed.items
      .filter(item =>
        item.title &&
        keywords.some(k => item.title.toLowerCase().includes(k))
      )
      .map(item => {
        const realDate = extractRealDate(item.content);

        return {
          id: item.guid || item.link || item.title,
          title: item.title?.trim(),
          description: item.contentSnippet || "Événement ouvert à tous",
          url: item.link,
          image: getEventImage(item.title),
          start: realDate,
          end: null,
          location: null,
          source: "Université Toulouse Capitole"
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
