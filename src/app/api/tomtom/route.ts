import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.TOMTOM_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "Clé API manquante" },
        { status: 500 }
      );
    }

    // Toulouse centre
    const lat = 43.6045;
    const lon = 1.444;

    const response = await fetch(
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/json?point=${lat},${lon}&unit=KMPH&key=${key}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Erreur API TomTom");
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur TomTom :", error);

    return NextResponse.json(
      { error: "Impossible de récupérer le trafic" },
      { status: 500 }
    );
  }
}
