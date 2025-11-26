import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

type RawItem = Parser.Item;

interface Event {
id: string;
title: string;
description: string;
date: string;
image: string | null;
url: string;
source: string;
}

const RSS_URL = "[https://hieronyma.ict-toulouse.fr/items/browse?output=rss2](https://hieronyma.ict-toulouse.fr/items/browse?output=rss2)";

export async function GET(req: NextRequest) {
const parser = new Parser();

try {
const feed = await parser.parseURL(RSS_URL);
const events: Event[] = (feed.items || []).map((item: RawItem) => {
const enclosureUrl = (item.enclosure && item.enclosure.url) || null;
return {
id: item.guid || item.link || item.title || Math.random().toString(),
title: item.title || "Untitled",
description: item.description || "",
date: item.pubDate ? new Date(item.pubDate).toISOString() : "",
image: enclosureUrl,
url: item.link || "",
source: "ICT-Hieronyma",
};
});

return NextResponse.json(events);  

} catch (err: any) {
console.error("Erreur récupération RSS ICT :", err);
return NextResponse.json({ error: "Impossible de récupérer les événements ICT" }, { status: 500 });
}
}
