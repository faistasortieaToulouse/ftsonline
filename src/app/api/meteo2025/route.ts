import { NextResponse } from "next/server";

export async function GET() {
  // On utilise historical-forecast pour garantir d'avoir des données sur toutes les variables en 2025
  const url = "https://api.open-meteo.com/v1/historical-forecast?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max&timezone=Europe/Paris";

  try {
    const res = await fetch(url);
    const data = await res.json();

    const daily = data.daily;

    if (!daily) {
      return NextResponse.json({ error: "Données non disponibles" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const tempMax = daily.temperature_2m_max[i] ?? 0;
      const pluie = daily.precipitation_sum[i] ?? 0;
      const vent = daily.windspeed_10m_max[i] ?? 0;
      const uv = daily.uv_index_max?.[i] ?? 0;

      // --- LOGIQUE DE DÉDUCTION DES ALERTES ---
      let alerte = { niveau: "Vert", libelle: "Calme" };

      // Seuil Rouge (Danger extrême)
      if (tempMax >= 40 || vent >= 100 || pluie >= 70) {
        alerte = { 
          niveau: "Rouge", 
          libelle: tempMax >= 40 ? "Canicule Extrême" : (vent >= 100 ? "Tempête" : "Inondation") 
        };
      } 
      // Seuil Orange (Danger important)
      else if (tempMax >= 35 || vent >= 75 || pluie >= 40) {
        alerte = { 
          niveau: "Orange", 
          libelle: tempMax >= 35 ? "Forte Chaleur" : (vent >= 75 ? "Coup de Vent" : "Fortes Pluies") 
        };
      } 
      // Seuil Jaune (Soyez vigilant)
      else if (tempMax >= 30 || vent >= 50 || pluie >= 15) {
        alerte = { 
          niveau: "Jaune", 
          libelle: "Vigilance" 
        };
      }

      return {
        date,
        tempMax,
        tempMin: daily.temperature_2m_min[i],
        pluie,
        vent,
        uvIndex: uv,
        alerte // On renvoie l'objet alerte calculé
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API Meteo:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
