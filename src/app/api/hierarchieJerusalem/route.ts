import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin absolu vers le fichier JSON
    const filePath = path.join(process.cwd(), 'data', 'hierarchie', 'hierarchie Jerusalem.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonData);

    return NextResponse.json(data);
  } catch (err) {
    console.error('Erreur lecture JSON :', err);
    return NextResponse.json({ error: 'Impossible de lire le fichier JSON' }, { status: 500 });
  }
}
