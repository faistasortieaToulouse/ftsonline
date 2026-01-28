import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || "0");

    const publicDir = path.join(process.cwd(), 'public', 'constellation');
    
    // Lecture des 3 fichiers en parallèle
    const [starsData, linesData, namesData] = await Promise.all([
      fs.readFile(path.join(publicDir, 'stars.json'), 'utf-8'),
      fs.readFile(path.join(publicDir, 'constellations.lines.json'), 'utf-8'),
      fs.readFile(path.join(publicDir, 'constellations.json'), 'utf-8')
    ]);

    const stars = JSON.parse(starsData);
    const lines = JSON.parse(linesData); // Format GeoJSON de d3-celestial
    const names = JSON.parse(namesData);

    // Calcul de la RA de minuit
    const solarRA = (month * 2) % 24;
    const midnightRA = (solarRA + 12) % 24;

    return NextResponse.json({
      stars: stars.map((s: any) => {
        let diff = Math.abs(s.ra - midnightRA);
        if (diff > 12) diff = 24 - diff;
        return { ...s, visible: diff < 6.5 };
      }),
      // On simplifie les lignes GeoJSON pour le frontend
      lines: lines.features.map((f: any) => ({
        id: f.id,
        // Conversion Degrés [0,360] -> Heures [0,24]
        paths: f.geometry.coordinates.map((path: any) => 
          path.map((p: any) => [p[0] / 15, p[1]])
        )
      })),
      // On prépare les noms avec leurs coordonnées centrales
      names: names.features.map((f: any) => ({
        name: f.properties.name,
        ra: f.geometry.coordinates[0] / 15,
        dec: f.geometry.coordinates[1]
      }))
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur de chargement des données" }, { status: 500 });
  }
}
