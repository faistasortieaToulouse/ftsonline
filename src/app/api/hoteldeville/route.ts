import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Chemin vers votre fichier JSON nettoyé
    const filePath = path.join(process.cwd(), 'data', 'territoire', 'hoteldeville.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const mairies = JSON.parse(fileData);

    // Tri par ordre alphabétique sur le nom de l'hôtel de ville
    const mairiesTriees = mairies.sort((a: any, b: any) => 
      a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
    );

    return NextResponse.json(mairiesTriees);
  } catch (error) {
    console.error("Erreur lors de la lecture des données :", error);
    return NextResponse.json({ error: "Impossible de charger les données" }, { status: 500 });
  }
}
