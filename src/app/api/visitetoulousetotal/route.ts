import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'toulouse', 'visite_toulouse_geocode.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContents);

    // On s'assure que le format est plat et propre pour Leaflet
    const lieux = json.lieux.map((lieu: any, index: number) => ({
      id: index + 1,
      name: `${lieu.numero || ''} ${lieu.type_voie || ''} ${lieu.nom_voie || ''}`.trim(),
      address: `${lieu.numero || ''} ${lieu.type_voie || ''} ${lieu.nom_voie || ''}, Toulouse`,
      description: lieu.description || "Aucune description disponible.",
      lat: lieu.lat,
      lng: lieu.lng,
    }));

    return NextResponse.json(lieux);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de chargement' }, { status: 500 });
  }
}
