import { NextResponse } from "next/server";
import Parser from "rss-parser";

const getEventImage = () => "/images/ict-default.jpg";

export async function GET() {
try {
const rssUrl = "[https://hieronyma.ict-toulouse.fr/items/browse?output=rss2](https://hieronyma.ict-toulouse.fr/items/browse?output=rss2)";
const xml = await fetch(rssUrl).then(res => {
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return res.text();
});

const parser = new Parser();
const feed = await parser.parseString(xml);

const events = feed.items.map(item => ({
  id: item.guid || item.link || item.title,
  title: item.title?.trim(),
  description: item.contentSnippet || "Événement ICT",
  url: item.link,
  image: getEventImage(),
  start: item.pubDate ? new Date(item.pubDate).toISOString() : null,
  end: null,
  location: null,
  source: "Institut Catholique de Toulouse",
}));

return NextResponse.json(events);

} catch (err: any) {
console.error("Flux ICT inaccessible :", err);
return NextResponse.json({ error: "Impossible de récupérer les événements." }, { status: 500 });
}
}
