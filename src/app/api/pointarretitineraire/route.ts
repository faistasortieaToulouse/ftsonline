import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'tisseo', 'arrets-itineraire.json');
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des arrêts itinéraire:', error);
    return NextResponse.json({ error: 'Erreur de chargement des données' }, { status: 500 });
  }
}
