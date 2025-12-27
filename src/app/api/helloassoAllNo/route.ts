import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.HELLOASSO_CLIENT_ID;
    const clientSecret = process.env.HELLOASSO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Variables d'environnement manquantes" }, { status: 500 });
    }

    // 1. Authentification OAuth2
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
      return NextResponse.json({ error: "Authentification API échouée" }, { status: 401 });
    }

    const { access_token } = await tokenRes.json();

    // 2. Récupération des formulaires publics (Directory)
    // Nous filtrons sur Toulouse (31000) et uniquement les événements
    const searchParams = new URLSearchParams({
      formTypes: "Event",
      locations: "31000",
      pageSize: "50", // On en prend pas mal pour avoir du choix
    });

    const eventsRes = await fetch(`https://api.helloasso.com/v5/directory/forms?${searchParams}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!eventsRes.ok) {
      return NextResponse.json({ error: "Accès à l'annuaire HelloAsso refusé" }, { status: eventsRes.status });
    }

    const data = await eventsRes.json();

    // 3. Mapping pour correspondre exactement à votre HelloAssoEvent (page.tsx)
    const events = (data.resources || []).map((ev: any) => ({
      id: ev.id?.toString() || Math.random().toString(),
      name: ev.name || "Événement sans titre",
      // On met le nom de l'organisation en description si pas de contenu
      description: `Organisé par ${ev.organizationName || "une association"}`, 
      date: null, // L'annuaire public ne fournit pas la date dans ce flux
      url: ev.publicUrl,
      image: ev.logo?.url || null,
      location: ev.city ? `${ev.zipCode} ${ev.city}` : "Toulouse",
    }));

    return NextResponse.json({ events });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}