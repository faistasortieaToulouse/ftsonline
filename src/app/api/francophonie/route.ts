import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Ce chemin remonte à la racine depuis src/app/api/...
    const filePath = path.join(process.cwd(), 'data', 'francais', 'francophonie.json');
    
    if (!fs.existsSync(filePath)) {
       return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}