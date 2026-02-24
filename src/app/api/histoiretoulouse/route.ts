import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers le fichier JSON
    // 'process.cwd()' pointe vers la racine du projet
    const filePath = path.join(process.cwd(), 'data', 'toulousain', 'histoiretoulouse.json');

    // Vérification si le fichier existe avant de tenter la lecture
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier non trouvé à l'emplacement : ${filePath}`);
      return NextResponse.json(
        { error: 'Le fichier de données historiques est introuvable' },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur API Histoire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la lecture des données historiques' },
      { status: 500 }
    );
  }
}
