import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Chemin vers votre fichier JSON
    const jsonDirectory = path.join(process.cwd(), 'data', 'europe');
    const fileContents = await fs.readFile(jsonDirectory + '/Europe.json', 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Europe:", error);
    return NextResponse.json({ error: "Impossible de charger les données" }, { status: 500 });
  }
}