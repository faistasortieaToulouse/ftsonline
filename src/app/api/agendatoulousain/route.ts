import { NextResponse } from "next/server";

function normalizeApiResult(data: any): any[] {
  if (!data) return [];

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;

  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  if (firstArray) return firstArray;

  return [];
}

export async function GET() {
  try {
    const sources = [
      "https://ftstoulouse.vercel.app/api/agenda-trad-haute-garonne",
      "https://ftstoulouse.vercel.app/api/agendaculturel",
      // tu pourras en ajouter d’autres ici
    ];

    const results = await Promise.all(
      sources.map(async (url) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          const json = await res.json();
          return normalizeApiResult(json);
        } catch (e) {
          console.error("Erreur API:", url, e);
          return [];
        }
      })
    );

    // Fusion de toutes les sources
    const merged = results.flat();

    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
