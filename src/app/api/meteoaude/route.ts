import { NextResponse } from 'next/server';

// Coordonnées GPS des stations
const STATIONS = {
  carcassonne: { lat: 43.21, lon: 2.35, name: "Carcassonne" },
  lezignan: { lat: 43.20, lon: 2.75, name: "Lézignan-Corbières" },
  narbonne: { lat: 43.18, lon: 3.00, name: "Narbonne" }
};

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const today = new Date().toISOString().split('T')[0];
    const startDate = `${year}-01-01`;

    // On prépare les promesses pour récupérer les données des 3 villes en parallèle
    const fetchPromises = Object.entries(STATIONS).map(async ([key, city]) => {
      // 1. Appel API pour les prévisions actuelles (Temp, Vent, UV, Condition)
      const currentRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&daily=uv_index_max&timezone=Europe%2FBerlin`
      );
      
      // 2. Appel API pour l'historique de pluie depuis le 1er janvier (Archives)
      // Note: Open-Meteo Archive est gratuit
      const archiveRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startDate}&end_date=${today}&daily=rain_sum,et0_fao_evapotranspiration&timezone=Europe%2FBerlin`
      );

      const current = await currentRes.json();
      const archive = await archiveRes.json();

      // Calcul des stats de pluie et bilan hydrique
      const totalRain = archive.daily.rain_sum.reduce((a: number, b: number) => a + (b || 0), 0);
      const totalEvap = archive.daily.et0_fao_evapotranspiration.reduce((a: number, b: number) => a + (b || 0), 0);
      
      // Bilan hydrique simplifié (Pluie - Évapotranspiration)
      const waterBalance = totalRain - totalEvap;

      // Mapping du code météo vers une description texte
      const conditionMap: { [key: number]: string } = {
        0: "Ciel dégagé", 1: "Peu nuageux", 2: "Partiellement nuageux", 3: "Couvert",
        45: "Brouillard", 51: "Bruine légère", 61: "Pluie faible", 71: "Neige",
        80: "Averses", 95: "Orage"
      };

      return [key, {
        ville: city.name,
        temp: Math.round(current.current.temperature_2m),
        condition: conditionMap[current.current.weather_code] || "Variable",
        vitesseVent: Math.round(current.current.wind_speed_10m),
        uv: Math.round(current.daily.uv_index_max[0]),
        stats: {
          totalSunshine: "En calcul...", // Nécessite une API solaire spécifique
          totalRain: Math.round(totalRain),
          maxWind: "N/A", 
          waterBalance: Math.round(waterBalance)
        },
        rainData: {
          daily: archive.daily.rain_sum.slice(-7), // 7 derniers jours
          totalYear: Math.round(totalRain)
        }
      }];
    });

    const results = await Promise.all(fetchPromises);
    const dataAude = Object.fromEntries(results);

    return NextResponse.json(dataAude);

  } catch (error) {
    console.error("Erreur API Aude:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des flux" }, { status: 500 });
  }
}
