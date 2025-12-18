import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import cheerio from "cheerio";

const MONTHS: Record<string, number> = {
  janv: 0, fév: 1, fev: 1, mars: 2, avr: 3, mai: 4, juin: 5, juil: 6,
  août: 7, aout: 7, sept: 8, oct: 9, nov: 10, déc: 11, dec: 11
};

function parseFrenchDate(text: string): Date | null {
  const match = text.match(/(\d{1,2}|1er)\s([a-zéû]+)/i);
  if (!match) return null;
  const day = match[1] === "1er" ? 1 : parseInt(match[1], 10);
  const month = MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;
  const now = new Date();
  let year = now.getFullYear();
  const date = new Date(year, month, day);
  return date < now ? new Date(year + 1, month, day) : date;
}

export async function GET() {
  const feedUrl = "https://www.ecluse-prod.com/category/agenda/feed/";

  try {
    const res = await fetch(feedUrl, { headers: { "User-Agent": "Next.js" }, cache: "no-store" });
    if (!res.ok) return NextResponse.json({ total: 0, events: [] });

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item;
    if (!item?.["content:encoded"]) return NextResponse.json({ total: 0, events: [] });

    const html = item["content:encoded"];
    const $ = cheerio.load(html);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 31);

    const events: any[] = [];

    $("li").each((_, el) => {
      const text = $(el).text();
      if (!text.includes("(31)") && !text.toUpperCase().includes("TOULOUSE")) return;

      const dateText = $(el).find("strong").first().text();
      const date = parseFrenchDate(dateText);
      if (!date || date < today || date > maxDate) return;

      const title = $(el).find("em").first().text().trim() || text.split("–")[0].trim();
      const descriptionMatch = text.match(/\(([^)]+)\)/);
      const description = descriptionMatch ? descriptionMatch[1] : "";

      const location = text.split("–")[1]?.trim() ?? "Théâtre du Grand Rond, Toulouse (31)";

      events.push({
        id: `ecluse-${date.toISOString()}-${title}`,
        title,
        description,
        date: date.toISOString(),
        location,
        source: "L'Écluse",
        image: "/images/ecluse/ecluse-default.jpg",
        link: "https://www.ecluse-prod.com/category/agenda/",
      });
    });

    return NextResponse.json({
      total: events.length,
      events,
    });
  } catch (err) {
    console.error("Erreur Ecluse:", err);
    return NextResponse.json({ total: 0, events: [] }, { status: 500 });
  }
}
