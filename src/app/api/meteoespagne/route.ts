import { NextResponse } from 'next/server';

const COORDONNEES: Record<string, { lat: number, lng: number }> = {
  // Aragon
  ainsa: { lat: 42.4170, lng: 0.1388 },
  huesca: { lat: 42.1362, lng: -0.4087 },
  barbastro: { lat: 42.0357, lng: 0.1266 },
  // Catalogne
  lerida: { lat: 41.6176, lng: 0.6236 },
  tremp: { lat: 42.1670, lng: 0.8944 },
  berga: { lat: 42.1039, lng: 1.8463 },
  ripoll: { lat: 42.2010, lng: 2.1911 },
  olot: { lat: 42.1810, lng: 2.4901 },
  figueras: { lat: 42.2665, lng: 2.9610 },
  cadaques: { lat: 42.2887, lng: 3.2778 },
  // Frontière & Cols
  portbou: { lat: 42.4253, lng: 3.1601 },
  'le-perthus': { lat: 42.4637, lng: 2.8640 },
  'las-illas': { lat: 42.4380, lng: 2.7602 },
  coustouges: { lat: 42.3683, lng: 2.6479 },
  'prats-de-mollo': { lat: 42.4045, lng: 2.5312 },
  'bourg-madame': { lat: 42.4332, lng: 1.9439 },
  'latour-de-carol': { lat: 42.4664, lng: 1.8893 },
  'pas-de-la-case': { lat: 42.5422, lng: 1.7333 },
  fos: { lat: 42.8731, lng: 0.7360 },
  'luchon': { lat: 42.7894, lng: 0.5950 },
  bossost: { lat: 42.7850, lng: 0.6922 },
  'st-lary': { lat: 42.8176, lng: 0.3228 }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville')?.toLowerCase() || 'ainsa';
  const coords = COORDONNEES[ville];

  if (!coords) return NextResponse.json({ error: "Ville non trouvée" }, { status: 404 });

  try {
    // MODIFICATION ICI : weather_code et wind_speed_10m_max avec les underscores
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,wind_speed_10m_max&timezone=Europe%2FBerlin`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur Open-Meteo");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Erreur API Meteo:", e);
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 });
  }
}