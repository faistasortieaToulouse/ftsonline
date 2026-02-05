import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface EtatBresil {
  nom: string;
  capitale: string;
  population_capitale: string;
  population_etat: string;
}

export interface AutreVilleBresil {
  ville: string;
  etat: string;
  population: string;
}

export interface DonneesBresil {
  pays: string;
  etats: EtatBresil[];
  autres_grandes_villes: AutreVilleBresil[];
}

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data/monde');
    const fileContents = await fs.readFile(jsonDirectory + '/bresil.json', 'utf8');
    const data: DonneesBresil = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Bresil:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}
