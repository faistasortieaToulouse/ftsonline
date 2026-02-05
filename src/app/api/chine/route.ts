import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface TerritoireChine {
  nom: string;
  capitale?: string;
  population_est_2026?: string;
  population_totale_2026?: string;
}

export interface VilleUrbaineChine {
  ville: string;
  province: string;
  census_2020: number;
}

export interface DonneesChine {
  pays: string;
  administration_territoriale: {
    provinces: TerritoireChine[];
    regions_autonomes: TerritoireChine[];
    municipalites: TerritoireChine[];
  };
  villes_principales_urbaines: VilleUrbaineChine[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/chine.json', 'utf8');
    const data: DonneesChine = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Chine:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
