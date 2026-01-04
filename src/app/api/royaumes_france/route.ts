import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers votre fichier JSON fourni
    const jsonPath = path.join(process.cwd(), 'data', 'histoire', 'royaumes_france_detail.json');
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lecture JSON:", error);
    return NextResponse.json({ error: "Impossible de charger les données" }, { status: 500 });
  }
}