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
      // On sécurise les données : si c'est null, on met 0 pour éviter les cases vides
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const tMin = daily.temperature_2m_min[i] ?? 0;
      const vent = daily.windspeed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloudcover_mean[i] ?? 0;

      // --- LOGIQUE DE VIGILANCE MULTI-RISQUES ---
      let alerte = "Vert";
      let risque = ""; 

      // Priorité Orange (Seuils critiques)
      if (tMax >= 35 || vent >= 85 || pluie >= 50) {
        alerte = "Orange";
        risque = tMax >= 35 ? "Canicule" : (vent >= 85 ? "Tempête" : "Inondation");
      } 
      // Priorité Jaune (Seuils de vigilance)
      else if (tMax >= 30 || vent >= 60 || pluie >= 20) {
        alerte = "Jaune";
        risque = tMax >= 30 ? "Chaleur" : (vent >= 60 ? "Vent" : "Pluie");
      }

      // Logique Ciel simplifiée
      let ciel = "Soleil";
      if (pluie > 1) ciel = "Pluie";
      else if (cloud > 50) ciel = "Nuage";

      return {
        date,
        ciel,
        tempMax: tMax,
        tempMin: tMin,
        vent: vent,
        pluie: pluie, 
        alerte,
        risque // On renvoie la cause pour l'afficher sous le symbole
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
