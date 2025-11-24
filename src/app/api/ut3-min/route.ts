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
        return {
          id: ev.uid,
          title: ev.summary || "Événement UT3",
          start: ev.start || null,
          end: ev.end || null,
          location: ev.location || null,
          description: ev.description || null,
          url: ev.url || null, // lien officiel
          attachments: ev.attach || null, // image si fournie dans le flux iCal
          source: "Université Toulouse III - Paul Sabatier",
        };
      })
      // Filtrage par mots-clés dans le titre
      .filter(ev => 
        ev.title && keywords.some(k => ev.title.toLowerCase().includes(k))
      );

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("UT3 Agenda error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
