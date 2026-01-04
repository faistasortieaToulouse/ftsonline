import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers ton JSON
    const filePath = path.join(process.cwd(), 'data', 'histoire', 'hordes_khanats.json');
    const fileContents = await fs.readFile(filePath, 'utf8');

    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur de lecture du fichier JSON:", error);
    return NextResponse.json(
      { error: "Fichier non trouvé dans /data/histoire/hordes_khanats.json" },
      { status: 500 }
    );
  }
}
