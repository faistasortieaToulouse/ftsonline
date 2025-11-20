import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.HELLOASSO_CLIENT_ID!;
    const clientSecret = process.env.HELLOASSO_CLIENT_SECRET!;
    const orgSlug = "bilingue"; // ✅ ton slug réel

    // 1. Obtenir un token OAuth2
    const tokenRes = await fetch("https://api.helloasso.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "Erreur token" }, { status: tokenRes.status });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Récupérer les événements de ton organisation bilingue
    const eventsRes = await fetch(
      `https://api.helloasso.com/v5/organizations/${orgSlug}/events`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!eventsRes.ok) {
      return NextResponse.json({ error: "Erreur HelloAsso" }, { status: eventsRes.status });
    }

    const eventsData = await eventsRes.json();

    // 3. Mapper les événements
    const events = eventsData?.data?.map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      description: ev.description,
      date: ev.startDate,
      url: ev.url,
      image: ev.imageUrl,
      location: ev.location,
    })) || [];

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
