import { NextResponse } from "next/server";
import * as ical from "node-ical";
import Parser from "rss-parser";

const keywords = ["ciné", "conf", "expo"];

const getEventImage = (title: string | undefined) => {
  if (!title) return "/images/ut3/ut3default.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/ut3/ut3cine.jpg";
  if (lower.includes("conf")) return "/images/ut3/ut3conf.jpg";
  if (lower.includes("expo")) return "/images/ut3/ut3expo.jpg";
  return "/images/ut3/ut3default.jpg";
};

export async function GET() {
  try {
    // 1️⃣ Charger iCal
    const icalUrl =
      "https://www.univ-tlse3.fr/servlet/com.jsbsoft.jtf.core.SG?EXT=agenda&PROC=RECHERCHE_AGENDA&ACTION=EXPORT_DIRECT&THEMATIQUE=0000&DTSTART=01/11/2025&AFFICHAGE=mensuel&CODE_RUBRIQUE=WEB&CATEGORIE=0000&LIEU=0000&DTEND=31/12/2025";
    const res = await fetch(icalUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icsText = await res.text();
    const icalData = ical.parseICS(icsText);

    // 2️⃣ Charger RSS
    const rssUrl = "https://www.univ-tlse3.fr/actualites/flux-rss";
    const parser = new Parser();
    const rssFeed = await parser.parseURL(rssUrl);

    // 3️⃣ Construire les événements iCal filtrés
    const icalEvents = Object.values(icalData)
      .filter(ev => ev.type === "VEVENT")
      .map(ev => ({
        id: ev.uid,
        title: ev.summary,
        start: ev.start,
        end: ev.end,
        location: ev.location || null,
        description: ev.description || null,
        url: null, // à remplir depuis RSS
        image: getEventImage(ev.summary),
        source: "Université Toulouse III - Paul Sabatier",
      }))
      // filtrer par mots-clés
      .filter(ev =>
        ev.title && keywords.some(k => ev.title.toLowerCase().includes(k))
      );

    // 4️⃣ Associer URL depuis RSS via correspondance approximative sur le titre
    const events = icalEvents.map(ev => {
      const rssItem = rssFeed.items.find(item =>
        ev.title &&
        item.title &&
        item.title.toLowerCase().includes(ev.title.toLowerCase().substring(0, 20))
      );
      return {
        ...ev,
        url: rssItem?.link || null,
      };
    });

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("UT3 Agenda error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
