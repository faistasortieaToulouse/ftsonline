import { NextResponse } from 'next/server';

const COORDONNEES = {
  toulouse: { lat: 43.6045, lng: 1.4442 },
  carcassonne: { lat: 43.2122, lng: 2.3537 }, // Préfecture de l'Aude
  montpellier: { lat: 43.6108, lng: 3.8767 }  // Autre pôle Occitanie
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville') || 'toulouse';
  const coords = COORDONNEES[ville as keyof typeof COORDONNEES];

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=Europe%2FBerlin`;
    
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur météo" }, { status: 500 });
  }
}
