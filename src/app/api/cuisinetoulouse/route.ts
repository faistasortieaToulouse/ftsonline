import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers le fichier cuisine
    const filePath = path.join(process.cwd(), 'data', 'culture', 'cuisinetoulouse.json');
    
    // Lecture du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing du JSON
    const data = JSON.parse(fileContents);

    // Sécurité : on vérifie que la clé racine existe bien
    if (!data.cuisine_toulousaine) {
        return NextResponse.json({ error: "Format de données de cuisine invalide" }, { status: 400 });
    }

    // On renvoie l'objet complet de la cuisine toulousaine
    return NextResponse.json(data.cuisine_toulousaine);

  } catch (error) {
    console.error("Erreur API CuisineToulouse:", error);
    return NextResponse.json({ error: "Impossible de charger le fichier JSON de cuisine" }, { status: 500 });
  }
}
