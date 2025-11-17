// /app/api/actutoulouse/route.ts

import { NextResponse } from "next/server";

const API_URL =
  "https://datainfolocale.opendatasoft.com/api/records/1.0/search/?dataset=agenda-des-manifestations";

export async function GET() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des données" },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur", details: error },
      { status: 500 }
    );
  }
}
