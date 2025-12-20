import { NextResponse } from "next/server";

const API_KEY = process.env.TISSEO_API_KEY!;
const BASE_URL = "https://api.tisseo.fr/v2/messages.json";

let cache: any[] = [];
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const now = Date.now();

  if (cache.length > 0 && now - lastFetch < CACHE_TTL) {
    return NextResponse.json(cache);
  }

  try {
    const res = await fetch(
      `${BASE_URL}?key=${API_KEY}&displayOnlyPerturbations=1`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      throw new Error(`Tisséo API error ${res.status}`);
    }

    const data = await res.json();

    const messages = (data.messages || []).map((msg: any, i: number) => ({
      id: `${msg.id || "tisseo"}-${i}`,
      title: msg.title || "Information réseau",
      description: msg.content || "",
      start: msg.startDate || null,
      end: msg.endDate || null,
      severity: msg.severity || "info",
      lines: (msg.lines || []).map((l: any) => l.shortName).join(", "),
      url: msg.url || "https://www.tisseo.fr",
      source: "Tisséo",
    }));

    cache = messages;
    lastFetch = now;

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Erreur Tisséo :", err);
    return NextResponse.json(
      { error: "Impossible de charger les infos Tisséo" },
      { status: 500 }
    );
  }
}
