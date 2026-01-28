import { NextResponse } from 'next/server';

export async function GET() {
  // Ici, tu devrais normalement appeler un service météo. 
  // Voici une structure de données qui correspond à tes besoins :
  const dataAude = {
    carcassonne: {
      ville: "Carcassonne",
      temp: 14,
      condition: "Ensoleillé",
      vent: 25,
      uv: "3 (Modéré)",
      stats: { totalSunshine: 210, totalRain: 45, maxWind: 85, waterBalance: -12 }
    },
    lezignan: {
      ville: "Lézignan-Corbières",
      temp: 15,
      condition: "Venté",
      vent: 45,
      uv: "3 (Modéré)",
      stats: { totalSunshine: 225, totalRain: 30, maxWind: 95, waterBalance: -25 }
    },
    narbonne: {
      ville: "Narbonne",
      temp: 16,
      condition: "Beau fixe",
      vent: 35,
      uv: "4 (Modéré)",
      stats: { totalSunshine: 240, totalRain: 20, maxWind: 110, waterBalance: -35 }
    }
  };

  return NextResponse.json(dataAude);
}
