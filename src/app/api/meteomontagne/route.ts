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
        try {
          // Simplification des paramètres pour garantir le succès
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lng}&current=temperature_2m,weather_code,wind_speed_10m,visibility&daily=sunrise,sunset,uv_index_max,snowfall_sum&timezone=auto`;

          const res = await fetch(url, { next: { revalidate: 600 } });

          if (!res.ok) {
            console.error(`API Error for ${station.name}: ${res.status}`);
            return null;
          }

          const json = await res.json();

          // Vérification si current et daily existent
          if (!json.current || !json.daily) {
            console.error(`Incomplete data for ${station.name}`);
            return null;
          }

          return {
            name: station.name,
            temp: Math.round(json.current.temperature_2m ?? 0),
            wind: Math.round(json.current.wind_speed_10m ?? 0),
            uv: json.daily.uv_index_max?.[0] ?? 0,
            code: json.current.weather_code ?? 0,
            visibility: (json.current.visibility ?? 10000) / 1000,
            snow: json.daily.snowfall_sum?.[0] ?? 0,
            isotherme: 1500, // Mis en dur temporairement pour tester l'affichage
            sunrise: (json.daily.sunrise?.[0] || "T08:00").split('T')[1],
            sunset: (json.daily.sunset?.[0] || "T18:00").split('T')[1],
          };
        } catch (e) {
          console.error(`Crash on ${station.name}:`, e);
          return null;
        }
      })
    );

    const filteredData = results.filter(item => item !== null);
    
    // LOG DE DEBUG : Vérifie ton terminal VS Code !
    console.log(`Nombre de stations récupérées : ${filteredData.length}`);

    return NextResponse.json(filteredData);
  } catch (globalError: any) {
    return NextResponse.json({ error: "Fail", message: globalError.message }, { status: 500 });
  }
}