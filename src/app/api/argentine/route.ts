import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface Province {
  nom: string;
  capitale: string;
  population_capitale: string;
  population_totale: string;
}

export interface GrandeVille {
  ville: string;
  province: string;
  population: string;
}

export interface DonneesArgentine {
  pays: string;
  provinces: Province[];
  grandes_villes_et_agglomerations: GrandeVille[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/argentine.json', 'utf8');
    const data: DonneesArgentine = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Argentine:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
