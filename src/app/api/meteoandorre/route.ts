import { NextResponse } from 'next/server';

const COORDONNEES: Record<string, { lat: number, lng: number }> = {
  "andorra-la-vella": { lat: 42.5063, lng: 1.5218 },
  "canillo": { lat: 42.5676, lng: 1.5976 },
  "encamp": { lat: 42.5361, lng: 1.5828 },
  "escaldes-engordany": { lat: 42.5072, lng: 1.5341 },
  "la-massana": { lat: 42.5449, lng: 1.5148 },
  "ordino": { lat: 42.5562, lng: 1.5332 },
  "sant-julia-de-loria": { lat: 42.4637, lng: 1.4913 }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville') || 'andorra-la-vella';
  const coords = COORDONNEES[ville];

  if (!coords) return NextResponse.json({ error: "Paroisse non trouvée" }, { status: 404 });

  try {
    // AJOUT de snowfall_sum dans la requête
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,windspeed_10m_max,snowfall_sum&timezone=Europe%2FBerlin`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}