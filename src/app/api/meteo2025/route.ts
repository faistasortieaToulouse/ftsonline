import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://archive-api.open-meteo.com/v1/archive?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris";

  const res = await fetch(url);
  const data = await res.json();

  const result = data.daily.time.map((date: string, i: number) => {
    const pluie = data.daily.precipitation_sum[i];
    const cloud = data.daily.cloudcover_mean[i];
    const uv = data.daily.uv_index_max?.[i];

    // 🌤️ logique ciel (AJOUT seulement)
    let ciel = "Soleil";

    if (pluie > 1) {
      ciel = "Pluie";
    } else if (cloud > 60) {
      ciel = "Nuage";
    }

    return {
      // ✅ TES DONNÉES ORIGINALES (inchangées)
      date,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      pluie, // ✔ conservé tel quel
      vent: data.daily.windspeed_10m_max[i],

      // ➕ AJOUTS
      ciel,        // Soleil / Nuage / Pluie
      nuages: cloud,
      uvIndex: uv,
    };
  });

  return NextResponse.json(result);
}
