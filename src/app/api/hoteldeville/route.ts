import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Astuce absolue pour forcer Vercel à inclure le dossier 'territoire' au build
// Vercel voit cet import statique et est obligé d'embarquer le fichier dans le bundle !
import '../../../../../data/territoire/hoteldeville.json';

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
    // Exactement la même structure de chemin que pour les hypermarchés
    const filePath = path.join(
      process.cwd(),
      'data',
      'territoire',
      'hoteldeville.json'
    );

    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      console.error(`[API HotelDeVille] Fichier non trouvé à l'emplacement : ${filePath}`);
      return NextResponse.json(
        { error: 'Fichier hoteldeville.json non trouvé' },
        { status: 404 }
      );
    }

    // Lecture synchrone du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing et typage de la donnée
    const data: Mairie[] = JSON.parse(fileContents);

    // Tri par ordre alphabétique sécurisé
    data.sort((a, b) => {
      const nomA = a?.nom || "";
      const nomB = b?.nom || "";
      return nomA.localeCompare(nomB, 'fr', { sensitivity: 'base' });
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API HotelDeVille:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
