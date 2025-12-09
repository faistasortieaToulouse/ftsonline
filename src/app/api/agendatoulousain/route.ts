import { NextResponse } from "next/server";

// Agrégation des flux AgendaTrad et AgendaCulturel
export async function GET() {
  try {
    const [tradRes, cultRes] = await Promise.all([
      fetch("/api/agenda-trad", { cache: "no-store" }),
      fetch("/api/agendaculturel", { cache: "no-store" })
    ]);

    const tradJson = await tradRes.json();
    const cultJson = await cultRes.json();

    const eventsTrad = tradJson.events || [];
    const eventsCult = (cultJson.items || []).map((item: any) => ({
      id: item.link,
      title: item.title,
      description: item.description,
      date: item.pubDate,
      dateFormatted: new Date(item.pubDate).toLocaleString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullAddress: "Toulouse (31)",
      category: item.category,
      image: item.image,
      url: item.link,
      source: "AgendaCulturel",
    }));

    // Fusion et tri chronologique
    const merged = [...eventsTrad, ...eventsCult].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ events: merged });
  } catch (err: any) {
    return NextResponse.json({ events: [], error: String(err) }, { status: 500 });
  }
}
