import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "data", "podombres-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6 heures

export async function GET() {
  try {
    let stats;
    try {
      stats = await fs.stat(CACHE_PATH);
    } catch {
      // Si le fichier n'existe pas → mettre à jour le cache
      return await updateCacheAndReturn();
    }

    const age = Date.now() - stats.mtime.getTime();
    if (age > CACHE_MAX_AGE) {
      // Si le cache est trop vieux → mise à jour
      return await updateCacheAndReturn();
    }

    // Lire le cache existant
    const fileContent = await fs.readFile(CACHE_PATH, "utf-8");
    const episodes = JSON.parse(fileContent);

    return NextResponse.json({ data: episodes }, { status: 200 });
  } catch (err) {
    console.error("Erreur API podombres:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// Fonction pour exécuter update-cache et retourner les données
async function updateCacheAndReturn() {
  try {
    // URL complète côté serveur
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:9002";
    const res = await fetch(`${baseUrl}/api/podombres/update-cache`, { cache: "no-store" });

    if (!res.ok) throw new Error("Erreur lors de la mise à jour du cache");

    const data = await res.json();
    return NextResponse.json({ data: data.episodes || [] }, { status: 200 });
  } catch (err) {
    console.error("Erreur update-cache podombres:", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le cache" },
      { status: 500 }
    );
  }
}
