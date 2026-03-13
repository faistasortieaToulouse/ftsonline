import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ici, on renvoie directement les informations sans lire de fichier
    return NextResponse.json({
      titre: "Chronologie des Épidémies",
      source: "https://fr.wikipedia.org/wiki/Liste_d%27%C3%A9pid%C3%A9mies"
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération du lien" }, { status: 500 });
  }
}
