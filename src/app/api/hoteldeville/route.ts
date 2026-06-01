import { NextResponse } from 'next/server';
// 4 niveaux de remontée exactement pour atteindre la racine
import mairiesData from '../../../../data/territoire/hoteldeville.json';

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
    // Copie du tableau pour le tri sécurisé
    const data: Mairie[] = [...mairiesData];

    data.sort((a, b) => {
      const nomA = a?.nom || "";
      const nomB = b?.nom || "";
      return nomA.localeCompare(nomB, 'fr', { sensitivity: 'base' });
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur critique API HotelDeVille:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
