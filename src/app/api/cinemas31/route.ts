// /app/api/cinemas31/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url =
      "https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/les-cinemas-en-haute-garonne/records?limit=100";

    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur API externe" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // On renvoie uniquement le tableau results[]
    return NextResponse.json(data.results);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Erreur interne" },
      { status: 500 }
    );
  }
}
