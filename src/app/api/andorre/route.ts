import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Interfaces pour le typage
export interface Paroisse {
  nom: string;
  capitale: string;
  population_capitale: string;
  population_totale: string;
}

export interface Localite {
  nom: string;
  paroisse: string;
  population: string;
}

export interface DonneesAndorre {
  pays: string;
  paroisses: Paroisse[];
  classement_villes_et_localites: Localite[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/andorre.json', 'utf8');
    const data: DonneesAndorre = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Andorre:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
