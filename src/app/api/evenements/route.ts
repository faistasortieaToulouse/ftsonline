import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Définition de l'interface pour le typage TypeScript
interface EvenementSource {
  Nom: string;
  Lien: string;
}

interface EvenementsData {
  Titre: string;
  Sources: EvenementSource[];
}

export async function GET() {
  try {
    // 1. Définir le chemin du fichier JSON
    // process.cwd() pointe à la racine du projet
    const filePath = path.join(process.cwd(), 'data', 'toulouseain', 'evenementsToulouse.json');

    // 2. Lire le contenu du fichier
    const fileContents = await fs.readFile(filePath, 'utf8');

    // 3. Parser le JSON
    const data: EvenementsData = JSON.parse(fileContents);

    // 4. Retourner la réponse
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Erreur API Evenements:", error);
    return NextResponse.json(
      { error: "Impossible de charger les événements" },
      { status: 500 }
    );
  }
}
