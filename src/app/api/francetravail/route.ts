import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Lecture des paramètres
    const page = searchParams.get("page") || "1";

    // Définit la date du jour en format YYYY-MM-DD
    const startDate = new Date().toISOString().split("T")[0];

    // Vérification clé API
    const API_KEY = process.env.FRANCETRAVAIL_API_KEY;
    if (!API_KEY) {
      console.error("❌ Clé API France Travail manquante");
      return NextResponse.json(
        { error: "Clé API France Travail manquante" },
        { status: 500 }
      );
    }

    // ✅ URL France Travail conforme documentation
    const API_URL = `https://api.francetravail.io/partenaire/evenements/v1/evenements?departement=31&dateDebut=${startDate}&page=${page}`;

    console.log("🔍 FT URL =", API_URL);

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API France Travail :", errText);
      return NextResponse.json(
        { error: "Erreur API France Travail", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();

    // France Travail renvoie les résultats dans `evenements`
    return NextResponse.json({
      events: data.evenements || [],
      total: data.total || 0,
      page: data.page || page,
    });

  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur", details: error }, { status: 500 });
  }
}
