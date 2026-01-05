import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers ton fichier JSON
    const jsonDirectory = path.join(process.cwd(), 'data', 'litterature');
    const fileContents = await fs.readFile(jsonDirectory + '/Grand Prix Femina.json', 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON:", error);
    return NextResponse.json({ error: "Impossible de lire les données" }, { status: 500 });
  }
}