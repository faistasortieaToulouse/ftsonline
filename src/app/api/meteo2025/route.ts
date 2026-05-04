import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://archive-api.open-meteo.com/v1/archive?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris&models=best_match";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily || data.daily_best_match;

    if (!daily) {
      return NextResponse.json({ error: "Structure de données introuvable" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const vent = daily.windspeed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloudcover_mean[i] ?? 0;

      let alerte = "Vert";
      if (tMax >= 35 || vent >= 85) alerte = "Orange";
      else if (tMax >= 30 || vent >= 60 || pluie >= 20) alerte = "Jaune";

      let ciel = "Soleil";
      if (pluie > 1) ciel = "Pluie";
      else if (cloud > 50) ciel = "Nuage";

      return {
        date,
        ciel,
        tempMax: tMax,
        tempMin: daily.temperature_2m_min[i] ?? 0,
        vent: vent,
        pluie: pluie, // <-- On ajoute la pluie ici
        alerte
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
