import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function cleanData(data: any) {
  if (data && Array.isArray(data.villes)) {
    data.villes.forEach((v: any) => {
      if (v.description == null) v.description = "";
      v.conservation_totale = !!v.conservation_totale;
    });
  }
  return data;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'occitanie', 'rempartoccitanie.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    const cleaned = cleanData(json);

    return NextResponse.json(cleaned);
  } catch (error) {
    console.error('Erreur API rempartoccitanie:', error);
    return NextResponse.json({ error: 'Impossible de charger les données d\'Occitanie' }, { status: 500 });
  }
}
