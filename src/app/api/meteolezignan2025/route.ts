import { NextResponse } from "next/server";

export async function GET() {
  // 1. MODIFICATION DES COORDONNÉES : Lézignan-Corbières
  // Latitude : 43.2003 | Longitude : 2.7588
  const url = "https://archive-api.open-meteo.com/v1/archive?latitude=43.2003&longitude=2.7588&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris&models=best_match";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily || data.daily_best_match;

    if (!daily) {
      return NextResponse.json({ error: "Structure de données introuvable" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const tMin = daily.temperature_2m_min[i] ?? 0;
      const vent = daily.windspeed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloudcover_mean[i] ?? 0;

      // --- LOGIQUE DE VIGILANCE ADAPTÉE À L'AUDE ---
      let alerte = "Vert";
      let risque = ""; 

      // Priorité Orange
      // À Lézignan, on monte le seuil de vent à 90km/h car c'est plus fréquent qu'à Toulouse
      if (tMax >= 36 || vent >= 90 || pluie >= 55) {
        alerte = "Orange";
        risque = tMax >= 36 ? "Canicule" : (vent >= 90 ? "Tempête" : "Inondation");
      } 
      // Priorité Jaune
      else if (tMax >= 31 || vent >= 60 || pluie >= 25) {
        alerte = "Jaune";
        risque = tMax >= 31 ? "Chaleur" : (vent >= 60 ? "Vent" : "Pluie");
      }

      // Logique Ciel
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
        risque 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
