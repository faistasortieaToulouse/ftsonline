import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface ProvinceCanada {
  nom: string;
  capitale: string;
  population_capitale: string;
  population_totale: string;
}

export interface VilleCanada {
  ville: string;
  province: string;
  population: string;
  rang?: number;
}

export interface DonneesCanada {
  pays: string;
  provinces_et_territoires: ProvinceCanada[];
  grandes_villes_plus_500k: VilleCanada[];
  villes_intermediaires: VilleCanada[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/canada.json', 'utf8');
    const data: DonneesCanada = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Canada:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
