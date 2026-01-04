import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'histoire',
      'expansion_islam.json'
    );

    const fileContents = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(fileContents);

    // Transformation : pays -> [{ date, evenement }]
    const data: Record<string, { date: string; evenement: string }[]> = {};

    rawData.forEach((item: any) => {
      const pays = item.pays;
      if (!data[pays]) data[pays] = [];

      data[pays].push({
        date: item.date,
        evenement: `${item.leader} – ${item.debut}`
      });
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur de lecture du fichier JSON:", error);
    return NextResponse.json(
      { error: "Fichier non trouvé dans /data/histoire/" },
      { status: 500 }
    );
  }
}
