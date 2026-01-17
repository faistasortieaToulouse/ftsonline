import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stopPointId = searchParams.get('stopPointId');

  // Si pas d'ID, on ne fait rien
  if (!stopPointId) return NextResponse.json({ error: "Missing stopPointId" }, { status: 400 });

  // Utilisation d'une clé de secours publique connue
  const API_KEY = process.env.TISSEO_API_KEY || 'a907d0f0-c127-4435-916a-e2748360155a'; 
  const url = `https://api.tisseo.fr/v1/stops_schedules.json?stopPointId=${stopPointId}&key=${API_KEY}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    
    // Tisséo renvoie parfois les départs sous forme d'objet simple s'il n'y en a qu'un
    let departures = data.departures?.departure || [];
    if (departures && !Array.isArray(departures)) {
      departures = [departures];
    }

    return NextResponse.json(departures);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de connexion à Tisséo" }, { status: 500 });
  }
}