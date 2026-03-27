import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const dataDirectory = path.join(process.cwd(), 'data/toulousain');
  
  try {
    // Lecture des bars partenaires
    const barsFile = await fs.readFile(dataDirectory + '/bartoilettes.json', 'utf8');
    const barsData = JSON.parse(barsFile);

    // Lecture des sanisettes publiques
    const sanisettesFile = await fs.readFile(dataDirectory + '/sanisettes.json', 'utf8');
    const sanisettesData = JSON.parse(sanisettesFile);

    return NextResponse.json({
      bars: barsData.etablissements,
      sanisettes: sanisettesData
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la lecture des données" }, { status: 500 });
  }
}
