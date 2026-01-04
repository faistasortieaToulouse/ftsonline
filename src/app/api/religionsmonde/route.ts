import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function cleanData(data: any) {
  // Parcourt chaque religion
  for (const religion in data) {
    if (Array.isArray(data[religion])) {
      data[religion].forEach((c: any) => {
        // Si c.nombre est null ou undefined, on met 0
        if (c.nombre == null) c.nombre = 0;
      });
    }
  }
  return data;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'religion', 'religions_monde_2024.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const json = JSON.parse(data);

    // Nettoyage pour éviter null
    const cleaned = cleanData(json);

    // Renvoie le JSON complet
    return NextResponse.json(cleaned);
  } catch (error) {
    console.error('Erreur API religionsmonde:', error);
    return NextResponse.json({ error: 'Impossible de lire le fichier JSON' }, { status: 500 });
  }
}
