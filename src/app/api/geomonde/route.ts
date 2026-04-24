import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin mis à jour vers votre nouveau fichier JSON
    const filePath = path.join(process.cwd(), 'data', 'mondecategories', 'geomonde.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Fichier JSON non trouvé' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des données' }, { status: 500 });
  }
}
