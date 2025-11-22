import { NextResponse } from "next/server";

// Interface pour vos événements
interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  link: string;
  start: string | null;
  end: string | null;
  source: string;
}

export async function GET() {
  try {
    // Ici, aucun appel externe : on renvoie juste un tableau vide
    const events: EventItem[] = [];

    // Optionnel : ajouter quelques événements fictifs pour tester
    /*
    const events: EventItem[] = [
      {
        id: "1",
        title: "Exemple d'événement",
        description: "Ceci est un événement fictif pour tester l'affichage.",
        location: "Toulouse",
        link: "#",
        start: new Date().toISOString(),
        end: null,
        source: "Test",
      },
    ];
    */

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Erreur route /api/toulousetourisme:", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les événements." },
      { status: 500 }
    );
  }
}
