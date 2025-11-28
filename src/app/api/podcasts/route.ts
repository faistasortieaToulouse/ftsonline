import { NextResponse } from "next/server";
import fs from "fs/promises"; // Utilisation de fs/promises pour les opérations asynchrones
import path from "path";

// Chemin du fichier de cache
const CACHE_PATH = path.join(process.cwd(), "data", "podcasts-cache.json");

export async function GET() {
  try {
    // Vérifier l'existence du fichier de cache de manière asynchrone
    try {
      await fs.access(CACHE_PATH);
    } catch (e) {
      // Le fichier n'existe pas
      return NextResponse.json(
        { error: "Cache absent. Lancez /api/podcasts/update-cache pour le créer." },
        { status: 404 }
      );
    }

    // Lire le fichier de cache de manière asynchrone
    const fileContent = await fs.readFile(CACHE_PATH, "utf-8");
    
    // Parser le JSON
    const episodes = JSON.parse(fileContent);

    // Retourner les données
    // Le paramètre 'limit=50' est ignoré pour l'instant, mais le client s'y attend.
    return NextResponse.json({ data: episodes }, { status: 200 });
  } catch (err) {
    console.error("Erreur API podcasts (lecture du cache):", err);
    return NextResponse.json(
      { error: "Erreur interne lors de la lecture des podcasts." },
      { status: 500 }
    );
  }
}
