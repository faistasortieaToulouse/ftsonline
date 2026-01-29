import { NextResponse } from 'next/server';

// On définit les coordonnées pour les 13 préfectures d'Occitanie
const COORDONNEES: Record<string, { lat: number, lng: number }> = {
  toulouse: { lat: 43.6045, lng: 1.4442 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  perpignan: { lat: 42.6986, lng: 2.8956 },
  carcassonne: { lat: 43.2122, lng: 2.3537 },
  albi: { lat: 43.9289, lng: 2.1464 },
  montauban: { lat: 44.0175, lng: 1.3550 },
  tarbes: { lat: 43.2320, lng: 0.0789 },
  rodez: { lat: 44.3506, lng: 2.5750 },
  auch: { lat: 43.6465, lng: 0.5855 },
  cahors: { lat: 44.4475, lng: 1.4419 },
  foix: { lat: 42.9639, lng: 1.6054 },
  mende: { lat: 44.5181, lng: 3.5000 },
  // NOUVELLES VILLES AJOUTÉES ICI
  pamiers: { lat: 43.1167, lng: 1.6167 },
  narbonne: { lat: 43.1833, lng: 3.0000 },
  beziers: { lat: 43.3444, lng: 3.2158 },
  lezignan: { lat: 43.2031, lng: 2.7592 }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville')?.toLowerCase() || 'toulouse';
  
  // On récupère les coordonnées correspondant à l'ID de la ville
  const coords = COORDONNEES[ville];

  if (!coords) {
    return NextResponse.json({ error: `Ville '${ville}' non supportée` }, { status: 404 });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=Europe%2FBerlin`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur Open-Meteo");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Impossible de récupérer la météo" }, { status: 500 });
  }
}
