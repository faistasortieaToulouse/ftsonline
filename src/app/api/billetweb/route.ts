import { NextResponse } from "next/server";

type BilletwebEvent = {
  id: string;
  ext_id?: string;
  name: string;
  start: string;
  end?: string;
  place?: string;
  shop?: string;
  online?: string;
  tax?: string;
  tags?: string[];
  description?: string;
  image?: string;
  cover?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const past = searchParams.get("past") || "0";
    const online = searchParams.get("online") || "1";
    const description = searchParams.get("description") || "1";

    const userId = process.env.BILLETWEB_USER_ID;
    const apiKey = process.env.BILLETWEB_API_KEY;

    if (!userId || !apiKey) {
      return NextResponse.json(
        { error: "Identifiants Billetweb manquants" },
        { status: 500 }
      );
    }

    const apiUrl = `https://www.billetweb.fr/api/events?user=${userId}&key=${apiKey}&version=1&past=${past}&online=${online}&description=${description}`;

    const res = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
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

    const events: BilletwebEvent[] = Array.isArray(data)
      ? data.map((ev: any) => ({
          id: ev.id,
          ext_id: ev.ext_id,
          name: ev.name,
          start: ev.start,
          end: ev.end,
          place: ev.place,
          shop: ev.shop,
          online: ev.online,
          tax: ev.tax,
          tags: ev.tags,
          description: ev.description,
          image: ev.image,
          cover: ev.cover,
        }))
      : [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(error) },
      { status: 500 }
    );
  }
}
