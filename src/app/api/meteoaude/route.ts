import { NextResponse } from 'next/server';

const STATIONS = {
  carcassonne: { lat: 43.21, lon: 2.35, name: "Carcassonne" },
  lezignan: { lat: 43.20, lon: 2.75, name: "Lézignan-Corbières" },
  narbonne: { lat: 43.18, lon: 3.00, name: "Narbonne" }
};

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    const fetchPromises = Object.entries(STATIONS).map(async ([key, city]) => {
      // 1. Actuel
      const currentRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=uv_index_max&timezone=Europe%2FBerlin`
      );
      
      // 2. Archives (On demande explicitement les MAX journaliers pour le vent et la temp)
      const archiveRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,et0_fao_evapotranspiration,sunshine_duration,wind_speed_10m_max,temperature_2m_max&timezone=Europe%2FBerlin`
      );

      const current = await currentRes.json();
      const archive = await archiveRes.json();

      const rain = archive.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      const sun = archive.daily.sunshine_duration.reduce((a: number, b: number) => a + (b || 0), 0);
      const evap = archive.daily.et0_fao_evapotranspiration.reduce((a: number, b: number) => a + (b || 0), 0);
      
      // Extraction des rafales max et temp max journalières
      const dailyMaxWinds = archive.daily.wind_speed_10m_max || [];
      const dailyMaxTemps = archive.daily.temperature_2m_max || [];

      // CALCULS
      const joursVentes = dailyMaxWinds.filter((v: number) => v >= 57).length;
      const joursChaleur = dailyMaxTemps.filter((t: number) => t >= 25).length;
      const recordAn = dailyMaxTemps.length > 0 ? Math.max(...dailyMaxTemps.filter((t:any) => t !== null)) : 0;

      return [key, {
        ville: city.name,
        temp: Math.round(current.current.temperature_2m),
        condition: current.current.weather_code,
        iconCode: current.current.weather_code,
        stats: {
          totalSunshine: `${Math.round(sun / 3600)}h`,
          totalRain: Math.round(rain),
          waterBalance: Math.round(rain - evap),
          joursVentes: joursVentes,
          joursChaleur: joursChaleur,
          recordChaleur: recordAn > 0 ? `${Math.round(recordAn)}°C` : "N/A"
        }
      }];
    });

    const results = await Promise.all(fetchPromises);
    return NextResponse.json(Object.fromEntries(results));
  } catch (e) {
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}
