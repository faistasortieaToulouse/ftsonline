import { NextResponse } from 'next/server';

const STATIONS_PYRENEES = {
  luchon: { lat: 42.79, lon: 0.60, name: "Bagnères-de-Luchon" },
  saintlary: { lat: 42.81, lon: 0.32, name: "Saint-Lary-Soulan" },
  ax: { lat: 42.72, lon: 1.83, name: "Ax-les-Thermes" }
};

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    const fetchPromises = Object.entries(STATIONS_PYRENEES).map(async ([key, station]) => {
      // 1. Actuel (Garder ton code pour la neige en direct)
      const currentRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,weather_code,snowfall&timezone=Europe%2FBerlin`
      );
      
      // 2. Archives (AJOUT de rain_sum à ton code pour avoir la pluie + la neige)
      const archiveRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${station.lat}&longitude=${station.lon}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,snowfall_sum,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin`
      );

      const current = await currentRes.json();
      const archive = await archiveRes.json();

      // Tes calculs de neige (gardés à l'identique)
      const totalSnow = archive.daily.snowfall_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      
      // NOUVEAU : Calcul de la pluie cumulée
      const totalRain = archive.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      
      // Tes calculs de gel (gardés à l'identique)
      const frostDays = archive.daily.temperature_2m_min.filter((t: number) => t < 0).length;

      return [key, {
        ville: station.name,
        temp: Math.round(current.current.temperature_2m),
        condition: current.current.weather_code,
        iconCode: current.current.weather_code, // Ajouté pour ton getWeatherIcon
        isSnowing: current.current.snowfall > 0 || [71, 73, 75, 77, 85, 86].includes(current.current.weather_code),
        stats: {
          totalRain: Math.round(totalRain), // La pluie liquide
          cumulNeige: Math.round(totalSnow), // Les cm de neige
          joursGel: frostDays,
          recordFroid: Math.min(...archive.daily.temperature_2m_min.filter((t: any) => t !== null))
        }
      }];
    });

    const results = await Promise.all(fetchPromises);
    return NextResponse.json(Object.fromEntries(results));
  } catch (e) {
    return NextResponse.json({ error: "Erreur API Pyrénées" }, { status: 500 });
  }
}
