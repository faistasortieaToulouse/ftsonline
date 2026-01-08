import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'litterature',
      'Total Prix par ecrivain.json'
    );

    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContents);

    // 🔥 NORMALISATION DES CLÉS
    const data = rawData.map((item: any) => ({
      annee: item.annee ?? item.année ?? null,
      auteur: item.auteur ?? item.écrivain ?? null,
      titre: item.titre ?? null,
      prix: item.prix ?? null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lecture TotalPrixEcrivain:', error);
    return NextResponse.json(
      { error: 'Impossible de lire les données' },
      { status: 500 }
    );
  }
}
