import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://api.open-meteo.com/v1/historical-forecast?latitude=43.6045&longitude=1.444&start_date=2025-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe/Paris";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const daily = data.daily;

    if (!daily) return NextResponse.json({ error: "Vide" }, { status: 404 });

    const result = daily.time.map((date: string, i: number) => {
      const tMax = daily.temperature_2m_max[i];
      const vent = daily.windspeed_10m_max[i];
      const pluie = daily.precipitation_sum[i];

      // Calcul simple de l'alerte
      let alerte = "Vert";
      if (tMax >= 35 || vent >= 80) alerte = "Orange";
      else if (tMax >= 30 || vent >= 50 || pluie >= 15) alerte = "Jaune";

      return {
        date,
        ciel: pluie > 1 ? "Pluie" : (tMax > 25 ? "Soleil" : "Nuage"),
        tempMax: tMax,
        tempMin: daily.temperature_2m_min[i],
        vent: vent,
        pluie: pluie,
        alerte: alerte
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
