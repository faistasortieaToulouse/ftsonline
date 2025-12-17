// src/app/api/agendatoulousain/route.ts
import { NextRequest, NextResponse } from "next/server";

// Sources externes uniquement
const EXTERNAL_SOURCES = [
  "https://ftstoulouse.vercel.app/api/agenda-trad-haute-garonne",
  "https://ftstoulouse.vercel.app/api/agendaculturel",
];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;

  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

export async function GET(request: NextRequest) {
  try {
    const results = await Promise.all(
      EXTERNAL_SOURCES.map(async (url) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          const json = await res.json();
          return normalizeApiResult(json);
        } catch (err) {
          console.error("Erreur API externe:", url, err);
          return [];
        }
      })
    );

    let events = results.flat();

    // 🔹 Normalisation des dates → ISO
    events = events.map((ev) => {
      const raw = ev.date || ev.start || ev.startDate;
      const d = raw ? new Date(raw) : null;

      return {
        ...ev,
        date: d && !isNaN(d.getTime()) ? d.toISOString() : null,
      };
    });

    // 🔹 Suppression des doublons
    const uniq = new Map<string, any>();
    events.forEach((ev) => {
      const key = ev.id || `${ev.title}-${ev.date}`;
      if (!uniq.has(key)) uniq.set(key, ev);
    });

    // 🔹 Tri chronologique
    const sorted = Array.from(uniq.values()).sort((a, b) => {
      return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
    });

    return NextResponse.json({
      total: sorted.length,
      events: sorted,
    });
  } catch (err: any) {
    console.error("Erreur /api/agendatoulousain:", err);
    return NextResponse.json(
      { total: 0, events: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
