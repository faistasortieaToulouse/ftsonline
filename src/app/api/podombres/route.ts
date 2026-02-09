import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Configuration des chemins
const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_PATH = path.join(CACHE_DIR, "podombres-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6 heures

export async function GET() {
  try {
    // 1. S'assurer que le dossier /data existe pour éviter les erreurs de lecture
    try {
      await fs.access(CACHE_DIR);
    } catch {
      // Si le dossier n'existe pas, on le crée
      await fs.mkdir(CACHE_DIR, { recursive: true });
    }

    let stats;
    try {
      stats = await fs.stat(CACHE_PATH);
    } catch {
      // CASE A: Le fichier n'existe pas du tout
      console.log("Cache PodOmbres absent.");
      return NextResponse.json(
        { data: [], needsUpdate: true, message: "Cache inexistant" },
        { status: 200 } // On reste en 200 pour ne pas déclencher le catch du client
      );
    }

    // 2. Vérifier l'âge du cache
    const age = Date.now() - stats.mtime.getTime();
    const isExpired = age > CACHE_MAX_AGE;

    // 3. Lire le contenu actuel
    const fileContent = await fs.readFile(CACHE_PATH, "utf-8");
    const episodes = JSON.parse(fileContent);

    // 4. Réponse : on envoie les données, mais on précise si elles sont périmées
    return NextResponse.json({
      data: episodes,
      needsUpdate: isExpired,
      lastUpdated: stats.mtime
    }, { status: 200 });

  } catch (err) {
    console.error("Erreur API podombres:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des podcasts", data: [] }, 
      { status: 500 }
    );
  }
}
