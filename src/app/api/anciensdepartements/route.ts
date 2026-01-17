import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data', 'france');
    const filePath = path.join(jsonDirectory, 'departements_France_Etranger.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Transformation pour correspondre aux interfaces du frontend
    const departements = data.departements.map((d: any) => ({
      ...d,
      lat: d.latitude,
      lng: d.longitude
    }));

    return NextResponse.json(departements);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: 'Erreur lors de la lecture des données' }, { status: 500 });
  }
}