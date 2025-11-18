import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || "1";
    const startDate = new Date().toISOString().split("T")[0];

    const clientId = process.env.FRANCETRAVAIL_CLIENT_ID;
    const clientSecret = process.env.FRANCETRAVAIL_CLIENT_SECRET;
    const scope = process.env.FRANCETRAVAIL_SCOPE;

    if (!clientId || !clientSecret || !scope) {
      console.error("❌ Variables env France Travail manquantes");
      return NextResponse.json(
        { error: "Variables FT manquantes" },
        { status: 500 }
      );
    }

    // --- 1) Obtenir un access_token OAuth2 ---
    const tokenResponse = await fetch(
      "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
          scope,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("❌ Erreur token France Travail :", err);
      return NextResponse.json(
        { error: "Erreur token", details: err },
        { status: tokenResponse.status }
      );
    }

    const { access_token } = await tokenResponse.json();

    // --- 2) Appel API des événements ---
    const apiUrl = `https://api.francetravail.io/partenaire/evenements/v1/evenements?departement=31&dateDebut=${startDate}&page=${page}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API FT Evenements :", errText);
      return NextResponse.json(
        { error: "Erreur API France Travail", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      events: data.evenements || [],
      total: data.total || 0,
      page: data.page || page,
    });

  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error },
      { status: 500 }
    );
  }
}
