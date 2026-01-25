import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Chemin propre vers le fichier
    const filePath = path.join(process.cwd(), 'data', 'europe', 'Europe.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Europe:", error);
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 500 });
  }
}