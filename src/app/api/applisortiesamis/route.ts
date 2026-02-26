import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Mise à jour du chemin vers ton nouveau nom de fichier : applisortiesfrance.json
    const filePath = path.join(process.cwd(), 'data', 'toulousain', 'applisortiesfrance.json');
    
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier introuvable à l'adresse : ${filePath}`);
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Tri par nom d'Application (A-Z)
    if (data && Array.isArray(data.applications)) {
      data.applications.sort((a: any, b: any) => 
        (a.Application || "").localeCompare(b.Application || "", 'fr', { sensitivity: 'base' })
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API détaillée:", error);
    return NextResponse.json({ error: 'Erreur lors du traitement des données' }, { status: 500 });
  }
}
