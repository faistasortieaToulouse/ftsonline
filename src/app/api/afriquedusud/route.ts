import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Interface pour typer les données
export interface VilleAfriqueSud {
  ville: string;
  role: string;
  province: string;
  population_agglo: number;
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/afriquedusud.json', 'utf8');
    const data: VilleAfriqueSud[] = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Afrique du Sud:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
