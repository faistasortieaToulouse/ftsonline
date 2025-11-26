import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

interface Event {
id: string;
title: string;
description: string;
start: string;        // date ISO (publication date)
end: string | null;
location: string | null;
image: string | null;
url: string;
source: string;
}

const BASE_URL = "[https://www.canal-u.tv/recherche?f%5B0%5D=chaine:375&sort_by=field_date_publication_1](https://www.canal-u.tv/recherche?f%5B0%5D=chaine:375&sort_by=field_date_publication_1)";

async function fetchAllPages(): Promise<Event[]> {
let page = 0;
const events: Event[] = [];
let hasNextPage = true;

while (hasNextPage) {
page++;
const url = `${BASE_URL}&page=${page}`;
const res = await fetch(url);
if (!res.ok) break;

const html = await res.text();
const $ = cheerio.load(html);

const videos = $(".view-content .views-row");
if (videos.length === 0) {
  hasNextPage = false;
  break;
}

videos.each((_, el) => {
  const title = $(el).find(".views-field-title a").text().trim() || "Untitled";
  const urlPath = $(el).find(".views-field-title a").attr("href") || "";
  const imageSrc = $(el).find(".field-name-field-image img").attr("src") || "/default-cover.jpg";
  const description = $(el).find(".views-field-field-description").text().trim() || "";

  // extraire la date de publication si disponible
  const pubDateText = $(el).find(".views-field-created span").attr("content") || "";
  const start = pubDateText ? new Date(pubDateText).toISOString() : "";

  events.push({
    id: `${urlPath}-${page}`,
    title,
    description,
    start,
    end: null,
    location: null,
    image: imageSrc.startsWith("http") ? imageSrc : `https://www.canal-u.tv${imageSrc}`,
    url: urlPath ? `https://www.canal-u.tv${urlPath}` : "",
    source: "UT2J‑Canal‑U",
  });
});
}

return events;
}

export async function GET(req: NextRequest) {
try {
const events = await fetchAllPages();
return NextResponse.json(events);
} catch (err: any) {
console.error("Erreur lors de la récupération des événements UT2J :", err);
return NextResponse.json(
{ error: "Impossible de récupérer les événements UT2J" },
{ status: 500 }
);
}
}
