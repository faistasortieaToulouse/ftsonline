import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Définition de l'interface pour un typage TypeScript rigoureux
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
    // Écriture du chemin en clair (comme pour villePIB.json) pour forcer la détection par Vercel
    const filePath = path.join(process.cwd(), 'data/territoire/hoteldeville.json');

    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier hoteldeville.json non trouvé' },
        { status: 404 }
      );
    }

    // Lecture synchrone du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing et typage de la donnée
    const data: Mairie[] = JSON.parse(fileContents);

    // Filtrage de sécurité
    const filteredData = data.filter(
      (m) =>
        m?.nom &&
        m?.coordonnees &&
        typeof m.coordonnees.latitude === 'number' &&
        typeof m.coordonnees.longitude === 'number'
    );

    // Tri par ordre alphabétique
    filteredData.sort((a, b) => {
      const nomA = a.nom || '';
      const nomB = b.nom || '';
      return nomA.localeCompare(nomB, 'fr', { sensitivity: 'base' });
    });

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Erreur API HotelDeVille:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
