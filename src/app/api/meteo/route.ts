import { NextResponse } from 'next/server';

export async function GET() {
  const today = new Date();
  const year = today.getFullYear();
  const lat = 43.6043;
  const lon = 1.4437;

  // 1. Dates pour l'année en cours
  const startDate = `${year}-01-01`;
  const endDate = today.toISOString().split('T')[0];

  // 2. Dates pour l'année précédente (même période)
  const todayCopy = new Date();
  const lastYearStart = `${year - 1}-01-01`;
  const lastYearEnd = new Date(todayCopy.setFullYear(year - 1)).toISOString().split('T')[0];

  const params = `daily=temperature_2m_mean,precipitation_sum,sunshine_duration,wind_speed_10m_max,et0_fao_evapotranspiration&timezone=Europe%2FBerlin`;

  const urlCurrent = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&${params}`;
  const urlPast = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${lastYearStart}&end_date=${lastYearEnd}&${params}`;

    try {
    // On ajoute un cache d'une heure (3600s) pour éviter les Timeouts sur Vercel
    const fetchOptions = { next: { revalidate: 3600 } };

    const [resCurrent, resPast] = await Promise.all([
      fetch(urlCurrent, fetchOptions).then(r => r.json()),
      fetch(urlPast, fetchOptions).then(r => r.json())
    ]);

    if (!resCurrent.daily || !resPast.daily) throw new Error("Données non disponibles");

    // --- ANALYSE ANNÉE EN COURS ---
    const daily = resCurrent.daily;
    
    // Extraction du vent du jour (dernière valeur non nulle du tableau)
    const windValues = daily.wind_speed_10m_max.filter((v: any) => v !== null);
    const ventDuJour = windValues.length > 0 ? windValues[windValues.length - 1] : 0;

    const totalRain = daily.precipitation_sum.reduce((a: any, b: any) => a + (b || 0), 0);
    const avgTemp = daily.temperature_2m_mean.reduce((a: any, b: any) => a + (b || 0), 0) / daily.time.length;
    const totalSunshineHours = Math.round(daily.sunshine_duration.reduce((a: any, b: any) => a + (b || 0), 0) / 3600);
    const maxWind = Math.max(...windValues);
    const totalEvapo = daily.et0_fao_evapotranspiration.reduce((a: any, b: any) => a + (b || 0), 0);

    // --- ANALYSE ANNÉE PRÉCÉDENTE (Comparaison) ---
    const pastDaily = resPast.daily;
    const pastAvgTemp = pastDaily.temperature_2m_mean.reduce((a: any, b: any) => a + (b || 0), 0) / pastDaily.time.length;
    const pastTotalRain = pastDaily.precipitation_sum.reduce((a: any, b: any) => a + (b || 0), 0);

    return NextResponse.json({
      // Données pour le vent du jour et l'état général
      vitesseVent: ventDuJour.toFixed(1),
      condition: ventDuJour > 30 ? "Vent" : "Calme", // Utile pour ton test .includes("Vent")
      
      history: daily,
      stats: {
        totalRain: totalRain.toFixed(1),
        avgTemp: avgTemp.toFixed(1),
        totalSunshine: totalSunshineHours,
        maxWind: maxWind.toFixed(1),
        waterBalance: (totalRain - totalEvapo).toFixed(1),
        daysCount: daily.time.length,
        // Tendances par rapport à l'an dernier
        diffTemp: (avgTemp - pastAvgTemp).toFixed(1),
        diffRain: (totalRain - pastTotalRain).toFixed(1)
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur météo" }, { status: 500 });
  }
}
