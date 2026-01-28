import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || "0");

    // Chemin dynamique vers le dossier public
    const filePath = path.join(process.cwd(), 'public', 'constellation', 'stars.json');
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const stars = JSON.parse(fileContent);

    // Calcul de la RA de minuit (décalage de 2h par mois)
    const solarRA = (month * 2) % 24;
    const midnightRA = (solarRA + 12) % 24;

    const processedStars = stars.map((s: any) => {
      let diff = Math.abs(s.ra - midnightRA);
      if (diff > 12) diff = 24 - diff;
      
      // Une étoile est "visible" si elle est à +/- 6h de la RA de minuit
      const isVisible = diff < 6;

      return {
        ...s,
        visible: isVisible
      };
    });

    return NextResponse.json(processedStars);
  } catch (error) {
    console.error("Erreur de lecture du fichier stars.json:", error);
    return NextResponse.json({ error: "Fichier de données introuvable" }, { status: 500 });
  }
}
