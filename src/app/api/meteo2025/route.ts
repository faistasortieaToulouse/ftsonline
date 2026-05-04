import { NextResponse } from "next/server";

export async function GET() {
  // Changement majeur : on utilise "historical-forecast" au lieu de "archive"
  // Ce endpoint est beaucoup plus fiable pour l'indice UV sur l'année passée (2025).
  const url = "https://api.open-meteo.com/v1/historical-forecast?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max&timezone=Europe/Paris";

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Sur ce endpoint, les données sont toujours dans l'objet "daily"
    if (!data.daily) {
      return NextResponse.json({ error: "Données non disponibles" }, { status: 404 });
    }

    const result = data.daily.time.map((date: string, i: number) => {
      const pluie = data.daily.precipitation_sum[i] ?? 0;
      const vent = data.daily.windspeed_10m_max[i] ?? 0;
      
      // L'UV est maintenant récupéré depuis les prévisions historiques
      const uv = data.daily.uv_index_max ? (data.daily.uv_index_max[i] ?? 0) : 0;

      // Logique simple pour le ciel (ajustable selon vos besoins)
      let ciel = "Soleil";
      if (pluie > 1) {
        ciel = "Pluie";
      } else if (uv < 1 && pluie === 0) {
        // Souvent signe de couverture nuageuse en journée ou hiver
        ciel = "Nuage";
      }

      return {
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        pluie,
        vent,
        ciel,
        uvIndex: uv, 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API Meteo 2025:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
