import { NextResponse } from "next/server";

export async function GET() {
  // Endpoint forecast pour les 7 prochains jours
  const url = "https://api.open-meteo.com/v1/forecast?latitude=43.6045&longitude=1.444&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean,uv_index_max&timezone=Europe/Paris";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily;

    if (!daily) {
      return NextResponse.json({ error: "Prévisions indisponibles" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const tMin = daily.temperature_2m_min[i] ?? 0;
      const vent = daily.wind_speed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloud_cover_mean[i] ?? 0;
      const uv = daily.uv_index_max[i] ?? 0;

      // --- LOGIQUE DE VIGILANCE ---
      let alerte = "Vert";
      let risque = ""; 

      if (tMax >= 35 || vent >= 85 || uv >= 8) {
        alerte = "Orange";
        risque = tMax >= 35 ? "Canicule" : (vent >= 85 ? "Tempête" : "UV Critique");
      } else if (tMax >= 30 || vent >= 60 || uv >= 6) {
        alerte = "Jaune";
        risque = tMax >= 30 ? "Chaleur" : (vent >= 60 ? "Vent" : "UV Élevé");
      }

      let ciel = "Soleil";
      if (pluie > 1) ciel = "Pluie";
      else if (cloud > 50) ciel = "Nuage";

      return { date, ciel, tempMax: tMax, tempMin: tMin, vent, pluie, uv, alerte, risque };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
