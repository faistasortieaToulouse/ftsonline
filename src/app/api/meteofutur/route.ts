// route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const TOULOUSE = { lat: 43.6045, lng: 1.4442 };
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfYear = "2026-01-01";

  try {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${TOULOUSE.lat}&longitude=${TOULOUSE.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,windspeed_10m_max&timezone=Europe%2FBerlin`;
    const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${TOULOUSE.lat}&longitude=${TOULOUSE.lng}&start_date=${firstDayOfYear}&end_date=${today}&daily=precipitation_sum,sunshine_duration&timezone=Europe%2FBerlin`;

    const [forecastRes, archiveRes] = await Promise.all([fetch(forecastUrl), fetch(archiveUrl)]);
    const forecastData = await forecastRes.json();
    const archiveData = await archiveRes.json();

    const totalRain = archiveData.daily.precipitation_sum.reduce((a: number, b: number) => a + (b || 0), 0);
    const totalSunshine = Math.round(archiveData.daily.sunshine_duration.reduce((a: number, b: number) => a + (b || 0), 0) / 3600);

    return NextResponse.json({
      daily: forecastData.daily, // Contient uv_index_max
      stats: {
        totalRain: Math.round(totalRain),
        totalSunshine: totalSunshine,
        waterBalance: Math.round(totalRain * 0.2)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}