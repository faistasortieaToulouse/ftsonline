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
    // Découpage strict pour forcer le traçage statique de Vercel (NFT)
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

    // Sécurisation du tri par ordre alphabétique (évite le crash si un champ 'nom' est indéfini)
    data.sort((a, b) => {
      const nomA = a?.nom || "";
      const nomB = b?.nom || "";
      return nomA.localeCompare(nomB, 'fr', { sensitivity: 'base' });
    });

    // Retour des données sous forme de réponse JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur critique API HotelDeVille:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
