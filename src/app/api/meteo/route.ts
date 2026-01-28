import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();
  const year = today.getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = today.toISOString().split('T')[0];

  // Coordonnées de Toulouse
  const lat = 43.6043;
  const lon = 1.4437;

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,precipitation_sum&timezone=Europe%2FBerlin`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.daily) throw new Error("Données non disponibles");

    // Calcul des statistiques cumulées
    const totalRain = data.daily.precipitation_sum.reduce((a: number, b: number) => a + (b || 0), 0);
    const avgTemp = data.daily.temperature_2m_mean.reduce((a: number, b: number) => a + (b || 0), 0) / data.daily.temperature_2m_mean.length;

    return NextResponse.json({
      history: data.daily, // Pour le graphique
      stats: {
        totalRain: totalRain.toFixed(1),
        avgTemp: avgTemp.toFixed(1),
        daysCount: data.daily.time.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur météo" }, { status: 500 });
  }
}
