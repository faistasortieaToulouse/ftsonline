import { NextResponse } from 'next/server';

export async function GET() {
  const TOULOUSE = { lat: 43.6045, lng: 1.4442 };

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${TOULOUSE.lat}&longitude=${TOULOUSE.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,windspeed_10m_max&timezone=Europe%2FBerlin`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache d'une heure
    if (!res.ok) throw new Error("Erreur Open-Meteo");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur Toulouse" }, { status: 500 });
  }
}
