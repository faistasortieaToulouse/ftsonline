// src/app/api/ut3-min/route.ts
import { NextResponse } from "next/server";
import * as ical from "node-ical";

export async function GET() {
  try {
    const url =
      "https://www.univ-tlse3.fr/servlet/com.jsbsoft.jtf.core.SG?EXT=agenda&PROC=RECHERCHE_AGENDA&ACTION=EXPORT_DIRECT&THEMATIQUE=0000&DTSTART=01/11/2025&AFFICHAGE=mensuel&CODE_RUBRIQUE=WEB&CATEGORIE=0000&LIEU=0000&DTEND=31/12/2025";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icsText = await res.text();

    const data = ical.parseICS(icsText);

    const keywords = ["ciné", "conf", "expo"];

    const events = Object.values(data)
      .filter(ev => ev.type === "VEVENT")
      .map(ev => {
        // Extraire l’URL propre
        let eventUrl = "";
        if (ev.url) {
          if (typeof ev.url === "string") eventUrl = ev.url;
          else if (ev.url.value) eventUrl = ev.url.value;
        }

        // Extraire l’attachment comme image
        let imageUrl: string | null = null;
        if (ev.attach) {
          if (Array.isArray(ev.attach) && ev.attach.length > 0) {
            imageUrl = ev.attach[0].val || ev.attach[0];
          } else if (typeof ev.attach === "object" && ev.attach.val) {
            imageUrl = ev.attach.val;
          } else if (typeof ev.attach === "string") {
            imageUrl = ev.attach;
          }
        }

        return {
          id: ev.uid,
          title: ev.summary,
          start: ev.start,
          end: ev.end,
          location: ev.location || null,
          description: ev.description || null,
          url: eventUrl || null,
          attachments: imageUrl,
          source: "Université Toulouse III - Paul Sabatier",
        };
      })
      .filter(ev => ev.title && keywords.some(k => ev.title.toLowerCase().includes(k)));

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("UT3 Agenda error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
