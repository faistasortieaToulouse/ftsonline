// src/app/radarsquat/route.ts
import { NextResponse } from "next/server";

// Petit parseur ICS minimaliste
function parseICS(ics: string) {
  const events: any[] = [];
  const blocks = ics.split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);

    const get = (prop: string) => {
      // gère les lignes repliées (RFC 5545: continuation avec espace au début)
      const regex = new RegExp(`^${prop}(?:;[^:]*)?:(.*)$`, "i");
      let value = "";
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(regex);
        if (m) {
          value = m[1];
          // concaténation des lignes suivantes commençant par un espace
          let j = i + 1;
          while (j < lines.length && lines[j].startsWith(" ")) {
            value += lines[j].slice(1);
            j++;
          }
          break;
        }
      }
      return value || null;
    };

    const summary = get("SUMMARY");
    const description = get("DESCRIPTION");
    const location = get("LOCATION");
    const url = get("URL");
    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    const uid = get("UID");

    // Convertir dates (gère formats Zulu YYYYMMDDTHHMMSSZ et date-only YYYYMMDD)
    const toISO = (s: string | null) => {
      if (!s) return null;
      // ex: 20251116T080000Z
      const m = s.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/);
      if (!m) return null;
      const [_, Y, M, D, h, mi, se] = m;
      if (h) {
        return new Date(Date.UTC(+Y, +M - 1, +D, +h, +mi, +se)).toISOString();
      } else {
        // date-only → début de journée en UTC
        return new Date(Date.UTC(+Y, +M - 1, +D, 0, 0, 0)).toISOString();
      }
    };

    const startISO = toISO(dtstart);
    const endISO = toISO(dtend);

    events.push({
      id: uid || url || summary,
      source: "Radar Squat Toulouse",
      title: summary,
      description,
      location,
      link: url,
      start: startISO,
      end: endISO,
      // ICS ne fournit pas d'image → définis une image par défaut dans /public
      image: "/logo/logodemosphere.jpg",
    });
  }

  // Filtrer les événements incomplets
  return events.filter(e => e.title && e.start);
}

export async function GET() {
  const res = await fetch("https://radar.squat.net/fr/events/city/Toulouse/ical", {
    headers: { "Accept": "text/calendar" },
    // suivant Next 15, l’edge runtime peut nécessiter cache: "no-store" si besoin
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Impossible de récupérer le flux ICS" }, { status: 500 });
  }

  const ics = await res.text();
  const events = parseICS(ics);

  return NextResponse.json(events);
}
