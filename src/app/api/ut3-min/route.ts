import { NextResponse } from "next/server";
import * as ical from "node-ical";
import Parser from "rss-parser";

const parser = new Parser();

export async function GET() {
  try {
    // 1️⃣ Récupération iCal
    const icalUrl =
      "https://www.univ-tlse3.fr/servlet/com.jsbsoft.jtf.core.SG?EXT=agenda&PROC=RECHERCHE_AGENDA&ACTION=EXPORT_DIRECT&THEMATIQUE=0000&DTSTART=01/11/2025&AFFICHAGE=mensuel&CODE_RUBRIQUE=WEB&CATEGORIE=0000&LIEU=0000&DTEND=31/12/2025";
    const icalRes = await fetch(icalUrl);
    if (!icalRes.ok) throw new Error(`HTTP ${icalRes.status}`);
    const icsText = await icalRes.text();
    const icalData = ical.parseICS(icsText);

    // 2️⃣ Récupération RSS UT3
    const rssUrl = "https://www.univ-tlse3.fr/actualites/flux-rss";
    const rssData = await parser.parseURL(rssUrl);

    // 3️⃣ Préparer les mots-clés pour images
    const getEventImage = (title: string | undefined) => {
      if (!title) return "/images/ut3/ut3default.jpg";
      const lower = title.toLowerCase();
      if (lower.includes("ciné") || lower.includes("cine")) return "/images/ut3/ut3cine.jpg";
      if (lower.includes("conf")) return "/images/ut3/ut3conf.jpg";
      if (lower.includes("expo")) return "/images/ut3/ut3expo.jpg";
      return "/images/ut3/ut3default.jpg";
    };

    const keywords = ["ciné", "conf", "expo"];

    // 4️⃣ Construire les événements
    const events = Object.values(icalData)
      .filter(ev => ev.type === "VEVENT")
      .map(ev => {
        // Chercher le lien et description dans RSS
        const rssMatch = rssData.items.find(item =>
          item.title && ev.summary && item.title.toLowerCase().includes(ev.summary.toLowerCase())
        );
        return {
          id: ev.uid,
          title: ev.summary,
          start: ev.start,
          end: ev.end,
          location: ev.location || null,
          description: rssMatch?.contentSnippet || null,
          url: rssMatch?.link || null,
          image: getEventImage(ev.summary),
          source: "Université Toulouse III - Paul Sabatier",
        };
      })
      // Filtrer par mots-clés
      .filter(ev => ev.title && keywords.some(k => ev.title.toLowerCase().includes(k)));

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("UT3 Agenda error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
