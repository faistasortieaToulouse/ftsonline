import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'france');
    const fileContents = await fs.readFile(jsonDirectory + '/colonie_France_Europe.json', 'utf8');
    const data = JSON.parse(fileContents);

    // On s'assure que chaque territoire a un champ 'continent' pour le tri
    // et on mappe latitude/longitude vers lat/lng pour correspondre au modèle
    const territoires = data.territoires.map((t: any) => ({
      ...t,
      continent: "Europe",
      lat: t.latitude,
      lng: t.longitude
    }));

    return NextResponse.json(territoires);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture des données' }, { status: 500 });
  }
}