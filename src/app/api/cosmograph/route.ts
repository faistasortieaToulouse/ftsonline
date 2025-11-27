import { NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function GET() {
try {
const res = await fetch("https://www.american-cosmograph.fr/");
const html = await res.text();

const $ = cheerio.load(html);

const events: any[] = [];

// Exemple générique : adapter le sélecteur selon la structure réelle du site
$('.event-item, article, .post').each((i, elem) => {
  const title = $(elem).find('h2, h3, .title').first().text().trim();
  const description = $(elem).find('.description, p').first().text().trim();
  const dateStr = $(elem).find('.date, time').first().attr('datetime') || $(elem).find('.date, time').first().text().trim();
  const url = $(elem).find('a').first().attr('href');

  if (title && dateStr) {
    const date = new Date(dateStr).toISOString();
    if (!isNaN(new Date(date).getTime()) && new Date(date) >= new Date()) {
      events.push({
        id: `cosmo-${i}`,
        title,
        description,
        date,
        url: url?.startsWith('http') ? url : `https://www.american-cosmograph.fr/${url}`,
        source: "American Cosmograph",
      });
    }
  }
});

return NextResponse.json({ total: events.length, events });

} catch (err: any) {
console.error("Erreur Scraping American Cosmograph :", err);
return NextResponse.json(
{ error: "Erreur Scraping American Cosmograph : " + (err.message || err) },
{ status: 500 }
);
}
}
