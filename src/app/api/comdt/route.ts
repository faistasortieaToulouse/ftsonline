// src/app/api/comdt/route.ts
import { NextResponse } from "next/server";

const ICS_URL = "https://www.comdt.org/events/feed/?ical=1";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// 🔹 Cartographie catégorie → image par défaut
const defaultImages: Record<string, string> = {
  "Stages": "/images/comdt/catecomdtstage.jpg",
  "Stages de danse": "/images/comdt/catecomdtdanse.jpg",
  "Stages de musique": "/images/comdt/catecomdtmusique.jpg",
  "Saison du COMDT": "/images/comdt/catecomdtcomdt.jpg",
  "Evénements partenaires": "/images/comdt/catecomdtpartenaire.jpg",
};

// 🔹 Parse date ICS → Date
function parseIcsDate(value?: string): Date | null {
  if (!value) return null;

  if (/^\d{8}$/.test(value)) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// 🔹 Parse ICS → événements
function parseICS(text: string) {
  const events: any[] = [];
  const blocks = text.split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:]*:(.+)`));
      return m ? m[1].trim() : "";
    };

    const date = parseIcsDate(get("DTSTART"));
    if (!date) continue;

    // 📌 Gestion de l'image : ATTACH sinon image par défaut selon catégorie
    let image = get("ATTACH");
    if (!image) {
      const categories = get("CATEGORIES").split(",").map((c) => c.trim());
      for (const cat of categories) {
        if (defaultImages[cat]) {
          image = defaultImages[cat];
          break;
        }
      }
    }

    events.push({
      id: get("UID"),
      title: get("SUMMARY"),
      description: get("DESCRIPTION").replace(/\\n/g, "\n"),
      link: get("URL"),
      location: get("LOCATION"),
      date: date.toISOString(),
      source: "COMDT",
      categories: get("CATEGORIES").split(",").map((c) => c.trim()),
      image,
    });
  }

  return events;
}

export async function GET() {
  try {
    const res = await fetch(ICS_URL, {
      headers: { Accept: "text/calendar" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `ICS fetch failed (${res.status})` },
        { status: 502 }
      );
    }

    const text = await res.text();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = parseICS(text).filter(
      (e) => new Date(e.date) >= today
    );

    return NextResponse.json({
      total: events.length,
      events,
    });
  } catch (err) {
    console.error("COMDT ICS error:", err);
    return NextResponse.json(
      { total: 0, events: [], error: "COMDT ICS error" },
      { status: 500 }
    );
  }
}
