import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'toulouse', 'visite_toulouse_geocode.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContents);

    const source = json.lieux || json;

    const lieux = source
      .map((lieu: any, index: number) => {
        const lat = parseFloat(lieu.lat);
        const lng = parseFloat(lieu.lng);

        // --- LE FILTRE ICI ---
        // On vérifie si les coordonnées sont cohérentes avec Toulouse
        // Toulouse est entre Lat 43.5 et 43.7 / Lng 1.3 et 1.6
        const isToulouse = lat > 43.5 && lat < 43.7 && lng > 1.3 && lng < 1.6;

        if (isToulouse) {
          return {
            id: index + 1,
            name: lieu.name || `${lieu.numero || ''} ${lieu.type_voie || ''} ${lieu.nom_voie || ''}`.trim(),
            address: lieu.address || `${lieu.numero || ''} ${lieu.type_voie || ''} ${lieu.nom_voie || ''}, Toulouse`,
            description: lieu.description || "Aucune description.",
            lat: lat,
            lng: lng,
          };
        }
        return null; // On rejette le monument s'il est hors zone
      })
      .filter((l: any) => l !== null); // On retire les "null" de la liste finale

    return NextResponse.json(lieux);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
