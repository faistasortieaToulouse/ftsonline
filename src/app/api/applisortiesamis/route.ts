import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Utilisation de process.cwd() pour pointer à la racine du projet
    const filePath = path.join(process.cwd(), 'data', 'toulousain', 'applisortiesfrance.json');
    
    // Log pour débugger sur Vercel si besoin
    console.log("Tentative d'accès au fichier :", filePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        error: 'Fichier non trouvé',
        debugPath: filePath 
      }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

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
