import { NextResponse } from 'next/server';

const LACS = [
  { name: "Base de Saint-Sardos", city: "Saint-Sardos", lat: 43.90, lng: 1.13, dist: "41 km", dept: "Tarn et Garonne" },
  { name: "Base des 3 Lacs", city: "Monclar", lat: 43.96, lng: 1.58, dist: "42 km", dept: "Tarn et Garonne" },
  { name: "Bassin du Lampy", city: "Saissac", lat: 43.41, lng: 2.16, dist: "65 km", dept: "Aude" },
  { name: "Lac d'En Laure", city: "Labruguière", lat: 43.53, lng: 2.25, dist: "65 km", dept: "Tarn" },
  { name: "Lac de Braguessou", city: "Saint-Jory", lat: 43.74, lng: 1.34, dist: "17 km", dept: "Haute-Garonne" },
  { name: "Lac de Buzerens", city: "Bram", lat: 43.25, lng: 2.11, dist: "70 km", dept: "Aude" },
  { name: "Lac de Gimone", city: "Lalanne-Arqué", lat: 43.32, lng: 0.65, dist: "60 km", dept: "Gers" },
  { name: "Lac de l'Isle-Jourdain", city: "L'Isle-Jourdain", lat: 43.61, lng: 1.08, dist: "35 km", dept: "Gers" },
  { name: "Lac de l'Orme Blanc", city: "Caraman", lat: 43.53, lng: 1.76, dist: "30 km", dept: "Haute-Garonne" },
  { name: "Lac de la Bancalié", city: "St-Antonin", lat: 43.78, lng: 2.31, dist: "75 km", dept: "Tarn" },
  { name: "Lac de la Ganguise", city: "Belflou", lat: 43.32, lng: 1.79, dist: "50 km", dept: "Aude" },
  { name: "Lac de la Ramée", city: "Tournefeuille", lat: 43.58, lng: 1.35, dist: "8 km", dept: "Haute-Garonne" },
  { name: "Lac de la Thésauque", city: "Nailloux", lat: 43.34, lng: 1.63, dist: "40 km", dept: "Haute-Garonne" },
  { name: "Lac de Laprade Basse", city: "Cuxac-Cabardès", lat: 43.41, lng: 2.24, dist: "70 km", dept: "Aude" },
  { name: "Lac de Molières", city: "Molières", lat: 44.19, lng: 1.36, dist: "65 km", dept: "Tarn et Garonne" },
  { name: "Lac de Parisot", city: "Parisot", lat: 44.26, lng: 1.85, dist: "80 km", dept: "Tarn et Garonne" },
  { name: "Lac de Saint-Ferréol", city: "Revel", lat: 43.44, lng: 2.02, dist: "55 km", dept: "Haute-Garonne/Tarn" },
  { name: "Lac de Saint-Ybars", city: "Saint-Ybars", lat: 43.23, lng: 1.45, dist: "55 km", dept: "Ariège" },
  { name: "Lac de Sainte-Croix-Volvestre", city: "Sainte-Croix", lat: 43.12, lng: 1.17, dist: "60 km", dept: "Ariège" },
  { name: "Lac de Sainte-Marie", city: "Le Garric", lat: 43.98, lng: 2.14, dist: "80 km", dept: "Tarn" },
  { name: "Lac de Samatan", city: "Samatan", lat: 43.49, lng: 0.93, dist: "50 km", dept: "Gers" },
  { name: "Lac de Thoux-Saint-Cricq", city: "Thoux", lat: 43.70, lng: 0.99, dist: "45 km", dept: "Gers" },
  { name: "Lac des Bonnets", city: "Muret", lat: 43.43, lng: 1.32, dist: "20 km", dept: "Haute-Garonne" },
  { name: "Lac du Val de Saune", city: "Ste-Foy-d'Aigrefeuille", lat: 43.54, lng: 1.61, dist: "15 km", dept: "Haute-Garonne" },
  { name: "Plage d'Ardus", city: "Lamothe-Capdeville", lat: 44.07, lng: 1.37, dist: "53 km", dept: "Tarn et Garonne" },
  { name: "Plage de Rivières", city: "Gaillac", lat: 43.91, lng: 1.87, dist: "55 km", dept: "Tarn" }
];

export async function GET() {
  try {
    const data = await Promise.all(LACS.map(async (lac) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lac.lat}&longitude=${lac.lng}&current=temperature_2m,weather_code,wind_speed_10m&daily=sunrise,sunset,uv_index_max&timezone=auto`;
      const res = await fetch(url, { next: { revalidate: 900 } });
      const json = await res.json();

      return {
        name: lac.name,
        city: lac.city,
        dist: lac.dist,
        dept: lac.dept,
        temp: Math.round(json.current.temperature_2m),
        wind: Math.round(json.current.wind_speed_10m),
        uv: json.daily.uv_index_max[0],
        code: json.current.weather_code,
        sunrise: json.daily.sunrise[0].split('T')[1],
        sunset: json.daily.sunset[0].split('T')[1],
      };
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}