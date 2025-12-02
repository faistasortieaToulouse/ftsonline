import { NextResponse } from "next/server";
import Parser from "rss-parser";

export async function GET() {
const rssUrl = "[https://31.agendaculturel.fr/rss](https://31.agendaculturel.fr/rss)";
const parser = new Parser();
let events: any[] = [];

try {
// Récupération du flux RSS
const feed = await parser.parseURL(rssUrl);

```
// Vérification de la présence d'items
events = Array.isArray(feed.items) ? feed.items : [];
```

} catch (error) {
console.error("Erreur fetch ou parsing RSS agendaculturel:", error);
events = []; // fallback vide
}

// Transformation minimale pour la réponse
const formattedEvents = events.map((item) => ({
title: item.title || "Sans titre",
link: item.link || "#",
pubDate: item.pubDate || null,
contentSnippet: item.contentSnippet || "",
}));

return NextResponse.json({ count: formattedEvents.length, events: formattedEvents });
}
