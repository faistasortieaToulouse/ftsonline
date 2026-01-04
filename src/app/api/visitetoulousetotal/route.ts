import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'data',
      'toulouse',
      'visite_toulouse_geocode.json'
    );

    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContents);

    const lieux = json.lieux.map((lieu: any, index: number) => ({
      id: index + 1,
      numero: lieu.numero,
      type_voie: lieu.type_voie,
      nom_voie: lieu.nom_voie,
      description: lieu.description,
      lat: lieu.lat,
      lng: lieu.lng,
    }));

    return NextResponse.json(lieux);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des lieux' },
      { status: 500 }
    );
  }
}
