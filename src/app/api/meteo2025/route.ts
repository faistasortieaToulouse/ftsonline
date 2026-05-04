import { NextResponse } from "next/server";

export async function GET() {
  // 💡 J'ai ajouté "&models=best_match" à la fin de l'URL. 
  // C'est ce qui permet de récupérer des estimations UV quand les relevés réels manquent.
  const url = "https://archive-api.open-meteo.com/v1/archive?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,cloudcover_mean,uv_index_max&timezone=Europe/Paris&models=best_match";

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Vérification de la structure (l'API renvoie parfois data.daily_best_match selon le modèle)
    const daily = data.daily || data.daily_best_match;

    if (!daily) {
      return NextResponse.json({ error: "Données non disponibles" }, { status: 404 });
    }

    const result = daily.time.map((date: string, i: number) => {
      const pluie = daily.precipitation_sum[i] ?? 0;
      const cloud = daily.cloudcover_mean[i] ?? 0;
      
      // On récupère l'UV. Si c'est encore null, on met 0, mais avec best_match, tu auras enfin des chiffres !
      const uv = daily.uv_index_max ? (daily.uv_index_max[i] ?? 0) : 0;

      // Logique ciel
      let ciel = "Soleil";
      if (pluie > 1) {
        ciel = "Pluie";
      } else if (cloud > 60) {
        ciel = "Nuage";
      }

      return {
        date,
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        pluie,
        vent: daily.windspeed_10m_max[i],
        ciel,
        nuages: cloud,
        uvIndex: uv, 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API Meteo:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
