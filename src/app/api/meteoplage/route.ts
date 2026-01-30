import { NextResponse } from 'next/server';

const PLAGES = [
  { name: "Fleury-d'Aude", lat: 43.2289, lng: 3.1341 },
  { name: "Saint-Pierre-la-Mer", lat: 43.1818, lng: 3.1852 },
  { name: "Narbonne-Plage", lat: 43.1517, lng: 3.1561 },
  { name: "Gruissan", lat: 43.1077, lng: 3.0853 },
  { name: "Port-la-Nouvelle", lat: 43.0125, lng: 3.0441 },
  { name: "La Palme", lat: 42.9723, lng: 3.0145 },
  { name: "Leucate", lat: 42.9095, lng: 3.0287 },
  { name: "Port-Leucate", lat: 42.8533, lng: 3.0372 },
  { name: "Le Barcarès", lat: 42.7876, lng: 3.0371 },
  { name: "Torreilles", lat: 42.7562, lng: 3.0101 },
  { name: "Sainte-Marie-la-Mer", lat: 42.7247, lng: 3.0347 },
  { name: "Canet-en-Roussillon", lat: 42.7031, lng: 3.0326 },
  { name: "Saint-Cyprien", lat: 42.6173, lng: 3.0341 },
  { name: "Elne", lat: 42.5997, lng: 3.0012 },
  { name: "Argelès-sur-Mer", lat: 42.5460, lng: 3.0226 },
  { name: "Collioure", lat: 42.5255, lng: 3.0847 },
  { name: "Port-Vendres", lat: 42.5208, lng: 3.1072 },
  { name: "Banyuls-sur-Mer", lat: 42.4828, lng: 3.1294 },
  { name: "Cerbère", lat: 42.4414, lng: 3.1638 },
  { name: "Valras-Plage", lat: 43.2455, lng: 3.2921 },
  { name: "Sérignan-Plage", lat: 43.2662, lng: 3.3276 },
  { name: "Portiragnes-Plage", lat: 43.2842, lng: 3.3614 },
  { name: "Vendres-Plage", lat: 43.2185, lng: 3.2384 },
  { name: "Vias-Plage", lat: 43.3001, lng: 3.4182 }
];

export async function GET() {
  try {
    const data = await Promise.all(PLAGES.map(async (plage) => {
      // 1. On demande les prévisions quotidiennes complètes sur 7 jours
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${plage.lat}&longitude=${plage.lng}&current=temperature_2m,weather_code,wind_speed_10m,visibility&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,wind_speed_10m_max,sunrise,sunset&timezone=auto`;
      
      const res = await fetch(url);
      const json = await res.json();

      // 2. On transforme les données daily en un tableau de 7 objets "forecast"
      const forecast = json.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: Math.round(json.daily.temperature_2m_max[i]),
        tempMin: Math.round(json.daily.temperature_2m_min[i]),
        code: json.daily.weather_code[i],
        uv: json.daily.uv_index_max[i],
        windMax: Math.round(json.daily.wind_speed_10m_max[i]),
        sunrise: json.daily.sunrise[i].split('T')[1],
        sunset: json.daily.sunset[i].split('T')[1],
      }));

      // 3. On retourne l'objet complet pour la page
      return {
        name: plage.name,
        lat: plage.lat,
        lng: plage.lng,
        currentTemp: Math.round(json.current.temperature_2m),
        currentWind: Math.round(json.current.wind_speed_10m),
        currentVisibility: Math.round((json.current.visibility || 10000) / 1000),
        forecast // Ce tableau contient les 7 jours
      };
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Plage:", error);
    return NextResponse.json({ error: "Erreur fetch" }, { status: 500 });
  }
}