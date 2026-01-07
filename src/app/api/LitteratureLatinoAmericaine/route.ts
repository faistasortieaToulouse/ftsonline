import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'litterature');
    // On lit le fichier africain comme demandé
    const fileContents = await fs.readFile(jsonDirectory + '/Litterature Latino Americaine.json', 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Litterature:", error);
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 });
  }
}