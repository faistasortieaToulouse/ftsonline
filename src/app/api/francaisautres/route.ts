import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Déterminer le chemin vers le fichier JSON
    const jsonDirectory = path.join(process.cwd(), 'data', 'francais');
    const fileContents = await fs.readFile(jsonDirectory + '/francaisautres.json', 'utf8');
    
    // Parser et retourner les données
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON:", error);
    return NextResponse.json({ error: "Erreur de chargement des données" }, { status: 500 });
  }
}