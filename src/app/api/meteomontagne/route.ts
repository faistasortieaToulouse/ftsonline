import { NextResponse } from 'next/server';

const STATIONS = [
  { name: "Ax 3 Domaines", lat: 42.70, lng: 1.83 },
  { name: "Guzet", lat: 42.79, lng: 1.29 },
  { name: "Les Monts d'Olmes", lat: 42.84, lng: 1.74 },
  { name: "Peyragudes", lat: 42.79, lng: 0.44 },
  { name: "Grand Tourmalet", lat: 42.90, lng: 0.14 },
  { name: "Saint-Lary-Soulan", lat: 42.81, lng: 0.32 },
  { name: "Piau-Engaly", lat: 42.78, lng: 0.15 },
  { name: "Cauterets", lat: 42.88, lng: -0.11 },
  { name: "Luz-Ardiden", lat: 42.87, lng: -0.05 },
  { name: "Gavarnie", lat: 42.73, lng: -0.00 }
];

export async function GET() {
  try {
    const results = await Promise.all(
      STATIONS.map(async (station) => {
        // Ajout de visibility dans current et uv_index_max dans daily
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lng}&current=temperature_2m,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,snowfall_sum,uv_index_max,wind_speed_10m_max&timezone=auto`;
        
        const res = await fetch(url);
        const json = await res.json();

        const forecast = json.daily.time.map((date: string, i: number) => ({
          date,
          tempMax: Math.round(json.daily.temperature_2m_max[i]),
          tempMin: Math.round(json.daily.temperature_2m_min[i]),
          code: json.daily.weather_code[i],
          snow: json.daily.snowfall_sum[i],
          uv: json.daily.uv_index_max[i], // Index UV pour chaque jour
          wind: Math.round(json.daily.wind_speed_10m_max[i])
        }));

        return {
          ...station,
          currentTemp: Math.round(json.current.temperature_2m),
          currentWind: Math.round(json.current.wind_speed_10m),
          currentVisibility: Math.round((json.current.visibility || 10000) / 1000), // En km
          forecast
        };
      })
    );
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: "Erreur API" }, { status: 500 });
  }
}