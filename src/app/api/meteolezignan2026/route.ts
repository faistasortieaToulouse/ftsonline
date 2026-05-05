import { NextResponse } from "next/server";

export async function GET() {
  // Calcul de la date d'hier pour l'API Archive
  const hier = new Date();
  hier.setDate(hier.getDate() - 1);
  const dateFin = hier.toISOString().split('T')[0];

  // 1. MODIFICATION DES COORDONNÉES (Lézignan-Corbières)
  // Latitude: 43.2003, Longitude: 2.7588
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=43.2003&longitude=2.7588&start_date=2026-01-01&end_date=${dateFin}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris&models=best_match`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily || data.daily_best_match;

    if (!daily) {
      return NextResponse.json({ error: "Données non disponibles pour Lézignan en 2026" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i] ?? 0;
      const tMin = daily.temperature_2m_min[i] ?? 0;
      const vent = daily.windspeed_10m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloudcover_mean[i] ?? 0;
      const uv = daily.uv_index_max[i] ?? 0;

      // --- LOGIQUE DE VIGILANCE ADAPTÉE À L'AUDE (VENT ET UV) ---
      let alerte = "Vert";
      let risque = ""; 

      // Priorité Orange (Seuils adaptés pour le vent de l'Aude)
      if (tMax >= 36 || vent >= 85 || pluie >= 55 || uv >= 10) {
        alerte = "Orange";
        if (tMax >= 36) risque = "Canicule";
        else if (vent >= 85) risque = "Tempête";
        else if (uv >= 10) risque = "UV Critique";
        else risque = "Inondation";
      } 
      // Priorité Jaune
      else if (tMax >= 31 || vent >= 60 || pluie >= 25 || uv >= 7) {
        alerte = "Jaune";
        if (tMax >= 31) risque = "Chaleur";
        else if (vent >= 60) risque = "Vent";
        else if (uv >= 7) risque = "UV Élevé";
        else risque = "Pluie";
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
        uv, // Ajout de l'UV dans le retour
        alerte,
        risque
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
