import { NextResponse } from "next/server";

const CACHE_URL = "https://raw.githubusercontent.com/faistasortieaToulouse/ftsdatatoulouse/main/data/podmarathon-cache.json";

export async function GET() {
  try {
    const headers: Record<string, string> = {};
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(CACHE_URL, { headers });

    if (!res.ok) {
      throw new Error(`Impossible de récupérer le cache GitHub : ${res.status} ${res.statusText}`);
    }

    const episodes = (await res.json()) as Array<{
      titre: string;
      date: string;
      description: string;
      audioUrl: string;
    }>;

    return NextResponse.json({ data: episodes });
  } catch (err: any) {
    console.error("Erreur GET /podmarathon :", err);
    return NextResponse.json(
      { data: [], error: err.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}
