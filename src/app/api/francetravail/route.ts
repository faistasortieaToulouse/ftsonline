import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || "1";
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const [startDate, setStartDate] = useState(today);

    const API_URL = `https://api.francetravail.io/v1/events?territory.department=31&start_date>=${startDate}&page=${page}`;

    // On vérifie simplement si la clé existe
    console.log("France Travail key loaded ?", !!process.env.FRANCETRAVAIL_API_KEY);

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.FRANCETRAVAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Erreur FT :", errText);
      return NextResponse.json({ error: "Erreur API France Travail", details: errText }, { status: res.status });
    }

    const data = await res.json();

    // France Travail renvoie les événements dans "results"
    return NextResponse.json({
      events: data.results || [],
      total: data.total || 0,
      page: data.page || page,
    });

  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
