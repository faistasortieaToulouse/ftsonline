import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers votre fichier JSON à la racine du projet
    const filePath = path.join(process.cwd(), 'data', 'tisseo', 'arret_logique.json');
    
    // Lecture du fichier
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON:', error);
    return NextResponse.json({ error: 'Impossible de charger les arrêts' }, { status: 500 });
  }
}
