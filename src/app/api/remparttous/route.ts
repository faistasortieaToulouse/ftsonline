import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'architecture', 'remparttous.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    // Pas de nettoyage complexe nécessaire ici car la structure est simple
    return NextResponse.json(json);
  } catch (error) {
    console.error('Erreur API remparttous:', error);
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 500 });
  }
}
