import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || "1";
    const startDate = searchParams.get("start_date") || "2025-11-10";

    // Encodage correct du paramètre >=
    const API_URL = `https://api.francetravail.io/v1/events?territory.department=31&start_date%3E=${encodeURIComponent(startDate)}&page=${page}`;

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.FRANCETRAVAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erreur API France Travail" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
