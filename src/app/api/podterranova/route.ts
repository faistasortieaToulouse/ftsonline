import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "data", "podterranova-cache.json");
const CACHE_MAX_AGE = 1000 * 60 * 60 * 6; // 6 heures

export async function GET() {
  try {
    let stats;
    try {
      stats = await fs.stat(CACHE_PATH);
    } catch {
      // Fichier absent → on force la mise à jour
      return await updateCacheAndReturn();
    }

    const age = Date.now() - stats.mtime.getTime();
    if (age > CACHE_MAX_AGE) {
      // Cache trop vieux → mise à jour
      return await updateCacheAndReturn();
    }

    // Lire le cache existant
    const fileContent = await fs.readFile(CACHE_PATH, "utf-8");
    const episodes = JSON.parse(fileContent);
    return NextResponse.json({ data: episodes }, { status: 200 });
  } catch (err) {
    console.error("Erreur API podterranova:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// Fonction pour exécuter /api/podterranova/update-cache et renvoyer le résultat
async function updateCacheAndReturn() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/podterranova/update-cache`
    );
    if (!res.ok) throw new Error("Erreur lors de la mise à jour du cache");
    const data = await res.json();
    return NextResponse.json({ data: data.episodes || [] }, { status: 200 });
  } catch (err) {
    console.error("Erreur update-cache:", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le cache" },
      { status: 500 }
    );
  }
}
