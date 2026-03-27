import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers le fichier JSON
    const jsonPath = path.join(process.cwd(), 'data', 'toulousain', 'transports.json');
    
    // Lecture du fichier
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    
    // Analyse du JSON et renvoi de la réponse
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lecture JSON:', error);
    return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
  }
}
