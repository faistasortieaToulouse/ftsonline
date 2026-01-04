import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Si le dossier est à la racine, on retire 'src' du path.join
    const filePath = path.join(process.cwd(), 'data', 'histoire', 'civilisations_precolombiennes.json');
    
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 500 });
  }
}