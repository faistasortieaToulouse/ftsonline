import { NextResponse } from "next/server";

export async function GET() {
  try {
    // On utilise la clé serveur (sans NEXT_PUBLIC) pour l'appel API Backend
    const key = process.env.TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "Clé API manquante dans l'environnement" },
        { status: 500 }
      );
    }

    // Coordonnées : Jean Jaurès, Toulouse (plus de chances d'avoir du flux)
    const lat = 43.6055;
    const lon = 1.4485;

    // Utilisation de l'endpoint 'absolute' avec un niveau de zoom 10
    // Cela permet d'obtenir des données de flux plus larges
    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&unit=KMPH&key=${key}`;

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Détails erreur TomTom:", errorData);
      throw new Error("Erreur réponse API TomTom");
    }

    const data = await response.json();

    // On vérifie si TomTom a renvoyé des données exploitables
    if (!data.flowSegmentData) {
      return NextResponse.json({ error: "Aucun segment de trafic trouvé à ce point" }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur TomTom Route:", error);
    return NextResponse.json(
      { error: "Serveur incapable de joindre TomTom" },
      { status: 500 }
    );
  }
}
