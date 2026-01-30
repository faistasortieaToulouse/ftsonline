import { NextResponse } from 'next/server';

const STATIONS: Record<string, { lat: number, lon: number, name: string }> = {
  carcassonne: { lat: 43.21, lon: 2.35, name: "Carcassonne" },
  lezignan: { lat: 43.20, lon: 2.75, name: "Lézignan-Corbières" },
  narbonne: { lat: 43.18, lon: 3.00, name: "Narbonne" }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const villeParam = searchParams.get('ville') || 'lezignan';
    const city = STATIONS[villeParam] || STATIONS.lezignan;

    const year = new Date().getFullYear();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    // 1. Fetch PREVISIONS 7 JOURS avec VENT et UV
    const forecastRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,uv_index_max&timezone=Europe%2FBerlin`
    );
    
    // 2. Fetch ARCHIVES
    const archiveRes = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,et0_fao_evapotranspiration,sunshine_duration,wind_speed_10m_max,temperature_2m_max&timezone=Europe%2FBerlin`
    );

    const forecastData = await forecastRes.json();
    const archiveData = await archiveRes.json();

    const rain = archiveData.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
    const sun = archiveData.daily.sunshine_duration.reduce((a: number, b: number) => a + (b || 0), 0);
    const evap = archiveData.daily.et0_fao_evapotranspiration.reduce((a: number, b: number) => a + (b || 0), 0);
    
    const joursVentes = (archiveData.daily.wind_speed_10m_max || []).filter((v: number) => v >= 57).length;

    return NextResponse.json({
      ville: city.name,
      temp: Math.round(forecastData.current.temperature_2m),
      daily: forecastData.daily, // Contient maintenant wind_speed_10m_max et uv_index_max
      stats: {
        totalSunshine: `${Math.round(sun / 3600)}h`,
        totalRain: Math.round(rain),
        waterBalance: Math.round(rain - evap),
        joursVentes: joursVentes,
      }
    });
  } catch (e) {
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}