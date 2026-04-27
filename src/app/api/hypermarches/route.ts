import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'toulousain',
      'hypermarches.json'
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier hypermarches.json non trouvé' },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Tri par id (cohérent avec ton dataset)
    data.sort((a: any, b: any) => a.id - b.id);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
