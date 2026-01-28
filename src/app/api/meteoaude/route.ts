import { NextResponse } from 'next/server';

// Coordonnées GPS précises des stations de l'Aude
const STATIONS = {
  carcassonne: { lat: 43.21, lon: 2.35, name: "Carcassonne" },
  lezignan: { lat: 43.20, lon: 2.75, name: "Lézignan-Corbières" },
  narbonne: { lat: 43.18, lon: 3.00, name: "Narbonne" }
};

export async function GET() {
  try {
    const year = new Date().getFullYear();
    // On prend la date d'hier pour l'archive car les données du jour même 
    // ne sont pas encore totalement consolidées dans les bases historiques
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    const fetchPromises = Object.entries(STATIONS).map(async ([key, city]) => {
      // 1. Prévisions et conditions actuelles (Temps réel)
      const currentRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=uv_index_max&timezone=Europe%2FBerlin`
      );
      
      // 2. Historique complet (Archives)
      // rain_sum: Pluie | et0_fao_evapotranspiration: Évaporation | sunshine_duration: Soleil | wind_speed_10m_max: Vent Max
      const archiveRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,et0_fao_evapotranspiration,sunshine_duration,wind_speed_10m_max&timezone=Europe%2FBerlin`
      );

      const current = await currentRes.json();
      const archive = await archiveRes.json();

      if (!archive.daily) throw new Error("Données archive indisponibles");

      // --- CALCULS SÉCURISÉS ---
      
      // 1. Pluie totale (Cumul depuis le 1er Janvier)
      const totalRain = archive.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      
      // 2. Bilan hydrique (Eau tombée - Eau évaporée)
      const totalEvap = archive.daily.et0_fao_evapotranspiration.reduce((a: number, b: number) => a + (b || 0), 0);
      const waterBalance = totalRain - totalEvap;

      // 3. Ensoleillement (conversion secondes -> heures)
      const totalSeconds = archive.daily.sunshine_duration.reduce((a: number, b: number) => a + (b || 0), 0);
      const totalSunshineHours = Math.round(totalSeconds / 3600);

      // 4. Rafale/Vent Max Annuel (Sécurité contre les valeurs nulles/N/A)
      const windValues = archive.daily.wind_speed_10m_max.filter((v: any) => v !== null && !isNaN(v));
      const maxWindYear = windValues.length > 0 ? Math.max(...windValues) : 0;

      const conditionMap: { [key: number]: string } = {
        0: "Ciel dégagé", 1: "Peu nuageux", 2: "Partiellement nuageux", 3: "Couvert",
        45: "Brouillard", 51: "Bruine légère", 61: "Pluie faible", 80: "Averses", 95: "Orage"
      };

      return [key, {
        ville: city.name,
        temp: Math.round(current.current.temperature_2m),
        condition: conditionMap[current.current.weather_code] || "Variable",
        vitesseVent: Math.round(current.current.wind_speed_10m),
        uv: Math.round(current.daily.uv_index_max[0] || 0),
        stats: {
          totalSunshine: `${totalSunshineHours}h`,
          totalRain: Math.round(totalRain),
          maxWind: maxWindYear > 0 ? `${Math.round(maxWindYear)}km/h` : "Calme",
          waterBalance: Math.round(waterBalance)
        },
        rainData: {
          daily: archive.daily.rain_sum.slice(-7), 
          totalYear: Math.round(totalRain)
        }
      }];
    });

    const results = await Promise.all(fetchPromises);
    return NextResponse.json(Object.fromEntries(results));

  } catch (error) {
    console.error("Erreur API Aude:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des flux" }, { status: 500 });
  }
}
