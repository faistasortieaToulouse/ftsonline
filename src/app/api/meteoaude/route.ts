import { NextResponse } from 'next/server';

const STATIONS = {
  carcassonne: { lat: 43.21, lon: 2.35, name: "Carcassonne" },
  lezignan: { lat: 43.20, lon: 2.75, name: "Lézignan-Corbières" },
  narbonne: { lat: 43.18, lon: 3.00, name: "Narbonne" }
};

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = yesterday.toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    const fetchPromises = Object.entries(STATIONS).map(async ([key, city]) => {
      // 1. Appel Conditions Actuelles
      const currentRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=uv_index_max&timezone=Europe%2FBerlin`
      );
      
      // 2. Appel Archives (Indispensable pour calculer les jours de vent et de chaleur)
      const archiveRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${endDate}&daily=rain_sum,et0_fao_evapotranspiration,sunshine_duration,wind_speed_10m_max,temperature_2m_max&timezone=Europe%2FBerlin`
      );

      const current = await currentRes.json();
      const archive = await archiveRes.json();

      if (!archive.daily) throw new Error("Données archive indisponibles");

      // --- CALCULS DES STATISTIQUES ---
      
      const totalRain = archive.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      const totalEvap = archive.daily.et0_fao_evapotranspiration.reduce((a: number, b: number) => a + (b || 0), 0);
      const totalSeconds = archive.daily.sunshine_duration.reduce((a: number, b: number) => a + (b || 0), 0);
      
      // Nettoyage des données pour éviter les erreurs si une journée est manquante
      const windValues = archive.daily.wind_speed_10m_max.filter((v: any) => v !== null && !isNaN(v));
      const tempMaxValues = archive.daily.temperature_2m_max.filter((t: any) => t !== null && !isNaN(t));

      // Calcul des compteurs demandés
      const joursVentes = windValues.filter((v: number) => v >= 57).length;
      const joursChaleur = tempMaxValues.filter((t: number) => t >= 25).length;
      const recordAn = tempMaxValues.length > 0 ? Math.max(...tempMaxValues) : 0;

      const conditionMap: { [key: number]: string } = {
        0: "Ciel dégagé", 1: "Peu nuageux", 2: "Partiellement nuageux", 3: "Couvert",
        45: "Brouillard", 51: "Bruine légère", 61: "Pluie faible", 80: "Averses", 95: "Orage"
      };

      return [key, {
        ville: city.name,
        temp: Math.round(current.current.temperature_2m),
        condition: conditionMap[current.current.weather_code] || "Variable",
        iconCode: current.current.weather_code,
        stats: {
          totalSunshine: `${Math.round(totalSeconds / 3600)}h`,
          totalRain: Math.round(totalRain),
          maxWind: windValues.length > 0 ? `${Math.round(Math.max(...windValues))}km/h` : "Calme",
          waterBalance: Math.round(totalRain - totalEvap),
          
          // ATTENTION : Ces noms doivent être identiques à ceux de ton page.tsx
          joursVentes: joursVentes, 
          joursChaleur: joursChaleur,
          recordChaleur: recordAn > 0 ? `${Math.round(recordAn)}°C` : "N/A"
        }
      }];
    });

    const results = await Promise.all(fetchPromises);
    return NextResponse.json(Object.fromEntries(results));

  } catch (error) {
    console.error("Erreur API Aude:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
