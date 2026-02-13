import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Utilisation de segments séparés dans path.join pour une meilleure compatibilité OS (Windows/Linux)
    const filePath = path.join(process.cwd(), 'data', 'statistiques', 'tri_pays_indice_inegalites.json');
    
    if (!fs.existsSync(filePath)) {
      console.error("Fichier introuvable au chemin :", filePath);
      return NextResponse.json({ error: "Fichier JSON manquant", data: [] }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // On s'assure de renvoyer une structure cohérente même si le JSON est vide
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API Inégalités:", error);
    return NextResponse.json(
      { error: "Erreur serveur", data: [] }, 
      { status: 500 }
    );
  }
}
