import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";

    const token = process.env.EVENTBRITE_TOKEN;

    if (!token) {
      console.error("❌ TOKEN MANQUANT");
      return NextResponse.json(
        { error: "Token Eventbrite manquant" },
        { status: 500 }
      );
    }

    // const apiUrl = `https://www.eventbriteapi.com/v3/events/search/?location.address=Toulouse&location.within=10km&page=${page}`;
    // const apiUrl = `https://www.eventbriteapi.com/v3/events/search/?location.address=Toulouse&location.within=10km&page=1`;
    const apiUrl =
  `https://www.eventbriteapi.com/v3/events/search/?` + 
  `location.address=Toulouse&location.within=10km&sort_by=date&page=${page}`;
    
    // 🟦 LOGS DEBUG COMPLETS
    console.log("========== EVENTBRITE DEBUG ==========");
    console.log("➡️ URL appelée :", apiUrl);
    console.log("➡️ Headers envoyés :", {
      Authorization: `Bearer ${token.substring(0, 5)}…(masqué)`,
      "Content-Type": "application/json",
    });
    console.log("======================================");

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const rawText = await res.text();

    // 🟥 Si erreur HTTP → on log le contenu exact renvoyé par Eventbrite
    if (!res.ok) {
      console.error("❌ Eventbrite status:", res.status);
      console.error("❌ Eventbrite raw response:", rawText);

      return NextResponse.json(
        {
          error: "Erreur API Eventbrite",
          status: res.status,
          raw: rawText,
          url: apiUrl,
        },
        { status: res.status }
      );
    }

    // 🟩 OK → parse JSON
    const data = JSON.parse(rawText);

    return NextResponse.json({
      debug_url: apiUrl,
      pagination: data.pagination,
      events: data.events || [],
    });
  } catch (error: any) {
    console.error("🔥 Crash non géré :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
