import { NextResponse } from 'next/server';
// On importe directement le fichier comme une variable
import evenementsData from '../../../../data/toulouseain/evenementsToulouse.json';

export async function GET() {
  try {
    // Si l'import fonctionne, les données sont déjà là !
    if (evenementsData) {
      return NextResponse.json(evenementsData);
    } else {
      return NextResponse.json({ error: "Données vides" }, { status: 404 });
    }
  } catch (error) {
    console.error("Erreur API Toulouse :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
