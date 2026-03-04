import { NextResponse } from 'next/server';
// Importation directe du JSON avec typage automatique par TypeScript
import histoireData from '../../../../../data/mondecategories/histoireinternet.json';

export async function GET() {
  try {
    // Vérification basique que les données sont chargées
    if (!histoireData) {
      throw new Error("Fichier de données vide");
    }

    return NextResponse.json(histoireData);
  } catch (error) {
    console.error("Erreur API Histoire:", error);
    return NextResponse.json(
      { error: "Impossible de charger les données historiques" },
      { status: 500 }
    );
  }
}
