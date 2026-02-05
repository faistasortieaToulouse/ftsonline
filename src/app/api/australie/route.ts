import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface EtatAustralie {
  nom: string;
  capitale: string;
  population_capitale: string;
  population_totale: string;
}

export interface VilleAustralie {
  ville: string;
  etat: string;
  population: string;
}

export interface DonneesAustralie {
  pays: string;
  etats_et_territoires: EtatAustralie[];
  classement_villes: VilleAustralie[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/australie.json', 'utf8');
    const data: DonneesAustralie = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Australie:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
