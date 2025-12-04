import { NextResponse } from "next/server";
import Parser from "rss-parser";

// Mots-clés intelligents
const keywordGroups = {
  cine: ["ciné", "cine", "cinéma", "projection", "projection-débat"],
  conf: ["conf", "conférence", "conférence-débat", "séminaire", "débat", "débat citoyen"],
  expo: ["expo", "exposition"],
  rencontre: ["rencontre", "rencontre culture", "rencontre connaissance"]
};

// Attribution de l’image
const getEventImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();

  if (keywordGroups.cine.some(k => lower.includes(k))) return "/images/capitole/capicine.jpg";
  if (keywordGroups.conf.some(k => lower.includes(k))) return "/images/capitole/capiconf.jpg";
  if (keywordGroups.expo.some(k => lower.includes(k))) return "/images/capitole/capiexpo.jpg";
  if (keywordGroups.rencontre.some(k => lower.includes(k))) return "/images/capitole/capiconf.jpg"; // même style que conf

  return "/images/capitole/capidefaut.jpg";
};

// Analyse de la date depuis le flux RSS
function parseEventDate(item: any): Date | null {
  const possibleFields = ["ev:startdate", "ev:date", "dc:date", "pubDate"];
  for (const field of possibleFields) {
    if (item[field]) {
      const date = new Date(item[field]);
      if (!isNaN(date.getTime())) return date; // UTC
    }
  }
  return null;
}

export async function GET() {
  try {
    const rssUrl =
      "https://www.ut-capitole.fr/adminsite/webservices/export_rss.jsp?NOMBRE=50&CODE_RUBRIQUE=1315555643369&LANGUE=0";

    const xml = await fetch(rssUrl).then(res => res.text());
    const parser = new Parser();
    const feed = await parser.parseString(xml);

    // Début du jour UTC
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const maxDate = new Date(utcToday);
    maxDate.setUTCDate(utcToday.getUTCDate() + 31);

    const events = feed.items
      .filter(item => {
        const haystack =
          ((item.title || "") + " " + (item.contentSnippet || "") + " " + (item.content || "")).toLowerCase();
        return Object.values(keywordGroups).some(group =>
          group.some(keyword => haystack.includes(keyword))
        );
      })
      .map(item => {
        const dt = parseEventDate(item);
        return {
          id: item.guid || item.link || item.title,
          title: item.title?.trim(),
          description: item.contentSnippet || item.content || "Événement UT Capitole",
          url: item.link,
          image: getEventImage(item.title),
          start: dt ? dt.toISOString() : null,
          end: null,
          location: null,
          source: "Université Toulouse Capitole"
        };
      })
      .filter(ev => ev.start)
      .filter(ev => {
        const start = new Date(ev.start!); // UTC
        return start >= utcToday && start <= maxDate;
      })
      .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());

    return NextResponse.json(events, { status: 200 });
  } catch (err) {
    console.error("Flux UT Capitole inaccessible :", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les événements UT Capitole." },
      { status: 500 }
    );
  }
}
