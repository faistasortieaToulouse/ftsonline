// src/app/api/meteo2025/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://archive-api.open-meteo.com/v1/archive?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris";

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.daily) {
      return NextResponse.json({ error: "Données non disponibles" }, { status: 404 });
    }

    const result = data.daily.time.map((date: string, i: number) => {
      const pluie = data.daily.precipitation_sum[i] ?? 0;
      const cloud = data.daily.cloudcover_mean[i] ?? 0;
      
      // ✅ CORRECTION : Si uv_index_max[i] est null, on renvoie 0
      const uv = data.daily.uv_index_max ? (data.daily.uv_index_max[i] ?? 0) : 0;

      let ciel = "Soleil";
      if (pluie > 1) {
        ciel = "Pluie";
      } else if (cloud > 60) {
        ciel = "Nuage";
      }

      return {
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        pluie,
        vent: data.daily.windspeed_10m_max[i],
        ciel,
        nuages: cloud,
        uvIndex: uv, 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
