import { NextResponse } from "next/server";

export async function GET() {
  // 1. MODIFICATION DES COORDONNÉES (Lézignan-Corbières)
  // Latitude: 43.2003 | Longitude: 2.7588
  const url = "https://api.open-meteo.com/v1/forecast?latitude=43.2003&longitude=2.7588&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean,uv_index_max&timezone=Europe/Paris";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily;

    if (!daily) {
      return NextResponse.json({ error: "Prévisions indisponibles pour Lézignan" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const tMin = daily.temperature_2m_min[i] ?? 0;
      const vent = daily.wind_speed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloud_cover_mean[i] ?? 0;
      const uv = daily.uv_index_max[i] ?? 0;

      // --- LOGIQUE DE VIGILANCE ADAPTÉE (CLIMAT AUDAIS) ---
      let alerte = "Vert";
      let risque = ""; 

      // On augmente légèrement les seuils de vent car le Cers souffle fort à Lézignan
      if (tMax >= 36 || vent >= 85 || uv >= 9) {
        alerte = "Orange";
        if (tMax >= 36) risque = "Canicule";
        else if (vent >= 85) risque = "Tempête";
        else risque = "UV Critique";
      } else if (tMax >= 31 || vent >= 65 || uv >= 7) {
        alerte = "Jaune";
        if (tMax >= 31) risque = "Chaleur";
        else if (vent >= 65) risque = "Vent";
        else risque = "UV Élevé";
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
