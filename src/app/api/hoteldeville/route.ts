import { NextResponse } from 'next/server';
// On importe directement le JSON. Next.js gère le parsing automatiquement !
import mairiesData from '@/../data/territoire/hoteldeville.json';

// Définition de l'interface pour TypeScript
interface Mairie {
  nom: string;
  ville: string;
  url: string;
  coordonnees: {
    latitude: number;
    longitude: number;
  };
}

export async function GET() {
  try {
    // On duplique le tableau importé pour pouvoir le trier sans muter le cache global
    const data: Mairie[] = [...mairiesData];

    // Tri sécurisé par ordre alphabétique
    data.sort((a, b) => {
      const nomA = a?.nom || "";
      const nomB = b?.nom || "";
      return nomA.localeCompare(nomB, 'fr', { sensitivity: 'base' });
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur critique API HotelDeVille:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement des données' },
      { status: 500 }
    );
  }
}
