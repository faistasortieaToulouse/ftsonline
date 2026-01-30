import { NextResponse } from 'next/server';

const STATIONS_PYRENEES = {
  luchon: { lat: 42.79, lon: 0.60, name: "Bagnères-de-Luchon", id: "luchon", dept: "31" },
  saintlary: { lat: 42.81, lon: 0.32, name: "Saint-Lary-Soulan", id: "saintlary", dept: "65" },
  ax: { lat: 42.72, lon: 1.83, name: "Ax-les-Thermes", id: "ax", dept: "09" }
};

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    const fetchPromises = Object.entries(STATIONS_PYRENEES).map(async ([key, station]) => {
      // 1. Actuel + Prévisions (Forecast) sur 7 jours
      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,weather_code,snowfall,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,snowfall_sum,precipitation_sum&timezone=Europe%2FBerlin`
      );
      
      // 2. Archives (Cumuls depuis le 1er janvier)
      const archiveRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${station.lat}&longitude=${station.lon}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,snowfall_sum,temperature_2m_min&timezone=Europe%2FBerlin`
      );

      const forecastData = await forecastRes.json();
      const archiveData = await archiveRes.json();

      // Calculs Stats Archives
      const totalSnowArchive = archiveData.daily.snowfall_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      const totalRainArchive = archiveData.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      const frostDays = archiveData.daily.temperature_2m_min.filter((t: number) => t < 0).length;
      const recordFroid = Math.min(...archiveData.daily.temperature_2m_min.filter((t: any) => t !== null));

      // Transformation du Forecast pour le scroll 7 jours
      const forecast = forecastData.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: Math.round(forecastData.daily.temperature_2m_max[i]),
        tempMin: Math.round(forecastData.daily.temperature_2m_min[i]),
        code: forecastData.daily.weather_code[i],
        uv: forecastData.daily.uv_index_max[i],
        snow: Math.round(forecastData.daily.snowfall_sum[i] * 10) / 10, // cm
        rain: Math.round(forecastData.daily.precipitation_sum[i] * 10) / 10  // mm
      }));

      return {
        id: station.id,
        ville: station.name,
        name: station.name, // Doublon pour compatibilité page
        lat: station.lat,
        lng: station.lon,
        dept: station.dept,
        currentTemp: Math.round(forecastData.current.temperature_2m),
        currentWind: Math.round(forecastData.current.wind_speed_10m),
        currentVisibility: Math.round((forecastData.current.visibility || 10000) / 1000),
        condition: forecastData.current.weather_code,
        iconCode: forecastData.current.weather_code,
        isSnowing: forecastData.current.snowfall > 0 || [71, 73, 75, 77, 85, 86].includes(forecastData.current.weather_code),
        forecast,
        stats: {
          totalRain: Math.round(totalRainArchive),
          cumulNeige: Math.round(totalSnowArchive),
          joursGel: frostDays,
          recordFroid: recordFroid === Infinity ? "--" : `${recordFroid}°C`
        }
      };
    });

    const results = await Promise.all(fetchPromises);
    
    // On retourne un TABLEAU d'objets (plus facile pour le .map dans la page)
    return NextResponse.json(results);
  } catch (error) {
    console.error("Erreur API Pyrénées:", error);
    return NextResponse.json({ error: "Erreur API Pyrénées" }, { status: 500 });
  }
}