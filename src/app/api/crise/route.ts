import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      titre: "Crises Monétaires et Financières dans le monde",
      source: "https://fr.wikipedia.org/wiki/Liste_des_crises_mon%C3%A9taires_et_financi%C3%A8res"
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération du lien" }, { status: 500 });
  }
}
