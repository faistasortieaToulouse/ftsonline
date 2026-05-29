import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Définition de l'interface
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
    // Découpage strict comme pour les hypermarchés pour forcer le traçage Vercel
    const filePath = path.join(
      process.cwd(),
      'data',
      'territoire',
      'hoteldeville.json'
    );

    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier hoteldeville.json non trouvé' },
        { status: 404 }
      );
    }

    // Lecture synchrone
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing des données
    const data: Mairie[] = JSON.parse(fileContents);

    // Tri par ordre alphabétique demandé du nom de l'hôtel de ville
    data.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API HotelDeVille:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
