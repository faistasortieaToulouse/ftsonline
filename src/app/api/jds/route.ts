import { NextResponse } from "next/server";

type JDSEvent = {
  title: string;
  date?: string;
  place?: string;
  url: string;
};

export async function GET() {
  try {
    const res = await fetch("https://www.jds.fr/toulouse/agenda/agenda-du-jour/-aujourdhui_JPJ", {
      headers: { "Content-Type": "text/html" },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API JDS :", errText);
      return NextResponse.json(
        { error: "Erreur API JDS", details: errText },
        { status: res.status }
      );
    }

    const html = await res.text();

    // ⚠️ Ici il faut parser le HTML pour extraire les événements.
    // Exemple simplifié : recherche des balises <article> ou <h2>
    const events: JDSEvent[] = [];
    const regex = /<h2[^>]*>(.*?)<\/h2>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      events.push({
        title: match[1],
        url: "https://www.jds.fr/toulouse/agenda/agenda-du-jour/-aujourdhui_JPJ",
      });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(error) },
      { status: 500 }
    );
  }
}
