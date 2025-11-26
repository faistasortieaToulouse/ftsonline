import { NextResponse } from "next/server";
import Parser from "rss-parser";

const keywords = ["ciné", "cine", "conf", "expo"];

const getEventImage = (title?: string) => {
if (!title) return "/images/default.jpg";
const lower = title.toLowerCase();
if (lower.includes("ciné") || lower.includes("cine")) return "/images/cine.jpg";
if (lower.includes("conf")) return "/images/conf.jpg";
if (lower.includes("expo")) return "/images/expo.jpg";
return "/images/default.jpg";
};

export async function GET() {
try {
const rssUrl = "https://www.inp-toulouse.fr/rss-events.xml"; // mettre le vrai RSS INP
const xml = await fetch(rssUrl, {
headers: {
"User-Agent": "Mozilla/5.0",
"Accept": "application/rss+xml, application/xml",
},
}).then(res => {
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return res.text();
});

const parser = new Parser();
const feed = await parser.parseString(xml);

const events = feed.items
  .filter(item => item.title && keywords.some(k => item.title.toLowerCase().includes(k)))
  .map(item => ({
    id: item.guid || item.link || item.title,
    title: item.title?.trim(),
    description: item.contentSnippet || "Événement ouvert à tous",
    url: item.link,
    image: getEventImage(item.title),
    start: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    end: null,
    location: null,
    source: "INP Toulouse",
  }));

return NextResponse.json(events);

} catch (err: any) {
console.error("Flux INP inaccessible :", err);
return NextResponse.json({ error: "Impossible de récupérer les événements." }, { status: 500 });
}
}
