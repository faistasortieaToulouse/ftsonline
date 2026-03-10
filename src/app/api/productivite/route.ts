import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Construction du chemin absolu vers le JSON
    const filePath = path.join(
      process.cwd(),
      "data",
      "mondecategories",
      "productivite.json"
    );

    // Vérification de l'existence du fichier avant lecture
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContents);
      
      return NextResponse.json(data);
    } else {
      // Log pour le monitoring Vercel/Serveur
      console.error(`[API Productivité] Fichier introuvable au chemin : ${filePath}`);
      
      return NextResponse.json(
        { 
          error: "Fichier productivite.json introuvable",
          path: filePath // Utile en dev pour vérifier les dossiers
        },
        { status: 404 }
      );
    }
  } catch (error) {
    // Capture de l'erreur réelle pour les logs
    console.error("[API Productivité] Erreur serveur :", error);
    
    return NextResponse.json(
      { error: "Erreur serveur lors de la lecture des données" },
      { status: 500 }
    );
  }
}
