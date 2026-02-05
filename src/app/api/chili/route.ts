import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface RegionChili {
  nom: string;
  capitale: string;
  population_capitale: string;
  population_region: string;
}

export interface VilleChili {
  ville: string;
  region: string;
  population: string;
}

export interface DonneesChili {
  pays: string;
  regions: RegionChili[];
  grandes_villes_et_agglomerations: VilleChili[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/chili.json', 'utf8');
    const data: DonneesChili = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Chili:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
