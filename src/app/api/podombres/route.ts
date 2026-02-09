import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
// Importe la logique de mise à jour directement
// Assure-toi que ton fichier update-cache exporte une fonction nommée "scrapeAndSave" ou similaire
import { scrapeAndSaveOmbres } from "./update-cache/worker"; 

const CACHE_PATH = path.join(process.cwd(), "data", "podombres-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6 heures

export async function GET() {
  try {
    // 1. Vérifier si le dossier /data existe (essentiel pour Vercel)
    const dataDir = path.join(process.cwd(), "data");
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    let stats;
    let shouldUpdate = false;

    try {
      stats = await fs.stat(CACHE_PATH);
      const age = Date.now() - stats.mtime.getTime();
      if (age > CACHE_MAX_AGE) shouldUpdate = true;
    } catch {
      // Le fichier n'existe pas
      shouldUpdate = true;
    }

    // 2. Si mise à jour nécessaire, on appelle la logique interne (pas de fetch HTTP)
    if (shouldUpdate) {
      console.log("Mise à jour du cache PodOmbres en cours...");
      try {
        // On appelle la fonction de scraping directement
        const episodes = await scrapeAndSaveOmbres(); 
        return NextResponse.json({ data: episodes }, { status: 200 });
      } catch (scrapeErr) {
        console.error("Échec du scraping direct:", scrapeErr);
        // Si le scraping échoue mais qu'on a un vieux cache, on le renvoie quand même au lieu de planter
        if (stats) {
          const oldContent = await fs.readFile(CACHE_PATH, "utf-8");
          return NextResponse.json({ data: JSON.parse(oldContent), warning: "Cache expiré, MAJ échouée" }, { status: 200 });
        }
        throw scrapeErr;
      }
    }

    // 3. Lire et renvoyer le cache valide
    const fileContent = await fs.readFile(CACHE_PATH, "utf-8");
    return NextResponse.json({ data: JSON.parse(fileContent) }, { status: 200 });

  } catch (err) {
    console.error("Erreur API podombres:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des podcasts" }, 
      { status: 500 }
    );
  }
}
