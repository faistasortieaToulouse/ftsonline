// app/api/ecluse/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const MONTHS: Record<string, number> = {
  janv: 0,
  févr: 1,
  fevr: 1,
  mars: 2,
  avr: 3,
  mai: 4,
  juin: 5,
  juil: 6,
  août: 7,
  aout: 7,
  sept: 8,
  oct: 9,
  nov: 10,
  déc: 11,
  dec: 11,
};

function parseFrenchDate(text: string): Date | null {
  const match = text.match(/(\d{1,2})\s([a-zéû]+)/i);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;

  const now = new Date();
  let year = now.getFullYear();

  let date = new Date(year, month, day);
  if (date < now) {
    date = new Date(year + 1, month, day);
  }

  return date;
}

export async function GET() {
  const url = "https://www.ecluse-prod.com/category/agenda/";

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ events: [] });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 31);

    const events: any[] = [];

    $("li").each((_, el) => {
      const text = $(el).text();

      // 🔹 Filtre Haute-Garonne
      if (!text.includes("(31)")) return;
      if (!text.toUpperCase().includes("TOULOUSE")) return;

      const dateText = $(el).find("strong").first().text();
      const date = parseFrenchDate(dateText);
      if (!date || date < today || date > maxDate) return;

      const title = $(el).find("em").first().text().trim();

      events.push({
        id: `ecluse-${date.toISOString()}-${title}`,
        title,
        date: date.toISOString(),
        location: "Théâtre du Grand Rond, Toulouse (31)",
        source: "L'Écluse",
        categories: ["L'Écluse"],
        image: "/images/ecluse/ecluse-default.jpg",
        link: url,
      });
    });

    return NextResponse.json({ total: events.length, events });
  } catch (err) {
    console.error("Erreur L'Écluse :", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
