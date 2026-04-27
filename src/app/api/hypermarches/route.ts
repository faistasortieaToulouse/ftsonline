import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Définition de l'interface pour un typage TypeScript rigoureux
interface Hypermarche {
  id: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
  area_m2: number | null;
  status: string;
}

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'toulousain',
      'hypermarches.json'
    );

    // Vérification de l'existence du fichier
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier hypermarches.json non trouvé' },
        { status: 404 }
      );
    }

    // Lecture synchrone du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing et typage de la donnée
    const data: Hypermarche[] = JSON.parse(fileContents);

    // Tri par ID croissant (plus fiable qu'un tri par défaut)
    data.sort((a, b) => a.id - b.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API Hypermarches:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
