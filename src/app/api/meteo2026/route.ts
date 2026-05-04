import { NextResponse } from "next/server";

export async function GET() {
  // Calcul de la date d'hier pour ne pas demander de données futures à l'API Archive
  const hier = new Date();
  hier.setDate(hier.getDate() - 1);
  const dateFin = hier.toISOString().split('T')[0];

  // URL configurée du 01/01/2026 jusqu'à hier
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=43.6045&longitude=1.444&start_date=2026-01-01&end_date=${dateFin}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris&models=best_match`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily || data.daily_best_match;

    if (!daily) {
      return NextResponse.json({ error: "Données non disponibles pour 2026" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const tMin = daily.temperature_2m_min[i] ?? 0;
      const vent = daily.windspeed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloudcover_mean[i] ?? 0;

      // --- LOGIQUE DE VIGILANCE ---
      let alerte = "Vert";
      let risque = ""; 

      if (tMax >= 35 || vent >= 85 || pluie >= 50) {
        alerte = "Orange";
        risque = tMax >= 35 ? "Canicule" : (vent >= 85 ? "Tempête" : "Inondation");
      } else if (tMax >= 30 || vent >= 60 || pluie >= 20) {
        alerte = "Jaune";
        risque = tMax >= 30 ? "Chaleur" : (vent >= 60 ? "Vent" : "Pluie");
      }

      let ciel = "Soleil";
      if (pluie > 1) ciel = "Pluie";
      else if (cloud > 50) ciel = "Nuage";

      return {
        date,
        ciel,
        tempMax: tMax,
        tempMin: tMin,
        vent,
        pluie, 
        alerte,
        risque
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
