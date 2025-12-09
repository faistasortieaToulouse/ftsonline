import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Fonction pour récupérer l’URL d’origine
function getBaseUrl(req: Request) {
  const host = req.headers.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function GET(req: Request) {
  try {
    const baseUrl = getBaseUrl(req);

    const [tradRes, cultRes] = await Promise.all([
      fetch(`${baseUrl}/api/agenda-trad-haute-garonne`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/agendaculturel`, { cache: "no-store" })
    ]);

    if (!tradRes.ok || !cultRes.ok) {
      throw new Error("Erreur lors du fetch des APIs sources");
    }

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

    const merged = [...eventsTrad, ...eventsCult].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ events: merged });

  } catch (err: any) {
    return NextResponse.json(
      { events: [], error: String(err) },
      { status: 500 }
    );
  }
}
