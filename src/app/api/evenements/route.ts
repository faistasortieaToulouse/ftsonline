import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/** * ASTUCE VERCEL : Importer le fichier (même si on ne se sert pas de l'import) 
 * force le serveur de build à inclure ce fichier JSON dans le bundle final.
 */
// @ts-ignore
import forceInclude from '../../../../data/toulouseain/evenementsToulouse.json';

export async function GET() {
  try {
    // Construction du chemin absolu
    const filePath = path.join(
      process.cwd(),
      "data",
      "toulouseain",
      "evenementsToulouse.json"
    );

    // Vérification de l'existence avec fs
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      
      // Sécurité : on vérifie que le JSON est valide avant de répondre
      try {
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        return NextResponse.json({ error: "Format JSON invalide" }, { status: 500 });
      }
      
    } else {
      // Log détaillé pour voir exactement où Vercel cherche dans les logs de déploiement
      console.error("ERREUR 404 - Chemin introuvable :", filePath);
      return NextResponse.json(
        { 
          error: "Fichier introuvable sur le serveur", 
          pathSearched: filePath 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Erreur critique API Toulouse :", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement des données" },
      { status: 500 }
    );
  }
}
