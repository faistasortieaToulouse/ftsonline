import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers data/toulousain/languesfrance.json
    const filePath = path.join(process.cwd(), 'data', 'toulousain', 'languesfrance.json');
    
    // Lecture du fichier
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parsing du JSON
    const data = JSON.parse(fileContents);

    // Sécurité : on vérifie que la structure attendue existe
    if (!data || !data.langues) {
      return NextResponse.json({ error: "Structure de données 'langues' introuvable" }, { status: 400 });
    }

    // On renvoie le tableau des langues
    return NextResponse.json(data.langues);

  } catch (error) {
    console.error("Erreur API LanguesFrance:", error);
    return NextResponse.json({ error: "Erreur lors de la lecture du fichier JSON" }, { status: 500 });
  }
}
