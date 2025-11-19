import { NextResponse } from "next/server";

type BilletwebEvent = {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  url: string;
};

export async function GET() {
  try {
    const userId = process.env.BILLETWEB_USER_ID;
    const apiKey = process.env.BILLETWEB_API_KEY;

    if (!userId || !apiKey) {
      return NextResponse.json(
        { error: "Identifiants Billetweb manquants" },
        { status: 500 }
      );
    }

    const apiUrl = `https://www.billetweb.fr/api/events?user=${userId}&key=${apiKey}&version=1`;

    const res = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // évite la mise en cache côté Next.js
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API Billetweb :", errText);
      return NextResponse.json(
        { error: "Erreur API Billetweb", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();

    const events: BilletwebEvent[] = (data.events || []).map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      description: ev.description,
      start_date: ev.start_date,
      end_date: ev.end_date,
      url: ev.url,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(error) },
      { status: 500 }
    );
  }
}
