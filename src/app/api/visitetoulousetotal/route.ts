import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'toulouse', 'visite_toulouse_geocode.json');
    
    if (!fs.existsSync(filePath)) {
      console.error("Fichier non trouvé:", filePath);
      return NextResponse.json([]); // Retourne un tableau vide au lieu d'une erreur
    }

    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContents);

    // Vérifiez si json.lieux existe, sinon utilisez json directement
    const source = json.lieux || json; 

    const lieux = source.map((lieu: any, index: number) => ({
      id: index + 1,
      name: lieu.name || `${lieu.numero || ''} ${lieu.type_voie || ''} ${lieu.nom_voie || ''}`.trim(),
      address: lieu.address || `${lieu.numero || ''} ${lieu.type_voie || ''} ${lieu.nom_voie || ''}, Toulouse`,
      description: lieu.description || "Aucune description.",
      lat: parseFloat(lieu.lat), // Force la conversion en nombre
      lng: parseFloat(lieu.lng),
    }));

    return NextResponse.json(lieux);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json([]); 
  }
}
