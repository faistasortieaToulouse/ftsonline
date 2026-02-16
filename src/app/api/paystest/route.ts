import { NextResponse } from 'next/server';
// Next.js va inclure automatiquement ce fichier dans le déploiement Vercel
import inequalityData from '@/data/statistiques/tri_pays_indice_inegalites.json';

export async function GET() {
  try {
    // Plus besoin de lire le fichier, il est déjà chargé en mémoire
    return NextResponse.json(inequalityData);
  } catch (error) {
    console.error("Erreur lors de la distribution du JSON :", error);
    return NextResponse.json(
      { error: "Impossible de charger les données." },
      { status: 500 }
    );
  }
}
