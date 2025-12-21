import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // On utilise l'API météo gratuite de Open-Meteo (pas besoin de clé API)
    // Coordonnées de Toulouse : Lat 43.6043, Lon 1.4437
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=43.6043&longitude=1.4437&current_weather=true&timezone=Europe%2FBerlin"
    );
    const data = await response.json();

    // On traduit le code météo en texte pour votre composant WeatherIcon
    const weatherCode = data.current_weather.weathercode;
    let description = "Ensoleillé";

    if (weatherCode === 0) description = "Ensoleillé";
    else if (weatherCode <= 3) description = "Nuageux";
    else if (weatherCode >= 51 && weatherCode <= 67) description = "Pluie";
    else if (weatherCode >= 71 && weatherCode <= 77) description = "Neige";
    else if (weatherCode >= 80) description = "Averse";
    else if (weatherCode >= 95) description = "Orage";

    return NextResponse.json({
      temp: data.current_weather.temperature,
      description: description
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur météo" }, { status: 500 });
  }
}